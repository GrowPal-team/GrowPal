import { NextRequest, NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { nextPlantStateAfterOrder } from "@/lib/plant-gamification"

type CheckoutItem = { productId?: number; quantity?: number }

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { userId?: number; items?: CheckoutItem[] }
    const userId = body.userId != null ? Number(body.userId) : NaN
    if (!Number.isFinite(userId) || userId < 1) {
      return NextResponse.json({ message: "Invalid userId" }, { status: 400 })
    }

    const rawItems = Array.isArray(body.items) ? body.items : []
    const merged = new Map<number, number>()
    for (const line of rawItems) {
      const productId = line.productId != null ? Number(line.productId) : NaN
      const quantity = line.quantity != null ? Number(line.quantity) : 0
      if (!Number.isFinite(productId) || productId < 1) continue
      if (!Number.isFinite(quantity) || quantity < 1) continue
      const q = Math.min(99, Math.floor(quantity))
      merged.set(productId, (merged.get(productId) ?? 0) + q)
    }
    const normalized = [...merged.entries()].map(([productId, quantity]) => ({ productId, quantity }))

    if (normalized.length === 0) {
      return NextResponse.json({ message: "Cart is empty" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        plantStage: true,
        plantPendingGiftCode: true,
        plantCompletions: true,
      },
    })
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    const result = await prisma.$transaction(async (tx) => {
      let total = new Prisma.Decimal(0)
      const orderItems: { productId: number; qty: number; price_ils: Prisma.Decimal }[] = []

      for (const line of normalized) {
        const product = await tx.product.findFirst({
          where: { id: line.productId, is_active: true },
          select: { id: true, price_ils: true, stock_quantity: true },
        })
        if (!product) {
          throw new Error(`PRODUCT_${line.productId}`)
        }
        if (product.stock_quantity != null && product.stock_quantity < line.quantity) {
          throw new Error(`STOCK_${line.productId}`)
        }
        const lineTotal = product.price_ils.mul(line.quantity)
        total = total.add(lineTotal)
        orderItems.push({
          productId: product.id,
          qty: line.quantity,
          price_ils: product.price_ils,
        })
      }

      const order = await tx.order.create({
        data: {
          userId,
          total_ils: total,
          status: "PAID_MOCK",
          orderItems: {
            create: orderItems.map((oi) => ({
              productId: oi.productId,
              qty: oi.qty,
              price_ils: oi.price_ils,
            })),
          },
        },
        select: { id: true, total_ils: true },
      })

      for (const line of normalized) {
        const row = await tx.product.findFirst({
          where: { id: line.productId },
          select: { stock_quantity: true },
        })
        if (row?.stock_quantity != null) {
          const dec = await tx.product.updateMany({
            where: { id: line.productId, stock_quantity: { gte: line.quantity } },
            data: { stock_quantity: { decrement: line.quantity } },
          })
          if (dec.count !== 1) throw new Error(`STOCK_${line.productId}`)
        }
      }

      const nextPlant = nextPlantStateAfterOrder({
        stage: user.plantStage,
        pendingGiftCode: user.plantPendingGiftCode,
        completions: user.plantCompletions,
      })

      const plantDidGrow =
        nextPlant.stage !== user.plantStage ||
        nextPlant.pendingGiftCode !== user.plantPendingGiftCode ||
        nextPlant.completions !== user.plantCompletions

      await tx.user.update({
        where: { id: userId },
        data: {
          plantStage: nextPlant.stage,
          plantPendingGiftCode: nextPlant.pendingGiftCode,
          plantCompletions: nextPlant.completions,
        },
      })

      return {
        order,
        plant: nextPlant,
        plantDidGrow,
        hadPendingGiftBlocked: Boolean(user.plantPendingGiftCode) && !plantDidGrow,
      }
    })

    return NextResponse.json({
      ok: true,
      orderId: result.order.id,
      totalIls: result.order.total_ils.toString(),
      plant: {
        stage: result.plant.stage,
        pendingGiftCode: result.plant.pendingGiftCode,
        completions: result.plant.completions,
      },
      plantDidGrow: result.plantDidGrow,
      plantMessage: result.hadPendingGiftBlocked
        ? "Your order is in — claim your gift on My Plant first to keep growing your plant."
        : undefined,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : ""
    if (msg.startsWith("PRODUCT_")) {
      return NextResponse.json({ message: "One or more products are unavailable." }, { status: 400 })
    }
    if (msg.startsWith("STOCK_")) {
      return NextResponse.json({ message: "Not enough stock for an item in your cart." }, { status: 400 })
    }
    console.error("checkout POST", e)
    return NextResponse.json({ message: "Could not complete order" }, { status: 500 })
  }
}

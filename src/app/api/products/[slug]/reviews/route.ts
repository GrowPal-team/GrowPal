import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }
const prisma = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params
    const decoded = decodeURIComponent(slug)
    const idNum = parseInt(decoded, 10)

    let productId: number | null = null
    if (!Number.isNaN(idNum) && String(idNum) === decoded) {
      const p = await prisma.product.findFirst({ where: { id: idNum }, select: { id: true } })
      productId = p?.id ?? null
    }
    if (productId == null) {
      const p = await prisma.product.findFirst({ where: { slug: decoded }, select: { id: true } })
      productId = p?.id ?? null
    }
    if (productId == null) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const reviews = await prisma.productReview.findMany({
      where: { productId },
      include: {
        user: { select: { id: true, full_name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    const rows = reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      body: r.body,
      createdAt: r.createdAt.toISOString(),
      userName: r.user.full_name,
      userId: r.user.id,
    }))

    const avg =
      rows.length === 0 ? 0 : rows.reduce((s, r) => s + r.rating, 0) / rows.length

    return NextResponse.json({ reviews: rows, averageRating: avg, count: rows.length })
  } catch (e: any) {
    console.error("reviews GET", e)
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 })
  }
}

export async function POST(request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params
    const decoded = decodeURIComponent(slug)
    const body = await request.json()
    const userId = Number(body.userId)
    const rating = Math.min(5, Math.max(1, Number(body.rating) || 5))
    const text = String(body.body || "").trim()
    if (!userId) {
      return NextResponse.json({ error: "Login required to comment" }, { status: 401 })
    }
    if (text.length < 2) {
      return NextResponse.json({ error: "Comment too short" }, { status: 400 })
    }

    const idNum = parseInt(decoded, 10)
    let product = null
    if (!Number.isNaN(idNum) && String(idNum) === decoded) {
      product = await prisma.product.findFirst({ where: { id: idNum } })
    }
    if (!product) {
      product = await prisma.product.findFirst({ where: { slug: decoded } })
    }
    if (!product) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const created = await prisma.productReview.create({
      data: {
        productId: product.id,
        userId,
        rating,
        body: text,
      },
      include: { user: { select: { full_name: true, id: true } } },
    })

    return NextResponse.json({
      review: {
        id: created.id,
        rating: created.rating,
        body: created.body,
        createdAt: created.createdAt.toISOString(),
        userName: created.user.full_name,
        userId: created.user.id,
      },
    })
  } catch (e: any) {
    console.error("reviews POST", e)
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 })
  }
}

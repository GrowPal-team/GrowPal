import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { assertExpert, expertMayAccessThread } from "@/lib/expert-thread-access"

type Ctx = { params: Promise<{ id: string }> }

/** POST { expertUserId, body?, productId? } — expert-only, thread must be open for work */
export async function POST(request: Request, ctx: Ctx) {
  try {
    const { id: raw } = await ctx.params
    const threadId = parseInt(raw, 10)
    if (Number.isNaN(threadId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 })
    }

    const body = await request.json()
    const expertUserId = Number(body.expertUserId)
    const text = typeof body.body === "string" ? body.body.trim() : ""
    const productId = body.productId != null ? Number(body.productId) : null

    if (!expertUserId || (!text && !productId)) {
      return NextResponse.json({ error: "expertUserId and body or productId required" }, { status: 400 })
    }

    const expert = await assertExpert(expertUserId)
    if (!expert) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const thread = await prisma.expertThread.findUnique({ where: { id: threadId } })
    if (!thread) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    if (thread.status === "closed") {
      return NextResponse.json({ error: "Consultation is closed" }, { status: 400 })
    }

    if (!expertMayAccessThread(thread, expertUserId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (thread.claimedByExpertUserId != null && thread.claimedByExpertUserId !== expertUserId) {
      return NextResponse.json({ error: "Thread is handled by another expert" }, { status: 403 })
    }

    if (productId) {
      const p = await prisma.product.findFirst({ where: { id: productId, is_active: true } })
      if (!p) {
        return NextResponse.json({ error: "Product not found" }, { status: 400 })
      }
    }

    const rec = await prisma.expertRecommendation.create({
      data: {
        threadId,
        expertUserId,
        body: text || "Recommended plant for your setup.",
        productId: productId && !Number.isNaN(productId) ? productId : null,
      },
      include: {
        product: {
          select: { id: true, name: true, slug: true, price_ils: true, imageUrl: true },
        },
      },
    })

    const tip = text || (productId ? "Recommended plant for your setup." : "")

    await prisma.expertThreadMessage.create({
      data: {
        threadId,
        senderUserId: expertUserId,
        senderRole: "expert",
        body: `[Recommendation] ${tip}`,
      },
    })

    await prisma.expertThread.update({
      where: { id: threadId },
      data: {
        lastMessagePreview:
          tip.length > 200 ? `${tip.slice(0, 197)}…` : tip,
      },
    })

    return NextResponse.json({
      ok: true,
      recommendation: {
        id: rec.id,
        body: rec.body,
        productId: rec.productId,
        product: rec.product
          ? {
              id: rec.product.id,
              name: rec.product.name,
              slug: rec.product.slug,
              price_ils: Number(rec.product.price_ils),
              imageUrl: rec.product.imageUrl,
            }
          : null,
      },
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed"
    console.error("expert recommendations POST", e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

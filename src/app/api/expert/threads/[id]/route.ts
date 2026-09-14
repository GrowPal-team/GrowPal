import { NextResponse } from "next/server"
import { assertExpert, expertMayAccessThread, loadExpertThread } from "@/lib/expert-thread-access"
import { getMessageAttachmentMap, getThreadRating } from "@/lib/expert-consultation-store"
import { closeExpiredThreadsForUser } from "@/lib/expert-thread-runtime"

type Ctx = { params: Promise<{ id: string }> }

async function serializeThread(thread: any) {
  const [attachmentMap, rating] = await Promise.all([
    getMessageAttachmentMap(thread.messages.map((m) => m.id)),
    getThreadRating(thread.id),
  ])

  return {
    thread: {
      id: thread.id,
      userId: thread.userId,
      status: thread.status,
      claimedByExpertUserId: thread.claimedByExpertUserId,
      subject: thread.subject,
      lastMessagePreview: thread.lastMessagePreview,
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt,
      customer: thread.customer,
      claimedByExpert: thread.claimedByExpert,
    },
    messages: thread.messages.map((m) => ({
      id: m.id,
      threadId: m.threadId,
      senderUserId: m.senderUserId,
      senderRole: m.senderRole,
      body: m.body,
      createdAt: m.createdAt,
      attachments: attachmentMap[m.id] || [],
    })),
    recommendations: thread.recommendations.map((r) => ({
      id: r.id,
      threadId: r.threadId,
      expertUserId: r.expertUserId,
      body: r.body,
      productId: r.productId,
      createdAt: r.createdAt,
      product: r.product
        ? {
            id: r.product.id,
            name: r.product.name,
            slug: r.product.slug,
            price_ils: Number(r.product.price_ils),
            imageUrl: r.product.imageUrl,
          }
        : null,
    })),
    rating,
  }
}

export async function GET(request: Request, ctx: Ctx) {
  try {
    const { id: raw } = await ctx.params
    const threadId = parseInt(raw, 10)
    if (Number.isNaN(threadId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const expertUserId = searchParams.get("expertUserId")

    const uid = userId ? parseInt(userId, 10) : undefined
    const eid = expertUserId ? parseInt(expertUserId, 10) : undefined

    if ((uid === undefined || Number.isNaN(uid)) && (eid === undefined || Number.isNaN(eid))) {
      return NextResponse.json({ error: "userId or expertUserId required" }, { status: 400 })
    }

    const thread = await loadExpertThread(threadId)
    if (!thread) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    if (uid !== undefined && !Number.isNaN(uid) && thread.userId === uid) {
      await closeExpiredThreadsForUser(uid)
      const refreshed = await loadExpertThread(threadId)
      if (!refreshed) return NextResponse.json({ error: "Not found" }, { status: 404 })
      return NextResponse.json(await serializeThread(refreshed))
    }

    if (eid !== undefined && !Number.isNaN(eid)) {
      await closeExpiredThreadsForUser(thread.userId)
      const updatedThread = await loadExpertThread(threadId)
      if (!updatedThread) return NextResponse.json({ error: "Not found" }, { status: 404 })
      const expert = await assertExpert(eid)
      if (!expert || !expertMayAccessThread(updatedThread, eid)) {
        return NextResponse.json({ error: "Forbidden or not found" }, { status: 403 })
      }
      return NextResponse.json(await serializeThread(updatedThread))
    }

    return NextResponse.json({ error: "Forbidden or not found" }, { status: 403 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed"
    console.error("expert thread GET", e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

/** Mark consultation solved: PATCH { expertUserId, action: "close" } */
export async function PATCH(request: Request, ctx: Ctx) {
  try {
    await request.json().catch(() => ({}))
    void ctx
    return NextResponse.json(
      { error: "Manual close is disabled. Consultations are closed automatically after 24 hours." },
      { status: 410 }
    )
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed"
    console.error("expert thread PATCH", e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { assertExpert, expertMayAccessThread } from "@/lib/expert-thread-access"
import { setMessageAttachments, type UploadedAsset } from "@/lib/expert-consultation-store"
import {
  addThreadMessage,
  closeExpiredThreadsForUser,
  getBasicThread,
  updateThreadAfterMessage,
} from "@/lib/expert-thread-runtime"

type Ctx = { params: Promise<{ id: string }> }

function preview(s: string, max = 200) {
  const t = s.trim().replace(/\s+/g, " ")
  return t.length <= max ? t : `${t.slice(0, max)}…`
}

function cleanAttachments(value: unknown): UploadedAsset[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((item) => item && typeof item === "object")
    .map((item) => {
      const file = item as Partial<UploadedAsset>
      return {
        url: typeof file.url === "string" ? file.url : "",
        name: typeof file.name === "string" ? file.name : "Image",
        contentType: typeof file.contentType === "string" ? file.contentType : "image/jpeg",
        uploadedAt: typeof file.uploadedAt === "string" ? file.uploadedAt : new Date().toISOString(),
      }
    })
    .filter((file) => file.url)
}

export async function POST(request: Request, ctx: Ctx) {
  try {
    const { id: raw } = await ctx.params
    const threadId = parseInt(raw, 10)
    if (Number.isNaN(threadId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 })
    }

    const body = await request.json()
    const text = typeof body.body === "string" ? body.body.trim() : ""
    const userId = body.userId != null ? Number(body.userId) : undefined
    const expertUserId = body.expertUserId != null ? Number(body.expertUserId) : undefined
    const attachments = cleanAttachments(body.attachments)

    if (!text && attachments.length === 0) {
      return NextResponse.json({ error: "A message or image is required" }, { status: 400 })
    }

    if ((!userId || Number.isNaN(userId)) && (!expertUserId || Number.isNaN(expertUserId))) {
      return NextResponse.json({ error: "userId or expertUserId required" }, { status: 400 })
    }

    const thread = await getBasicThread(threadId)
    if (!thread) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 })
    }
    await closeExpiredThreadsForUser(thread.userId)
    const freshThread = await getBasicThread(threadId)
    if (!freshThread) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 })
    }

    if (freshThread.status === "closed") {
      return NextResponse.json({ error: "Thread is closed" }, { status: 400 })
    }

    if (userId) {
      if (freshThread.userId !== userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
      const messageId = await addThreadMessage({
        threadId,
        senderUserId: userId,
        senderRole: "customer",
        body: text || "Shared image attachment",
      })
      if (attachments.length) {
        await setMessageAttachments(messageId, attachments)
      }
      await updateThreadAfterMessage({
        threadId,
        preview: preview(text || `Sent ${attachments.length} image${attachments.length === 1 ? "" : "s"}`),
      })
      return NextResponse.json({ ok: true })
    }

    if (expertUserId) {
      const expert = await assertExpert(expertUserId)
      if (!expert) {
        return NextResponse.json({ error: "Invalid expert" }, { status: 403 })
      }

      if (!expertMayAccessThread(freshThread, expertUserId)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }

      if (freshThread.claimedByExpertUserId != null && freshThread.claimedByExpertUserId !== expertUserId) {
        return NextResponse.json({ error: "Thread is handled by another expert" }, { status: 403 })
      }

      await updateThreadAfterMessage({
        threadId,
        preview: preview(text || `Sent ${attachments.length} image${attachments.length === 1 ? "" : "s"}`),
        claimedByExpertUserId: expertUserId,
        claimNow: freshThread.claimedByExpertUserId == null,
      })

      const messageId = await addThreadMessage({
        threadId,
        senderUserId: expertUserId,
        senderRole: "expert",
        body: text || "Shared image attachment",
      })
      if (attachments.length) {
        await setMessageAttachments(messageId, attachments)
      }

      return NextResponse.json({ ok: true, claimed: freshThread.claimedByExpertUserId == null })
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed"
    console.error("expert thread messages POST", e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

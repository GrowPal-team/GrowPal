import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  addPaidConsultationCredit,
  consumePaidConsultationCredit,
  getPaidConsultationCredits,
  setMessageAttachments,
  type UploadedAsset,
} from "@/lib/expert-consultation-store"
import {
  closeExpiredThreadsForExpertInbox,
  closeExpiredThreadsForUser,
  createThreadWithFirstMessage,
  getActiveThreadForUser,
  getThreadCountForUser,
  listThreadsForExpert,
  listThreadsForUser,
} from "@/lib/expert-thread-runtime"

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

/** Customer: GET ?userId= — Expert inbox: GET ?expertUserId= */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const expertUserId = searchParams.get("expertUserId")

    if (expertUserId) {
      const eid = parseInt(expertUserId, 10)
      if (Number.isNaN(eid)) {
        return NextResponse.json({ error: "Invalid expertUserId" }, { status: 400 })
      }
      const expert = await prisma.user.findUnique({ where: { id: eid } })
      if (!expert || expert.role !== "expert") {
        return NextResponse.json({ error: "Invalid expert" }, { status: 403 })
      }
      await closeExpiredThreadsForExpertInbox(eid)
      const threads = await listThreadsForExpert(eid)
      return NextResponse.json({
        threads: threads.map((thread: any) => ({
          ...thread,
          lastSenderRole:
            typeof thread.lastSenderRole === "string"
              ? thread.lastSenderRole
              : Array.isArray(thread.messages) && thread.messages[0]
                ? thread.messages[0].senderRole
                : null,
          unread:
            typeof thread.unread === "boolean"
              ? thread.unread
              : Array.isArray(thread.messages) && thread.messages[0]
                ? thread.messages[0].senderRole === "customer"
                : false,
        })),
      })
    }

    if (userId) {
      const uid = parseInt(userId, 10)
      if (Number.isNaN(uid)) {
        return NextResponse.json({ error: "Invalid userId" }, { status: 400 })
      }
      await closeExpiredThreadsForUser(uid)
      const threads = await listThreadsForUser(uid)
      return NextResponse.json({ threads })
    }

    return NextResponse.json({ error: "userId or expertUserId required" }, { status: 400 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed"
    console.error("expert threads GET", e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

/** Create thread + first customer message: POST { userId, body, subject? } */
export async function POST(request: Request) {
  let paidCreditConsumedForUserId: number | null = null
  try {
    const body = await request.json()
    const userId = Number(body.userId)
    const text = typeof body.body === "string" ? body.body.trim() : ""
    const subject = typeof body.subject === "string" ? body.subject.trim().slice(0, 255) : null
    const attachments = cleanAttachments(body.attachments)

    if (!userId || (!text && attachments.length === 0)) {
      return NextResponse.json({ error: "userId and a message or image are required" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    await closeExpiredThreadsForUser(userId)

    const [existingActiveThread, threadCount, paidCredits] = await Promise.all([
      getActiveThreadForUser(userId),
      getThreadCountForUser(userId),
      getPaidConsultationCredits(userId),
    ])

    if (existingActiveThread) {
      return NextResponse.json(
        {
          error: "You already have an active expert consultation.",
          threadId: existingActiveThread.id,
        },
        { status: 409 }
      )
    }

    const usingFreeConsultation = threadCount === 0
    if (!usingFreeConsultation) {
      const consumed = await consumePaidConsultationCredit(userId)
      if (!consumed) {
        return NextResponse.json(
          {
            error: "Your first consultation is free. Follow-up consultations require ₪ 20.",
            needPayment: true,
            paidCredits,
            followUpPriceIls: 20,
          },
          { status: 402 }
        )
      }
      paidCreditConsumedForUserId = userId
    }

    const thread = await createThreadWithFirstMessage({
      userId,
      subject: subject || null,
      preview: preview(text || `Sent ${attachments.length} image${attachments.length === 1 ? "" : "s"}`),
      body: text || "Shared image attachment",
    })

    if (attachments.length) {
      await setMessageAttachments(thread.messageId, attachments)
    }

    return NextResponse.json({
      threadId: thread.threadId,
      usedFreeConsultation: usingFreeConsultation,
      remainingPaidCredits: usingFreeConsultation ? paidCredits : Math.max(0, paidCredits - 1),
    })
  } catch (e: unknown) {
    if (paidCreditConsumedForUserId) {
      await addPaidConsultationCredit(paidCreditConsumedForUserId, 1)
    }
    const msg = e instanceof Error ? e.message : "Failed"
    console.error("expert threads POST", e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

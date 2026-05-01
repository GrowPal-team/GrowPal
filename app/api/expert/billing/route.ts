import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { addPaidConsultationCredit, getPaidConsultationCredits } from "@/lib/expert-consultation-store"
import { closeExpiredThreadsForUser, getActiveThreadForUser, getThreadCountForUser } from "@/lib/expert-thread-runtime"

const FOLLOW_UP_PRICE_ILS = 20

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = parseInt(searchParams.get("userId") || "", 10)
    if (Number.isNaN(userId)) {
      return NextResponse.json({ error: "userId required" }, { status: 400 })
    }

    await closeExpiredThreadsForUser(userId)

    const [threadCount, activeThread, paidCredits] = await Promise.all([
      getThreadCountForUser(userId),
      getActiveThreadForUser(userId),
      getPaidConsultationCredits(userId),
    ])

    const firstConsultationAvailable = threadCount === 0
    const canStartNewConsultation = Boolean(activeThread) || firstConsultationAvailable || paidCredits > 0

    return NextResponse.json({
      firstConsultationAvailable,
      paidCredits,
      followUpPriceIls: FOLLOW_UP_PRICE_ILS,
      activeThreadId: activeThread?.id ?? null,
      activeThreadStatus: activeThread?.status ?? null,
      canStartNewConsultation,
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed"
    console.error("expert billing GET", e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const userId = Number(body.userId)
    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const paidCredits = await addPaidConsultationCredit(userId, 1)

    return NextResponse.json({
      ok: true,
      paidCredits,
      followUpPriceIls: FOLLOW_UP_PRICE_ILS,
      message: `Payment confirmed. You can now start one more expert consultation for ₪ ${FOLLOW_UP_PRICE_ILS}.`,
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Payment failed"
    console.error("expert billing POST", e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

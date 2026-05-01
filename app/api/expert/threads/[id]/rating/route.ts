import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getThreadRating, setThreadRating } from "@/lib/expert-consultation-store"

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_request: Request, ctx: Ctx) {
  try {
    const { id: raw } = await ctx.params
    const threadId = parseInt(raw, 10)
    if (Number.isNaN(threadId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 })
    }

    const rating = await getThreadRating(threadId)
    return NextResponse.json({ rating })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed"
    console.error("expert rating GET", e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST(request: Request, ctx: Ctx) {
  try {
    const { id: raw } = await ctx.params
    const threadId = parseInt(raw, 10)
    if (Number.isNaN(threadId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 })
    }

    const body = await request.json()
    const userId = Number(body.userId)
    const rating = Number(body.rating)
    const feedback = typeof body.feedback === "string" ? body.feedback.trim().slice(0, 1500) : ""

    if (!userId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "userId and rating are required" }, { status: 400 })
    }

    const thread = await prisma.expertThread.findUnique({
      where: { id: threadId },
      select: { id: true, userId: true, status: true },
    })

    if (!thread || thread.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (thread.status !== "closed") {
      return NextResponse.json({ error: "You can rate only after the consultation is closed" }, { status: 400 })
    }

    const existing = await getThreadRating(threadId)
    if (existing) {
      return NextResponse.json({ error: "Rating already submitted" }, { status: 400 })
    }

    await setThreadRating(threadId, { rating, feedback })

    return NextResponse.json({
      ok: true,
      rating: {
        rating,
        feedback,
        anonymous: true,
      },
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed"
    console.error("expert rating POST", e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

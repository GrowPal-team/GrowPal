import { NextResponse } from "next/server"
import { getCommunityFeedback, userCanSubmitFeedback } from "@/lib/community-feedback"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "@/lib/session-server"

export async function GET() {
  try {
    const feedback = await getCommunityFeedback()
    return NextResponse.json({ feedback })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load feedback."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession()
  if (!session) {
    return NextResponse.json({ error: "Sign in to leave feedback." }, { status: 401 })
  }

  try {
    const body = (await request.json()) as {
      rating?: number
      title?: string
      body?: string
    }

    const rating = Number(body.rating)
    const normalizedRating = Math.round(rating * 2) / 2
    if (!Number.isFinite(normalizedRating) || normalizedRating < 0.5 || normalizedRating > 5 || normalizedRating !== rating) {
      return NextResponse.json({ error: "Rating must be between 0.5 and 5 in 0.5-star steps." }, { status: 400 })
    }

    const feedbackBody = typeof body.body === "string" ? body.body.trim() : ""
    if (feedbackBody.length < 10) {
      return NextResponse.json({ error: "Feedback must be at least 10 characters." }, { status: 400 })
    }

    const title = typeof body.title === "string" ? body.title.trim().slice(0, 150) : ""
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { id: true, role: true },
    })
    if (!user || user.role === "admin") {
      return NextResponse.json({ error: "Only customer accounts can add feedback." }, { status: 403 })
    }

    const eligible = await userCanSubmitFeedback(session.id)
    if (!eligible) {
      return NextResponse.json(
        { error: "You need at least one completed or paid order before leaving feedback." },
        { status: 403 }
      )
    }

    await prisma.$executeRaw`
      INSERT INTO community_feedback (user_id, rating, title, body)
      VALUES (${session.id}, ${normalizedRating}, ${title || null}, ${feedbackBody})
    `

    const feedback = await getCommunityFeedback()
    return NextResponse.json({ ok: true, feedback })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to save feedback."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

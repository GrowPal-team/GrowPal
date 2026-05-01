import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { userCanSubmitFeedback } from "@/lib/community-feedback"
import { getServerSession } from "@/lib/session-server"

export async function GET() {
  const session = await getServerSession()
  if (!session) {
    return NextResponse.json({
      canSubmit: false,
      reason: "Sign in to check whether you can add feedback.",
    })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { id: true, role: true, full_name: true, email: true },
    })

    if (!user || user.role === "admin") {
      return NextResponse.json({
        canSubmit: false,
        reason: "Only signed-in customer accounts can add feedback.",
      })
    }

    const canSubmit = await userCanSubmitFeedback(session.id)

    return NextResponse.json({
      canSubmit,
      reason: canSubmit ? null : "You need at least one paid order before adding feedback.",
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email,
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to check eligibility."
    return NextResponse.json({ canSubmit: false, reason: message }, { status: 500 })
  }
}

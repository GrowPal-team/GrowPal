import { NextResponse } from "next/server"
import { getFeaturedCommunityFeedback } from "@/lib/community-feedback"

export async function GET() {
  try {
    const feedback = await getFeaturedCommunityFeedback(3)
    return NextResponse.json({ feedback })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load featured feedback."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

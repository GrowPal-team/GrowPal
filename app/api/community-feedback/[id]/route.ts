import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "@/lib/session-server"

type Ctx = { params: Promise<{ id: string }> }

export async function DELETE(_request: Request, ctx: Ctx) {
  const session = await getServerSession()
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id: rawId } = await ctx.params
  const feedbackId = Number(rawId)
  if (!Number.isInteger(feedbackId) || feedbackId < 1) {
    return NextResponse.json({ error: "Invalid feedback id." }, { status: 400 })
  }

  const existing = await prisma.$queryRaw<Array<{ id: number }>>`
    SELECT id
    FROM community_feedback
    WHERE id = ${feedbackId}
    LIMIT 1
  `

  if (!existing[0]) {
    return NextResponse.json({ error: "Feedback not found." }, { status: 404 })
  }

  await prisma.$executeRaw`
    DELETE FROM community_feedback
    WHERE id = ${feedbackId}
  `

  revalidatePath("/")
  revalidatePath("/feedback")
  revalidatePath("/admin/feedback")

  return NextResponse.json({ ok: true, feedbackId })
}

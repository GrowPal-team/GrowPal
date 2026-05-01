import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "@/lib/session-server"

type Ctx = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, ctx: Ctx) {
  const session = await getServerSession()
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id: rawId } = await ctx.params
  const userId = Number(rawId)
  if (!userId) {
    return NextResponse.json({ error: "Invalid user id" }, { status: 400 })
  }

  const body = await request.json().catch(() => ({}))
  const approvalStatus = String(body.approvalStatus || "").trim().toLowerCase()
  if (!["approved", "pending", "rejected"].includes(approvalStatus)) {
    return NextResponse.json({ error: "Invalid approval status" }, { status: 400 })
  }

  const expertRows = await prisma.$queryRaw<Array<{ id: number; full_name: string; email: string; role: string }>>`
    SELECT id, full_name, email, role
    FROM users
    WHERE id = ${userId}
      AND role = 'expert'
    LIMIT 1
  `

  const expertUser = expertRows[0]
  if (!expertUser) {
    return NextResponse.json({ error: "Expert account not found" }, { status: 404 })
  }

  const fallbackDisplayName = expertUser.full_name?.trim() || expertUser.email.split("@")[0] || "Expert"

  await prisma.$executeRaw`
    INSERT INTO experts (user_id, display_name, approval_status)
    VALUES (${userId}, ${fallbackDisplayName.slice(0, 200)}, ${approvalStatus})
    ON DUPLICATE KEY UPDATE approval_status = VALUES(approval_status)
  `

  revalidatePath("/admin")
  revalidatePath("/admin/experts")

  return NextResponse.json({
    ok: true,
    userId,
    approvalStatus,
  })
}

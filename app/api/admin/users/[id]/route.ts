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
  const nextStatus = String(body.status || "").trim().toLowerCase()
  if (nextStatus !== "active" && nextStatus !== "blocked") {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 })
  }

  if (session.id === userId && nextStatus === "blocked") {
    return NextResponse.json({ error: "You cannot block your own admin account." }, { status: 400 })
  }

  const userRows = await prisma.$queryRaw<Array<{ id: number; role: string }>>`
    SELECT id, role
    FROM users
    WHERE id = ${userId}
    LIMIT 1
  `

  if (!userRows[0]) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  await prisma.$executeRaw`
    UPDATE users
    SET status = ${nextStatus}
    WHERE id = ${userId}
  `

  revalidatePath("/admin")
  revalidatePath("/admin/users")

  return NextResponse.json({
    ok: true,
    userId,
    status: nextStatus,
  })
}

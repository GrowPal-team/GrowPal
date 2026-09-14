import { prisma } from "@/lib/prisma"
import { loadThreadDetail } from "@/lib/expert-thread-runtime"

export async function loadExpertThread(threadId: number) {
  return loadThreadDetail(threadId)
}

/** Customer: own thread. Expert: open = any; claimed/closed = only assigned expert. */
export function expertMayAccessThread(
  thread: { status: string; claimedByExpertUserId: number | null },
  expertUserId: number
): boolean {
  if (thread.status === "closed") {
    return thread.claimedByExpertUserId === expertUserId
  }
  if (thread.status === "open") {
    return true
  }
  return thread.claimedByExpertUserId === expertUserId
}

export async function assertExpert(userId: number) {
  const u = await prisma.user.findUnique({ where: { id: userId } })
  if (!u || u.role !== "expert") return null
  const approvalRows = await prisma.$queryRaw<Array<{ approval_status: string | null }>>`
    SELECT approval_status
    FROM experts
    WHERE user_id = ${userId}
    LIMIT 1
  `
  const approvalStatus = String(approvalRows[0]?.approval_status || "approved").trim().toLowerCase()
  if (approvalStatus === "pending" || approvalStatus === "rejected") {
    return null
  }
  return u
}

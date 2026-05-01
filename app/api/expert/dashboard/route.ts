import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { assertExpert } from "@/lib/expert-thread-access"

type ExpertThreadModelLike = {
  findMany: (...args: any[]) => Promise<any[]>
}

/** GET ?expertUserId= — summary stats + recent active threads */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const eid = parseInt(searchParams.get("expertUserId") || "", 10)
    if (Number.isNaN(eid)) {
      return NextResponse.json({ error: "expertUserId required" }, { status: 400 })
    }

    const expert = await assertExpert(eid)
    if (!expert) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const expertThreadModel = (prisma as unknown as { expertThread?: ExpertThreadModelLike }).expertThread

    if (expertThreadModel) {
      const inboxWhere = {
        status: { not: "closed" as const },
        OR: [{ status: "open" as const }, { claimedByExpertUserId: eid }],
      }

      const [activeThreads, openThreads, helpedThreads, recentThreads] = await Promise.all([
        expertThreadModel.findMany({
          where: inboxWhere,
          select: { id: true },
        }),
        expertThreadModel.findMany({
          where: { status: "open" },
          select: { id: true },
        }),
        expertThreadModel.findMany({
          where: { claimedByExpertUserId: eid },
          select: { userId: true },
        }),
        expertThreadModel.findMany({
          where: inboxWhere,
          take: 6,
          orderBy: { updatedAt: "desc" },
          include: {
            customer: { select: { id: true, full_name: true, email: true } },
          },
        }),
      ])

      const uniqueCustomersHelped = new Set(helpedThreads.map((thread: { userId: number }) => thread.userId)).size

      return NextResponse.json({
        activeConsultations: activeThreads.length,
        newThreads: openThreads.length,
        uniqueCustomersHelped,
        recentThreads: recentThreads.map((t: any) => ({
          id: t.id,
          status: t.status,
          lastMessagePreview: t.lastMessagePreview,
          updatedAt: t.updatedAt,
          customer: t.customer,
        })),
      })
    }

    const [activeRows, openRows, helpedRows, recentRows] = await Promise.all([
      prisma.$queryRaw<Array<{ count: bigint | number }>>`
        SELECT COUNT(*) AS count
        FROM expert_threads
        WHERE status <> 'closed'
          AND (status = 'open' OR claimed_by_expert_id = ${eid})
      `,
      prisma.$queryRaw<Array<{ count: bigint | number }>>`
        SELECT COUNT(*) AS count
        FROM expert_threads
        WHERE status = 'open'
      `,
      prisma.$queryRaw<Array<{ user_id: number }>>`
        SELECT DISTINCT user_id
        FROM expert_threads
        WHERE claimed_by_expert_id = ${eid}
      `,
      prisma.$queryRaw<
        Array<{
          id: number
          status: string
          last_message_preview: string | null
          updated_at: Date | string
          customer_id: number
          customer_name: string
          customer_email: string
        }>
      >`
        SELECT
          t.id,
          t.status,
          t.last_message_preview,
          t.updated_at,
          u.id AS customer_id,
          u.full_name AS customer_name,
          u.email AS customer_email
        FROM expert_threads t
        INNER JOIN users u ON u.id = t.user_id
        WHERE t.status <> 'closed'
          AND (t.status = 'open' OR t.claimed_by_expert_id = ${eid})
        ORDER BY t.updated_at DESC
        LIMIT 6
      `,
    ])

    const activeConsultations = Number(activeRows[0]?.count || 0)
    const newThreads = Number(openRows[0]?.count || 0)
    const uniqueCustomersHelped = helpedRows.length

    return NextResponse.json({
      activeConsultations,
      newThreads,
      uniqueCustomersHelped,
      recentThreads: recentRows.map((row) => ({
        id: row.id,
        status: row.status,
        lastMessagePreview: row.last_message_preview,
        updatedAt: row.updated_at,
        customer: {
          id: row.customer_id,
          full_name: row.customer_name,
          email: row.customer_email,
        },
      })),
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed"
    console.error("expert dashboard GET", e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

import { prisma } from "@/lib/prisma"

export type CommunityFeedbackItem = {
  id: number
  userId: number
  name: string
  email: string
  rating: number
  title: string | null
  body: string
  createdAt: string
}

type FeedbackRow = {
  id: number
  user_id: number
  full_name: string
  email: string
  rating: number
  title: string | null
  body: string
  created_at: Date | string
}

function isMissingFeedbackTable(error: unknown) {
  return error instanceof Error && /community_feedback/i.test(error.message)
}

function isMissingFeedbackColumn(error: unknown, column: string) {
  return error instanceof Error && new RegExp(`Unknown column '.*${column}.*'`, "i").test(error.message)
}

async function getFeedbackColumns() {
  try {
    const rows = await prisma.$queryRawUnsafe<Array<{ Field: string }>>("SHOW COLUMNS FROM community_feedback")
    return new Set(rows.map((row) => String(row.Field || "").toLowerCase()))
  } catch (error: unknown) {
    if (isMissingFeedbackTable(error)) {
      return null
    }
    throw error
  }
}

async function queryFeedback(limit: number) {
  const columns = await getFeedbackColumns()
  if (!columns) {
    return []
  }

  const titleSelect = columns.has("title") ? "f.title" : "NULL AS title"

  return prisma.$queryRawUnsafe<Array<FeedbackRow>>(
    `
      SELECT
        f.id,
        f.user_id,
        u.full_name,
        u.email,
        f.rating,
        ${titleSelect},
        f.body,
        f.created_at
      FROM community_feedback f
      INNER JOIN users u ON u.id = f.user_id
      ORDER BY f.created_at DESC, f.id DESC
      LIMIT ?
    `,
    limit
  )
}

function mapFeedbackRow(row: FeedbackRow): CommunityFeedbackItem {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.full_name,
    email: row.email,
    rating: Number(row.rating),
    title: row.title,
    body: row.body,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
  }
}

export async function getCommunityFeedback(limit = 50) {
  try {
    const rows = await queryFeedback(limit)
    return rows.map(mapFeedbackRow)
  } catch (error: unknown) {
    if (isMissingFeedbackTable(error) || isMissingFeedbackColumn(error, "title")) {
      return []
    }
    throw error
  }
}

export async function getFeaturedCommunityFeedback(limit = 3) {
  try {
    const rows = await queryFeedback(limit)
    return rows.map(mapFeedbackRow)
  } catch (error: unknown) {
    if (isMissingFeedbackTable(error) || isMissingFeedbackColumn(error, "title")) {
      return []
    }
    throw error
  }
}

export async function userCanSubmitFeedback(userId: number) {
  const rows = await prisma.$queryRaw<Array<{ count: bigint | number }>>`
    SELECT COUNT(*) AS count
    FROM orders
    WHERE user_id = ${userId}
      AND status IN ('PAID_MOCK', 'PAID', 'SHIPPED', 'DELIVERED')
  `

  return Number(rows[0]?.count || 0) > 0
}

import { Prisma } from "@prisma/client"
import type { PrismaClient } from "@prisma/client"

export type RewardCodeRecord = {
  id: number
  user_id: number
  code: string
  status: string
  claimed_at: Date | string
  redeemed_at: Date | string | null
}

type DbLike = PrismaClient | Prisma.TransactionClient

const CREATE_REWARD_CODES_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS reward_codes (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    code VARCHAR(48) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'saved',
    claimed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    redeemed_at TIMESTAMP NULL DEFAULT NULL,
    UNIQUE KEY uq_reward_codes_code (code),
    KEY idx_reward_codes_user_status (user_id, status)
  )
`

export async function ensureRewardCodesTable(db: DbLike) {
  await db.$executeRawUnsafe(CREATE_REWARD_CODES_TABLE_SQL)
}

export async function saveRewardCode(db: DbLike, userId: number, code: string) {
  await ensureRewardCodesTable(db)

  await db.$executeRaw`
    INSERT INTO reward_codes (user_id, code, status, claimed_at, redeemed_at)
    VALUES (${userId}, ${code}, 'saved', CURRENT_TIMESTAMP, NULL)
    ON DUPLICATE KEY UPDATE
      user_id = VALUES(user_id),
      status = 'saved',
      claimed_at = CURRENT_TIMESTAMP,
      redeemed_at = NULL
  `
}

export async function getSavedRewardCode(db: DbLike, userId: number, code?: string | null) {
  try {
    const codeFilter = code ? Prisma.sql`AND code = ${code}` : Prisma.sql``
    const rows = await db.$queryRaw<RewardCodeRecord[]>(Prisma.sql`
      SELECT id, user_id, code, status, claimed_at, redeemed_at
      FROM reward_codes
      WHERE user_id = ${userId}
        AND status = 'saved'
        ${codeFilter}
      ORDER BY claimed_at DESC, id DESC
      LIMIT 1
    `)

    return rows[0] ?? null
  } catch {
    return null
  }
}

export async function markRewardCodeRedeemed(db: DbLike, userId: number, code: string) {
  await ensureRewardCodesTable(db)

  await db.$executeRaw`
    UPDATE reward_codes
    SET status = 'redeemed',
        redeemed_at = CURRENT_TIMESTAMP
    WHERE user_id = ${userId}
      AND code = ${code}
      AND status = 'saved'
  `
}

export async function hasAnyRewardCodeHistory(db: DbLike, userId: number) {
  try {
    const rows = await db.$queryRaw<{ total: bigint }[]>`
      SELECT COUNT(*) AS total
      FROM reward_codes
      WHERE user_id = ${userId}
    `

    return Number(rows[0]?.total ?? 0) > 0
  } catch {
    return false
  }
}

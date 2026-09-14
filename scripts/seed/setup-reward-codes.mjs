import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const sql = `
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

async function main() {
  await prisma.$executeRawUnsafe(sql)
  console.log("reward_codes table is ready.")
}

main()
  .catch((error) => {
    console.error("Could not prepare reward_codes table:", error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

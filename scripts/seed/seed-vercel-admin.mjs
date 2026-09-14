/**
 * Seeds the default admin user for hosted deployments.
 * Run: node scripts/seed/seed-vercel-admin.mjs
 */
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

const email = "sadeel@growpal.com"
const plainPassword = "Sadeel@123"
const fullName = "Sadeel Admin"

async function main() {
  const passwordHash = await bcrypt.hash(plainPassword, 10)

  await prisma.user.upsert({
    where: { email },
    update: {
      full_name: fullName,
      firstName: "Sadeel",
      lastName: "Admin",
      password_hash: passwordHash,
      role: "admin",
      emailVerified: true,
    },
    create: {
      full_name: fullName,
      firstName: "Sadeel",
      lastName: "Admin",
      email,
      password_hash: passwordHash,
      role: "admin",
      emailVerified: true,
    },
  })

  console.log(`Admin ready: ${email}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

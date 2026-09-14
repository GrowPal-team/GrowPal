import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

type AuthResult = {
  success: boolean
  message?: string
  user?: {
    id: number
    name: string
    firstName: string
    lastName: string
    email: string
    role: string
    status: string
    approvalStatus: string | null
    newsletterOptIn: boolean
  }
  needs_verification?: boolean
  email?: string
  user_id?: number
}

function displayName(user: {
  full_name: string
  firstName: string | null
  lastName: string | null
}) {
  const fn = (user.firstName || "").trim()
  const ln = (user.lastName || "").trim()
  if (fn || ln) return `${fn} ${ln}`.trim()
  return user.full_name.trim()
}

export function shouldUsePhpAuth(): boolean {
  return Boolean(process.env.PHP_API_BASE_URL?.trim())
}

export async function handleNativeAuth(body: Record<string, unknown>): Promise<AuthResult> {
  const action = String(body.action || "")

  if (action !== "login") {
    return {
      success: false,
      message:
        "This action is not available on the hosted preview yet. Use local XAMPP for full auth flows.",
    }
  }

  const databaseUrl = process.env.DATABASE_URL?.trim() || ""
  const isLocalDatabase =
    /localhost|127\.0\.0\.1/i.test(databaseUrl) || databaseUrl.includes("@127.0.0.1")

  if (!databaseUrl || (process.env.NODE_ENV === "production" && isLocalDatabase)) {
    return {
      success: false,
      message:
        "Login on the live site needs a cloud MySQL database. Add DATABASE_URL in Vercel (Railway MySQL).",
    }
  }

  const email = String(body.email || "")
    .trim()
    .toLowerCase()
  const password = String(body.password || "")

  if (!email || !password) {
    return { success: false, message: "Email and password are required" }
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: { experts: true },
  })

  if (!user) {
    return { success: false, message: "Invalid email or password" }
  }

  const passwordValid = await bcrypt.compare(password, user.password_hash)
  if (!passwordValid) {
    return { success: false, message: "Invalid email or password" }
  }

  if (user.emailVerified === false) {
    return {
      success: false,
      needs_verification: true,
      message: "Please verify your email first.",
      email: user.email,
      user_id: user.id,
    }
  }

  const fn = (user.firstName || "").trim()
  const ln = (user.lastName || "").trim()
  const role = String(user.role || "user").toLowerCase()
  let approvalStatus: string | null = null

  if (role === "expert") {
    approvalStatus = "approved"
  }

  return {
    success: true,
    message: "Login successful",
    user: {
      id: user.id,
      name: displayName(user),
      firstName: fn,
      lastName: ln,
      email: user.email,
      role,
      status: "active",
      approvalStatus,
      newsletterOptIn: Boolean(user.newsletterOptIn),
    },
  }
}

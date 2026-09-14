import crypto from "node:crypto"
import { cookies } from "next/headers"

export const SESSION_COOKIE_NAME = "growpal_session"
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7

export type ServerSessionUser = {
  id: number
  name: string
  email: string
  role: string
}

function base64UrlEncode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url")
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8")
}

function getSessionSecret() {
  return process.env.SESSION_SECRET || "growpal-local-session-secret"
}

function signPayload(payload: string) {
  return crypto.createHmac("sha256", getSessionSecret()).update(payload).digest("base64url")
}

function normalizeUser(user: ServerSessionUser): ServerSessionUser {
  return {
    id: Number(user.id),
    name: String(user.name || "").trim(),
    email: String(user.email || "").trim().toLowerCase(),
    role: String(user.role || "user").trim().toLowerCase(),
  }
}

export function createSessionToken(user: ServerSessionUser) {
  const payload = base64UrlEncode(JSON.stringify(normalizeUser(user)))
  const signature = signPayload(payload)
  return `${payload}.${signature}`
}

export function readSessionToken(token?: string | null): ServerSessionUser | null {
  if (!token) return null

  const [payload, signature] = token.split(".")
  if (!payload || !signature) return null

  const expected = signPayload(payload)
  const isValid =
    expected.length === signature.length &&
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))

  if (!isValid) return null

  try {
    const parsed = JSON.parse(base64UrlDecode(payload)) as Partial<ServerSessionUser>
    if (typeof parsed.id !== "number" || !parsed.email || !parsed.role) {
      return null
    }
    return normalizeUser(parsed as ServerSessionUser)
  } catch {
    return null
  }
}

export async function getServerSession() {
  const cookieStore = await cookies()
  return readSessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value)
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  }
}

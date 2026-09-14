import { NextRequest, NextResponse } from "next/server"
import { handleNativeAuth, shouldUsePhpAuth } from "@/lib/auth-server"
import { createSessionToken, getSessionCookieOptions, SESSION_COOKIE_NAME } from "@/lib/session-server"
import { buildPhpApiUrl } from "@/lib/php-api"

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  }
}

function attachSessionCookie(response: NextResponse, user: Record<string, unknown>) {
  response.cookies.set(
    SESSION_COOKIE_NAME,
    createSessionToken({
      id: Number(user.id),
      name: String(user.name || ""),
      email: String(user.email || ""),
      role: String(user.role || "user").toLowerCase(),
    }),
    getSessionCookieOptions(),
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const requiredRole =
      typeof body?.requiredRole === "string" && body.requiredRole.trim() !== ""
        ? body.requiredRole.trim().toLowerCase()
        : null

    const data = shouldUsePhpAuth()
      ? await forwardToPhpAuth(body)
      : await handleNativeAuth(body)

    if (body?.action === "login" && data?.success && data?.user) {
      const userRole = String(data.user.role || "user").trim().toLowerCase()

      if (requiredRole && userRole !== requiredRole) {
        return NextResponse.json(
          {
            success: false,
            message: "This account does not have access to this area.",
          },
          { status: 403, headers: corsHeaders() },
        )
      }

      const nextResponse = NextResponse.json(data, {
        status: 200,
        headers: corsHeaders(),
      })
      attachSessionCookie(nextResponse, data.user as Record<string, unknown>)
      return nextResponse
    }

    return NextResponse.json(data, {
      status: data.success ? 200 : 400,
      headers: corsHeaders(),
    })
  } catch (error: unknown) {
    console.error("Auth API error:", error)
    const message =
      error instanceof Error ? error.message : "An error occurred while processing your request"
    return NextResponse.json(
      {
        success: false,
        message: message.includes("fetch") ? "Could not reach the auth backend. Check DATABASE_URL on Vercel." : message,
      },
      { status: 500, headers: corsHeaders() },
    )
  }
}

async function forwardToPhpAuth(body: Record<string, unknown>) {
  const phpApiUrl = buildPhpApiUrl("auth.php")

  const response = await fetch(phpApiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })

  const contentType = response.headers.get("content-type") || ""
  const text = await response.text()

  if (!contentType.includes("application/json")) {
    console.error("PHP API returned non-JSON. Response starts with:", text.substring(0, 200))
    return {
      success: false,
      message: `Backend API returned HTML instead of JSON. Check the PHP API at ${phpApiUrl}.`,
    }
  }

  return JSON.parse(text)
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders(),
  })
}

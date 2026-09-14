import { NextRequest, NextResponse } from "next/server"
import { buildPhpApiUrl } from "@/lib/php-api"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const response = await fetch(buildPhpApiUrl("user-profile.php"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    const text = await response.text()
    const contentType = response.headers.get("content-type") || ""
    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        { success: false, message: "Profile API returned non-JSON. Is XAMPP running?" },
        { status: 502 }
      )
    }
    const data = JSON.parse(text)
    return NextResponse.json(data, { status: response.ok ? 200 : 400 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error"
    return NextResponse.json({ success: false, message: msg }, { status: 500 })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}

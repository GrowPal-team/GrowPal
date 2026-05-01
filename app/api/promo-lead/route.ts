import { NextRequest, NextResponse } from "next/server"

const PHP_PROMO_URL = "http://localhost/GrowPal/api/promo-lead.php"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = String(body.email ?? "")
      .trim()
      .toLowerCase()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, message: "Invalid email" }, { status: 400 })
    }

    const payload = {
      email,
      discount_label: body.discount_label || "10%",
      source: body.source || "homepage_modal",
    }

    try {
      const res = await fetch(PHP_PROMO_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const text = await res.text()
      if (res.ok) {
        try {
          return NextResponse.json(JSON.parse(text))
        } catch {
          return NextResponse.json({ success: true })
        }
      }
    } catch {
      /* PHP offline */
    }

    return NextResponse.json({
      success: true,
      message: "Recorded locally; configure PHP promo-lead.php for persistence.",
      dev: true,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error"
    return NextResponse.json({ success: false, message: msg }, { status: 500 })
  }
}

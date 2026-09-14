import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`

    return NextResponse.json({
      ok: true,
      app: "growpal-next",
      database: "reachable",
      phpApiBaseUrl: process.env.PHP_API_BASE_URL || null,
      siteUrl: process.env.GROWPAL_SITE_URL || null,
    })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        app: "growpal-next",
        database: "unreachable",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

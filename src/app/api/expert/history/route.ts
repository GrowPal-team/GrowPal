import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { assertExpert } from "@/lib/expert-thread-access"

/** GET ?expertUserId= — closed consultations claimed by this expert */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const eid = parseInt(searchParams.get("expertUserId") || "", 10)
    if (Number.isNaN(eid)) {
      return NextResponse.json({ error: "expertUserId required" }, { status: 400 })
    }

    const expert = await assertExpert(eid)
    if (!expert) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const threads = await prisma.expertThread.findMany({
      where: {
        status: "closed",
        claimedByExpertUserId: eid,
      },
      orderBy: { updatedAt: "desc" },
      include: {
        customer: { select: { id: true, full_name: true, email: true } },
        recommendations: {
          orderBy: { createdAt: "asc" },
          include: {
            product: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    })

    return NextResponse.json({
      threads: threads.map((t) => ({
        id: t.id,
        userId: t.userId,
        status: t.status,
        lastMessagePreview: t.lastMessagePreview,
        updatedAt: t.updatedAt,
        createdAt: t.createdAt,
        customer: t.customer,
        recommendations: t.recommendations.map((r) => ({
          id: r.id,
          body: r.body,
          product: r.product,
          createdAt: r.createdAt,
        })),
      })),
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed"
    console.error("expert history GET", e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

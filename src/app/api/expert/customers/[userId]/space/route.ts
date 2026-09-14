import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { assertExpert } from "@/lib/expert-thread-access"
import { getSpaceExtras } from "@/lib/expert-consultation-store"

type Ctx = { params: Promise<{ userId: string }> }

/** Latest planner space for a customer (expert-only). GET ?expertUserId= */
export async function GET(request: Request, ctx: Ctx) {
  try {
    const { userId: raw } = await ctx.params
    const customerId = parseInt(raw, 10)
    if (Number.isNaN(customerId)) {
      return NextResponse.json({ error: "Invalid user" }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const eid = parseInt(searchParams.get("expertUserId") || "", 10)
    if (Number.isNaN(eid)) {
      return NextResponse.json({ error: "expertUserId required" }, { status: 400 })
    }

    const expert = await assertExpert(eid)
    if (!expert) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const [space, extras] = await Promise.all([
      prisma.space.findFirst({
        where: { userId: customerId },
        orderBy: { updatedAt: "desc" },
        include: {
          city: true,
          zone: true,
        },
      }),
      getSpaceExtras(customerId),
    ])

    if (!space) {
      return NextResponse.json({
        space: extras
          ? {
              notes: extras.notes,
              photos: extras.photos,
            }
          : null,
      })
    }

    return NextResponse.json({
      space: {
        id: space.id,
        spaceType: space.spaceType,
        sizeM2: Number(space.sizeM2),
        sunExposure: space.sunExposure,
        waterAvailability: space.waterAvailability,
        budgetLevel: space.budgetLevel,
        goal: space.goal,
        city: space.city ? { id: space.city.id, name: space.city.name } : null,
        zone: space.zone
          ? {
              id: space.zone.id,
              name: space.zone.name,
              description: space.zone.description,
            }
          : null,
        updatedAt: space.updatedAt,
        notes: extras?.notes || "",
        photos: extras?.photos || [],
      },
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed"
    console.error("expert customer space GET", e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

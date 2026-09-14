import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSpaceExtras, setSpaceExtras, type UploadedAsset } from "@/lib/expert-consultation-store"

type SpacePayload = {
  userId?: number
  spaceType?: string
  sizeM2?: number
  sunExposure?: string
  waterAvailability?: string
  budgetLevel?: string
  goal?: string
  notes?: string
  photos?: UploadedAsset[]
}

function cleanPhotos(value: unknown): UploadedAsset[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((item) => item && typeof item === "object")
    .map((item) => {
      const photo = item as Partial<UploadedAsset>
      return {
        url: typeof photo.url === "string" ? photo.url : "",
        name: typeof photo.name === "string" ? photo.name : "Image",
        contentType: typeof photo.contentType === "string" ? photo.contentType : "image/jpeg",
        uploadedAt: typeof photo.uploadedAt === "string" ? photo.uploadedAt : new Date().toISOString(),
      }
    })
    .filter((photo) => photo.url)
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = parseInt(searchParams.get("userId") || "", 10)
    if (Number.isNaN(userId)) {
      return NextResponse.json({ error: "userId required" }, { status: 400 })
    }

    const [space, extras] = await Promise.all([
      prisma.space.findFirst({
        where: { userId },
        orderBy: { updatedAt: "desc" },
      }),
      getSpaceExtras(userId),
    ])

    if (!space) {
      return NextResponse.json({
        space: null,
        extras: extras || { notes: "", photos: [] },
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
      },
      extras: extras || { notes: "", photos: [] },
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed"
    console.error("my-space GET", e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SpacePayload
    const userId = Number(body.userId)
    const sizeM2 = Number(body.sizeM2)
    const notes = typeof body.notes === "string" ? body.notes.trim().slice(0, 2000) : ""
    const photos = cleanPhotos(body.photos)

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 })
    }

    if (
      !body.spaceType ||
      !body.sunExposure ||
      !body.waterAvailability ||
      !body.budgetLevel ||
      !body.goal ||
      !sizeM2 ||
      sizeM2 <= 0
    ) {
      return NextResponse.json({ error: "Please complete all required My Space fields" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const latestSpace = await prisma.space.findFirst({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      select: { id: true },
    })

    const data = {
      userId,
      spaceType: body.spaceType as never,
      sizeM2,
      sunExposure: body.sunExposure as never,
      waterAvailability: body.waterAvailability as never,
      budgetLevel: body.budgetLevel as never,
      goal: body.goal as never,
    }

    const savedSpace = latestSpace
      ? await prisma.space.update({
          where: { id: latestSpace.id },
          data,
        })
      : await prisma.space.create({
          data,
        })

    await setSpaceExtras(userId, { notes, photos })

    return NextResponse.json({
      ok: true,
      space: {
        id: savedSpace.id,
        spaceType: savedSpace.spaceType,
        sizeM2: Number(savedSpace.sizeM2),
        sunExposure: savedSpace.sunExposure,
        waterAvailability: savedSpace.waterAvailability,
        budgetLevel: savedSpace.budgetLevel,
        goal: savedSpace.goal,
      },
      extras: { notes, photos },
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to save My Space"
    console.error("my-space POST", e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

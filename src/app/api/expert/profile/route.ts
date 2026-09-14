import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/** GET ?userId= — expert profile row */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = parseInt(searchParams.get("userId") || "", 10)
    if (Number.isNaN(userId)) {
      return NextResponse.json({ error: "userId required" }, { status: 400 })
    }
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user || user.role !== "expert") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    let row = await prisma.experts.findUnique({ where: { user_id: userId } })
    if (!row) {
      const display = user.full_name?.trim() || user.email.split("@")[0] || "Expert"
      row = await prisma.experts.create({
        data: { user_id: userId, display_name: display.slice(0, 200) },
      })
    }
    return NextResponse.json({
      expert: {
        id: row.id,
        userId: row.user_id,
        displayName: row.display_name,
        specialization: row.specialization,
        bio: row.bio,
        email: user.email,
        fullName: user.full_name,
      },
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed"
    console.error("expert profile GET", e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

/** PATCH { userId, displayName?, specialization?, bio? } */
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const userId = Number(body.userId)
    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 })
    }
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user || user.role !== "expert") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    const displayName =
      typeof body.displayName === "string" ? body.displayName.trim().slice(0, 200) : undefined
    const specialization =
      typeof body.specialization === "string" ? body.specialization.trim().slice(0, 200) : undefined
    const bio = typeof body.bio === "string" ? body.bio.trim() : undefined

    await prisma.experts.upsert({
      where: { user_id: userId },
      create: {
        user_id: userId,
        display_name: displayName || user.full_name?.slice(0, 200) || "Expert",
        specialization: specialization ?? null,
        bio: bio ?? null,
      },
      update: {
        ...(displayName !== undefined ? { display_name: displayName } : {}),
        ...(specialization !== undefined ? { specialization: specialization || null } : {}),
        ...(bio !== undefined ? { bio: bio || null } : {}),
      },
    })
    const row = await prisma.experts.findUnique({ where: { user_id: userId } })
    return NextResponse.json({
      ok: true,
      expert: row
        ? {
            id: row.id,
            userId: row.user_id,
            displayName: row.display_name,
            specialization: row.specialization,
            bio: row.bio,
          }
        : null,
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed"
    console.error("expert profile PATCH", e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

/** Ensures a row in `experts` for users with role expert (display name from full_name). */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const userId = Number(body.userId)
    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 })
    }
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    if (user.role !== "expert") {
      return NextResponse.json({ error: "Not an expert account" }, { status: 403 })
    }
    const display = user.full_name?.trim() || user.email.split("@")[0] || "Expert"
    const row = await prisma.experts.upsert({
      where: { user_id: userId },
      create: {
        user_id: userId,
        display_name: display.slice(0, 200),
      },
      update: {},
    })
    return NextResponse.json({
      ok: true,
      expert: {
        id: row.id,
        userId: row.user_id,
        displayName: row.display_name,
        specialization: row.specialization,
        bio: row.bio,
      },
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed"
    console.error("expert profile POST", e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

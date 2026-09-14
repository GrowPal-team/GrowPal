import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { saveRewardCode } from "@/lib/reward-codes"

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { userId?: number }
    const userId = body.userId != null ? Number(body.userId) : NaN
    if (!Number.isFinite(userId) || userId < 1) {
      return NextResponse.json({ message: "Invalid userId" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plantPendingGiftCode: true },
    })
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }
    if (!user.plantPendingGiftCode) {
      return NextResponse.json({ message: "Nothing to claim" }, { status: 400 })
    }

    const rewardCode = user.plantPendingGiftCode

    await prisma.$transaction(async (tx) => {
      await saveRewardCode(tx, userId, rewardCode)
      await tx.user.update({
        where: { id: userId },
        data: { plantPendingGiftCode: null },
      })
    })

    return NextResponse.json({ ok: true, code: rewardCode })
  } catch (e) {
    console.error("my-plant claim", e)
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}

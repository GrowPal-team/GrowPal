import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  MAX_VISUAL_STAGE,
  ORDERS_PER_BLOOM,
  PLANT_STAGE_LABELS,
  plantProgressPercent,
} from "@/lib/plant-gamification"
import { getSavedRewardCode } from "@/lib/reward-codes"

export async function GET(request: NextRequest) {
  const userIdRaw = request.nextUrl.searchParams.get("userId")
  const userId = userIdRaw ? Number(userIdRaw) : NaN
  if (!Number.isFinite(userId) || userId < 1) {
    return NextResponse.json({ message: "Invalid userId" }, { status: 400 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        plantStage: true,
        plantPendingGiftCode: true,
        plantCompletions: true,
        full_name: true,
      },
    })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    const savedReward = await getSavedRewardCode(prisma, userId)
    const rewardCode = user.plantPendingGiftCode || savedReward?.code || null
    const rewardCodeSource = user.plantPendingGiftCode ? "pending" : savedReward ? "saved" : null

    const hasPendingGift = Boolean(user.plantPendingGiftCode)
    const stage = Math.min(Math.max(0, user.plantStage), MAX_VISUAL_STAGE)
    const label =
      hasPendingGift && user.plantPendingGiftCode
        ? "In bloom — reward ready!"
        : PLANT_STAGE_LABELS[stage] ?? PLANT_STAGE_LABELS[0]

    return NextResponse.json({
      stage,
      maxStage: MAX_VISUAL_STAGE,
      ordersPerBloom: ORDERS_PER_BLOOM,
      label,
      progressPercent: plantProgressPercent(stage, hasPendingGift),
      pendingGiftCode: user.plantPendingGiftCode,
      rewardCode,
      rewardCodeSource,
      completions: user.plantCompletions,
      displayName: user.full_name,
    })
  } catch (e) {
    console.error("my-plant GET", e)
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}

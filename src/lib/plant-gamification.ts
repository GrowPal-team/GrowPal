/** Orders needed to bloom once (5th order awards gift & resets growth). */
export const ORDERS_PER_BLOOM = 5

/** Visual growth steps are 0..ORDERS_PER_BLOOM - 1 while progressing. */
export const MAX_VISUAL_STAGE = ORDERS_PER_BLOOM - 1

export const PLANT_STAGE_LABELS = [
  "Seed",
  "Sprout",
  "Seedling",
  "Growing",
  "Almost there",
] as const

export type PlantSnapshot = {
  stage: number
  pendingGiftCode: string | null
  completions: number
}

export function generateGiftCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  const part = () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
  return `GROWPAL-${part()}-${part()}`
}

/** After a qualifying order is recorded. Block growth while an unclaimed gift exists. */
export function nextPlantStateAfterOrder(current: PlantSnapshot): PlantSnapshot {
  if (current.pendingGiftCode) {
    return current
  }
  if (current.stage < MAX_VISUAL_STAGE) {
    return { ...current, stage: current.stage + 1 }
  }
  return {
    stage: 0,
    pendingGiftCode: generateGiftCode(),
    completions: current.completions + 1,
  }
}

export function plantProgressPercent(stage: number, hasPendingGift: boolean): number {
  if (hasPendingGift) return 100
  return Math.round((stage / MAX_VISUAL_STAGE) * 100)
}

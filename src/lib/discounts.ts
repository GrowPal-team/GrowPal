export const WELCOME_DISCOUNT_PERCENT = 10
export const REWARD_CODE_DISCOUNT_PERCENT = 10

const WELCOME_OFFER_KEY = "growpal_welcome_offer"

export type WelcomeOffer = {
  email: string
  discountPercent: number
  source: string
  capturedAt: string
  used: boolean
  usedAt?: string
}

function normalizeEmail(email: string): string {
  return String(email || "").trim().toLowerCase()
}

export function formatCurrency(value: number): string {
  return `₪ ${value.toFixed(2)}`
}

export function saveWelcomeOffer(email: string, source = "lead-capture"): void {
  if (typeof window === "undefined") return

  const normalizedEmail = normalizeEmail(email)
  if (!normalizedEmail) return

  const nextOffer: WelcomeOffer = {
    email: normalizedEmail,
    discountPercent: WELCOME_DISCOUNT_PERCENT,
    source,
    capturedAt: new Date().toISOString(),
    used: false,
  }

  localStorage.setItem(WELCOME_OFFER_KEY, JSON.stringify(nextOffer))
}

export function getWelcomeOffer(): WelcomeOffer | null {
  if (typeof window === "undefined") return null

  try {
    const raw = localStorage.getItem(WELCOME_OFFER_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as Partial<WelcomeOffer>
    if (!parsed?.email) return null

    return {
      email: normalizeEmail(parsed.email),
      discountPercent:
        typeof parsed.discountPercent === "number" && Number.isFinite(parsed.discountPercent)
          ? parsed.discountPercent
          : WELCOME_DISCOUNT_PERCENT,
      source: parsed.source || "lead-capture",
      capturedAt: parsed.capturedAt || new Date().toISOString(),
      used: parsed.used === true,
      usedAt: parsed.usedAt,
    }
  } catch {
    return null
  }
}

export function getEligibleWelcomeOffer(userEmail?: string | null): WelcomeOffer | null {
  const offer = getWelcomeOffer()
  if (!offer || offer.used) return null
  if (!userEmail) return null

  return normalizeEmail(userEmail) === offer.email ? offer : null
}

export function markWelcomeOfferUsed(userEmail?: string | null): void {
  if (typeof window === "undefined" || !userEmail) return

  const offer = getEligibleWelcomeOffer(userEmail)
  if (!offer) return

  localStorage.setItem(
    WELCOME_OFFER_KEY,
    JSON.stringify({
      ...offer,
      used: true,
      usedAt: new Date().toISOString(),
    })
  )
}

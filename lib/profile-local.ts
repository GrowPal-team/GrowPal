/** Client-only profile extras (addresses & payment labels). Not for full PAN / CVV. */

export type SavedAddress = {
  id: string
  label: string
  line1: string
  line2: string
  city: string
  postalCode: string
  country: string
}

export type PaymentKind = "cod" | "paypal" | "card_label"

export type SavedPaymentMethod = {
  id: string
  kind: PaymentKind
  /** Human-readable, non-secret label (e.g. "Cash on delivery", "PayPal", "Visa •••• 4242") */
  label: string
}

const STORAGE_KEY = "growpal_profile_extras"

type Bucket = {
  addresses: SavedAddress[]
  payments: SavedPaymentMethod[]
}

function readAll(): Record<string, Bucket> {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const p = JSON.parse(raw) as Record<string, Bucket>
    return p && typeof p === "object" ? p : {}
  } catch {
    return {}
  }
}

function writeAll(data: Record<string, Bucket>) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `id_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

export function getProfileExtras(userId: number): Bucket {
  const all = readAll()
  const key = String(userId)
  const b = all[key]
  return {
    addresses: Array.isArray(b?.addresses) ? b.addresses : [],
    payments: Array.isArray(b?.payments) ? b.payments : [],
  }
}

export function setProfileExtras(userId: number, next: Bucket) {
  const all = readAll()
  all[String(userId)] = {
    addresses: next.addresses,
    payments: next.payments,
  }
  writeAll(all)
}

export function addSavedAddress(userId: number, a: Omit<SavedAddress, "id">): SavedAddress {
  const cur = getProfileExtras(userId)
  const row: SavedAddress = { ...a, id: newId() }
  setProfileExtras(userId, { ...cur, addresses: [...cur.addresses, row] })
  return row
}

export function addSavedPaymentMethod(
  userId: number,
  p: Omit<SavedPaymentMethod, "id">
): SavedPaymentMethod {
  const cur = getProfileExtras(userId)
  const row: SavedPaymentMethod = { ...p, id: newId() }
  setProfileExtras(userId, { ...cur, payments: [...cur.payments, row] })
  return row
}

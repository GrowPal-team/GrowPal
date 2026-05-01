export type CartLine = {
  id: number
  name: string
  price: number
  quantity: number
  image: string
  slug?: string
}

export type WishlistLine = {
  id: number
  name: string
  price: number
  image: string
  slug?: string
}

const CART_KEY = "growpal_cart"
const WISHLIST_LOCAL_KEY = "growpal_wishlist_local"

export function emitCartUpdated() {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent("growpal-cart"))
}

export function emitWishlistUpdated() {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent("growpal-wishlist"))
}

export function getCart(): CartLine[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(CART_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function setCart(lines: CartLine[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(CART_KEY, JSON.stringify(lines))
  emitCartUpdated()
}

export function addToCart(item: {
  id: number
  name: string
  price: number
  image: string
  slug?: string
  quantity?: number
}) {
  const qty = Math.max(1, item.quantity ?? 1)
  const lines = getCart()
  const idx = lines.findIndex((l) => l.id === item.id)
  if (idx >= 0) {
    lines[idx] = { ...lines[idx], quantity: lines[idx].quantity + qty }
  } else {
    lines.push({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      slug: item.slug,
      quantity: qty,
    })
  }
  setCart(lines)
}

export function cartItemCount(): number {
  return getCart().reduce((n, l) => n + l.quantity, 0)
}

export function getLocalWishlist(): WishlistLine[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(WISHLIST_LOCAL_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function setLocalWishlist(items: WishlistLine[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(WISHLIST_LOCAL_KEY, JSON.stringify(items))
  emitWishlistUpdated()
}

export function addToLocalWishlist(item: WishlistLine) {
  const items = getLocalWishlist()
  if (items.some((w) => w.id === item.id)) return
  items.push(item)
  setLocalWishlist(items)
}

export function removeFromLocalWishlist(productId: number) {
  setLocalWishlist(getLocalWishlist().filter((w) => w.id !== productId))
}

export type StoredUser = {
  id?: number
  name?: string
  firstName?: string
  lastName?: string
  email?: string
  role?: string
  status?: string
  approvalStatus?: string | null
  newsletterOptIn?: boolean
}

export function getStoredUser(): StoredUser | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem("user")
    if (!raw) return null
    const u = JSON.parse(raw)
    const id = u?.id != null ? Number(u.id) : undefined
    const rawRole = u?.role
    const roleNorm =
      rawRole != null && rawRole !== "" ? String(rawRole).toLowerCase().trim() : undefined
    return {
      id,
      name: u?.name,
      firstName: u?.firstName,
      lastName: u?.lastName,
      email: u?.email,
      role: roleNorm,
      status: u?.status != null && u?.status !== "" ? String(u.status).toLowerCase().trim() : undefined,
      approvalStatus:
        u?.approvalStatus != null && u?.approvalStatus !== "" ? String(u.approvalStatus).toLowerCase().trim() : undefined,
      newsletterOptIn: typeof u?.newsletterOptIn === "boolean" ? u.newsletterOptIn : undefined,
    }
  } catch {
    return null
  }
}

export async function addToWishlistWithSync(item: WishlistLine): Promise<{ ok: boolean; message?: string }> {
  const user = getStoredUser()
  if (user?.id) {
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, productId: item.id }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) return { ok: false, message: data.message || "Could not update wishlist" }
      emitWishlistUpdated()
      return { ok: true }
    } catch {
      return { ok: false, message: "Network error" }
    }
  }
  addToLocalWishlist(item)
  return { ok: true }
}

export async function removeWishlistWithSync(productId: number): Promise<void> {
  const user = getStoredUser()
  if (user?.id) {
    await fetch("/api/wishlist", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, productId }),
    }).catch(() => {})
    emitWishlistUpdated()
    return
  }
  removeFromLocalWishlist(productId)
}

export function wishlistLocalCount(): number {
  return getLocalWishlist().length
}

import type { StoredUser } from "@/lib/shopping"
import { getStoredUser } from "@/lib/shopping"

export function persistUserToStorage(user: StoredUser) {
  if (typeof window === "undefined") return
  localStorage.setItem("user", JSON.stringify(user))
  window.dispatchEvent(new CustomEvent("growpal-auth"))
}

export function mergeStoredUser(partial: Partial<StoredUser>) {
  const cur = getStoredUser() || {}
  persistUserToStorage({ ...cur, ...partial })
}

export function logoutClient() {
  if (typeof window === "undefined") return
  fetch("/api/session", { method: "DELETE" }).catch(() => {})
  localStorage.removeItem("user")
  localStorage.removeItem("isLoggedIn")
  localStorage.removeItem("growpal_token")
  window.dispatchEvent(new CustomEvent("growpal-auth"))
}

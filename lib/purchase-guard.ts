"use client"

import { clientIsLoggedIn } from "@/lib/session-client"

export function shoppingLoginHref(nextPath?: string): string {
  const next =
    nextPath ??
    (typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : "/shop")
  return `/login?next=${encodeURIComponent(next)}`
}

/** Returns true if the user is logged in and may shop; otherwise pushes login and returns false. */
export function ensureLoggedInForShopping(router: { push: (href: string) => void }, nextPath?: string): boolean {
  if (clientIsLoggedIn()) return true
  router.push(shoppingLoginHref(nextPath))
  return false
}

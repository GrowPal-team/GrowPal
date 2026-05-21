"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect, useCallback } from "react"
import { ShoppingCart, Heart, Menu, X, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cartItemCount, getStoredUser, wishlistLocalCount } from "@/lib/shopping"
import { UserMenu } from "@/components/user-menu"
import { ExpertHubBar, EXPERT_HUB_ITEMS } from "@/components/expert/expert-subnav"
import { clientGetRole, clientIsExpert, clientIsLoggedIn } from "@/lib/session-client"
import { BRAND_LOGO_SRC } from "@/lib/brand-assets"

const baseLinks: { href: string; label: string; requireAuth?: boolean }[] = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/climate-zones", label: "Growing zones" },
  { href: "/planner", label: "My Space", requireAuth: true },
]

const expertNavLinks: { href: string; label: string }[] = []

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [wishCount, setWishCount] = useState(0)
  const [navLinks, setNavLinks] = useState(baseLinks.filter((l) => !l.requireAuth))
  const [staffRole, setStaffRole] = useState<"expert" | "admin" | null>(null)
  const homeHref = staffRole === "expert" ? "/expert" : staffRole === "admin" ? "/admin" : "/"

  const refreshAuth = useCallback(() => {
    if (typeof window === "undefined") return
    const logged = clientIsLoggedIn()
    setIsLoggedIn(logged)
    const role = clientGetRole()
    const nextStaffRole =
      logged && (role === "admin" || (role === "expert" && clientIsExpert())) ? (role as "expert" | "admin") : null
    setStaffRole(nextStaffRole)
    if (nextStaffRole === "expert") {
      setNavLinks(expertNavLinks)
    } else {
      setNavLinks(baseLinks.filter((l) => !l.requireAuth || logged))
    }
  }, [])

  const refreshCounts = useCallback(() => {
    if (typeof window === "undefined") return
    setCartCount(cartItemCount())
    const u = getStoredUser()
    if (u?.id) {
      fetch(`/api/wishlist?userId=${u.id}`)
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) setWishCount(data.length)
        })
        .catch(() => setWishCount(wishlistLocalCount()))
    } else {
      setWishCount(wishlistLocalCount())
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    refreshAuth()
    refreshCounts()
    window.addEventListener("growpal-cart", refreshCounts)
    window.addEventListener("growpal-wishlist", refreshCounts)
    window.addEventListener("growpal-auth", refreshAuth)
    return () => {
      window.removeEventListener("growpal-cart", refreshCounts)
      window.removeEventListener("growpal-wishlist", refreshCounts)
      window.removeEventListener("growpal-auth", refreshAuth)
    }
  }, [refreshCounts, refreshAuth])

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card backdrop-blur-md">
      <div className="relative mx-auto flex max-w-7xl items-start gap-2 px-3 py-2 sm:items-center sm:gap-3 sm:px-4 sm:py-3 lg:px-8">
        <Link href={homeHref} className="flex shrink-0 items-center gap-2 self-center">
          <div className="relative flex h-9 w-9 items-center justify-center">
            <Image
              src={BRAND_LOGO_SRC}
              alt="GrowPal Logo"
              width={36}
              height={36}
              className="object-contain"
            />
          </div>
          <span className="font-serif text-lg font-bold text-foreground sm:text-xl">GrowPal</span>
        </Link>

        {staffRole === "expert" ? (
          <ExpertHubBar />
        ) : (
          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center justify-center md:flex">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        )}

        <div className="ml-auto flex shrink-0 items-center gap-1 self-center">
          {isLoggedIn && !staffRole && (
            <Link href="/wishlist" aria-label="Wishlist" className="cursor-pointer">
              <Button variant="ghost" size="icon" className="relative cursor-pointer">
                <Heart className="h-5 w-5" />
                {wishCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-primary px-0.5 text-[10px] font-bold text-primary-foreground">
                    {wishCount > 99 ? "99+" : wishCount}
                  </span>
                )}
              </Button>
            </Link>
          )}
          {isLoggedIn && !staffRole && (
            <Link href="/cart" aria-label="Cart" className="cursor-pointer">
              <Button variant="ghost" size="icon" className="relative cursor-pointer">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="pointer-events-none absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-primary px-0.5 text-[10px] font-bold text-primary-foreground">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Button>
            </Link>
          )}
          {isLoggedIn ? (
            <UserMenu variant="desktop" />
          ) : (
            <Link href="/login" aria-label="Sign in" className="cursor-pointer">
              <Button variant="ghost" size="icon" className="h-9 w-9 cursor-pointer">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="cursor-pointer md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-card px-4 pb-4 md:hidden">
          <nav className="flex flex-col gap-1 pt-2">
            {staffRole === "expert"
              ? EXPERT_HUB_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))
              : navLinks.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    onClick={() => setOpen(false)}
                  >
                    {l.label}
                  </Link>
                ))}
            <div className="mt-2 border-t border-border pt-3">
              {isLoggedIn ? (
                <UserMenu variant="mobile" onNavigate={() => setOpen(false)} />
              ) : (
                <Link
                  href="/login"
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-primary"
                  onClick={() => setOpen(false)}
                >
                  Sign in
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

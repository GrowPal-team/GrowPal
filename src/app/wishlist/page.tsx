"use client"

import { useState, useEffect, useCallback } from "react"
import { PublicImage } from "@/components/public-image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Trash2, Heart, ShoppingCart } from "lucide-react"
import {
  addToCart,
  getLocalWishlist,
  getStoredUser,
  removeWishlistWithSync,
  setLocalWishlist,
  type WishlistLine,
} from "@/lib/shopping"
import { clientIsGuest } from "@/lib/session-client"

export default function WishlistPage() {
  const router = useRouter()
  const [authReady, setAuthReady] = useState(false)
  const [wishlist, setWishlist] = useState<WishlistLine[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (clientIsGuest()) {
      router.replace("/login?next=/wishlist")
      return
    }
    setAuthReady(true)
  }, [router])

  const load = useCallback(async () => {
    const user = getStoredUser()
    if (user?.id) {
      try {
        const r = await fetch(`/api/wishlist?userId=${user.id}`)
        if (r.ok) {
          const data = await r.json()
          if (Array.isArray(data)) {
            setWishlist(data)
            setLoading(false)
            return
          }
        }
      } catch {
        /* fall through */
      }
    }
    setWishlist(getLocalWishlist())
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!authReady) return
    load()
    window.addEventListener("growpal-wishlist", load)
    return () => window.removeEventListener("growpal-wishlist", load)
  }, [load, authReady])

  const removeWishlistItem = async (id: number) => {
    const user = getStoredUser()
    if (user?.id) {
      await removeWishlistWithSync(id)
      setWishlist((prev) => prev.filter((item) => item.id !== id))
      return
    }
    const next = getLocalWishlist().filter((item) => item.id !== id)
    setLocalWishlist(next)
    setWishlist(next)
  }

  const moveToCart = (item: WishlistLine) => {
    if (clientIsGuest()) {
      router.push("/login?next=/wishlist")
      return
    }
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      slug: item.slug,
      quantity: 1,
    })
  }

  if (!authReady) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex flex-1 items-center justify-center bg-background px-4 py-16">
          <p className="text-muted-foreground">Loading…</p>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-background">
        <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
          <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
            My Wishlist
          </h1>

          <div className="mt-6">
            {loading ? (
              <p className="text-muted-foreground">Loading…</p>
            ) : wishlist.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-16 text-center">
                <Heart className="h-12 w-12 text-muted-foreground/30" />
                <p className="text-lg font-medium text-muted-foreground">Your wishlist is empty</p>
                <Link href="/shop">
                  <Button className="gap-2 rounded-full">Browse Plants</Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {wishlist.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4"
                  >
                    <Link
                      href={item.slug ? `/product/${encodeURIComponent(item.slug)}` : "/shop"}
                      className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl"
                    >
                      <PublicImage src={item.image} alt={item.name} fill className="object-cover" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={item.slug ? `/product/${encodeURIComponent(item.slug)}` : "/shop"}
                        className="text-sm font-semibold text-foreground hover:text-primary line-clamp-2"
                      >
                        {item.name}
                      </Link>
                      <p className="text-sm font-bold text-foreground">${item.price}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="rounded-full text-xs"
                        onClick={() => moveToCart(item)}
                      >
                        <ShoppingCart className="mr-1 h-3.5 w-3.5" />
                        Add
                      </Button>
                      <button
                        onClick={() => removeWishlistItem(item.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        aria-label={`Remove ${item.name} from wishlist`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

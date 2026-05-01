"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight, Loader2 } from "lucide-react"
import { getCart, getStoredUser, setCart, type CartLine } from "@/lib/shopping"
import { clientIsGuest } from "@/lib/session-client"
import { toast } from "@/hooks/use-toast"

function CartItemImage({ src, alt }: { src: string; alt: string }) {
  const [imageSrc, setImageSrc] = useState(src || "/images/plant-1.jpg")

  useEffect(() => {
    setImageSrc(src || "/images/plant-1.jpg")
  }, [src])

  return (
    <img
      src={imageSrc}
      alt={alt}
      className="h-full w-full object-cover"
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setImageSrc("/images/plant-1.jpg")}
    />
  )
}

export default function CartPage() {
  const router = useRouter()
  const [authReady, setAuthReady] = useState(false)
  const [cart, setCartState] = useState<CartLine[]>([])
  const [checkingOut, setCheckingOut] = useState(false)

  useEffect(() => {
    if (clientIsGuest()) {
      router.replace("/login?next=/cart")
      return
    }
    setAuthReady(true)
  }, [router])

  const reload = useCallback(() => {
    setCartState(getCart())
  }, [])

  useEffect(() => {
    if (!authReady) return
    reload()
    window.addEventListener("growpal-cart", reload)
    return () => window.removeEventListener("growpal-cart", reload)
  }, [reload, authReady])

  const updateQty = (id: number, delta: number) => {
    const lines = getCart().map((item) =>
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    )
    setCart(lines)
    setCartState(lines)
  }

  const removeItem = (id: number) => {
    const lines = getCart().filter((item) => item.id !== id)
    setCart(lines)
    setCartState(lines)
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const checkout = async () => {
    const u = getStoredUser()
    if (!u?.id) {
      toast({ title: "Sign in required", variant: "destructive" })
      return
    }
    if (cart.length === 0) return
    setCheckingOut(true)
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: u.id,
          items: cart.map((c) => ({ productId: c.id, quantity: c.quantity })),
        }),
      })
      const data = (await res.json()) as {
        message?: string
        plant?: { pendingGiftCode: string | null }
        plantDidGrow?: boolean
        plantMessage?: string
      }
      if (!res.ok) {
        toast({
          title: "Checkout could not complete",
          description: data.message || "Try again or adjust your cart.",
          variant: "destructive",
        })
        return
      }
      setCart([])
      setCartState([])
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("growpal-plant"))
      }
      toast({
        title: "Order placed",
        description:
          data.plantMessage ||
          (data.plant?.pendingGiftCode
            ? "Your plant bloomed! Claim your gift on My Plant."
            : data.plantDidGrow
              ? "Your plant grew — keep going for your reward."
              : "Order confirmed."),
      })
      router.push(data.plant?.pendingGiftCode ? "/my-plant?reward=1" : "/my-plant")
    } catch {
      toast({ title: "Network error", variant: "destructive" })
    } finally {
      setCheckingOut(false)
    }
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
            Shopping Cart
          </h1>

          <div className="mt-6">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-16 text-center">
                <ShoppingCart className="h-12 w-12 text-muted-foreground/30" />
                <p className="text-lg font-medium text-muted-foreground">Your cart is empty</p>
                <Link href="/shop">
                  <Button className="gap-2 rounded-full">Browse Plants</Button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4"
                  >
                    <Link
                      href={item.slug ? `/product/${encodeURIComponent(item.slug)}` : "/shop"}
                      className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl"
                    >
                      <CartItemImage src={item.image} alt={item.name} />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={item.slug ? `/product/${encodeURIComponent(item.slug)}` : "/shop"}
                        className="text-sm font-semibold text-foreground hover:text-primary line-clamp-2"
                      >
                        {item.name}
                      </Link>
                      <p className="text-sm text-muted-foreground">${item.price} each</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQty(item.id, -1)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:bg-accent"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium text-foreground">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQty(item.id, 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:bg-accent"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <span className="w-16 text-right text-sm font-bold text-foreground">
                      ${(item.price * item.quantity).toFixed(0)}
                    </span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                <div className="mt-4 flex items-center justify-between rounded-2xl border border-border bg-card p-5">
                  <span className="text-lg font-semibold text-foreground">Total</span>
                  <span className="text-2xl font-bold text-foreground">${total.toFixed(0)}</span>
                </div>

                <Button
                  type="button"
                  className="gap-2 rounded-full"
                  size="lg"
                  disabled={checkingOut}
                  onClick={() => void checkout()}
                >
                  {checkingOut ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Complete order
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  Checkout records your order, updates stock, and grows your{" "}
                  <a href="/my-plant" className="font-medium text-primary underline-offset-2 hover:underline">
                    My Plant
                  </a>{" "}
                  progress.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

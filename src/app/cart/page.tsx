"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight, Loader2, Gift, Sparkles, TicketPercent } from "lucide-react"
import { getCart, getStoredUser, setCart, type CartLine } from "@/lib/shopping"
import { clientIsGuest } from "@/lib/session-client"
import {
  REWARD_CODE_DISCOUNT_PERCENT,
  formatCurrency,
  getEligibleWelcomeOffer,
  markWelcomeOfferUsed,
} from "@/lib/discounts"
import { toast } from "@/hooks/use-toast"

type PlantStatus = {
  pendingGiftCode: string | null
  rewardCode: string | null
}

type ActiveDiscount =
  | { type: "welcome"; label: string; percent: number }
  | { type: "reward"; label: string; percent: number; code: string }
  | null

const FALLBACK_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?auto=format&fit=crop&w=900&q=80"

function CartItemImage({ src, alt }: { src: string; alt: string }) {
  const [imageSrc, setImageSrc] = useState(src || FALLBACK_PRODUCT_IMAGE)

  useEffect(() => {
    setImageSrc(src || FALLBACK_PRODUCT_IMAGE)
  }, [src])

  return (
    <img
      src={imageSrc}
      alt={alt}
      className="h-full w-full object-cover"
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setImageSrc(FALLBACK_PRODUCT_IMAGE)}
    />
  )
}

export default function CartPage() {
  const router = useRouter()
  const [authReady, setAuthReady] = useState(false)
  const [cart, setCartState] = useState<CartLine[]>([])
  const [checkingOut, setCheckingOut] = useState(false)
  const [discountCode, setDiscountCode] = useState("")
  const [appliedRewardCode, setAppliedRewardCode] = useState<string | null>(null)
  const [discountError, setDiscountError] = useState<string | null>(null)
  const [plantStatus, setPlantStatus] = useState<PlantStatus | null>(null)
  const [loadingPlantStatus, setLoadingPlantStatus] = useState(false)

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

  useEffect(() => {
    if (!authReady) return

    const user = getStoredUser()
    if (!user?.id) return

    let cancelled = false

    const loadPlantStatus = async () => {
      setLoadingPlantStatus(true)
      try {
        const res = await fetch(`/api/my-plant?userId=${user.id}`)
        const data = (await res.json()) as PlantStatus & { message?: string }
        if (!res.ok) throw new Error(data.message || "Could not load rewards")
        if (!cancelled) {
          setPlantStatus({
            pendingGiftCode: data.pendingGiftCode ?? null,
            rewardCode: data.rewardCode ?? null,
          })
        }
      } catch {
        if (!cancelled) {
          setPlantStatus({ pendingGiftCode: null, rewardCode: null })
        }
      } finally {
        if (!cancelled) {
          setLoadingPlantStatus(false)
        }
      }
    }

    void loadPlantStatus()

    const onPlantUpdate = () => {
      void loadPlantStatus()
    }

    window.addEventListener("growpal-plant", onPlantUpdate)
    return () => {
      cancelled = true
      window.removeEventListener("growpal-plant", onPlantUpdate)
    }
  }, [authReady])

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

  const user = getStoredUser()
  const welcomeOffer = getEligibleWelcomeOffer(user?.email)
  const normalizedPendingRewardCode = plantStatus?.rewardCode?.trim().toUpperCase() || null
  const normalizedEnteredCode = discountCode.trim().toUpperCase()
  const looksLikeRewardCode = /^GROWPAL-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(normalizedEnteredCode)

  const activeDiscount: ActiveDiscount = appliedRewardCode
    ? {
        type: "reward",
        label: "My Plant reward applied",
        percent: REWARD_CODE_DISCOUNT_PERCENT,
        code: appliedRewardCode,
      }
    : welcomeOffer
      ? {
          type: "welcome",
          label: "Welcome 10% offer applied",
          percent: welcomeOffer.discountPercent,
        }
      : null

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const discountRate = activeDiscount ? activeDiscount.percent / 100 : 0
  const discountAmount = subtotal * discountRate
  const total = Math.max(0, subtotal - discountAmount)

  const applyDiscountCode = () => {
    if (!normalizedEnteredCode) {
      setDiscountError("Enter a discount code first.")
      return
    }

    if (normalizedPendingRewardCode && normalizedEnteredCode === normalizedPendingRewardCode) {
      setAppliedRewardCode(normalizedEnteredCode)
      setDiscountCode(normalizedEnteredCode)
      setDiscountError(null)
      toast({
        title: "Reward code applied",
        description: "Your My Plant code will give you 10% off this order.",
      })
      return
    }

    if (!normalizedPendingRewardCode && looksLikeRewardCode) {
      setAppliedRewardCode(normalizedEnteredCode)
      setDiscountCode(normalizedEnteredCode)
      setDiscountError(null)
      toast({
        title: "Reward code added",
        description: "We will verify this saved GrowPal code when you complete the order.",
      })
      return
    }

    setDiscountError("This code is invalid or not available for your account.")
  }

  const clearRewardCode = () => {
    setAppliedRewardCode(null)
    setDiscountCode("")
    setDiscountError(null)
  }

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
          discountCode: activeDiscount?.type === "reward" ? activeDiscount.code : undefined,
          applyWelcomeDiscount: activeDiscount?.type === "welcome",
        }),
      })
      const data = (await res.json()) as {
        message?: string
        plant?: { pendingGiftCode: string | null }
        plantDidGrow?: boolean
        plantMessage?: string
        pricing?: {
          subtotalIls: string
          discountAmountIls: string
          totalIls: string
          discountType?: string | null
        }
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
      setAppliedRewardCode(null)
      setDiscountCode("")
      setDiscountError(null)
      if (activeDiscount?.type === "welcome") {
        markWelcomeOfferUsed(u.email)
      }
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
                      <p className="text-sm text-muted-foreground">{formatCurrency(item.price)} each</p>
                      {activeDiscount && (
                        <p className="mt-1 text-xs text-primary">
                          {formatCurrency(item.price * (1 - discountRate))} each after {activeDiscount.percent}% off
                        </p>
                      )}
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
                    <div className="w-28 text-right">
                      {activeDiscount && (
                        <p className="text-xs text-muted-foreground line-through">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      )}
                      <span className="text-sm font-bold text-foreground">
                        {formatCurrency(item.price * item.quantity * (1 - discountRate))}
                      </span>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr,0.9fr]">
                  <div className="rounded-2xl border border-border bg-card p-5">
                    <div className="flex items-center gap-2">
                      <TicketPercent className="h-4 w-4 text-primary" />
                      <h2 className="text-base font-semibold text-foreground">Discounts</h2>
                    </div>

                    {welcomeOffer && !appliedRewardCode && (
                      <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                        <div className="flex items-start gap-3">
                          <Sparkles className="mt-0.5 h-4 w-4 text-emerald-600" />
                          <div>
                            <p className="font-medium text-foreground">10% welcome offer is active</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              Your first order with this email gets 10% off automatically.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                      <input
                        type="text"
                        value={discountCode}
                        onChange={(event) => {
                          setDiscountCode(event.target.value.toUpperCase())
                          if (discountError) setDiscountError(null)
                        }}
                        placeholder="Enter discount code"
                        className="h-11 flex-1 rounded-full border border-border bg-background px-4 text-sm text-foreground outline-none transition-colors focus:border-primary"
                      />
                      {appliedRewardCode ? (
                        <Button type="button" variant="outline" className="rounded-full" onClick={clearRewardCode}>
                          Remove code
                        </Button>
                      ) : (
                        <Button type="button" className="rounded-full" onClick={applyDiscountCode}>
                          Apply code
                        </Button>
                      )}
                    </div>

                    {normalizedPendingRewardCode && (
                      <p className="mt-3 text-xs text-muted-foreground">
                        Your current My Plant reward code:{" "}
                        <span className="font-semibold text-foreground">{normalizedPendingRewardCode}</span>
                      </p>
                    )}

                    {loadingPlantStatus && (
                      <p className="mt-3 text-xs text-muted-foreground">Checking your available reward codes…</p>
                    )}

                    {discountError && <p className="mt-3 text-sm text-destructive">{discountError}</p>}

                    {activeDiscount && (
                      <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                        <div className="flex items-start gap-3">
                          <Gift className="mt-0.5 h-4 w-4 text-primary" />
                          <div>
                            <p className="font-medium text-foreground">{activeDiscount.label}</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              You are saving {formatCurrency(discountAmount)} on this order.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl border border-border bg-card p-5">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Subtotal</span>
                        <span>{formatCurrency(subtotal)}</span>
                      </div>
                      {activeDiscount && (
                        <div className="flex items-center justify-between text-sm text-primary">
                          <span>{activeDiscount.label}</span>
                          <span>-{formatCurrency(discountAmount)}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Shipping</span>
                        <span>Free</span>
                      </div>
                      <div className="border-t border-border pt-3">
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-semibold text-foreground">Total</span>
                          <div className="text-right">
                            {activeDiscount && (
                              <p className="text-xs text-muted-foreground line-through">
                                {formatCurrency(subtotal)}
                              </p>
                            )}
                            <span className="text-2xl font-bold text-foreground">{formatCurrency(total)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
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

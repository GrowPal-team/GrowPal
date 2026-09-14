"use client"

import { useCallback, useEffect, useState } from "react"
import { PublicImage } from "@/components/public-image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Minus, Plus, Heart, ShoppingCart, Leaf, ChevronLeft, Star } from "lucide-react"
import {
  addToCart,
  addToWishlistWithSync,
  getStoredUser,
  type WishlistLine,
} from "@/lib/shopping"
import { ensureLoggedInForShopping } from "@/lib/purchase-guard"
import { fetchProductDetail, fetchProductReviews } from "@/lib/static-pages"

type ProductDetail = {
  id: number
  name: string
  slug: string
  description: string
  price: number
  image: string
  images: string[]
  secondaryImage?: string
  ecoScore: number
  stock: number
  category?: string
  spaceType: string
  sunExposure: string
  waterLevel: string
  climateZones?: string
  careHighlights?: string[]
  idealFor?: string
  suggestions: { id: number; name: string; slug: string; price: number; image: string }[]
}

type ReviewRow = {
  id: number
  rating: number
  body: string
  createdAt: string
  userName: string
  userId: number
}

export default function ProductPage() {
  const router = useRouter()
  const params = useParams()
  const slug = typeof params?.slug === "string" ? params.slug : params?.slug?.[0] || ""

  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [mainIdx, setMainIdx] = useState(0)
  const [qty, setQty] = useState(1)
  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState<ReviewRow[]>([])
  const [avgRating, setAvgRating] = useState(0)
  const [reviewCount, setReviewCount] = useState(0)
  const [comment, setComment] = useState("")
  const [rating, setRating] = useState(5)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2200)
  }, [])

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const data = await fetchProductDetail(slug)
        if (!cancelled) {
          setProduct(data)
          setMainIdx(0)
        }
      } catch {
        if (!cancelled) setProduct(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [slug])

  const loadReviews = useCallback(async () => {
    if (!slug) return
    const data = await fetchProductReviews(slug).catch(() => null)
    const safeData = data && typeof data === "object" ? data : null
    const safeReviews = Array.isArray(safeData?.reviews) ? safeData.reviews : []
    setReviews(safeReviews)
    setAvgRating(typeof safeData?.averageRating === "number" ? safeData.averageRating : 0)
    setReviewCount(typeof safeData?.count === "number" ? safeData.count : 0)
  }, [slug])

  useEffect(() => {
    loadReviews()
  }, [loadReviews])

  const onSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    const user = getStoredUser()
    if (!user?.id) {
      showToast("Please log in to leave a comment")
      return
    }
    const body = comment.trim()
    if (body.length < 2) return
    setSubmitting(true)
    try {
      const r = await fetch(`/api/products/${encodeURIComponent(slug)}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, rating, body }),
      })
      const data = await r.json().catch(() => ({}))
      if (!r.ok) {
        showToast(data.error || "Could not post review")
        return
      }
      setComment("")
      await loadReviews()
      showToast("Thanks for your review")
    } finally {
      setSubmitting(false)
    }
  }

  const fallbackProductImage =
    "https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?auto=format&fit=crop&w=900&q=80"
  const thumbs = product?.images?.length ? product.images : product ? [product.image] : []
  const mainSrc = thumbs[mainIdx] || fallbackProductImage

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex flex-1 items-center justify-center bg-[#edece8]">
          <p className="text-muted-foreground">Loading…</p>
        </main>
        <Footer />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex flex-1 flex-col items-center justify-center gap-4 bg-[#edece8]">
          <p className="text-muted-foreground">Product not found.</p>
          <Link href="/shop">
            <Button className="rounded-full">Back to shop</Button>
          </Link>
        </main>
        <Footer />
      </div>
    )
  }

  const line: WishlistLine = {
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.image,
    slug: product.slug,
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      {toast && (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-foreground px-5 py-2 text-sm text-background shadow-lg">
          {toast}
        </div>
      )}
      <main className="flex-1 bg-[#edece8]">
        <div className="mx-auto max-w-6xl px-4 py-6 lg:px-8 lg:py-10">
          <Link
            href="/shop"
            className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Shop
          </Link>

          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="flex gap-3 lg:gap-4">
              <div className="flex w-14 shrink-0 flex-col gap-2 lg:w-20">
                {thumbs.map((src, i) => (
                  <button
                    key={`${src}-${i}`}
                    type="button"
                    onClick={() => setMainIdx(i)}
                    className={`relative aspect-square overflow-hidden rounded-xl border-2 transition ${
                      mainIdx === i ? "border-primary ring-2 ring-primary/20" : "border-transparent opacity-80 hover:opacity-100"
                    }`}
                  >
                    <PublicImage src={src} alt="" fill className="object-cover" sizes="80px" />
                  </button>
                ))}
              </div>
              <div className="relative min-h-[280px] flex-1 overflow-hidden rounded-2xl bg-muted/30 lg:min-h-[420px]">
                <PublicImage
                  src={mainSrc}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              </div>
            </div>

            <div>
              <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                {product.name}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-0.5 text-primary">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i + 1 <= Math.round(avgRating) ? "fill-primary" : "fill-transparent"}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {reviewCount} review{reviewCount === 1 ? "" : "s"}
                  {avgRating > 0 && ` · ${avgRating.toFixed(1)} avg`}
                </span>
              </div>
              <p className="mt-4 font-serif text-3xl font-bold text-foreground">₪ {product.price}</p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{product.description}</p>

              <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="rounded-full bg-card px-3 py-1">Sun: {product.sunExposure}</span>
                <span className="rounded-full bg-card px-3 py-1">Water: {product.waterLevel}</span>
                <span className="rounded-full bg-card px-3 py-1 flex items-center gap-1">
                  <Leaf className="h-3 w-3 text-primary" /> Eco {product.ecoScore}/10
                </span>
                {product.category && (
                  <span className="rounded-full bg-card px-3 py-1">{product.category}</span>
                )}
              </div>

              {!!product.careHighlights?.length && (
                <div className="mt-6 rounded-2xl border border-border bg-card/80 p-4">
                  <p className="text-sm font-semibold text-foreground">Care at a glance</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {product.careHighlights.map((item) => (
                      <span key={item} className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                        {item}
                      </span>
                    ))}
                  </div>
                  {product.idealFor && (
                    <p className="mt-3 text-sm text-muted-foreground">
                      Best for <span className="font-medium text-foreground">{product.idealFor.toLowerCase()}</span>.
                    </p>
                  )}
                </div>
              )}

              <div className="mt-8 flex items-center gap-3">
                <span className="text-sm font-medium text-foreground">Quantity</span>
                <div className="flex items-center gap-1 rounded-full border border-border bg-card px-1 py-1">
                  <button
                    type="button"
                    className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-accent"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="min-w-[2rem] text-center text-sm font-semibold">{qty}</span>
                  <button
                    type="button"
                    className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-accent"
                    onClick={() => setQty((q) => Math.min(product.stock || 99, q + 1))}
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                {product.stock != null && (
                  <span className="text-xs text-muted-foreground">{product.stock} in stock</span>
                )}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  className="h-12 flex-1 gap-2 rounded-full px-8 text-base sm:flex-none sm:min-w-[220px]"
                  onClick={() => {
                    if (!ensureLoggedInForShopping(router)) {
                      showToast("Sign in to add to cart")
                      return
                    }
                    addToCart({
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      image: product.image,
                      slug: product.slug,
                      quantity: qty,
                    })
                    showToast("Added to cart")
                  }}
                >
                  <ShoppingCart className="h-5 w-5" />
                  Add to cart — ₪ {(product.price * qty).toFixed(0)}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 rounded-full border-primary/40"
                  aria-label="Add to wishlist"
                  onClick={async () => {
                    if (!ensureLoggedInForShopping(router)) {
                      showToast("Sign in to save favorites")
                      return
                    }
                    const res = await addToWishlistWithSync(line)
                    if (res.ok) showToast("Saved to wishlist")
                    else showToast(res.message || "Could not save")
                  }}
                >
                  <Heart className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {product.suggestions.length > 0 && (
            <section className="mt-16 border-t border-border/60 pt-12">
              <h2 className="font-serif text-xl font-semibold text-foreground">
                You may also like
              </h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {product.suggestions.map((s) => (
                  <Link
                    key={s.id}
                    href={`/product/${encodeURIComponent(s.slug)}`}
                    className="flex gap-3 rounded-2xl border border-border/80 bg-card p-3 transition hover:shadow-md"
                  >
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                      <PublicImage src={s.image} alt={s.name} fill className="object-cover" sizes="64px" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground line-clamp-2">{s.name}</p>
                      <p className="mt-1 text-sm font-bold text-foreground">₪ {s.price}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section className="mt-16 border-t border-border/60 pt-12">
            <h2 className="font-serif text-xl font-semibold text-foreground">Reviews</h2>
            <form onSubmit={onSubmitReview} className="mt-6 max-w-xl space-y-3 rounded-2xl border border-border bg-card p-5">
              <p className="text-sm text-muted-foreground">
                Share your experience {getStoredUser()?.name ? `, ${getStoredUser()?.name}` : ""}.
              </p>
              <label className="block text-xs font-medium text-foreground">
                Rating
                <select
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n} stars
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-medium text-foreground">
                Comment
                <textarea
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="How is this plant doing for you?"
                  maxLength={2000}
                />
              </label>
              <Button type="submit" className="rounded-full" disabled={submitting}>
                Post review
              </Button>
            </form>

            <ul className="mt-8 space-y-4">
              {reviews.length === 0 && (
                <li className="text-sm text-muted-foreground">No reviews yet — be the first.</li>
              )}
              {reviews.map((rev) => (
                <li
                  key={rev.id}
                  className="rounded-2xl border border-border/80 bg-card/80 px-4 py-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium text-foreground">{rev.userName}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="mt-1 flex gap-0.5 text-primary">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-primary" />
                    ))}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{rev.body}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}

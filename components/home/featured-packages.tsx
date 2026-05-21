"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Heart, ShoppingCart } from "lucide-react"
import { addToCart, addToWishlistWithSync, type WishlistLine } from "@/lib/shopping"
import { ensureLoggedInForShopping } from "@/lib/purchase-guard"
import { pickFeaturedHeroImage } from "@/lib/product-media"
import { fetchProductList } from "@/lib/static-pages"

type Package = {
  id: number
  slug: string
  name: string
  description: string
  shortBlurb: string
  price: number
  image: string
  tag: string
}

const IMAGE_BOX = "h-[220px] sm:h-[240px] md:h-[252px]"
const POP_W = 276
const POP_H = 215

function FeaturedPackageCard({
  pkg,
  isMd,
  onAddCart,
  onWishlist,
}: {
  pkg: Package
  isMd: boolean
  onAddCart: (p: Package) => void
  onWishlist: (p: Package) => void
}) {
  const [hover, setHover] = useState(false)
  const [pos, setPos] = useState({ left: 16, top: 16 })
  const hoverRef = useRef(false)

  const clampPopover = useCallback((clientX: number, clientY: number, el: HTMLDivElement) => {
    const r = el.getBoundingClientRect()
    const x = clientX - r.left
    const y = clientY - r.top
    const pad = 8
    let left = x + 14
    let top = y + 14
    if (left + POP_W > r.width - pad) left = x - POP_W - 14
    if (top + POP_H > r.height - pad) top = y - POP_H - 14
    if (left < pad) left = pad
    if (top < pad) top = pad
    if (left + POP_W > r.width - pad) left = Math.max(pad, r.width - POP_W - pad)
    if (top + POP_H > r.height - pad) top = Math.max(pad, r.height - POP_H - pad)
    setPos({ left, top })
  }, [])

  return (
    <div
      data-package-card
      className="group/card relative flex w-[min(85vw,300px)] shrink-0 flex-col overflow-visible rounded-2xl border border-border/80 bg-background shadow-sm transition duration-300 hover:shadow-md md:w-[calc((100%-3rem)/3)]"
    >
      <div
        className={`relative ${IMAGE_BOX} w-full shrink-0 rounded-t-2xl bg-muted/40`}
        onMouseEnter={(e) => {
          if (!isMd) return
          hoverRef.current = true
          setHover(true)
          clampPopover(e.clientX, e.clientY, e.currentTarget)
        }}
        onMouseLeave={() => {
          hoverRef.current = false
          setHover(false)
        }}
        onMouseMove={(e) => {
          if (!isMd || !hoverRef.current) return
          clampPopover(e.clientX, e.clientY, e.currentTarget)
        }}
      >
        <div className="absolute inset-0 z-0 overflow-hidden rounded-t-2xl">
          <Image
            src={pkg.image}
            alt={pkg.name}
            fill
            className="object-cover object-center transition duration-500 ease-out group-hover/card:scale-[1.03]"
            sizes="(max-width: 768px) 85vw, 33vw"
          />
        </div>
        <span className="absolute left-3 top-3 z-20 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-sm">
          {pkg.tag}
        </span>

        {isMd && hover && (
          <div
            className="absolute z-30 w-[276px] max-w-[calc(100%-16px)] pointer-events-none"
            style={{ left: pos.left, top: pos.top }}
            role="dialog"
            aria-label={`Quick view: ${pkg.name}`}
          >
            <div
              className="pointer-events-auto max-h-[min(60vh,320px)] overflow-y-auto rounded-xl border border-border/80 bg-card/95 p-4 shadow-xl backdrop-blur-md"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <p className="font-serif text-base font-semibold leading-snug text-foreground">{pkg.name}</p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{pkg.shortBlurb}</p>
              <p className="mt-3 font-serif text-lg font-bold text-foreground">₪ {pkg.price}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button type="button" size="sm" className="gap-1.5 rounded-full" onClick={() => onAddCart(pkg)}>
                  <ShoppingCart className="h-3.5 w-3.5" />
                  Add to cart
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="gap-1.5 rounded-full"
                  onClick={() => onWishlist(pkg)}
                >
                  <Heart className="h-3.5 w-3.5" />
                  Wishlist
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="relative z-[5] flex flex-1 flex-col p-4 pt-3">
        <Link
          href={`/product/${encodeURIComponent(pkg.slug)}`}
          className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-foreground transition-colors hover:text-primary"
        >
          {pkg.name}
        </Link>
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <span className="font-serif text-xl font-bold text-foreground">₪ {pkg.price}</span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="shrink-0 rounded-full text-xs sm:inline-flex"
            onClick={() => onAddCart(pkg)}
          >
            <ShoppingCart className="mr-1 h-3.5 w-3.5" />
            Add
          </Button>
        </div>
      </div>
    </div>
  )
}

export function FeaturedPackages() {
  const router = useRouter()
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [index, setIndex] = useState(0)
  const [perView, setPerView] = useState(3)
  const [isMd, setIsMd] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = useCallback((msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast(msg)
    toastTimer.current = setTimeout(() => setToast(null), 2200)
  }, [])

  useEffect(() => {
    const mq = () => {
      if (typeof window === "undefined") return 3
      const w = window.innerWidth
      if (w < 640) return 1
      if (w < 1024) return 2
      return 3
    }
    const setV = () => setPerView(mq())
    setV()
    window.addEventListener("resize", setV)
    return () => window.removeEventListener("resize", setV)
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    const m = window.matchMedia("(min-width: 768px)")
    const apply = () => setIsMd(m.matches)
    apply()
    m.addEventListener("change", apply)
    return () => m.removeEventListener("change", apply)
  }, [])

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const products: any[] = await fetchProductList()
        if (!Array.isArray(products)) {
          setPackages([])
          return
        }

        const enriched = products.map((product) => {
          const pick = pickFeaturedHeroImage(
            product.id,
            product.name || "",
            product.slug || "",
            product.image || ""
          )
          const shortBlurb =
            pick.shortBlurb ||
            (product.description
              ? String(product.description).slice(0, 120) +
                (String(product.description).length > 120 ? "…" : "")
              : `${product.name} — curated for your space.`)

          return {
            id: product.id,
            slug: product.slug || String(product.id),
            name: product.name,
            description: product.description || shortBlurb,
            shortBlurb,
            price: product.price,
            image: pick.src,
            tag: pick.tag,
          } as Package
        })

        const priority = (p: Package) => {
          if (p.image.includes("BasilStarterKit")) return 0
          if (p.image.includes("TomatoPlants_Cherry") || p.image.includes("TomatoPlants")) return 1
          if (p.image.includes("MintCollection")) return 2
          if (p.image.startsWith("https://images.unsplash.com")) return 3
          return 4
        }

        enriched.sort((a, b) => priority(a) - priority(b))
        setPackages(enriched.slice(0, 10))
      } catch (e) {
        console.error(e)
        setPackages([])
      } finally {
        setLoading(false)
      }
    }

    fetchPackages()
  }, [])

  const maxIndex = Math.max(0, packages.length - perView)

  useEffect(() => {
    if (index > maxIndex) setIndex(maxIndex)
  }, [maxIndex, index])

  useEffect(() => {
    const el = trackRef.current
    if (!el || packages.length === 0) return
    const card = el.querySelector<HTMLElement>("[data-package-card]")
    const width = card?.offsetWidth ?? 300
    const gap = 24
    const step = width + gap
    el.scrollTo({ left: index * step, behavior: "smooth" })
  }, [index, packages.length, perView])

  const prev = () => setIndex((i) => Math.max(0, i - 1))
  const next = () => setIndex((i) => Math.min(maxIndex, i + 1))

  const handleAddCart = (pkg: Package) => {
    if (!ensureLoggedInForShopping(router)) {
      showToast("Sign in to add to cart")
      return
    }
    addToCart({
      id: pkg.id,
      name: pkg.name,
      price: pkg.price,
      image: pkg.image,
      slug: pkg.slug,
      quantity: 1,
    })
    showToast("Added to cart")
  }

  const handleWishlist = async (pkg: Package) => {
    if (!ensureLoggedInForShopping(router)) {
      showToast("Sign in to save favorites")
      return
    }
    const item: WishlistLine = {
      id: pkg.id,
      name: pkg.name,
      price: pkg.price,
      image: pkg.image,
      slug: pkg.slug,
    }
    const res = await addToWishlistWithSync(item)
    if (res.ok) showToast("Saved to wishlist")
    else showToast(res.message || "Could not save")
  }

  return (
    <section className="relative bg-[#edece8] py-16 md:py-24">
      {toast && (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-foreground px-5 py-2 text-sm text-background shadow-lg">
          {toast}
        </div>
      )}
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
            Featured Packages
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            Curated collections to kickstart your green journey.
          </p>
        </div>

        {loading ? (
          <div className="mt-12 text-center text-muted-foreground">Loading packages…</div>
        ) : packages.length > 0 ? (
          <div className="relative mt-12">
            <button
              type="button"
              onClick={prev}
              disabled={index <= 0}
              className="absolute left-0 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-border bg-card/95 p-2.5 text-foreground shadow-md transition hover:bg-card disabled:opacity-30 md:flex"
              aria-label="Previous packages"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={next}
              disabled={index >= maxIndex}
              className="absolute right-0 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-border bg-card/95 p-2.5 text-foreground shadow-md transition hover:bg-card disabled:opacity-30 md:flex"
              aria-label="Next packages"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div
              ref={trackRef}
              className="flex items-stretch gap-6 overflow-x-auto scroll-smooth pb-4 pt-2 [-ms-overflow-style:none] [scrollbar-width:none] md:overflow-hidden [&::-webkit-scrollbar]:hidden"
            >
              {packages.map((pkg) => (
                <FeaturedPackageCard
                  key={pkg.id}
                  pkg={pkg}
                  isMd={isMd}
                  onAddCart={handleAddCart}
                  onWishlist={handleWishlist}
                />
              ))}
            </div>

            <div className="mt-2 flex justify-center gap-2 md:hidden">
              <Button type="button" variant="outline" size="icon" className="rounded-full" onClick={prev}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button type="button" variant="outline" size="icon" className="rounded-full" onClick={next}>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-12 text-center text-muted-foreground">No featured packages available.</div>
        )}
      </div>
    </section>
  )
}

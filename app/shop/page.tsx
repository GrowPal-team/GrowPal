"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ShoppingCart, Heart, Leaf, SlidersHorizontal } from "lucide-react"
import { addToCart, addToWishlistWithSync, type WishlistLine } from "@/lib/shopping"
import { loadClimatePrefs, clearClimatePrefs } from "@/lib/climate-zones"
import { ensureLoggedInForShopping } from "@/lib/purchase-guard"
import { fetchProductList } from "@/lib/static-pages"
import { resolvePublicUrl } from "@/lib/asset-path"

type Product = {
  id: number
  slug?: string
  name: string
  price: number
  ecoScore: number
  image: string
  secondaryImage?: string
  spaceType: string
  sunExposure: string
  waterLevel: string
  budget: string
  description?: string
  fullDescription?: string
  careHighlights?: string[]
  idealFor?: string
  stock?: number
  category?: string
}

const CATEGORY_ORDER = [
  "Herbs & Vegetables",
  "Ornamental Plants",
  "Fruit Trees",
  "Succulents & Cacti",
  "Plant Care Tools",
]

const CATEGORY_COPY: Record<string, string> = {
  "Herbs & Vegetables": "Fresh edible picks for kitchens, balconies, and productive home growing.",
  "Ornamental Plants": "Decorative greenery and flowering plants to soften and style every space.",
  "Fruit Trees": "Compact fruiting trees chosen for patios, rooftops, and sunny container gardens.",
  "Succulents & Cacti": "Low-water favorites for bright shelves, clean styling, and easy upkeep.",
  "Plant Care Tools": "Smart essentials for pruning, watering, and day-to-day plant care.",
}

const PRICE_FLOOR = 5
const PRICE_SOFT_CAP = 100

export default function ShopPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [spaceType, setSpaceType] = useState("all")
  const [sunExposure, setSunExposure] = useState("all")
  const [waterLevel, setWaterLevel] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [climateZoneLabel, setClimateZoneLabel] = useState<string | null>(null)
  const [priceLimit, setPriceLimit] = useState<number | null>(null)
  const [hasCustomPriceLimit, setHasCustomPriceLimit] = useState(false)

  useEffect(() => {
    const p = loadClimatePrefs()
    if (!p) return
    setSpaceType(p.spaceType)
    setSunExposure(p.sunExposure)
    setWaterLevel(p.waterLevel)
    setClimateZoneLabel(p.label)
  }, [])

  const clearZoneFilters = () => {
    clearClimatePrefs()
    setClimateZoneLabel(null)
    setSpaceType("all")
    setSunExposure("all")
    setWaterLevel("all")
  }

  // جلب المنتجات من API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (spaceType !== "all") params.append("spaceType", spaceType)
        if (sunExposure !== "all") params.append("sunExposure", sunExposure)
        if (waterLevel !== "all") params.append("waterLevel", waterLevel)

        const data = await fetchProductList(params)
        setProducts(data)
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [spaceType, sunExposure, waterLevel])

  const maxAvailablePrice = useMemo(() => {
    if (products.length === 0) return 0
    return Math.max(...products.map((product) => product.price))
  }, [products])

  const sliderCeiling = useMemo(() => {
    if (maxAvailablePrice === 0) return PRICE_SOFT_CAP
    return Math.min(maxAvailablePrice, PRICE_SOFT_CAP)
  }, [maxAvailablePrice])

  useEffect(() => {
    if (maxAvailablePrice === 0) {
      setPriceLimit(0)
      return
    }

    setPriceLimit((current) => {
      if (current === null || !hasCustomPriceLimit) return sliderCeiling
      return Math.min(current, sliderCeiling)
    })
  }, [maxAvailablePrice, hasCustomPriceLimit, sliderCeiling])

  const filtered = useMemo(() => {
    if (priceLimit === null) return products
    if (maxAvailablePrice > sliderCeiling && priceLimit >= sliderCeiling) return products
    return products.filter((product) => product.price <= priceLimit)
  }, [products, priceLimit, maxAvailablePrice, sliderCeiling])

  const groupedProducts = useMemo(() => {
    const groups = filtered.reduce<Record<string, Product[]>>((acc, product) => {
      const key = product.category || "More Picks"
      if (!acc[key]) acc[key] = []
      acc[key].push(product)
      return acc
    }, {})

    const ordered = CATEGORY_ORDER.filter((category) => groups[category]).map((category) => ({
      title: category,
      description: CATEGORY_COPY[category] || "Curated products for your growing space.",
      products: groups[category].slice().sort((a, b) => a.name.localeCompare(b.name)),
    }))

    const remaining = Object.keys(groups)
      .filter((category) => !CATEGORY_ORDER.includes(category))
      .sort((a, b) => a.localeCompare(b))
      .map((category) => ({
        title: category,
        description: CATEGORY_COPY[category] || "Curated products for your growing space.",
        products: groups[category].slice().sort((a, b) => a.name.localeCompare(b.name)),
      }))

    return [...ordered, ...remaining]
  }, [filtered])

  const renderProductCard = (product: Product) => {
    const href = `/product/${encodeURIComponent(product.slug || String(product.id))}`
    const wl: WishlistLine = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      slug: product.slug,
    }

    return (
      <div
        key={product.id}
        className="group overflow-hidden rounded-3xl border border-border/70 bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10"
      >
        <div className="relative aspect-square overflow-hidden bg-muted/30">
          <Link href={href} className="relative block h-full w-full">
            <Image
              src={resolvePublicUrl(product.image)}
              alt={product.name}
              fill
              className={`object-cover transition-all duration-500 ${product.secondaryImage ? "opacity-100 group-hover:opacity-0 group-hover:scale-105" : "group-hover:scale-105"}`}
            />
            {product.secondaryImage && (
              <Image
                src={resolvePublicUrl(product.secondaryImage)}
                alt={`${product.name} alternate view`}
                fill
                className="object-cover opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-105"
              />
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent px-4 pb-4 pt-12 text-white">
              <div className="flex flex-wrap gap-2 text-[11px]">
                {product.category && (
                  <span className="rounded-full bg-white/18 px-2.5 py-1 backdrop-blur-sm">{product.category}</span>
                )}
                <span className="rounded-full bg-white/18 px-2.5 py-1 backdrop-blur-sm">{product.spaceType}</span>
              </div>
            </div>
          </Link>
          <button
            type="button"
            className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-card/85 text-muted-foreground backdrop-blur-sm transition-colors hover:bg-card hover:text-primary"
            aria-label={`Add ${product.name} to wishlist`}
            onClick={() => {
              if (!ensureLoggedInForShopping(router)) return
              void addToWishlistWithSync(wl)
            }}
          >
            <Heart className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link href={href} className="block">
                <h3 className="line-clamp-2 text-base font-semibold text-foreground transition-colors hover:text-primary">
                  {product.name}
                </h3>
              </Link>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">{product.description}</p>
            </div>
            <div className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
              Eco {product.ecoScore}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {(product.careHighlights || []).slice(0, 3).map((item) => (
              <span key={item} className="rounded-full bg-muted px-3 py-1 text-[11px] text-muted-foreground">
                {item}
              </span>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-lg font-bold text-foreground">₪ {product.price}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{product.idealFor}</p>
            </div>
            <Button
              size="sm"
              className="shrink-0 gap-1.5 rounded-full px-4 text-xs"
              onClick={() => {
                if (!ensureLoggedInForShopping(router)) return
                addToCart({
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  image: product.image,
                  slug: product.slug,
                  quantity: 1,
                })
              }}
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const priceLimitLabel =
    priceLimit === null || maxAvailablePrice === 0
      ? "All prices"
      : maxAvailablePrice > sliderCeiling && priceLimit >= sliderCeiling
        ? `₪${sliderCeiling}+`
        : `Up to ₪${priceLimit}`

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
          <div className="flex flex-col gap-2">
            <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl">Shop Plants</h1>
            <p className="text-muted-foreground">Find the perfect plants and care tools for every space, style, and climate.</p>
          </div>

          {climateZoneLabel && (
            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-primary/25 bg-primary/5 px-4 py-3 text-sm text-foreground">
              <span>
                Filters aligned with your climate zone: <strong>{climateZoneLabel}</strong>
              </span>
              <Button type="button" variant="outline" size="sm" className="ml-auto rounded-full text-xs" onClick={clearZoneFilters}>
                Clear zone
              </Button>
              <Link href="/climate-zones" className="text-xs font-medium text-primary hover:underline">
                Change on map
              </Link>
            </div>
          )}

          {/* Filters */}
          <div className="mt-6">
            <Button
              variant="outline"
              className="gap-2 rounded-full md:hidden"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>

            <div className={`mt-4 flex flex-wrap gap-3 ${showFilters ? "flex" : "hidden md:flex"}`}>
              <Select value={spaceType} onValueChange={setSpaceType}>
                <SelectTrigger className="w-[160px] rounded-xl">
                  <SelectValue placeholder="Space Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Spaces</SelectItem>
                  <SelectItem value="Indoor">Indoor</SelectItem>
                  <SelectItem value="Balcony">Balcony</SelectItem>
                  <SelectItem value="Garden">Garden</SelectItem>
                  <SelectItem value="Rooftop">Rooftop</SelectItem>
                  <SelectItem value="Office">Office</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sunExposure} onValueChange={setSunExposure}>
                <SelectTrigger className="w-[160px] rounded-xl">
                  <SelectValue placeholder="Sun Exposure" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sun Levels</SelectItem>
                  <SelectItem value="Low">Low Sun</SelectItem>
                  <SelectItem value="Medium">Medium Sun</SelectItem>
                  <SelectItem value="High">High Sun</SelectItem>
                </SelectContent>
              </Select>

              <Select value={waterLevel} onValueChange={setWaterLevel}>
                <SelectTrigger className="w-[160px] rounded-xl">
                  <SelectValue placeholder="Water Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Water Levels</SelectItem>
                  <SelectItem value="Low">Low Water</SelectItem>
                  <SelectItem value="Medium">Medium Water</SelectItem>
                  <SelectItem value="High">High Water</SelectItem>
                </SelectContent>
              </Select>

              <div className="w-full rounded-xl border border-primary/20 bg-card px-3 py-2.5 shadow-sm md:w-[170px]">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Max Price
                    </p>
                    <p className="truncate text-sm font-semibold text-foreground">{priceLimitLabel}</p>
                  </div>
                  <button
                    type="button"
                    className="text-[10px] font-medium text-primary transition-colors hover:text-primary/80 disabled:text-muted-foreground"
                    onClick={() => {
                      setHasCustomPriceLimit(false)
                      setPriceLimit(sliderCeiling)
                    }}
                    disabled={maxAvailablePrice === 0 || priceLimit === sliderCeiling}
                  >
                    Reset
                  </button>
                </div>
                <input
                  type="range"
                  min={PRICE_FLOOR}
                  max={Math.max(sliderCeiling, 1)}
                  step={1}
                  value={priceLimit ?? Math.max(sliderCeiling, 1)}
                  disabled={loading || maxAvailablePrice === 0}
                  onChange={(event) => {
                    setHasCustomPriceLimit(true)
                    setPriceLimit(Number(event.target.value))
                  }}
                  className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-primary/15 accent-primary"
                />
                <div className="mt-1.5 flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>₪{PRICE_FLOOR}</span>
                  <span>{maxAvailablePrice > sliderCeiling ? `₪${sliderCeiling}+` : `₪${sliderCeiling}`}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="mt-16 flex flex-col items-center gap-3 text-center">
              <Leaf className="h-12 w-12 animate-spin text-muted-foreground/30" />
              <p className="text-lg font-medium text-muted-foreground">Loading products...</p>
            </div>
          ) : (
            <div className="mt-8 space-y-10">
              {groupedProducts.map((group) => (
                <section key={group.title} className="space-y-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h2 className="font-serif text-2xl font-semibold text-foreground">{group.title}</h2>
                      <p className="text-sm text-muted-foreground">{group.description}</p>
                    </div>
                    <span className="w-fit rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                      {group.products.length} items
                    </span>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {group.products.map((product) => renderProductCard(product))}
                  </div>
                </section>
              ))}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="mt-16 flex flex-col items-center gap-3 text-center">
              <Leaf className="h-12 w-12 text-muted-foreground/30" />
              <p className="text-lg font-medium text-muted-foreground">No plants match your filters</p>
              <p className="text-sm text-muted-foreground">Try adjusting your filters to find more options.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

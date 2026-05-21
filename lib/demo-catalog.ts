import seeds from "@/data/shop-product-seeds.json"
import { enrichProductCopy } from "@/lib/shop-catalog"

export type DemoListProduct = {
  id: number
  slug: string
  name: string
  price: number
  ecoScore: number
  image: string
  secondaryImage?: string
  spaceType: string
  spaceTypes: string[]
  sunExposure: string
  waterLevel: string
  budget: string
  description: string
  fullDescription: string
  careHighlights: string[]
  idealFor: string
  stock: number
  category: string
}

export type DemoDetailProduct = {
  id: number
  name: string
  slug: string
  description: string
  price: number
  image: string
  secondaryImage?: string
  images: string[]
  ecoScore: number
  stock: number
  category?: string
  spaceType: string
  sunExposure: string
  waterLevel: string
  climateZones?: string
  careHighlights: string[]
  idealFor: string
  suggestions: { id: number; name: string; slug: string; price: number; image: string }[]
}

type Seed = (typeof seeds)[number]

function parseSpaceTypes(value: string) {
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
}

function getPrimarySpaceType(spaceTypes: string[], category?: string) {
  if (spaceTypes.length > 0) return spaceTypes[0]
  if (category?.includes("Indoor") || category?.includes("Succulent")) return "Indoor"
  if (category?.includes("Herb")) return "Balcony"
  if (category?.includes("Tree")) return "Garden"
  if (category?.includes("Flower")) return "Balcony"
  return "All"
}

function budgetFromPrice(price: number) {
  if (price > 50) return "$$$"
  if (price > 25) return "$$"
  return "$"
}

function normalizeSunExposureForFilter(value: string) {
  switch (value) {
    case "High":
      return ["Full_Sun"]
    case "Medium":
      return ["Partial_Sun", "Partial_Shade"]
    case "Low":
      return ["Full_Shade"]
    default:
      return value ? [value] : []
  }
}

function formatListProduct(seed: Seed, id: number): DemoListProduct {
  const spaceTypes = parseSpaceTypes(seed.space_types)
  const spaceTypeValue = getPrimarySpaceType(spaceTypes, seed.category)
  const enhancement = enrichProductCopy({
    slug: seed.slug,
    category: seed.category,
    baseDescription: seed.description,
    sunExposure: seed.sun_exposure,
    waterLevel: seed.water_level,
    spaceType: spaceTypeValue,
  })

  return {
    id,
    slug: seed.slug,
    name: seed.name,
    price: seed.price_ils,
    ecoScore: seed.eco_score || 7,
    image: enhancement.primaryImage,
    secondaryImage: enhancement.secondaryImage,
    spaceType: spaceTypeValue,
    spaceTypes,
    sunExposure: seed.sun_exposure,
    waterLevel: seed.water_level,
    budget: budgetFromPrice(seed.price_ils),
    description: enhancement.shortDescription,
    fullDescription: enhancement.fullDescription,
    careHighlights: enhancement.careHighlights,
    idealFor: enhancement.idealFor,
    stock: seed.stock_quantity,
    category: seed.category,
  }
}

export const DEMO_PRODUCTS: DemoListProduct[] = (seeds as Seed[]).map((seed, index) =>
  formatListProduct(seed, index + 1),
)

export const DEMO_PRODUCT_SLUGS = DEMO_PRODUCTS.map((p) => p.slug)

export function filterDemoProducts(filters: {
  spaceType?: string | null
  sunExposure?: string | null
  waterLevel?: string | null
  budget?: string | null
}) {
  let filtered = [...DEMO_PRODUCTS]
  const { spaceType, sunExposure, waterLevel, budget } = filters

  if (spaceType && spaceType !== "all") {
    filtered = filtered.filter(
      (p) => p.spaceTypes.includes(spaceType) || p.spaceType === spaceType,
    )
  }

  if (sunExposure && sunExposure !== "all") {
    const allowed = normalizeSunExposureForFilter(sunExposure)
    filtered = filtered.filter((p) => allowed.includes(p.sunExposure))
  }

  if (waterLevel && waterLevel !== "all") {
    filtered = filtered.filter((p) => p.waterLevel === waterLevel)
  }

  if (budget && budget !== "all") {
    filtered = filtered.filter((p) => p.budget === budget)
  }

  return filtered
}

export function getDemoProductBySlug(slug: string): DemoDetailProduct | null {
  const decoded = decodeURIComponent(slug)
  const listItem =
    DEMO_PRODUCTS.find((p) => p.slug === decoded) ||
    DEMO_PRODUCTS.find((p) => String(p.id) === decoded)
  if (!listItem) return null

  const seed = (seeds as Seed[]).find((s) => s.slug === listItem.slug)
  if (!seed) return null

  const images = Array.from(
    new Set([listItem.image, listItem.secondaryImage].filter(Boolean)),
  ) as string[]

  const suggestions = DEMO_PRODUCTS.filter(
    (p) => p.slug !== listItem.slug && p.category === listItem.category,
  )
    .slice(0, 4)
    .map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      image: p.image,
    }))

  const fallbackSuggestions =
    suggestions.length > 0
      ? suggestions
      : DEMO_PRODUCTS.filter((p) => p.slug !== listItem.slug)
          .slice(0, 4)
          .map((p) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            price: p.price,
            image: p.image,
          }))

  return {
    id: listItem.id,
    name: listItem.name,
    slug: listItem.slug,
    description: listItem.fullDescription,
    price: listItem.price,
    image: listItem.image,
    secondaryImage: listItem.secondaryImage,
    images,
    ecoScore: listItem.ecoScore,
    stock: listItem.stock,
    category: listItem.category,
    spaceType: listItem.spaceType,
    sunExposure: listItem.sunExposure,
    waterLevel: listItem.waterLevel,
    climateZones: seed.climate_zones,
    careHighlights: listItem.careHighlights,
    idealFor: listItem.idealFor,
    suggestions: fallbackSuggestions,
  }
}

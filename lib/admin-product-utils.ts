import {
  products_maintenance_level,
  products_sun_exposure,
  products_water_level,
  products_weight_level,
} from "@prisma/client"

const SUN_EXPOSURE_VALUES = new Set(Object.values(products_sun_exposure))
const WATER_LEVEL_VALUES = new Set(Object.values(products_water_level))
const MAINTENANCE_VALUES = new Set(Object.values(products_maintenance_level))
const WEIGHT_VALUES = new Set(Object.values(products_weight_level))

export type ProductPayload = {
  name: string
  slug: string
  description: string | null
  priceIls: number
  imageUrl: string | null
  categoryId: number
  sunExposure: products_sun_exposure
  waterLevel: products_water_level
  maintenanceLevel: products_maintenance_level
  weightLevel: products_weight_level
  climateZones: string
  seasons: string
  ecoScore: number
  spaceTypes: string
  stockQuantity: number
}

function normalizeText(value: unknown, maxLength?: number) {
  const text = typeof value === "string" ? value.trim() : ""
  if (!text) return ""
  return maxLength ? text.slice(0, maxLength) : text
}

export function slugifyProductName(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200)
}

export function parseProductPayload(body: Record<string, unknown>): ProductPayload {
  const name = normalizeText(body.name, 200)
  if (!name) throw new Error("Product name is required.")

  const slugInput = normalizeText(body.slug, 200)
  const slug = slugifyProductName(slugInput || name)
  if (!slug) throw new Error("A valid slug is required.")

  const priceIls = Number(body.priceIls)
  if (!Number.isFinite(priceIls) || priceIls < 0) throw new Error("Price must be a valid non-negative number.")

  const categoryId = Number(body.categoryId)
  if (!Number.isInteger(categoryId) || categoryId < 1) throw new Error("Category is required.")

  const stockQuantity = Number(body.stockQuantity)
  if (!Number.isInteger(stockQuantity) || stockQuantity < 0) {
    throw new Error("Stock quantity must be a valid non-negative integer.")
  }

  const ecoScore = Number(body.ecoScore)
  if (!Number.isInteger(ecoScore) || ecoScore < 0) throw new Error("Eco score must be a valid non-negative integer.")

  const sunExposure = normalizeText(body.sunExposure) as products_sun_exposure
  const waterLevel = normalizeText(body.waterLevel) as products_water_level
  const maintenanceLevel = normalizeText(body.maintenanceLevel) as products_maintenance_level
  const weightLevel = normalizeText(body.weightLevel) as products_weight_level

  if (!SUN_EXPOSURE_VALUES.has(sunExposure)) throw new Error("Invalid sun exposure value.")
  if (!WATER_LEVEL_VALUES.has(waterLevel)) throw new Error("Invalid water level value.")
  if (!MAINTENANCE_VALUES.has(maintenanceLevel)) throw new Error("Invalid maintenance level value.")
  if (!WEIGHT_VALUES.has(weightLevel)) throw new Error("Invalid weight level value.")

  const descriptionRaw = typeof body.description === "string" ? body.description.trim() : ""
  const imageUrlRaw = normalizeText(body.imageUrl, 500)
  const climateZones = normalizeText(body.climateZones, 100)
  const seasons = normalizeText(body.seasons, 50)
  const spaceTypes = normalizeText(body.spaceTypes, 200)

  if (!climateZones) throw new Error("Climate zones are required.")
  if (!seasons) throw new Error("Seasons are required.")
  if (!spaceTypes) throw new Error("Space types are required.")

  return {
    name,
    slug,
    description: descriptionRaw || null,
    priceIls,
    imageUrl: imageUrlRaw || null,
    categoryId,
    sunExposure,
    waterLevel,
    maintenanceLevel,
    weightLevel,
    climateZones,
    seasons,
    ecoScore,
    spaceTypes,
    stockQuantity,
  }
}

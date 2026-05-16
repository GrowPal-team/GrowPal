import type { LucideIcon } from "lucide-react"
import { Droplets, Mountain, Sun, Trees, Flower2 } from "lucide-react"
import { PLANT_PRESETS, type RecommendedPlant } from "@/lib/mocks/plantPresets"

export type { RecommendedPlant } from "@/lib/mocks/plantPresets"

export type ClimateZone = {
  id: string
  name: string
  arabicName: string
  description: string
  climateBadge: string
  temperature: { min: number; max: number }
  rainfall: number
  sunHours: number
  humidity: string
  frostRisk: string
  color: string
  bgColor: string
  icon: LucideIcon
  growingSeasons: string[]
  soilType: string
  heatTolerance: string
  recommendedPlants: RecommendedPlant[]
  sunExposure: "Low" | "Medium" | "High"
  waterLevel: "Low" | "Medium" | "High"
  spaceType: "Indoor" | "Balcony" | "Garden" | "Office" | "Rooftop"
  /** Soft organic boundary for hit-testing & main fill */
  polygon: [number, number][]
  /** Slightly larger soft ring for a gentle “glow” under the main shape */
  haloPolygon: [number, number][]
}

/**
 * Smooth, cloud-like region (no sharp rectangle): ellipse + low-frequency wobble.
 */
export function organicRegionOutline(
  centerLat: number,
  centerLng: number,
  latAxis: number,
  lngAxis: number,
  options?: { points?: number; seed?: number }
): [number, number][] {
  const n = options?.points ?? 42
  const seed = options?.seed ?? 0
  const ring: [number, number][] = []
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2
    const wobble =
      1 +
      0.11 * Math.sin(t * 2 + seed * 0.85) +
      0.075 * Math.sin(t * 5 - seed * 0.35) +
      0.045 * Math.cos(t * 7 + seed * 0.55)
    ring.push([
      centerLat + Math.sin(t) * latAxis * wobble,
      centerLng + Math.cos(t) * lngAxis * wobble,
    ])
  }
  return ring
}

/** Check polygons in this order so overlaps resolve predictably. */
export const ZONE_HIT_ORDER = [
  "jordan-valley",
  "coastal-mediterranean",
  "negev-desert",
  "northern-galilee",
  "central-highlands",
] as const

export function pointInPolygon(lat: number, lng: number, poly: [number, number][]): boolean {
  const x = lng
  const y = lat
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [yi, xi] = poly[i]
    const [yj, xj] = poly[j]
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi + 1e-12) + xi) {
      inside = !inside
    }
  }
  return inside
}

export function findZoneAtLatLng(lat: number, lng: number): ClimateZone | null {
  for (const id of ZONE_HIT_ORDER) {
    const z = CLIMATE_ZONES.find((c) => c.id === id)
    if (z && pointInPolygon(lat, lng, z.polygon)) return z
  }
  return null
}

export function getZoneById(id: string): ClimateZone | undefined {
  return CLIMATE_ZONES.find((z) => z.id === id)
}

export const CLIMATE_ZONES: ClimateZone[] = [
  {
    id: "coastal-mediterranean",
    name: "Coastal Mediterranean",
    arabicName: "المنطقة الساحلية المتوسطة",
    description:
      "Sea breeze, mild winters, and steady humidity—ideal for citrus, jasmine, and lush balcony gardens along the coast.",
    climateBadge: "Mediterranean",
    temperature: { min: 12, max: 32 },
    rainfall: 550,
    sunHours: 8,
    humidity: "High",
    frostRisk: "Very low",
    color: "#4a7c59",
    bgColor: "rgba(74, 124, 89, 0.12)",
    icon: Droplets,
    growingSeasons: ["Spring", "Fall", "Mild winter"],
    soilType: "Sandy loam",
    heatTolerance: "High",
    recommendedPlants: [
      {
        name: "Lemon tree",
        category: "Outdoor trees",
        priceIls: 220,
        image: PLANT_PRESETS.lemon.image,
      },
      {
        name: "Jasmine",
        category: "Indoor plants",
        priceIls: 95,
        image: PLANT_PRESETS.jasmine.image,
      },
      {
        name: "Bougainvillea",
        category: "Outdoor trees",
        priceIls: 120,
        image: PLANT_PRESETS.bougainvillea.image,
      },
    ],
    sunExposure: "High",
    waterLevel: "Medium",
    spaceType: "Balcony",
    polygon: organicRegionOutline(32.05, 34.45, 0.9, 0.37, { points: 46, seed: 2 }),
    haloPolygon: organicRegionOutline(32.05, 34.45, 0.98, 0.42, { points: 46, seed: 2 }),
  },
  {
    id: "central-highlands",
    name: "Central Highlands",
    arabicName: "المرتفعات الوسطى",
    description:
      "Cooler nights and classic hill winters—olives, figs, and hardy perennials feel at home across the central ridge.",
    climateBadge: "Mountain Mediterranean",
    temperature: { min: 6, max: 30 },
    rainfall: 480,
    sunHours: 8,
    humidity: "Medium",
    frostRisk: "Moderate",
    color: "#6b8f5e",
    bgColor: "rgba(107, 143, 94, 0.12)",
    icon: Mountain,
    growingSeasons: ["Spring", "Summer", "Fall"],
    soilType: "Terra rossa / limestone",
    heatTolerance: "Medium",
    recommendedPlants: [
      {
        name: "Olive tree",
        category: "Outdoor trees",
        priceIls: 280,
        image: PLANT_PRESETS.olive.image,
      },
      {
        name: "Fig tree",
        category: "Outdoor trees",
        priceIls: 190,
        image: PLANT_PRESETS.fig.image,
      },
      {
        name: "Rosemary",
        category: "Herbs",
        priceIls: 45,
        image: PLANT_PRESETS.rosemary.image,
      },
    ],
    sunExposure: "High",
    waterLevel: "Medium",
    spaceType: "Garden",
    polygon: organicRegionOutline(31.83, 35.14, 0.44, 0.25, { points: 44, seed: 5 }),
    haloPolygon: organicRegionOutline(31.83, 35.14, 0.52, 0.3, { points: 44, seed: 5 }),
  },
  {
    id: "jordan-valley",
    name: "Jordan Valley",
    arabicName: "وادي الأردن",
    description:
      "Long hot summers and mild winters—the closest thing to tropical Palestine; dates, bananas, and sun-loving herbs thrive with irrigation.",
    climateBadge: "Hot arid basin",
    temperature: { min: 14, max: 40 },
    rainfall: 120,
    sunHours: 10,
    humidity: "Low",
    frostRisk: "Very low",
    color: "#c17f24",
    bgColor: "rgba(193, 127, 36, 0.14)",
    icon: Sun,
    growingSeasons: ["Year-round (with water)", "Winter peak"],
    soilType: "Alluvial / heavy",
    heatTolerance: "Very high",
    recommendedPlants: [
      {
        name: "Date palm",
        category: "Outdoor trees",
        priceIls: 350,
        image: PLANT_PRESETS.datePalm.image,
      },
      {
        name: "Basil",
        category: "Herbs",
        priceIls: 35,
        image: PLANT_PRESETS.basil.image,
      },
      {
        name: "Hibiscus",
        category: "Outdoor plants",
        priceIls: 85,
        image: PLANT_PRESETS.hibiscus.image,
      },
    ],
    sunExposure: "High",
    waterLevel: "High",
    spaceType: "Garden",
    polygon: organicRegionOutline(32.0, 35.47, 0.48, 0.15, { points: 40, seed: 8 }),
    haloPolygon: organicRegionOutline(32.0, 35.47, 0.55, 0.19, { points: 40, seed: 8 }),
  },
  {
    id: "northern-galilee",
    name: "Northern Galilee",
    arabicName: "الجليل الشمالي",
    description:
      "Greener hills and more rain—stone fruits, vines, and shade-loving understory plants do especially well.",
    climateBadge: "Cool Mediterranean",
    temperature: { min: 8, max: 31 },
    rainfall: 620,
    sunHours: 7,
    humidity: "Medium-high",
    frostRisk: "Low–moderate",
    color: "#2e7d32",
    bgColor: "rgba(46, 125, 50, 0.12)",
    icon: Trees,
    growingSeasons: ["Spring", "Summer", "Fall"],
    soilType: "Basalt / clay loam",
    heatTolerance: "Medium",
    recommendedPlants: [
      {
        name: "Stone fruit sapling",
        category: "Outdoor trees",
        priceIls: 210,
        image: PLANT_PRESETS.stoneFruit.image,
      },
      {
        name: "Fern mix",
        category: "Shade plants",
        priceIls: 65,
        image: PLANT_PRESETS.fern.image,
      },
      {
        name: "Mint",
        category: "Herbs",
        priceIls: 30,
        image: PLANT_PRESETS.mint.image,
      },
    ],
    sunExposure: "Medium",
    waterLevel: "Medium",
    spaceType: "Garden",
    polygon: organicRegionOutline(32.95, 35.3, 0.4, 0.27, { points: 44, seed: 11 }),
    haloPolygon: organicRegionOutline(32.95, 35.3, 0.47, 0.32, { points: 44, seed: 11 }),
  },
  {
    id: "negev-desert",
    name: "Negev Desert",
    arabicName: "صحراء النقب",
    description:
      "Low rainfall and intense sun—choose succulents, deep-rooted trees, and anything labeled drought-tough.",
    climateBadge: "Arid",
    temperature: { min: 10, max: 38 },
    rainfall: 180,
    sunHours: 10,
    humidity: "Very low",
    frostRisk: "Low",
    color: "#b5651d",
    bgColor: "rgba(181, 101, 29, 0.12)",
    icon: Flower2,
    growingSeasons: ["Spring", "Fall"],
    soilType: "Loamy sand / desert crust",
    heatTolerance: "Very high",
    recommendedPlants: [
      {
        name: "Succulent garden kit",
        category: "Indoor plants",
        priceIls: 110,
        image: PLANT_PRESETS.succulentMix.image,
      },
      {
        name: "Acacia sapling",
        category: "Outdoor trees",
        priceIls: 165,
        image: PLANT_PRESETS.acacia.image,
      },
      {
        name: "Desert sage",
        category: "Herbs",
        priceIls: 40,
        image: PLANT_PRESETS.rosemary.image,
      },
    ],
    sunExposure: "High",
    waterLevel: "Low",
    spaceType: "Garden",
    polygon: organicRegionOutline(31.08, 34.78, 0.5, 0.45, { points: 42, seed: 14 }),
    haloPolygon: organicRegionOutline(31.08, 34.78, 0.58, 0.52, { points: 42, seed: 14 }),
  },
]

export const MAX_RAINFALL_MOCK = Math.max(...CLIMATE_ZONES.map((z) => z.rainfall))

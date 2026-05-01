import type { RecommendedPlant } from "@/lib/mocks/plantPresets"

export type CityShopHints = {
  sunExposure: "Low" | "Medium" | "High"
  waterLevel: "Low" | "Medium" | "High"
  spaceType: "Indoor" | "Balcony" | "Garden" | "Office" | "Rooftop"
}

export type CityPlantsBySpace = {
  indoor: RecommendedPlant[]
  balcony: RecommendedPlant[]
  garden: RecommendedPlant[]
  rooftop: RecommendedPlant[]
}

export type CityClimateProfile = {
  name: string
  nameAr: string
  zoneId: string
  lat: number
  lng: number
  elevationM: number
  annualRainMm: number
  tempJanAvgC: number
  tempJulAvgC: number
  sunHoursSummer: number
  humidityNote: string
  frostRisk: string
  climateSummary: string
  growingNote: string
  dataSourceNote: string
  shopHints: CityShopHints
  plants: CityPlantsBySpace
}

export const CLIMATE_DATA_SOURCE_NOTE =
  "Numbers are rounded long‑term norms aligned with public climate tables (e.g. Climate-Data.org, PCBS / governorate geography, and regional meteorological summaries). Figures are interpolated for each locality from its zone, elevation, and distance to the sea — use as gardening guidance, not engineering data."

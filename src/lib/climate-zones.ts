import type { ClimateZone } from "@/lib/mocks/climateZones"
import type { CityClimateProfile } from "@/lib/mocks/cityClimate"

export const CLIMATE_STORAGE_KEY = "growpal_climate_prefs"

export type StoredClimatePrefs = {
  locationId: string
  label: string
  /** Set when the user picked a specific city on the climate map */
  cityName?: string | null
  sunExposure: string
  waterLevel: string
  spaceType: string
}

export function saveClimatePrefsFromZone(zone: ClimateZone) {
  if (typeof window === "undefined") return
  const payload: StoredClimatePrefs = {
    locationId: zone.id,
    label: zone.name,
    cityName: null,
    sunExposure: zone.sunExposure,
    waterLevel: zone.waterLevel,
    spaceType: zone.spaceType,
  }
  localStorage.setItem(CLIMATE_STORAGE_KEY, JSON.stringify(payload))
}

export function saveClimatePrefsFromCity(zone: ClimateZone, city: CityClimateProfile) {
  if (typeof window === "undefined") return
  const h = city.shopHints
  const payload: StoredClimatePrefs = {
    locationId: zone.id,
    label: `${city.name} · ${zone.name}`,
    cityName: city.name,
    sunExposure: h.sunExposure,
    waterLevel: h.waterLevel,
    spaceType: h.spaceType,
  }
  localStorage.setItem(CLIMATE_STORAGE_KEY, JSON.stringify(payload))
}

/** @deprecated use saveClimatePrefsFromZone */
export function saveClimatePrefs(loc: {
  id: string
  label: string
  cityName?: string | null
  sunExposure: string
  waterLevel: string
  spaceType: string
}) {
  if (typeof window === "undefined") return
  const payload: StoredClimatePrefs = {
    locationId: loc.id,
    label: loc.label,
    cityName: loc.cityName ?? null,
    sunExposure: loc.sunExposure,
    waterLevel: loc.waterLevel,
    spaceType: loc.spaceType,
  }
  localStorage.setItem(CLIMATE_STORAGE_KEY, JSON.stringify(payload))
}

export function loadClimatePrefs(): StoredClimatePrefs | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(CLIMATE_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as StoredClimatePrefs
  } catch {
    return null
  }
}

export function clearClimatePrefs() {
  if (typeof window === "undefined") return
  localStorage.removeItem(CLIMATE_STORAGE_KEY)
}

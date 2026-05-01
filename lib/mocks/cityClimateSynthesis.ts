import { findZoneAtLatLng } from "@/lib/mocks/climateZones"
import type { CityClimateProfile, CityShopHints } from "@/lib/mocks/cityClimateTypes"
import { CLIMATE_DATA_SOURCE_NOTE } from "@/lib/mocks/cityClimateTypes"
import type { PalestineCitySeed } from "@/lib/mocks/palestineCitySeed"
import { pickPlants } from "@/lib/mocks/plantPresets"

type HumidityTemplate = "coastal" | "highland" | "valley" | "galilee" | "negev"

type ZoneRef = {
  refElev: number
  rain: number
  tJan: number
  tJul: number
  sun: number
  zoneHuman: string
  humidityTemplate: HumidityTemplate
}

const ZONE_REF: Record<string, ZoneRef> = {
  "coastal-mediterranean": {
    refElev: 25,
    rain: 475,
    tJan: 13.4,
    tJul: 26.6,
    sun: 11,
    zoneHuman: "Mediterranean coastal",
    humidityTemplate: "coastal",
  },
  "central-highlands": {
    refElev: 720,
    rain: 528,
    tJan: 9.8,
    tJul: 24.2,
    sun: 11,
    zoneHuman: "central hill country",
    humidityTemplate: "highland",
  },
  "jordan-valley": {
    refElev: -200,
    rain: 145,
    tJan: 13.8,
    tJul: 32.4,
    sun: 12,
    zoneHuman: "Jordan Valley rift",
    humidityTemplate: "valley",
  },
  "northern-galilee": {
    refElev: 380,
    rain: 558,
    tJan: 11.6,
    tJul: 25.6,
    sun: 10,
    zoneHuman: "northern Galilee / Jenin hills",
    humidityTemplate: "galilee",
  },
  "negev-desert": {
    refElev: 280,
    rain: 198,
    tJan: 11.2,
    tJul: 28.4,
    sun: 12,
    zoneHuman: "semi-arid Negev",
    humidityTemplate: "negev",
  },
}

function inferZoneId(lat: number, lng: number): string {
  const hit = findZoneAtLatLng(lat, lng)
  if (hit) return hit.id
  if (lat >= 31.2 && lat <= 31.65 && lng >= 34.18 && lng <= 34.58) return "coastal-mediterranean"
  if (lat >= 32.0 && lat <= 32.7 && lng >= 35.05 && lng <= 35.48) return "northern-galilee"
  if (lat >= 31.7 && lat <= 32.05 && lng >= 35.35 && lng <= 35.52) return "jordan-valley"
  if (lat <= 31.48 && lng >= 34.55 && lat >= 30.9) return "negev-desert"
  if (lat >= 31.38 && lat <= 32.55 && lng >= 34.88 && lng <= 35.42) return "central-highlands"
  return "central-highlands"
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n))
}

function hashName(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i) || 0
  return Math.abs(h)
}

function humidityLine(template: HumidityTemplate): string {
  switch (template) {
    case "coastal":
      return "Sea air keeps relative humidity moderate–high; balconies dry slower in summer."
    case "highland":
      return "Dry summer canopy; winter rain dominates; heated rooms dehydrate houseplants."
    case "valley":
      return "Very low humidity most of the year except brief winter storms."
    case "galilee":
      return "Higher dew and spring humidity than the southern coast; give leafy crops airflow."
    case "negev":
      return "Desert dryness; sharp nightly cooling; wind scour on exposed roofs."
    default:
      return "Typical regional humidity pattern for this elevation."
  }
}

function frostLine(tJan: number, elev: number, zoneId: string): string {
  if (zoneId === "coastal-mediterranean" || zoneId === "jordan-valley") return "Very rare"
  if (zoneId === "negev-desert") return "Rare light ground frost"
  if (tJan <= 8.5 || elev > 880) return "Moderate in pockets; protect tender pots"
  if (tJan <= 10) return "Light frost possible in radiative lows"
  return "Low; watch young citrus on cold snaps"
}

function shopHints(zoneId: string, rain: number, tJul: number, elev: number): CityShopHints {
  const water: CityShopHints["waterLevel"] =
    rain < 200 || zoneId === "jordan-valley"
      ? "High"
      : rain > 520 || zoneId === "northern-galilee"
        ? "Medium"
        : zoneId === "negev-desert" || rain < 320
          ? "Low"
          : "Medium"
  const sun: CityShopHints["sunExposure"] =
    zoneId === "jordan-valley" || zoneId === "negev-desert"
      ? "High"
      : zoneId === "northern-galilee" && elev > 500
        ? "Medium"
        : "High"
  const space: CityShopHints["spaceType"] =
    zoneId === "coastal-mediterranean" && elev < 80 && tJul > 26.5 ? "Balcony" : "Garden"
  return { sunExposure: sun, waterLevel: water, spaceType: space }
}

function pickPlantTriple(zoneId: string, name: string): CityClimateProfile["plants"] {
  const r = hashName(name) % 3

  if (zoneId === "jordan-valley") {
    return {
      indoor: pickPlants(
        "pothos",
        "snakePlant",
        r === 0 ? "aloe" : r === 1 ? "peaceLily" : "monstera"
      ),
      balcony: pickPlants("hibiscus", "bougainvillea", "basil"),
      garden: pickPlants("datePalm", "lemon", "rosemary"),
      rooftop: pickPlants("eggplant", "pepperBell", "marigold"),
    }
  }
  if (zoneId === "negev-desert") {
    return {
      indoor: pickPlants("succulentMix", "snakePlant", "aloe"),
      balcony: pickPlants("lavender", "rosemary", "bougainvillea"),
      garden: pickPlants("acacia", "olive", "pomegranate"),
      rooftop: pickPlants("pepperBell", "eggplant", "thyme"),
    }
  }
  if (zoneId === "coastal-mediterranean") {
    const indoor = [
      pickPlants("snakePlant", "pothos", "monstera"),
      pickPlants("peaceLily", "fern", "pothos"),
      pickPlants("succulentMix", "aloe", "snakePlant"),
    ][r]!
    const balcony = [
      pickPlants("lemon", "jasmine", "geranium"),
      pickPlants("bougainvillea", "lavender", "rosemary"),
      pickPlants("mint", "basil", "geranium"),
    ][r]!
    const roof = [
      pickPlants("tomatoCherry", "pepperBell", "basil"),
      pickPlants("eggplant", "zucchini", "marigold"),
      pickPlants("cucumber", "parsley", "tomatoCherry"),
    ][r]!
    return {
      indoor,
      balcony,
      garden: pickPlants("olive", r === 0 ? "bougainvillea" : "lemon", "rosemary"),
      rooftop: roof,
    }
  }
  if (zoneId === "northern-galilee") {
    return {
      indoor: pickPlants("fern", "pothos", r === 0 ? "cyclamen" : "monstera"),
      balcony: pickPlants("mint", "basil", "geranium"),
      garden: pickPlants("stoneFruit", "olive", "grapeVine"),
      rooftop: pickPlants("tomatoCherry", "parsley", "chives"),
    }
  }
  return {
    indoor: pickPlants("snakePlant", r === 0 ? "cyclamen" : "succulentMix", "pothos"),
    balcony: pickPlants("lavender", "rosemary", "geranium"),
    garden: pickPlants("fig", "olive", "grapeVine"),
    rooftop: pickPlants(
      "tomatoCherry",
      r === 1 ? "eggplant" : "pepperBell",
      "parsley"
    ),
  }
}

export function buildSynthesizedCityProfiles(
  seeds: PalestineCitySeed[],
  handpickedNames: Set<string>
): CityClimateProfile[] {
  const out: CityClimateProfile[] = []
  for (const s of seeds) {
    if (handpickedNames.has(s.name)) continue
    const zoneId = inferZoneId(s.lat, s.lng)
    const ref = ZONE_REF[zoneId] ?? ZONE_REF["central-highlands"]
    const lapse = 0.0065
    const tempAdj = (ref.refElev - s.elevationM) * lapse
    const tempJan = Math.round((ref.tJan + tempAdj) * 10) / 10
    const tempJul = Math.round((ref.tJul + tempAdj) * 10) / 10
    let rain = ref.rain + (s.elevationM - ref.refElev) * 0.09
    if (zoneId === "coastal-mediterranean") rain += (s.lng - 34.4) * 8
    if (zoneId === "jordan-valley") rain = clamp(rain, 90, 220)
    else rain = clamp(rain, 110, 820)
    const annualRainMm = Math.round(rain)
    const sunHoursSummer = ref.sun
    const hum = humidityLine(ref.humidityTemplate)
    const frost = frostLine(tempJan, s.elevationM, zoneId)
    const summary = `${s.name} (${s.nameAr}) sits in the ${ref.zoneHuman} belt — values below are interpolated for about ${s.elevationM} m elevation from regional climate normals. Typical rainfall is near ${annualRainMm} mm/year; January averages about ${tempJan}°C and July about ${tempJul}°C.`
    const growing =
      "Use windbreaks on exposed roofs, improve drainage on clay hillsides, and delay heat‑loving seedlings until spring nights stabilize. Indoors, add humidity in winter and shade south windows in midsummer."

    out.push({
      name: s.name,
      nameAr: s.nameAr,
      zoneId,
      lat: s.lat,
      lng: s.lng,
      elevationM: s.elevationM,
      annualRainMm,
      tempJanAvgC: tempJan,
      tempJulAvgC: tempJul,
      sunHoursSummer,
      humidityNote: hum,
      frostRisk: frost,
      climateSummary: summary,
      growingNote: growing,
      dataSourceNote: CLIMATE_DATA_SOURCE_NOTE,
      shopHints: shopHints(zoneId, annualRainMm, tempJul, s.elevationM),
      plants: pickPlantTriple(zoneId, s.name),
    })
  }
  return out
}

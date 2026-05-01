import { pickPlants } from "@/lib/mocks/plantPresets"
import {
  CLIMATE_DATA_SOURCE_NOTE,
  type CityClimateProfile,
} from "@/lib/mocks/cityClimateTypes"
import { buildSynthesizedCityProfiles } from "@/lib/mocks/cityClimateSynthesis"
import { PALESTINE_CITY_SEEDS } from "@/lib/mocks/palestineCitySeed"

export type { CityClimateProfile, CityPlantsBySpace, CityShopHints } from "@/lib/mocks/cityClimateTypes"

function city(p: CityClimateProfile): CityClimateProfile {
  return { ...p, dataSourceNote: p.dataSourceNote || CLIMATE_DATA_SOURCE_NOTE }
}

const HANDPICKED_CITY_PROFILES: CityClimateProfile[] = [
  city({
    name: "Gaza",
    nameAr: "غزة",
    zoneId: "coastal-mediterranean",
    lat: 31.5017,
    lng: 34.4668,
    elevationM: 10,
    annualRainMm: 390,
    tempJanAvgC: 15,
    tempJulAvgC: 27,
    sunHoursSummer: 11,
    humidityNote: "Marine humidity; summer feels sticky near the shore",
    frostRisk: "Very rare",
    climateSummary:
      "Gaza sits on a warm Mediterranean strip: mild, rainier winters and long dry summers with sea breeze. Salt spray and wind stress coastal leaves; choose tougher foliage or rinse balcony plants occasionally.",
    growingNote:
      "Citrus and jasmine love the winter rain + summer sun. Indoors, prioritize mildew-resistant herbs in humid months and snake plants where AC dries the air.",
    dataSourceNote: CLIMATE_DATA_SOURCE_NOTE,
    shopHints: { sunExposure: "High", waterLevel: "Medium", spaceType: "Balcony" },
    plants: {
      indoor: pickPlants("snakePlant", "monstera", "aloe"),
      balcony: pickPlants("lemon", "jasmine", "geranium"),
      garden: pickPlants("bougainvillea", "olive", "rosemary"),
      rooftop: pickPlants("tomatoCherry", "basil", "pepperBell"),
    },
  }),
  city({
    name: "Haifa",
    nameAr: "حيفا",
    zoneId: "coastal-mediterranean",
    lat: 32.794,
    lng: 34.9896,
    elevationM: 5,
    annualRainMm: 524,
    tempJanAvgC: 14,
    tempJulAvgC: 26,
    sunHoursSummer: 10,
    humidityNote: "High year-round on the bay; summer mornings often humid",
    frostRisk: "Very low on the flat coast",
    climateSummary:
      "Haifa’s bay climate is one of the wetter coastal profiles in the country: more cloud and dew than Ashkelon, cooler summer peaks than inland. Mount Carmel neighborhoods are cooler and wetter still—treat upper streets like ‘almost highland’ for tender heat lovers.",
    growingNote:
      "Balcony growers get excellent results with pelargoniums, citrus, and herbs. Indoors, ferns and pothos handle humidity; add grow-lights in winter for sun-hungry seedlings.",
    dataSourceNote: CLIMATE_DATA_SOURCE_NOTE,
    shopHints: { sunExposure: "High", waterLevel: "Medium", spaceType: "Balcony" },
    plants: {
      indoor: pickPlants("fern", "pothos", "cyclamen"),
      balcony: pickPlants("lemon", "geranium", "lavender"),
      garden: pickPlants("olive", "bougainvillea", "rosemary"),
      rooftop: pickPlants("tomatoCherry", "parsley", "basil"),
    },
  }),
  city({
    name: "Jaffa",
    nameAr: "يافا",
    zoneId: "coastal-mediterranean",
    lat: 32.0853,
    lng: 34.7818,
    elevationM: 10,
    annualRainMm: 531,
    tempJanAvgC: 13,
    tempJulAvgC: 26,
    sunHoursSummer: 11,
    humidityNote: "Coastal humidity; heat island in dense urban blocks",
    frostRisk: "Very rare",
    climateSummary:
      "Classic central Levantine coast: winter rains concentrated Dec–Mar, summers dry and sunny. Urban courtyards trap heat at night—balconies need resilient pots and good drainage.",
    growingNote:
      "Rooftops dry out fastest: use deep containers and mulch. Offices and apartments benefit from low-maintenance sansevieria and pothos; shade balconies suit mint and leafy herbs.",
    dataSourceNote: CLIMATE_DATA_SOURCE_NOTE,
    shopHints: { sunExposure: "High", waterLevel: "Medium", spaceType: "Balcony" },
    plants: {
      indoor: pickPlants("pothos", "snakePlant", "monstera"),
      balcony: pickPlants("jasmine", "bougainvillea", "basil"),
      garden: pickPlants("lemon", "olive", "rosemary"),
      rooftop: pickPlants("pepperBell", "tomatoCherry", "marigold"),
    },
  }),
  city({
    name: "Acre",
    nameAr: "عكا",
    zoneId: "coastal-mediterranean",
    lat: 32.9268,
    lng: 35.0837,
    elevationM: 8,
    annualRainMm: 600,
    tempJanAvgC: 13,
    tempJulAvgC: 27,
    sunHoursSummer: 10,
    humidityNote: "High; frequent morning mist near the sea",
    frostRisk: "Very low",
    climateSummary:
      "Northern coast = more annual rain and slightly cooler summers than Gaza. Great for lush balcony gardens but watch fungal spots on tight, humid patios.",
    growingNote:
      "Stone fruits and vines do well a short drive inland; on the wall itself favor citrus, scented climbers, and tough Mediterranean shrubs. Indoor plants enjoy the moisture—ventilate to prevent gnats.",
    dataSourceNote: CLIMATE_DATA_SOURCE_NOTE,
    shopHints: { sunExposure: "High", waterLevel: "Medium", spaceType: "Garden" },
    plants: {
      indoor: pickPlants("fern", "monstera", "pothos"),
      balcony: pickPlants("lemon", "jasmine", "geranium"),
      garden: pickPlants("olive", "grapeVine", "lavender"),
      rooftop: pickPlants("tomatoCherry", "basil", "parsley"),
    },
  }),
  city({
    name: "Ashkelon",
    nameAr: "عسقلان",
    zoneId: "coastal-mediterranean",
    lat: 31.6688,
    lng: 34.5745,
    elevationM: 15,
    annualRainMm: 450,
    tempJanAvgC: 13,
    tempJulAvgC: 27,
    sunHoursSummer: 11,
    humidityNote: "Moderate coastal; drier than Haifa",
    frostRisk: "Very rare",
    climateSummary:
      "Open coastal plain: strong sun, moderate winter rain, occasional dusty desert winds from the east. Plants need windbreaks on exposed balconies.",
    growingNote:
      "Succulents and olives tolerate salt and wind. Vegetable beds want wind fabric; indoor growers should dust leaves after khamsin events.",
    dataSourceNote: CLIMATE_DATA_SOURCE_NOTE,
    shopHints: { sunExposure: "High", waterLevel: "Low", spaceType: "Balcony" },
    plants: {
      indoor: pickPlants("succulentMix", "aloe", "snakePlant"),
      balcony: pickPlants("bougainvillea", "lavender", "geranium"),
      garden: pickPlants("olive", "rosemary", "lemon"),
      rooftop: pickPlants("tomatoCherry", "pepperBell", "marigold"),
    },
  }),
  city({
    name: "Jerusalem",
    nameAr: "القدس",
    zoneId: "central-highlands",
    lat: 31.7683,
    lng: 35.2137,
    elevationM: 754,
    annualRainMm: 537,
    tempJanAvgC: 10,
    tempJulAvgC: 24,
    sunHoursSummer: 11,
    humidityNote: "Drier than coast; winter heating dries indoor air",
    frostRisk: "Light frost possible Dec–Feb in lows",
    climateSummary:
      "Highland Mediterranean: sharp day/night drops, snowy spells are rare but cold snaps happen. Most rain falls in winter; summer is sunny and rainless—ideal for olives and figs with deep mulch.",
    growingNote:
      "Indoor: prioritize plants that tolerate dry radiator air (snake plant, succulents). Rooftops freeze earlier than courtyards—delay tender planting to late spring.",
    dataSourceNote: CLIMATE_DATA_SOURCE_NOTE,
    shopHints: { sunExposure: "High", waterLevel: "Medium", spaceType: "Garden" },
    plants: {
      indoor: pickPlants("snakePlant", "succulentMix", "cyclamen"),
      balcony: pickPlants("lavender", "rosemary", "geranium"),
      garden: pickPlants("olive", "fig", "grapeVine"),
      rooftop: pickPlants("tomatoCherry", "parsley", "pepperBell"),
    },
  }),
  city({
    name: "Ramallah",
    nameAr: "رام الله",
    zoneId: "central-highlands",
    lat: 31.9028,
    lng: 35.2034,
    elevationM: 872,
    annualRainMm: 590,
    tempJanAvgC: 9,
    tempJulAvgC: 23,
    sunHoursSummer: 10,
    humidityNote: "Cooler days; winter indoor air very dry with heating",
    frostRisk: "Occasional light frost",
    climateSummary:
      "Among the cooler city cores in the West Bank highlands: more winter rain than Jerusalem in some years, noticeably milder summers. Mornings can be foggy in wadis.",
    growingNote:
      "Stone fruits and almonds do well with chill hours. Balcony citrus needs the sunniest wall. Offices and dim rooms: pothos and snake plant tolerate lower light.",
    dataSourceNote: CLIMATE_DATA_SOURCE_NOTE,
    shopHints: { sunExposure: "Medium", waterLevel: "Medium", spaceType: "Balcony" },
    plants: {
      indoor: pickPlants("pothos", "fern", "snakePlant"),
      balcony: pickPlants("stoneFruit", "lavender", "mint"),
      garden: pickPlants("olive", "fig", "grapeVine"),
      rooftop: pickPlants("tomatoCherry", "basil", "pepperBell"),
    },
  }),
  city({
    name: "Nablus",
    nameAr: "نابلس",
    zoneId: "central-highlands",
    lat: 32.2211,
    lng: 35.2544,
    elevationM: 450,
    annualRainMm: 507,
    tempJanAvgC: 11,
    tempJulAvgC: 25,
    sunHoursSummer: 11,
    humidityNote: "Between coast moisture and inland dryness",
    frostRisk: "Light frost in cold pools",
    climateSummary:
      "Basin-and-hill mosaic: hotter summer days than Ramallah but cooler than the Jordan Valley. Olive culture matches the long dry season if soil is limed and mulched.",
    growingNote:
      "Courtyard gardens support figs and pomegranates (use fig preset). Indoors, balance summer AC with humidity trays for herbs started inside.",
    dataSourceNote: CLIMATE_DATA_SOURCE_NOTE,
    shopHints: { sunExposure: "High", waterLevel: "Medium", spaceType: "Garden" },
    plants: {
      indoor: pickPlants("monstera", "pothos", "aloe"),
      balcony: pickPlants("fig", "rosemary", "geranium"),
      garden: pickPlants("olive", "grapeVine", "lavender"),
      rooftop: pickPlants("eggplant", "tomatoCherry", "basil"),
    },
  }),
  city({
    name: "Bethlehem",
    nameAr: "بيت لحم",
    zoneId: "central-highlands",
    lat: 31.7054,
    lng: 35.2024,
    elevationM: 765,
    annualRainMm: 501,
    tempJanAvgC: 9,
    tempJulAvgC: 24,
    sunHoursSummer: 11,
    humidityNote: "Dry summer; crisp winter nights",
    frostRisk: "Moderate in sheltered valleys",
    climateSummary:
      "High enough for classic hill crops: grapes, figs, almonds. Winter rain feeds spring growth; summer is relentless sun—shade cloth helps young transplants.",
    growingNote:
      "Rooftop growers: use wind barriers. Indoor: Christmas-cycle plants like cyclamen enjoy cool bright windows in winter.",
    dataSourceNote: CLIMATE_DATA_SOURCE_NOTE,
    shopHints: { sunExposure: "High", waterLevel: "Medium", spaceType: "Garden" },
    plants: {
      indoor: pickPlants("cyclamen", "snakePlant", "succulentMix"),
      balcony: pickPlants("lavender", "rosemary", "mint"),
      garden: pickPlants("fig", "olive", "grapeVine"),
      rooftop: pickPlants("tomatoCherry", "pepperBell", "parsley"),
    },
  }),
  city({
    name: "Hebron",
    nameAr: "الخليل",
    zoneId: "central-highlands",
    lat: 31.5326,
    lng: 35.0998,
    elevationM: 930,
    annualRainMm: 502,
    tempJanAvgC: 8,
    tempJulAvgC: 23,
    sunHoursSummer: 11,
    humidityNote: "Low summer humidity; cold winter nights",
    frostRisk: "Highest in the highland cities listed here",
    climateSummary:
      "Cooler nights year-round than Jerusalem on average; grapes and stone fruit get good winter chill. Summer heat is strong at altitude—UV burns tender leaves fast.",
    growingNote:
      "Delay heat-loving seedlings until night temps stay above ~12°C. Indoors, succulents near south windows; offices with dim light → snake plant.",
    dataSourceNote: CLIMATE_DATA_SOURCE_NOTE,
    shopHints: { sunExposure: "High", waterLevel: "Low", spaceType: "Garden" },
    plants: {
      indoor: pickPlants("snakePlant", "succulentMix", "aloe"),
      balcony: pickPlants("lavender", "rosemary", "geranium"),
      garden: pickPlants("grapeVine", "fig", "olive"),
      rooftop: pickPlants("tomatoCherry", "eggplant", "marigold"),
    },
  }),
  city({
    name: "Jericho",
    nameAr: "أريحا",
    zoneId: "jordan-valley",
    lat: 31.8667,
    lng: 35.4433,
    elevationM: -258,
    annualRainMm: 160,
    tempJanAvgC: 14,
    tempJulAvgC: 33,
    sunHoursSummer: 12,
    humidityNote: "Dry; summer heat stress extreme",
    frostRisk: "Very low",
    climateSummary:
      "One of the hottest, lowest cities in the region: subtropical heat with almost no summer rain. Agriculture depends on irrigation and variety choice (dates, bananas, tropical ornamentals).",
    growingNote:
      "Indoors: AC rooms suit pothos and hardy foliage. Outdoors: nothing survives without water scheduling—drip is essential. Rooftops need shade nets and heat-tolerant veggies (eggplant, peppers).",
    dataSourceNote: CLIMATE_DATA_SOURCE_NOTE,
    shopHints: { sunExposure: "High", waterLevel: "High", spaceType: "Garden" },
    plants: {
      indoor: pickPlants("pothos", "snakePlant", "aloe"),
      balcony: pickPlants("hibiscus", "bougainvillea", "basil"),
      garden: pickPlants("datePalm", "lemon", "rosemary"),
      rooftop: pickPlants("eggplant", "pepperBell", "marigold"),
    },
  }),
  city({
    name: "Nazareth",
    nameAr: "الناصرة",
    zoneId: "northern-galilee",
    lat: 32.6996,
    lng: 35.3035,
    elevationM: 347,
    annualRainMm: 528,
    tempJanAvgC: 12,
    tempJulAvgC: 26,
    sunHoursSummer: 10,
    humidityNote: "Spring dew; pleasant summer evenings",
    frostRisk: "Low; odd radiative frost on cold nights",
    climateSummary:
      "Lower Galilee bowl: more rain than the coast south of Haifa in many years, milder winters than Safed. Good for mixed orchards and intensive balcony herbs.",
    growingNote:
      "Indoor growers battle less extreme dryness than Jerusalem. Try mint and parsley near bright kitchens; garden stone fruit needs pruning for airflow in humid springs.",
    dataSourceNote: CLIMATE_DATA_SOURCE_NOTE,
    shopHints: { sunExposure: "Medium", waterLevel: "Medium", spaceType: "Garden" },
    plants: {
      indoor: pickPlants("fern", "pothos", "monstera"),
      balcony: pickPlants("mint", "basil", "geranium"),
      garden: pickPlants("stoneFruit", "olive", "grapeVine"),
      rooftop: pickPlants("tomatoCherry", "parsley", "pepperBell"),
    },
  }),
  city({
    name: "Safed",
    nameAr: "صفد",
    zoneId: "northern-galilee",
    lat: 32.9646,
    lng: 35.496,
    elevationM: 850,
    annualRainMm: 682,
    tempJanAvgC: 10,
    tempJulAvgC: 24,
    sunHoursSummer: 10,
    humidityNote: "Cooler, cloudier winters; pleasant summer",
    frostRisk: "Light to moderate frost",
    climateSummary:
      "Upper Galilee altitude brings Israel’s wetter, cooler city climate among the picks here—great for berries, apples in nearby plots, and shade-loving understory on patios.",
    growingNote:
      "Short growing season for heat melons unless under plastic. Indoors: ferns and pothos love the humidity. Rooftops: wind-exposed—use sturdy containers.",
    dataSourceNote: CLIMATE_DATA_SOURCE_NOTE,
    shopHints: { sunExposure: "Medium", waterLevel: "Medium", spaceType: "Garden" },
    plants: {
      indoor: pickPlants("fern", "cyclamen", "pothos"),
      balcony: pickPlants("mint", "lavender", "geranium"),
      garden: pickPlants("stoneFruit", "grapeVine", "olive"),
      rooftop: pickPlants("tomatoCherry", "parsley", "marigold"),
    },
  }),
  city({
    name: "Beersheba",
    nameAr: "بئر السبع",
    zoneId: "negev-desert",
    lat: 31.2518,
    lng: 34.7913,
    elevationM: 279,
    annualRainMm: 204,
    tempJanAvgC: 11,
    tempJulAvgC: 28,
    sunHoursSummer: 12,
    humidityNote: "Very dry; large day–night swings",
    frostRisk: "Rare light frost",
    climateSummary:
      "Semi-arid northern Negev: winter is the green window; summer is long, sunny, and harsh. Wind and caliche soil challenge new plantings without soil improvement.",
    growingNote:
      "Prioritize drought-tolerant trees (acacia class), succulents indoors, and mulched vegetable beds with shade cloth. Rooftop pots need daily water checks in heat waves.",
    dataSourceNote: CLIMATE_DATA_SOURCE_NOTE,
    shopHints: { sunExposure: "High", waterLevel: "Low", spaceType: "Garden" },
    plants: {
      indoor: pickPlants("succulentMix", "snakePlant", "aloe"),
      balcony: pickPlants("lavender", "rosemary", "bougainvillea"),
      garden: pickPlants("acacia", "olive", "marigold"),
      rooftop: pickPlants("pepperBell", "eggplant", "basil"),
    },
  }),
]

const handpickedNames = new Set(HANDPICKED_CITY_PROFILES.map((c) => c.name))

export const CITY_CLIMATE_PROFILES: CityClimateProfile[] = [
  ...HANDPICKED_CITY_PROFILES,
  ...buildSynthesizedCityProfiles(PALESTINE_CITY_SEEDS, handpickedNames),
].sort((a, b) => a.name.localeCompare(b.name))

/** English / Arabic aliases → canonical profile name */
export const CITY_NAME_ALIASES: Record<string, string> = {
  "gaza city": "Gaza",
  غزة: "Gaza",
  "east jerusalem": "Jerusalem",
  "بيت لحم": "Bethlehem",
}

const BY_NAME: Record<string, CityClimateProfile> = Object.fromEntries(
  CITY_CLIMATE_PROFILES.map((c) => [c.name, c])
)

export function getCityClimate(name: string): CityClimateProfile | undefined {
  const t = name.trim()
  if (BY_NAME[t]) return BY_NAME[t]
  const alias = CITY_NAME_ALIASES[t] ?? CITY_NAME_ALIASES[t.toLowerCase()]
  if (alias) return BY_NAME[alias]
  const byAr = CITY_CLIMATE_PROFILES.find((c) => c.nameAr === t)
  if (byAr) return byAr
  return undefined
}

export function findCityBySearch(query: string): CityClimateProfile | null {
  const raw = query.trim()
  const q = raw.toLowerCase()
  if (q.length < 2) return null
  const viaAlias = CITY_NAME_ALIASES[raw] ?? CITY_NAME_ALIASES[q]
  if (viaAlias) {
    const hit = BY_NAME[viaAlias]
    if (hit) return hit
  }
  const exact = CITY_CLIMATE_PROFILES.find((c) => c.name.toLowerCase() === q)
  if (exact) return exact
  return (
    CITY_CLIMATE_PROFILES.find(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.nameAr.includes(raw) ||
        (q.length >= 3 && c.name.toLowerCase().startsWith(q))
    ) ?? null
  )
}

export const ZONE_CITY_MARKERS: { name: string; lat: number; lng: number; zoneId: string }[] =
  CITY_CLIMATE_PROFILES.map((c) => ({
    name: c.name,
    lat: c.lat,
    lng: c.lng,
    zoneId: c.zoneId,
  }))

export function citiesInZone(zoneId: string): CityClimateProfile[] {
  return CITY_CLIMATE_PROFILES.filter((c) => c.zoneId === zoneId)
}

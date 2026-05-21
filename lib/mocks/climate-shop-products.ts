import { DEMO_PRODUCTS } from "@/lib/demo-catalog"

export type RecommendedPlant = {
  name: string
  category: string
  priceIls: number
  image: string
  slug: string
}

/** Maps legacy climate preset keys → real shop catalog slugs (22 products only). */
export const CLIMATE_PLANT_SLUGS = {
  rosemary: "rosemary-herb-pot",
  basil: "basil-starter-kit",
  tomatoCherry: "tomato-cherry",
  mint: "mint-collection",
  marigold: "african-marigold",
  bougainvillea: "bougainvillea",
  agave: "agave-desert",
  monstera: "monstera-deliciosa",
  snakePlant: "zz-plant",
  pothos: "pothos-golden",
  aloe: "agave-desert",
  geranium: "geranium-classic",
  jade: "jade-plant",
  spider: "spider-plant",
  zz: "zz-plant",
  oleander: "oleander",
  petunia: "petunia-garden",
  sunflower: "sunflower-bright",
  fiddle: "fiddle-leaf-fig",
  dracaena: "dracaena-twister",
  rubber: "rubber-plant",
  luckyBamboo: "lucky-bamboo",
  tools: "gardening-essentials-combo",
  shear: "hedge-shear-pro",
  // Shop substitutes for plants that are not in the catalog
  lemon: "oleander",
  jasmine: "geranium-classic",
  olive: "rubber-plant",
  fig: "fiddle-leaf-fig",
  datePalm: "agave-desert",
  hibiscus: "petunia-garden",
  stoneFruit: "fiddle-leaf-fig",
  fern: "spider-plant",
  succulentMix: "jade-plant",
  acacia: "oleander",
  pepperBell: "tomato-cherry",
  eggplant: "dracaena-twister",
  parsley: "mint-collection",
  cyclamen: "geranium-classic",
  grapeVine: "bougainvillea",
  pomegranate: "oleander",
  thyme: "rosemary-herb-pot",
  cucumber: "mint-collection",
  zucchini: "tomato-cherry",
  chives: "mint-collection",
  peaceLily: "spider-plant",
  lavender: "african-marigold",
} as const

export type ClimatePlantKey = keyof typeof CLIMATE_PLANT_SLUGS

export function pickShopPlants(...keys: ClimatePlantKey[]): RecommendedPlant[] {
  const seen = new Set<string>()
  const result: RecommendedPlant[] = []

  for (const key of keys) {
    const slug = CLIMATE_PLANT_SLUGS[key]
    if (!slug || seen.has(slug)) continue
    seen.add(slug)

    const product = DEMO_PRODUCTS.find((p) => p.slug === slug)
    if (!product) continue

    result.push({
      name: product.name,
      category: product.category,
      priceIls: product.price,
      image: product.image,
      slug: product.slug,
    })
  }

  return result
}

/** Shared plant cards for climate UI. Prefer local curated assets, then stable remote fallbacks. */

import { publicAssetUrl } from "@/lib/asset-path"

export type RecommendedPlant = {
  name: string
  category: string
  priceIls: number
  image: string
}

const localAsset = (path: string) => publicAssetUrl(path)

const remoteAsset = (url: string) => url

/** Curated library: each image matches the plant name theme. */
export const PLANT_PRESETS = {
  lemon: {
    name: "Dwarf lemon (Citrus)",
    category: "Outdoor / balcony citrus",
    priceIls: 220,
    image:
      remoteAsset(
        "https://images.unsplash.com/photo-1744028837324-469cbadb11be?fm=jpg&q=60&w=1600&auto=format&fit=crop"
      ),
  },
  jasmine: {
    name: "Arabian jasmine (Jasminum sambac)",
    category: "Balcony / trellis",
    priceIls: 95,
    image:
      remoteAsset(
        "https://images.unsplash.com/photo-1768113802480-d98319a295d0?fm=jpg&q=60&w=1600&auto=format&fit=crop"
      ),
  },
  bougainvillea: {
    name: "Bougainvillea",
    category: "Outdoor sun wall",
    priceIls: 120,
    image: localAsset("/Web/Bougainvillea1.png"),
  },
  olive: {
    name: "Olive tree (Olea europaea)",
    category: "Garden tree",
    priceIls: 280,
    image: localAsset("/images/plant-3.jpg"),
  },
  fig: {
    name: "Common fig (Ficus carica)",
    category: "Garden / sunny yard",
    priceIls: 190,
    image:
      remoteAsset(
        "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?auto=format&fit=crop&w=1600&q=80"
      ),
  },
  rosemary: {
    name: "Rosemary",
    category: "Herbs — outdoor",
    priceIls: 45,
    image: localAsset("/Web/Rosemary1.jpg"),
  },
  datePalm: {
    name: "Date palm (Phoenix dactylifera)",
    category: "Garden — hot climate",
    priceIls: 350,
    image:
      remoteAsset(
        "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=1600&q=80"
      ),
  },
  basil: {
    name: "Sweet basil",
    category: "Herbs — kitchen / sun",
    priceIls: 35,
    image: localAsset("/images/plant-2.jpg"),
  },
  hibiscus: {
    name: "Chinese hibiscus",
    category: "Outdoor tropical look",
    priceIls: 85,
    image: localAsset("/Web/Petunia1.jpg"),
  },
  stoneFruit: {
    name: "Stone fruit sapling (plum / peach)",
    category: "Garden tree",
    priceIls: 210,
    image:
      remoteAsset(
        "https://images.unsplash.com/photo-1528821128474-27f963b062bf?auto=format&fit=crop&w=1600&q=80"
      ),
  },
  fern: {
    name: "Boston fern",
    category: "Indoor humidity lover",
    priceIls: 65,
    image: localAsset("/images/indoor-plants.jpg"),
  },
  mint: {
    name: "Spearmint",
    category: "Herbs — part shade OK",
    priceIls: 30,
    image: localAsset("/images/MintCollection.png"),
  },
  succulentMix: {
    name: "Succulent mix (Echeveria / sedum)",
    category: "Indoor bright window",
    priceIls: 110,
    image: localAsset("/images/plant-4.jpg"),
  },
  acacia: {
    name: "Acacia / desert shade tree",
    category: "Garden — dry heat",
    priceIls: 165,
    image:
      remoteAsset(
        "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1600&q=80"
      ),
  },
  lavender: {
    name: "Lavender",
    category: "Balcony / full sun",
    priceIls: 48,
    image: localAsset("/images/plant-5.jpg"),
  },
  monstera: {
    name: "Monstera deliciosa",
    category: "Indoor — bright indirect",
    priceIls: 135,
    image: localAsset("/images/plant-1.jpg"),
  },
  snakePlant: {
    name: "Snake plant (Sansevieria)",
    category: "Indoor — low water",
    priceIls: 75,
    image: localAsset("/images/plant-6.jpg"),
  },
  pothos: {
    name: "Golden pothos",
    category: "Indoor / office",
    priceIls: 55,
    image: localAsset("/Web/Pothos1.jpg"),
  },
  tomatoCherry: {
    name: "Cherry tomato (container)",
    category: "Balcony / rooftop veg",
    priceIls: 42,
    image: localAsset("/images/TomatoPlants_Cherry.png"),
  },
  pepperBell: {
    name: "Bell pepper (container)",
    category: "Balcony — summer crop",
    priceIls: 38,
    image:
      remoteAsset(
        "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=1600&q=80"
      ),
  },
  geranium: {
    name: "Pelargonium (geranium)",
    category: "Balcony sun",
    priceIls: 52,
    image: localAsset("/Web/Geranium1.png"),
  },
  grapeVine: {
    name: "Table grape vine",
    category: "Garden pergola",
    priceIls: 175,
    image:
      remoteAsset(
        "https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?auto=format&fit=crop&w=1600&q=80"
      ),
  },
  aloe: {
    name: "Aloe vera",
    category: "Indoor / sunny sill",
    priceIls: 40,
    image: localAsset("/Web/Aloe Vera1.jpeg"),
  },
  parsley: {
    name: "Flat-leaf parsley",
    category: "Herbs — part sun",
    priceIls: 28,
    image: localAsset("/images/hero-garden.jpg"),
  },
  cyclamen: {
    name: "Cyclamen (winter bloomer)",
    category: "Indoor cool season",
    priceIls: 62,
    image: localAsset("/Web/Petunia2.jpg"),
  },
  eggplant: {
    name: "Eggplant (container)",
    category: "Rooftop / hot summer",
    priceIls: 36,
    image:
      remoteAsset(
        "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=1600&q=80"
      ),
  },
  marigold: {
    name: "French marigold",
    category: "Garden / pest companion",
    priceIls: 22,
    image: localAsset("/Web/African Marigold - Any Color1.jpg"),
  },
  pomegranate: {
    name: "Pomegranate shrub (Punica granatum)",
    category: "Garden / sunny wall",
    priceIls: 195,
    image:
      remoteAsset(
        "https://images.unsplash.com/photo-1631641482600-b3448b29d17a?fm=jpg&q=60&w=1600&auto=format&fit=crop"
      ),
  },
  thyme: {
    name: "Common thyme",
    category: "Herbs — sun & drainage",
    priceIls: 32,
    image: localAsset("/images/hero-garden.jpg"),
  },
  zucchini: {
    name: "Zucchini (container)",
    category: "Rooftop / summer veg",
    priceIls: 34,
    image: localAsset("/images/TomatoPlants_Cherry.png"),
  },
  cucumber: {
    name: "Cucumber (trellis pot)",
    category: "Balcony climber",
    priceIls: 31,
    image: localAsset("/images/TomatoPlants_Cherry.png"),
  },
  peaceLily: {
    name: "Peace lily (Spathiphyllum)",
    category: "Indoor — shade tolerant",
    priceIls: 88,
    image: localAsset("/Web/Peace Lily1.jpg"),
  },
  chives: {
    name: "Chives",
    category: "Herbs — pot / windowsill",
    priceIls: 26,
    image: localAsset("/images/hero-garden.jpg"),
  },
} satisfies Record<string, RecommendedPlant>

export function pickPlants(...keys: (keyof typeof PLANT_PRESETS)[]): RecommendedPlant[] {
  return keys.map((k) => PLANT_PRESETS[k])
}

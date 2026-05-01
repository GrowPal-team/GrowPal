/** Shared plant cards for climate UI — images via Unsplash (license: Unsplash). */

export type RecommendedPlant = {
  name: string
  category: string
  priceIls: number
  image: string
}

const u = (path: string) =>
  `https://images.unsplash.com/${path}?auto=format&fit=crop&w=600&q=80`

/** Curated library: each image matches the plant name theme. */
export const PLANT_PRESETS = {
  lemon: {
    name: "Dwarf lemon (Citrus)",
    category: "Outdoor / balcony citrus",
    priceIls: 220,
    image: u("photo-1568569350062-ea9913a51789"),
  },
  jasmine: {
    name: "Arabian jasmine (Jasminum sambac)",
    category: "Balcony / trellis",
    priceIls: 95,
    image: u("photo-1597848212624-e593e39a0b7d"),
  },
  bougainvillea: {
    name: "Bougainvillea",
    category: "Outdoor sun wall",
    priceIls: 120,
    image: u("photo-1596725985750-8c7b6d58c88d"),
  },
  olive: {
    name: "Olive tree (Olea europaea)",
    category: "Garden tree",
    priceIls: 280,
    image: u("photo-1599599810769-bcde5a160d32"),
  },
  fig: {
    name: "Common fig (Ficus carica)",
    category: "Garden / sunny yard",
    priceIls: 190,
    image: u("photo-1622206151226-18ca2c9ab4a1"),
  },
  rosemary: {
    name: "Rosemary",
    category: "Herbs — outdoor",
    priceIls: 45,
    image: u("photo-1515586000433-45406a8a874f"),
  },
  datePalm: {
    name: "Date palm (Phoenix dactylifera)",
    category: "Garden — hot climate",
    priceIls: 350,
    image: u("photo-1548550023-2bdb3c5beed7"),
  },
  basil: {
    name: "Sweet basil",
    category: "Herbs — kitchen / sun",
    priceIls: 35,
    image: u("photo-1618377382346-06f61c4ed930"),
  },
  hibiscus: {
    name: "Chinese hibiscus",
    category: "Outdoor tropical look",
    priceIls: 85,
    image: u("photo-1593691509543-c55fb32e5cee"),
  },
  stoneFruit: {
    name: "Stone fruit sapling (plum / peach)",
    category: "Garden tree",
    priceIls: 210,
    image: u("photo-1528821128474-27f963b062bf"),
  },
  fern: {
    name: "Boston fern",
    category: "Indoor humidity lover",
    priceIls: 65,
    image: u("photo-1596325502650-36c7a777e1a7"),
  },
  mint: {
    name: "Spearmint",
    category: "Herbs — part shade OK",
    priceIls: 30,
    image: u("photo-1615474040672-112d40b0ff9e"),
  },
  succulentMix: {
    name: "Succulent mix (Echeveria / sedum)",
    category: "Indoor bright window",
    priceIls: 110,
    image: u("photo-1459411552884-841db9b3cc2a"),
  },
  acacia: {
    name: "Acacia / desert shade tree",
    category: "Garden — dry heat",
    priceIls: 165,
    image: u("photo-1502082553048-f009c37129b9"),
  },
  lavender: {
    name: "Lavender",
    category: "Balcony / full sun",
    priceIls: 48,
    image: u("photo-1466692476868-aef1dfb1e735"),
  },
  monstera: {
    name: "Monstera deliciosa",
    category: "Indoor — bright indirect",
    priceIls: 135,
    image: u("photo-1545241047-60850a0dee5a"),
  },
  snakePlant: {
    name: "Snake plant (Sansevieria)",
    category: "Indoor — low water",
    priceIls: 75,
    image: u("photo-1593482892290-4330d260c54e"),
  },
  pothos: {
    name: "Golden pothos",
    category: "Indoor / office",
    priceIls: 55,
    image: u("photo-1614594975525-451453c2fe3c"),
  },
  tomatoCherry: {
    name: "Cherry tomato (container)",
    category: "Balcony / rooftop veg",
    priceIls: 42,
    image: u("photo-1592841200221-5369f7222076"),
  },
  pepperBell: {
    name: "Bell pepper (container)",
    category: "Balcony — summer crop",
    priceIls: 38,
    image: u("photo-1563565375-f3fdfdbefa83"),
  },
  geranium: {
    name: "Pelargonium (geranium)",
    category: "Balcony sun",
    priceIls: 52,
    image: u("photo-1599687266540-d01efe7f8ee5"),
  },
  grapeVine: {
    name: "Table grape vine",
    category: "Garden pergola",
    priceIls: 175,
    image: u("photo-1595433707802-6b2626b1b49d"),
  },
  aloe: {
    name: "Aloe vera",
    category: "Indoor / sunny sill",
    priceIls: 40,
    image: u("photo-1509423350716-97f9360b3e98"),
  },
  parsley: {
    name: "Flat-leaf parsley",
    category: "Herbs — part sun",
    priceIls: 28,
    image: u("photo-1591955506264-3f5a683cc15a"),
  },
  cyclamen: {
    name: "Cyclamen (winter bloomer)",
    category: "Indoor cool season",
    priceIls: 62,
    image: u("photo-1459156212013-c038eeb9d6c0"),
  },
  eggplant: {
    name: "Eggplant (container)",
    category: "Rooftop / hot summer",
    priceIls: 36,
    image: u("photo-1593179886159-fb6c6b9910c2"),
  },
  marigold: {
    name: "French marigold",
    category: "Garden / pest companion",
    priceIls: 22,
    image: u("photo-1490750967868-88aa4486c946"),
  },
  pomegranate: {
    name: "Pomegranate shrub (Punica granatum)",
    category: "Garden / sunny wall",
    priceIls: 195,
    image: u("photo-1551262128-a0d67cfb099f"),
  },
  thyme: {
    name: "Common thyme",
    category: "Herbs — sun & drainage",
    priceIls: 32,
    image: u("photo-1591955506264-3f5a683cc15a"),
  },
  zucchini: {
    name: "Zucchini (container)",
    category: "Rooftop / summer veg",
    priceIls: 34,
    image: u("photo-1593179886159-fb6c6b9910c2"),
  },
  cucumber: {
    name: "Cucumber (trellis pot)",
    category: "Balcony climber",
    priceIls: 31,
    image: u("photo-1592841200221-5369f7222076"),
  },
  peaceLily: {
    name: "Peace lily (Spathiphyllum)",
    category: "Indoor — shade tolerant",
    priceIls: 88,
    image: u("photo-1596547037025-a81da3a50ae2"),
  },
  chives: {
    name: "Chives",
    category: "Herbs — pot / windowsill",
    priceIls: 26,
    image: u("photo-1618377382346-06f61c4ed930"),
  },
} satisfies Record<string, RecommendedPlant>

export function pickPlants(...keys: (keyof typeof PLANT_PRESETS)[]): RecommendedPlant[] {
  return keys.map((k) => PLANT_PRESETS[k])
}

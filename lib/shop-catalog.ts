import { decodeAssetPath } from "@/lib/asset-path"
import shopSeeds from "@/data/shop-product-seeds.json"

type CatalogEnhancement = {
  primaryImage: string
  secondaryImage: string
  shortDescription: string
  careHighlights: string[]
  idealFor: string
}

/** Canonical local path (decoded). Encoding happens once in resolvePublicUrl. */
function localAsset(path: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`
  return decodeAssetPath(normalized)
}

export const SHOP_CATALOG_SLUGS = new Set(shopSeeds.map((s) => s.slug))

const SEED_IMAGE_BY_SLUG = Object.fromEntries(
  shopSeeds.map((s) => [s.slug, localAsset(s.imageUrl)]),
) as Record<string, string>

function isLocalProductImage(src: string | null | undefined) {
  if (!src) return false
  const normalized = src.trim()
  if (!normalized || normalized.includes("placeholder")) return false
  return normalized.startsWith("/images/") || normalized.startsWith("/Web/")
}

const REMOTE_WEB_IMAGE_ROTATION = [
  "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1470058869950-acaba78e25fc?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1566875538164-c9f7a89cc1b5?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1483794344563-d27a8d98014f?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1200&q=80",
]

function hashText(value: string) {
  return [...value].reduce((sum, char) => sum + char.charCodeAt(0), 0)
}

function webImage(filename: string) {
  return localAsset(`/Web/${filename}`)
}

const GENERIC_IMAGES = {
  herbsPrimary:
    "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=1200&q=80",
  herbsSecondary:
    "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80",
  indoorPrimary:
    "https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?auto=format&fit=crop&w=1200&q=80",
  indoorSecondary:
    "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1200&q=80",
  treePrimary:
    "https://images.unsplash.com/photo-1470058869950-acaba78e25fc?auto=format&fit=crop&w=1200&q=80",
  treeSecondary:
    "https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?auto=format&fit=crop&w=1200&q=80",
  succulentPrimary:
    "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?auto=format&fit=crop&w=1200&q=80",
  succulentSecondary:
    "https://images.unsplash.com/photo-1483794344563-d27a8d98014f?auto=format&fit=crop&w=1200&q=80",
  bloomPrimary:
    "https://images.unsplash.com/photo-1566875538164-c9f7a89cc1b5?auto=format&fit=crop&w=1200&q=80",
  bloomSecondary:
    "https://images.unsplash.com/photo-1498998758485-cf0d9103a272?auto=format&fit=crop&w=1200&q=80",
  toolsPrimary: localAsset("/images/garden-supplies.jpg"),
  toolsSecondary: webImage("Gardening Essentials Combo- Gardening Gloves, Garden Tool Kit & Watering Can2.jpg"),
}

const PRODUCT_ENHANCEMENTS: Record<string, CatalogEnhancement> = {
  "basil-starter-kit": {
    primaryImage: localAsset("/images/BasilStarterKit.jpg"),
    secondaryImage:
      "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=1200&q=80",
    shortDescription:
      "A compact basil kit for kitchens, sunny windows, and beginner herb growers who want fast, fragrant harvests.",
    careHighlights: ["Needs 6+ hours of sun", "Keep soil lightly moist", "Pinch tips often for bushier growth"],
    idealFor: "Sunny kitchens and compact herb corners",
  },
  "tomato-cherry": {
    primaryImage: localAsset("/images/TomatoPlants_Cherry.png"),
    secondaryImage: localAsset("/images/plant-2.jpg"),
    shortDescription:
      "Productive cherry tomatoes for balconies and containers, with sweet fruit and a reliable summer harvest.",
    careHighlights: ["Loves full sun", "Water consistently", "Add support or stakes early"],
    idealFor: "Balconies, containers, and edible home gardens",
  },
  "mint-collection": {
    primaryImage: localAsset("/images/MintCollection.png"),
    secondaryImage: localAsset("/images/MintCollection.png"),
    shortDescription:
      "A refreshing mix of mint varieties that grows quickly, smells amazing, and brings flavor to tea and cooking.",
    careHighlights: ["Prefers moist soil", "Give partial to bright light", "Trim regularly to keep it full"],
    idealFor: "Tea lovers and small edible planters",
  },
  "peace-lily": {
    primaryImage: webImage("Peace Lily1.jpg"),
    secondaryImage: webImage("Peace Lily2.jpg"),
    shortDescription:
      "An elegant indoor favorite with glossy leaves and white blooms, ideal for softening shaded interiors.",
    careHighlights: ["Bright indirect or partial shade", "Water when top layer starts drying", "Enjoys moderate humidity"],
    idealFor: "Calm indoor spaces and low-light rooms",
  },
  "lavender-bush": {
    primaryImage: webImage("Lavender1.jpg"),
    secondaryImage: webImage("Lavender2.jpg"),
    shortDescription:
      "A fragrant Mediterranean classic that adds color, pollinator value, and a dry-summer look to balconies and patios.",
    careHighlights: ["Full sun is best", "Use dry, gritty soil", "Do not overwater"],
    idealFor: "Sunny balconies and fragrant outdoor displays",
  },
  "snake-plant": {
    primaryImage: webImage("Snake Plant1.jpg"),
    secondaryImage: webImage("Snake Plant2.jpg"),
    shortDescription:
      "A sculptural, low-maintenance houseplant that tolerates neglect and keeps modern interiors looking sharp.",
    careHighlights: ["Handles lower light well", "Water only when mostly dry", "Very forgiving for beginners"],
    idealFor: "Busy homes, offices, and first-time plant parents",
  },
  "jasmine-climbing": {
    primaryImage:
      "https://images.unsplash.com/photo-1768113802480-d98319a295d0?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    secondaryImage:
      "https://images.unsplash.com/photo-1761809708747-32939af7549e?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    shortDescription:
      "A climbing jasmine with fragrant flowers and vertical charm, great for trellises, rails, and soft privacy.",
    careHighlights: ["Needs good sun", "Keep evenly watered in growth season", "Guide stems onto support"],
    idealFor: "Balconies, trellises, and vertical floral accents",
  },
  "lemon-tree-dwarf": {
    primaryImage:
      "https://images.unsplash.com/photo-1744028837324-469cbadb11be?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    secondaryImage:
      "https://images.unsplash.com/photo-1767498693631-80c5f024a872?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    shortDescription:
      "A compact citrus tree that brings ornamental leaves, scented blossom, and edible fruit to container growing.",
    careHighlights: ["Give full sun", "Feed during active growth", "Protect from cold snaps"],
    idealFor: "Sunny terraces and edible patio collections",
  },
  "olive-tree-potted": {
    primaryImage:
      "https://images.unsplash.com/photo-1757681745764-135e27f90ea5?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    secondaryImage:
      "https://images.unsplash.com/photo-1762542531473-ec9f86e0d86e?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    shortDescription:
      "A timeless potted olive tree with Mediterranean character, silver foliage, and excellent drought tolerance.",
    careHighlights: ["Thrives in full sun", "Let soil dry slightly between watering", "Excellent for hot exposures"],
    idealFor: "Rooftops, terraces, and Mediterranean-style spaces",
  },
  "pomegranate-tree": {
    primaryImage:
      "https://images.unsplash.com/photo-1631641482600-b3448b29d17a?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    secondaryImage:
      "https://images.unsplash.com/photo-1761135174741-5507a710bb49?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    shortDescription:
      "A fruiting tree with bold seasonal color and heat tolerance, suited to sunny outdoor growing in large pots.",
    careHighlights: ["Needs strong sun", "Water deeply but not constantly", "Performs well in heat"],
    idealFor: "Rooftops and warm fruit-growing spaces",
  },
  "succulent-garden-set": {
    primaryImage:
      "https://images.unsplash.com/photo-1761370366123-1e253e38e10c?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    secondaryImage:
      "https://images.unsplash.com/photo-1760627588118-8a30ffdeac1f?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    shortDescription:
      "A stylish group of low-water succulents designed for bright spaces that need clean lines and easy care.",
    careHighlights: ["Use bright light", "Choose fast-draining soil", "Water sparingly"],
    idealFor: "Bright shelves, desks, and modern indoor styling",
  },
  "aloe-vera": {
    primaryImage: webImage("Aloe Vera1.jpeg"),
    secondaryImage: webImage("Aloe Vera2.jpg"),
    shortDescription:
      "A practical aloe plant with medicinal appeal, architectural leaves, and easy-going care for sunny interiors.",
    careHighlights: ["Bright light or partial sun", "Let soil dry between watering", "Avoid soggy roots"],
    idealFor: "Sunny windowsills and practical home plant collections",
  },
  "cactus-collection": {
    primaryImage:
      "https://images.unsplash.com/photo-1487190296540-b92a6b829973?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    secondaryImage:
      "https://images.unsplash.com/photo-1758903823393-590ccfb3bcc4?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    shortDescription:
      "A compact cactus mix for bold texture and very low water use, ideal for bright rooms and minimal styling.",
    careHighlights: ["Strong sun is ideal", "Use gritty cactus mix", "Water rarely"],
    idealFor: "Sunny windows and low-maintenance decor",
  },
  "rosemary-herb-pot": {
    primaryImage: webImage("Rosemary1.jpg"),
    secondaryImage: webImage("Rosemary2.jpg"),
    shortDescription:
      "A fragrant rosemary pot that brings culinary use, Mediterranean structure, and evergreen texture to sunny corners.",
    careHighlights: ["Needs strong sun", "Use fast-draining soil", "Let the top layer dry slightly"],
    idealFor: "Sunny kitchen windows and herb balconies",
  },
  "african-marigold": {
    primaryImage: webImage("African Marigold - Any Color1.jpg"),
    secondaryImage: webImage("African Marigold - Any Color2.jpg"),
    shortDescription:
      "A bold marigold bloom with cheerful color, compact growth, and reliable performance through warm sunny months.",
    careHighlights: ["Thrives in full sun", "Deadhead to extend blooming", "Keep watering balanced"],
    idealFor: "Balconies, borders, and sunny seasonal displays",
  },
  "agave-desert": {
    primaryImage: webImage("Agave1.jpg"),
    secondaryImage: webImage("Agave2.jpg"),
    shortDescription:
      "A sculptural agave with dramatic rosettes and strong desert character, perfect for low-water contemporary styling.",
    careHighlights: ["Give it bright direct light", "Water sparingly", "Use very sharp drainage"],
    idealFor: "Sunny patios and drought-tolerant collections",
  },
  bougainvillea: {
    primaryImage: webImage("Bougainvillea1.png"),
    secondaryImage: webImage("Bougainvillea2.png"),
    shortDescription:
      "A vibrant bougainvillea that adds climbing color, balcony energy, and a warm Mediterranean mood to outdoor spaces.",
    careHighlights: ["Needs full sun", "Blooms best with regular pruning", "Avoid overwatering"],
    idealFor: "Balconies, pergolas, and statement outdoor color",
  },
  "dracaena-twister": {
    primaryImage: webImage("Dracaena fragrans Twister - Head1.jpg"),
    secondaryImage: webImage("Dracaena fragrans Twister - Head2.jpg"),
    shortDescription:
      "A twisted dracaena variety with elegant striped foliage that brings height and movement to indoor rooms and offices.",
    careHighlights: ["Prefers bright indirect light", "Allow soil to dry slightly", "Easy office-friendly care"],
    idealFor: "Modern interiors and calm workspaces",
  },
  "fiddle-leaf-fig": {
    primaryImage: webImage("Fiddle Leaf Fig1.jpg"),
    secondaryImage: webImage("Fiddle Leaf Fig2.jpg"),
    shortDescription:
      "A statement fiddle leaf fig with oversized leaves that instantly elevates bright interiors with lush architectural form.",
    careHighlights: ["Bright filtered light", "Rotate for even growth", "Avoid sudden environment changes"],
    idealFor: "Bright living rooms and styled corners",
  },
  "geranium-classic": {
    primaryImage: webImage("Geranium1.png"),
    secondaryImage: webImage("Geranium2.png"),
    shortDescription:
      "A classic geranium chosen for long flowering, balcony-friendly vigor, and dependable color through sunny seasons.",
    careHighlights: ["Full sun gives best flowering", "Trim spent blooms", "Water when top soil dries"],
    idealFor: "Window boxes and sunny balcony rails",
  },
  "jade-plant": {
    primaryImage: webImage("jade plant1.jpg"),
    secondaryImage: webImage("jade plant2.jpg"),
    shortDescription:
      "A compact jade plant with glossy succulent leaves, easy care, and a neat silhouette for bright indoor styling.",
    careHighlights: ["Bright light is ideal", "Let soil dry well", "Very low-maintenance"],
    idealFor: "Desks, shelves, and beginner plant setups",
  },
  "lucky-bamboo": {
    primaryImage: webImage("lucky bamboo1.jpg"),
    secondaryImage: webImage("lucky bamboo2.jpg"),
    shortDescription:
      "A graceful lucky bamboo arrangement that feels clean, calm, and easy to place in compact homes and offices.",
    careHighlights: ["Prefers indirect light", "Keep roots evenly moist", "Great for low-effort styling"],
    idealFor: "Desktops, reception areas, and gift-ready decor",
  },
  "monstera-deliciosa": {
    primaryImage: webImage("Monstera Deliciosa1.jpg"),
    secondaryImage: webImage("Monstera Deliciosa2.jpg"),
    shortDescription:
      "A lush monstera with iconic split leaves that brings tropical volume and designer appeal to indoor plant displays.",
    careHighlights: ["Bright indirect light", "Water when upper soil dries", "Appreciates occasional support"],
    idealFor: "Living rooms and tropical-inspired interiors",
  },
  oleander: {
    primaryImage: webImage("Oleander1.jpg"),
    secondaryImage: webImage("Oleander2.jpg"),
    shortDescription:
      "A heat-loving oleander that produces showy flowers and strong structure for bright terraces and outdoor containers.",
    careHighlights: ["Needs strong sun", "Handles heat well", "Prune after blooming flushes"],
    idealFor: "Sunny patios and warm-climate terraces",
  },
  "petunia-garden": {
    primaryImage: webImage("Petunia1.jpg"),
    secondaryImage: webImage("Petunia2.jpg"),
    shortDescription:
      "A floriferous petunia selection made for bright planters, soft trailing edges, and generous seasonal color.",
    careHighlights: ["Full sun for heavy bloom", "Feed regularly in season", "Deadhead lightly as needed"],
    idealFor: "Balcony baskets and colorful planter mixes",
  },
  "pothos-golden": {
    primaryImage: webImage("Pothos1.jpg"),
    secondaryImage: webImage("Pothos2.jpg"),
    shortDescription:
      "A trailing golden pothos that is forgiving, adaptable, and ideal for shelves, hanging spots, and easy greenery.",
    careHighlights: ["Tolerates lower light", "Water moderately", "Trail or climb as it matures"],
    idealFor: "Shelves, hanging planters, and easy indoor green walls",
  },
  "rubber-plant": {
    primaryImage: webImage("Rubber Plant1.jpg"),
    secondaryImage: webImage("Rubber Plant2.jpg"),
    shortDescription:
      "A bold rubber plant with glossy foliage and upright growth that brings a polished look to bright indoor spaces.",
    careHighlights: ["Bright indirect light", "Wipe leaves for shine", "Water moderately and consistently"],
    idealFor: "Living areas and refined office corners",
  },
  "spider-plant": {
    primaryImage: webImage("Spider Plant1.jpg"),
    secondaryImage: webImage("Spider Plant2.jpg"),
    shortDescription:
      "A lively spider plant with arching striped leaves and easy-care habits, perfect for bright rooms and hanging pots.",
    careHighlights: ["Bright indirect light", "Enjoys regular but light watering", "Produces baby offsets easily"],
    idealFor: "Hanging baskets and beginner-friendly homes",
  },
  "sunflower-bright": {
    primaryImage: webImage("Sunflower1.png"),
    secondaryImage: webImage("Sunflower2.png"),
    shortDescription:
      "A cheerful sunflower pick that brings height, summer color, and upbeat energy to sunny outdoor planters.",
    careHighlights: ["Needs full sun all day", "Water deeply during active growth", "Support taller stems if needed"],
    idealFor: "Sunny gardens and bold summer containers",
  },
  "zz-plant": {
    primaryImage: webImage("ZZ Plant1.jpg"),
    secondaryImage: webImage("ZZ Plant2.jpg"),
    shortDescription:
      "A sleek ZZ plant with waxy leaves and exceptional resilience, ideal for low-fuss interiors and office styling.",
    careHighlights: ["Handles lower light well", "Water infrequently", "Very durable and forgiving"],
    idealFor: "Busy offices and low-maintenance indoor setups",
  },
  "gardening-essentials-combo": {
    primaryImage: webImage("Gardening Essentials Combo- Gardening Gloves, Garden Tool Kit & Watering Can1.jpg"),
    secondaryImage: webImage("Gardening Essentials Combo- Gardening Gloves, Garden Tool Kit & Watering Can2.jpg"),
    shortDescription:
      "An all-in-one garden starter set with the everyday basics needed for potting, watering, and small-space plant care.",
    careHighlights: ["Great for everyday upkeep", "Easy starter bundle", "Pairs well with balcony gardening"],
    idealFor: "New plant parents and gift-ready care kits",
  },
  "hedge-shear-pro": {
    primaryImage:
      webImage(
        "Hedge Shear with PVC Handle - 1 Pc _ Garden Hedge Shear Cutter for Lawn and Plants _ Ergonomic Gardening Shears for Shrubs and Hedges _ Lightweight Garden Trimming Scissors1.jpg",
      ),
    secondaryImage:
      webImage(
        "Hedge Shear with PVC Handle - 1 Pc _ Garden Hedge Shear Cutter for Lawn and Plants _ Ergonomic Gardening Shears for Shrubs and Hedges _ Lightweight Garden Trimming Scissors2.jpg",
      ),
    shortDescription:
      "A lightweight hedge shear built for shaping shrubs, trimming balcony greenery, and keeping outdoor plants neat.",
    careHighlights: ["Ergonomic grip", "Good for clean shaping cuts", "Useful for routine pruning"],
    idealFor: "Patios, balconies, and home plant maintenance",
  },
}

const CATEGORY_FALLBACKS: Record<string, CatalogEnhancement> = {
  "Herbs & Vegetables": {
    primaryImage: GENERIC_IMAGES.herbsPrimary,
    secondaryImage: GENERIC_IMAGES.herbsSecondary,
    shortDescription: "Edible, aromatic picks for sunny spaces and productive home growing.",
    careHighlights: ["Prefer bright sun", "Harvest regularly", "Keep nutrition steady in containers"],
    idealFor: "Edible gardens and balcony planters",
  },
  "Ornamental Plants": {
    primaryImage: GENERIC_IMAGES.indoorPrimary,
    secondaryImage: GENERIC_IMAGES.bloomPrimary,
    shortDescription: "Decorative plants selected for beauty, structure, and room-enhancing greenery.",
    careHighlights: ["Match light to the plant", "Avoid overwatering", "Refresh growth with light pruning"],
    idealFor: "Styled indoor and balcony displays",
  },
  "Fruit Trees": {
    primaryImage: GENERIC_IMAGES.treePrimary,
    secondaryImage: GENERIC_IMAGES.treeSecondary,
    shortDescription: "Compact fruiting trees for warm, bright outdoor spaces and larger containers.",
    careHighlights: ["Need strong sun", "Feed in growth season", "Use roomy pots with good drainage"],
    idealFor: "Sunny terraces and rooftops",
  },
  "Succulents & Cacti": {
    primaryImage: GENERIC_IMAGES.succulentPrimary,
    secondaryImage: GENERIC_IMAGES.succulentSecondary,
    shortDescription: "Water-wise plants with bold form and easy care for bright spaces.",
    careHighlights: ["Bright light", "Fast drainage", "Water less often than most houseplants"],
    idealFor: "Low-maintenance indoor styling",
  },
  "Plant Care Tools": {
    primaryImage: GENERIC_IMAGES.toolsPrimary,
    secondaryImage: GENERIC_IMAGES.toolsSecondary,
    shortDescription: "Reliable gardening tools and care kits for keeping home plants healthy, clean, and easy to manage.",
    careHighlights: ["Made for regular upkeep", "Great with balcony and patio setups", "Helpful for beginners and enthusiasts"],
    idealFor: "Plant care routines and practical gifting",
  },
}

function toSentenceCase(text: string) {
  if (!text) return text
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function getCatalogEnhancement(slug: string, category?: string | null): CatalogEnhancement {
  const direct = PRODUCT_ENHANCEMENTS[slug]
  if (direct) return direct
  if (category && CATEGORY_FALLBACKS[category]) return CATEGORY_FALLBACKS[category]
  return {
    primaryImage: GENERIC_IMAGES.indoorPrimary,
    secondaryImage: GENERIC_IMAGES.indoorSecondary,
    shortDescription: "A curated plant pick designed to make your space greener, calmer, and easier to style.",
    careHighlights: ["Match watering to light", "Use good drainage", "Rotate for balanced growth"],
    idealFor: "Flexible home and office styling",
  }
}

export function resolveShopPrimaryImage(slug: string, imageUrl?: string | null) {
  const seedImage = SEED_IMAGE_BY_SLUG[slug]
  if (seedImage) return seedImage
  if (isLocalProductImage(imageUrl) && imageUrl) return localAsset(imageUrl)
  return getCatalogEnhancement(slug).primaryImage
}

export function enrichProductCopy(args: {
  slug: string
  category?: string | null
  baseDescription?: string | null
  sunExposure?: string | null
  waterLevel?: string | null
  spaceType?: string | null
  imageUrl?: string | null
}) {
  const enhancement = getCatalogEnhancement(args.slug, args.category)
  const primaryImage = resolveShopPrimaryImage(args.slug, args.imageUrl)
  const parts = [
    args.baseDescription?.trim() || enhancement.shortDescription,
    `Best for ${enhancement.idealFor.toLowerCase()}.`,
    `Light: ${toSentenceCase(String(args.sunExposure || "balanced").replaceAll("_", " ").toLowerCase())}.`,
    `Water: ${toSentenceCase(String(args.waterLevel || "moderate").replaceAll("_", " ").toLowerCase())}.`,
  ]

  return {
    ...enhancement,
    primaryImage,
    fullDescription: parts.filter(Boolean).join(" "),
    displaySpaceType: toSentenceCase(String(args.spaceType || "").replaceAll("_", " ")),
  }
}

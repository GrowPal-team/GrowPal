/** Featured hero images keyed by product name/slug (local assets + Unsplash). */
export const FEATURED_IMAGE_RULES: {
  test: (name: string, slug: string) => boolean
  image: string
  tag: string
  shortBlurb: string
}[] = [
  {
    test: (n, s) => /basil/i.test(n) || /basil/i.test(s),
    image: "/images/BasilStarterKit.jpg",
    tag: "Popular",
    shortBlurb: "Everything you need to grow aromatic basil on a windowsill or balcony.",
  },
  {
    test: (n, s) => /tomato|cherry/i.test(n) || /tomato/i.test(s),
    image: "/images/TomatoPlants_Cherry.png",
    tag: "Best value",
    shortBlurb: "Sweet cherry tomatoes—perfect for salads and sunny spots.",
  },
  {
    test: (n, s) => /mint/i.test(n) || /mint/i.test(s),
    image: "/images/MintCollection.png",
    tag: "New",
    shortBlurb: "Fresh mint for tea and kitchen gardens; thrives with regular water.",
  },
  {
    test: (n, s) => /monstera|swiss cheese/i.test(n) || /monstera/i.test(s),
    image:
      "https://images.unsplash.com/photo-1614594975525-e45190c7762a?auto=format&fit=crop&w=900&q=80",
    tag: "Statement",
    shortBlurb: "Bold leaves and easy indoor style—give it bright indirect light.",
  },
  {
    test: (n, s) => /succulent|echeveria|jade/i.test(n) || /succulent/i.test(s),
    image:
      "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?auto=format&fit=crop&w=900&q=80",
    tag: "Low care",
    shortBlurb: "Compact rosettes; water sparingly and plenty of sun.",
  },
  {
    test: (n, s) => /fern/i.test(n) || /fern/i.test(s),
    image:
      "https://images.unsplash.com/photo-1593691509543-c55fb32e5cee?auto=format&fit=crop&w=900&q=80",
    tag: "Shade",
    shortBlurb: "Loves humidity and indirect light—perfect for bathrooms.",
  },
  {
    test: (n, s) => /snake|sansevieria/i.test(n) || /snake/i.test(s),
    image:
      "https://images.unsplash.com/photo-1598887142487-a347278a77e4?auto=format&fit=crop&w=900&q=80",
    tag: "Beginner",
    shortBlurb: "Tall sculptural leaves; forgiving if you forget a watering.",
  },
  {
    test: (n, s) => /orchid/i.test(n) || /orchid/i.test(s),
    image:
      "https://images.unsplash.com/photo-1566875538164-c9f7a89cc1b5?auto=format&fit=crop&w=900&q=80",
    tag: "Bloom",
    shortBlurb: "Long-lasting flowers with bright, indirect light and airy roots.",
  },
  {
    test: (n, s) => /lavender/i.test(n) || /lavender/i.test(s),
    image:
      "https://images.unsplash.com/photo-1498998758485-cf0d9103a272?auto=format&fit=crop&w=900&q=80",
    tag: "Mediterranean",
    shortBlurb: "Fragrant stems—full sun outside or your sunniest sill.",
  },
  {
    test: (n, s) => /rosemary/i.test(n) || /rosemary/i.test(s),
    image:
      "https://images.unsplash.com/photo-1607277546860-2a18e6c2b3c0?auto=format&fit=crop&w=900&q=80",
    tag: "Kitchen",
    shortBlurb: "Woody herb for cooking; keep on the dry side between waterings.",
  },
]

/** Extra Unsplash picks when no rule matches (rotate by product id). */
export const CURATED_UNSPLASH_ROTATION: string[] = [
  "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1470058869950-acaba78e25fc?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1519336056116-bc246c5a5028?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1483794344563-d27a8d98014f?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80",
]

export function matchFeaturedRule(name: string, slug: string) {
  return FEATURED_IMAGE_RULES.find((r) => r.test(name, slug))
}

function isWeakImage(src: string) {
  if (!src || src.includes("placeholder")) return true
  return false
}

/** Hero image for featured carousel: rules → DB image → Unsplash rotation. */
export function pickFeaturedHeroImage(id: number, name: string, slug: string, apiImage: string) {
  const rule = matchFeaturedRule(name, slug)
  if (rule) return { src: rule.image, tag: rule.tag, shortBlurb: rule.shortBlurb, fromRule: true }
  if (!isWeakImage(apiImage)) {
    return {
      src: apiImage,
      tag: "Curated",
      shortBlurb: "",
      fromRule: false,
    }
  }
  const src = CURATED_UNSPLASH_ROTATION[Math.abs(id) % CURATED_UNSPLASH_ROTATION.length]
  return {
    src,
    tag: "Fresh pick",
    shortBlurb: "A lovely plant to brighten your space—see the full page for care tips.",
    fromRule: false,
  }
}

export function galleryForSlug(slug: string, mainImage: string): string[] {
  const s = slug.toLowerCase()
  if (s.includes("basil")) return ["/images/BasilStarterKit.jpg", mainImage].filter(Boolean)
  if (s.includes("tomato")) return ["/images/TomatoPlants_Cherry.png", mainImage].filter(Boolean)
  if (s.includes("mint")) return ["/images/MintCollection.png", mainImage].filter(Boolean)
  return [mainImage].filter(Boolean)
}

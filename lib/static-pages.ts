import { filterDemoProducts, getDemoProductBySlug } from "@/lib/demo-catalog"
import { resolvePublicUrl } from "@/lib/asset-path"

/** True when the app is built for GitHub Pages (static export, no API routes). */
export const isStaticPagesDeploy =
  process.env.NEXT_PUBLIC_STATIC_PAGES === "1"

export async function fetchProductList(searchParams?: URLSearchParams) {
  if (!isStaticPagesDeploy) {
    const query = searchParams?.toString() ? `?${searchParams.toString()}` : ""
    const response = await fetch(`/api/products${query}`)
    if (!response.ok) throw new Error("Failed to fetch products")
    return response.json()
  }

  const products = filterDemoProducts({
    spaceType: searchParams?.get("spaceType"),
    sunExposure: searchParams?.get("sunExposure"),
    waterLevel: searchParams?.get("waterLevel"),
    budget: searchParams?.get("budget"),
  })

  return products.map((p) => ({
    ...p,
    image: resolvePublicUrl(p.image),
    secondaryImage: p.secondaryImage ? resolvePublicUrl(p.secondaryImage) : undefined,
  }))
}

export async function fetchProductDetail(slug: string) {
  if (!isStaticPagesDeploy) {
    const response = await fetch(`/api/products/${encodeURIComponent(slug)}`)
    if (!response.ok) throw new Error("not found")
    return response.json()
  }

  const product = getDemoProductBySlug(slug)
  if (!product) throw new Error("not found")
  return {
    ...product,
    image: resolvePublicUrl(product.image),
    secondaryImage: product.secondaryImage ? resolvePublicUrl(product.secondaryImage) : undefined,
    images: product.images.map((url) => resolvePublicUrl(url)),
    suggestions: product.suggestions.map((s) => ({
      ...s,
      image: resolvePublicUrl(s.image),
    })),
  }
}

export async function fetchProductReviews(_slug: string) {
  if (!isStaticPagesDeploy) {
    const response = await fetch(`/api/products/${encodeURIComponent(_slug)}/reviews`)
    if (!response.ok) return null
    return response.json()
  }

  return { reviews: [], averageRating: 0, count: 0 }
}

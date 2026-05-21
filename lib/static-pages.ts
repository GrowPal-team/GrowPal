import { filterDemoProducts, getDemoProductBySlug, type DemoDetailProduct, type DemoListProduct } from "@/lib/demo-catalog"
import { resolvePublicUrl } from "@/lib/asset-path"

function withResolvedImages<T extends { image: string; secondaryImage?: string }>(item: T): T {
  return {
    ...item,
    image: resolvePublicUrl(item.image),
    ...(item.secondaryImage ? { secondaryImage: resolvePublicUrl(item.secondaryImage) } : {}),
  }
}

function mapListProducts(products: DemoListProduct[]) {
  return products.map(withResolvedImages)
}

function mapDetailProduct(product: DemoDetailProduct): DemoDetailProduct {
  return {
    ...withResolvedImages(product),
    images: product.images.map((url) => resolvePublicUrl(url)),
    suggestions: product.suggestions.map((s) => ({
      ...s,
      image: resolvePublicUrl(s.image),
    })),
  }
}

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

  return mapListProducts(
    filterDemoProducts({
      spaceType: searchParams?.get("spaceType"),
      sunExposure: searchParams?.get("sunExposure"),
      waterLevel: searchParams?.get("waterLevel"),
      budget: searchParams?.get("budget"),
    }),
  )
}

export async function fetchProductDetail(slug: string) {
  if (!isStaticPagesDeploy) {
    const response = await fetch(`/api/products/${encodeURIComponent(slug)}`)
    if (!response.ok) throw new Error("not found")
    return response.json()
  }

  const product = getDemoProductBySlug(slug)
  if (!product) throw new Error("not found")
  return mapDetailProduct(product)
}

export async function fetchProductReviews(_slug: string) {
  if (!isStaticPagesDeploy) {
    const response = await fetch(`/api/products/${encodeURIComponent(_slug)}/reviews`)
    if (!response.ok) return null
    return response.json()
  }

  return { reviews: [], averageRating: 0, count: 0 }
}

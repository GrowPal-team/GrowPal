function getBasePath() {
  if (typeof window !== "undefined") {
    const segment = window.location.pathname.split("/").filter(Boolean)[0]
    if (segment && segment !== "GrowPal-team.github.io") return `/${segment}`
  }
  return process.env.NEXT_PUBLIC_BASE_PATH ?? ""
}

/** Prefix local public asset URLs when deployed under a subpath (e.g. GitHub Pages /GrowPal). */
export function assetPath(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) return path
  const base = getBasePath()
  const normalized = path.startsWith("/") ? path : `/${path}`
  if (base && normalized.startsWith(`${base}/`)) return encodeURI(normalized)
  return `${base}${encodeURI(normalized)}`
}

/** Apply base path to product/media URLs returned from APIs or demo catalog. */
export function resolvePublicUrl(url: string | undefined | null) {
  if (!url) return ""
  if (url.startsWith("http://") || url.startsWith("https://")) return url
  return assetPath(url)
}

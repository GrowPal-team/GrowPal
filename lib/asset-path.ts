function getBasePath() {
  const fromEnv = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
  if (fromEnv) return fromEnv
  if (typeof window !== "undefined") {
    const segment = window.location.pathname.split("/").filter(Boolean)[0]
    if (segment && segment !== "GrowPal-team.github.io") return `/${segment}`
  }
  return ""
}

function withBasePath(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path
  }
  const base = getBasePath()
  const normalized = path.startsWith("/") ? path : `/${path}`
  if (!base || normalized.startsWith(`${base}/`)) return normalized
  return `${base}${normalized}`
}

/** Prefix local public asset URLs when deployed under a subpath (e.g. GitHub Pages /GrowPal). */
export function assetPath(path: string) {
  return encodeURI(withBasePath(path))
}

/** Same as assetPath — for favicon/metadata and next/image loader. */
export function publicAssetUrl(path: string) {
  return assetPath(path)
}

/** Apply base path to product/media URLs returned from APIs or demo catalog. */
export function resolvePublicUrl(url: string | undefined | null) {
  if (!url) return ""
  if (url.startsWith("http://") || url.startsWith("https://")) return url
  return assetPath(url)
}

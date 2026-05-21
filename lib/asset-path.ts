/** Prefix local public asset URLs when deployed under a subpath (e.g. GitHub Pages /GrowPal). */
export function assetPath(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) return path
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
  const normalized = path.startsWith("/") ? path : `/${path}`
  return `${base}${encodeURI(normalized)}`
}

/** Apply base path to product/media URLs returned from APIs or demo catalog. */
export function resolvePublicUrl(url: string | undefined | null) {
  if (!url) return ""
  if (url.startsWith("http://") || url.startsWith("https://")) return url
  return assetPath(url)
}

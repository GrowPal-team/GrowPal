/** Prefix public asset URLs when deployed under a subpath (e.g. GitHub Pages /GrowPal). */
export function assetPath(path: string) {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
  const normalized = path.startsWith("/") ? path : `/${path}`
  return `${base}${normalized}`
}

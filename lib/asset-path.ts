/** GitHub Pages subpath from build-time env only — never infer from /shop, /login, etc. */
function getBasePath() {
  return process.env.NEXT_PUBLIC_BASE_PATH ?? ""
}

/** Undo accidental double-encoding from DB (e.g. %2520 → space). */
export function decodeAssetPath(path: string) {
  if (!path.includes("%")) return path
  let current = path
  for (let i = 0; i < 4 && current.includes("%"); i += 1) {
    try {
      const next = decodeURIComponent(current)
      if (next === current) break
      current = next
    } catch {
      break
    }
  }
  return current
}

function normalizeLocalPath(path: string) {
  const base = getBasePath()
  let normalized = path.startsWith("/") ? path : `/${path}`
  normalized = decodeAssetPath(normalized)
  if (base && normalized.startsWith(`${base}/`)) {
    normalized = normalized.slice(base.length) || "/"
  }
  return normalized
}

function withBasePath(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path
  }
  const base = getBasePath()
  const normalized = normalizeLocalPath(path)
  if (!base) return encodeURI(normalized)
  return encodeURI(`${base}${normalized}`)
}

/** Prefix local public asset URLs when deployed under a subpath (e.g. GitHub Pages /GrowPal). */
export function assetPath(path: string) {
  return withBasePath(path)
}

/** Same as assetPath — for favicon/metadata only (not used on next/image). */
export function publicAssetUrl(path: string) {
  return withBasePath(path)
}

/** Apply base path once for next/image and media URLs (canonical paths in data). */
export function resolvePublicUrl(url: string | undefined | null) {
  if (!url) return ""
  if (url.startsWith("http://") || url.startsWith("https://")) return url
  return withBasePath(url)
}

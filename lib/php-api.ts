const DEFAULT_LOCAL_PHP_API_BASE = "http://localhost/GrowPal/api"

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "")
}

export function getPhpApiBaseUrl(): string {
  const explicitBase = process.env.PHP_API_BASE_URL?.trim()
  if (explicitBase) return trimTrailingSlash(explicitBase)

  const siteUrl = process.env.GROWPAL_SITE_URL?.trim()
  if (siteUrl) {
    return `${trimTrailingSlash(siteUrl)}/php-api`
  }

  return DEFAULT_LOCAL_PHP_API_BASE
}

export function buildPhpApiUrl(endpoint: string): string {
  const normalizedEndpoint = endpoint.replace(/^\/+/, "")
  return `${getPhpApiBaseUrl()}/${normalizedEndpoint}`
}

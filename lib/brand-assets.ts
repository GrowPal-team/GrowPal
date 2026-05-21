import { publicAssetUrl } from "@/lib/asset-path"

/** Small logo — navbar, favicon (metadata uses publicAssetUrl; UI uses PublicImage). */
export const BRAND_LOGO_SRC = "/images/Icon (1).jpeg"
export const BRAND_LOGO_ICON = publicAssetUrl(BRAND_LOGO_SRC)

/** Auth screens illustration (login, register, password reset, verify email). */
export const AUTH_HERO_SRC = "/images/growpal-auth-hero.png"

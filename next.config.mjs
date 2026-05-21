/** @type {import('next').NextConfig} */
const isGitHubPages = process.env.GITHUB_PAGES === "1"

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(isGitHubPages
    ? {
        output: "export",
        basePath: "/GrowPal",
        assetPrefix: "/GrowPal/",
        trailingSlash: true,
      }
    : { output: "standalone" }),
  env: {
    NEXT_PUBLIC_STATIC_PAGES: isGitHubPages ? "1" : "0",
    NEXT_PUBLIC_BASE_PATH: isGitHubPages ? "/GrowPal" : "",
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
}

export default nextConfig

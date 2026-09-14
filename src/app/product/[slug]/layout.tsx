import { DEMO_PRODUCT_SLUGS } from "@/lib/demo-catalog"

export function generateStaticParams() {
  return DEMO_PRODUCT_SLUGS.map((slug) => ({ slug }))
}

export default function ProductSlugLayout({ children }: { children: React.ReactNode }) {
  return children
}

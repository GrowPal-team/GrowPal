import Link from "next/link"
import { ContentPageShell } from "@/components/content-page-shell"

export default function CorporateGiftsPage() {
  return (
    <ContentPageShell
      title="Corporate gifting & bulk greening"
      subtitle="Plants as onboarding gifts, tenant welcome kits, or team wellness—planned so they survive the first month."
    >
      <section className="space-y-3">
        <h2 className="font-serif text-xl font-semibold text-foreground">What we bundle well</h2>
        <p className="text-muted-foreground">
          Low-drama varieties, clear care cards, optional decorative pots sized to the plant—not the logo sticker.
          We can align species to office light tiers (low / mixed / sunny) when you send floor photos.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl font-semibold text-foreground">Lead time</h2>
        <p className="text-muted-foreground">
          Small batches (under 30) often fit normal shop cadence. Larger drops need two–three weeks for sourcing,
          QC, and staggered packing days. Holiday crunch moves earlier—ping us in Q3 if you need December desks.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl font-semibold text-foreground">Start a brief</h2>
        <p className="text-muted-foreground">
          Email via{" "}
          <Link href="/contact" className="cursor-pointer font-medium text-primary underline-offset-4 hover:underline">
            contact
          </Link>{" "}
          with headcount, budget per desk, light reality, and ship-to pattern (single site vs many addresses). We
          reply with a proposal, not a generic catalog PDF.
        </p>
      </section>

      <p className="text-muted-foreground">
        Retail browsing:{" "}
        <Link href="/shop" className="cursor-pointer font-medium text-primary underline-offset-4 hover:underline">
          shop all plants
        </Link>
        .
      </p>
    </ContentPageShell>
  )
}

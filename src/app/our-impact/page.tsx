import Link from "next/link"
import { ContentPageShell } from "@/components/content-page-shell"

export default function OurImpactPage() {
  return (
    <ContentPageShell
      title="Impact, trust & guarantee"
      subtitle="What we stand for, how we think about sustainability, and how we make things right when something goes wrong."
    >
      <section className="space-y-3">
        <h2 className="font-serif text-xl font-semibold text-foreground">Why GrowPal exists</h2>
        <p className="text-muted-foreground">
          We believe everyday spaces—balconies, rooftops, small yards—can cool neighborhoods, save water, and
          reconnect people with living soil. GrowPal connects honest growing advice with a curated shop so you are
          not guessing in the dark.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl font-semibold text-foreground">Sustainability in practice</h2>
        <p className="text-muted-foreground">
          We favor drought-aware suggestions where climates allow, seasonal stock rotations to reduce waste, and
          packaging that balances protection with minimal plastic. Our dashboard metrics are educational—they
          celebrate progress, not perfection.
        </p>
      </section>

      <section className="space-y-3 rounded-2xl border border-primary/20 bg-primary/5 p-6">
        <h2 className="font-serif text-xl font-semibold text-foreground">30-day growing guarantee (summary)</h2>
        <p className="text-muted-foreground">
          If you followed the care note on your variety and the plant fails clearly within 30 days of delivery due
          to a health defect we should have caught—not neglect, pests you introduced, or extreme weather—we replace
          or credit the item. Email photos and your order ID through{" "}
          <Link href="/contact" className="cursor-pointer font-medium text-primary underline-offset-4 hover:underline">
            contact
          </Link>
          . Final wording on your receipt may refine this policy; keep that copy for disputes.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl font-semibold text-foreground">Transparency</h2>
        <p className="text-muted-foreground">
          Climate tools here blend open data patterns with horticultural rules of thumb. They are not a substitute
          for on-site agronomy in edge cases. When in doubt, our{" "}
          <Link href="/chat" className="cursor-pointer font-medium text-primary underline-offset-4 hover:underline">
            chat
          </Link>{" "}
          can help you stress-test a plan.
        </p>
      </section>
    </ContentPageShell>
  )
}

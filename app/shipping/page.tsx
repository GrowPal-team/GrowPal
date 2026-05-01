import Link from "next/link"
import { ContentPageShell } from "@/components/content-page-shell"

export default function ShippingPage() {
  return (
    <ContentPageShell
      title="Shipping & handling"
      subtitle="How we pack, dispatch, and what to expect after you check out."
    >
      <section className="space-y-3">
        <h2 className="font-serif text-xl font-semibold text-foreground">Packaging</h2>
        <p className="text-muted-foreground">
          Plants travel in ventilated wraps or sleeves with cushioning where needed. Soil is stabilized to limit
          spillage. We batch fragile items when heat spikes make same-day courier stress risky—you will see any
          delay in your order timeline.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl font-semibold text-foreground">Dispatch times</h2>
        <p className="text-muted-foreground">
          Most packed orders leave within 2–4 business days unless a product is back-ordered or weather-hold.
          You will get a confirmation with tracking when the label is created. Rural or checkpoint areas may add
          a day or two.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl font-semibold text-foreground">Fees & coverage</h2>
        <p className="text-muted-foreground">
          Shipping is calculated from weight, volume, and destination at checkout. Free-shipping campaigns, when
          active, appear on the cart page. If your address is outside our courier network, we will flag it before
          payment so you can adjust the cart or contact us for a custom quote.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl font-semibold text-foreground">Receiving your plants</h2>
        <p className="text-muted-foreground">
          Unpack gently, give a drink if the medium is dry, and place in bright indirect light for the first 24–48
          hours before hardening off outside. If anything looks crushed or frozen, photograph it and reach out
          within 48 hours—see our{" "}
          <Link href="/our-impact" className="cursor-pointer font-medium text-primary underline-offset-4 hover:underline">
            trust & guarantee notes
          </Link>
          .
        </p>
      </section>
    </ContentPageShell>
  )
}

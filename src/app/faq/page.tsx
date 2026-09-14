import Link from "next/link"
import { ContentPageShell } from "@/components/content-page-shell"

const items: { q: string; a: string }[] = [
  {
    q: "What is GrowPal?",
    a: "GrowPal is a smart green marketplace: we help you pick plants and supplies that fit your climate zone, space, and goals—whether you have a balcony, a courtyard, or a full garden.",
  },
  {
    q: "How do climate zones work here?",
    a: "Our map and city profiles combine typical rainfall, summer heat, and elevation cues to suggest plants and care levels that are realistic for your area. It is guidance, not a guarantee against extreme weather—always observe your own micro-climate.",
  },
  {
    q: "Do you ship plants everywhere?",
    a: "Availability depends on season, stock, and courier coverage. During checkout you will see what applies to your cart. Fragile items may ship in waves—we pack to reduce transit stress.",
  },
  {
    q: "What if my plant arrives damaged?",
    a: "Photograph the plant and packaging within 48 hours and contact us through the contact page. We will walk you through a replacement or store credit when it is clearly a transit or packing issue.",
  },
  {
    q: "Can I change or cancel an order?",
    a: "If the item has not shipped yet, we can usually adjust or cancel. Once it is with the courier, routing changes may be limited—reach out as soon as possible.",
  },
]

export default function FaqPage() {
  return (
    <ContentPageShell
      title="Frequently asked questions"
      subtitle="Straight answers about shopping, shipping, and getting the most from GrowPal."
    >
      <p className="text-muted-foreground">
        Did not find what you need?{" "}
        <Link href="/contact" className="cursor-pointer font-medium text-primary underline-offset-4 hover:underline">
          Contact us
        </Link>{" "}
        or{" "}
        <Link href="/chat" className="cursor-pointer font-medium text-primary underline-offset-4 hover:underline">
          chat with our expert flow
        </Link>{" "}
        for situational advice.
      </p>

      <div className="space-y-3">
        {items.map((item) => (
          <details
            key={item.q}
            className="group rounded-2xl border border-border bg-card px-4 py-3 shadow-sm open:shadow-md"
          >
            <summary className="cursor-pointer list-none font-serif text-lg font-semibold text-foreground outline-none marker:content-none [&::-webkit-details-marker]:hidden">
              {item.q}
            </summary>
            <p className="mt-3 border-t border-border pt-3 text-muted-foreground">{item.a}</p>
          </details>
        ))}
      </div>
    </ContentPageShell>
  )
}

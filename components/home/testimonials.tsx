import Link from "next/link"
import { StarRating } from "@/components/feedback/star-rating"

const testimonials = [
  {
    name: "Layla Hamdan",
    title: "Home Gardener, Ramallah",
    body: "GrowPal turned my tiny balcony into a thriving herb garden. The recommendations were perfect for my space and climate.",
    rating: 5,
  },
  {
    name: "Ahmad Khalil",
    title: "Office Manager, Nablus",
    body: "We greened our entire office using GrowPal's recommendations. The air quality improved noticeably within weeks.",
    rating: 5,
  },
  {
    name: "Sara Nasser",
    title: "Rooftop Farmer, Bethlehem",
    body: "The sustainability dashboard is incredible. I can see exactly how much CO2 my rooftop garden absorbs each month.",
    rating: 5,
  },
]

export function Testimonials() {
  return (
    <section className="bg-card py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
            What Our Community Says
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            Trusted by thousands of growers across Palestine.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="flex flex-col rounded-2xl border border-border bg-background p-6 transition-shadow hover:shadow-lg hover:shadow-primary/5"
            >
              <StarRating value={t.rating} readOnly className="mb-3" starClassName="h-4 w-4" />
              <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                {`"${t.body}"`}
              </p>
              <div className="mt-4 border-t border-border pt-4">
                <p className="text-sm font-semibold text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.title || "GrowPal customer"}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link href="/feedback" className="text-sm font-medium text-primary transition hover:opacity-80">
            View all feedback
          </Link>
        </div>
      </div>
    </section>
  )
}

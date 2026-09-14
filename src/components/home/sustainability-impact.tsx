import { Droplets, Wind, Thermometer } from "lucide-react"

const metrics = [
  {
    icon: Droplets,
    value: "42%",
    label: "Water Saved",
    description: "Through smart irrigation and drought-resistant plant recommendations.",
  },
  {
    icon: Wind,
    value: "1.2T",
    label: "CO2 Absorbed",
    description: "Collectively absorbed by our community's green spaces every month.",
  },
  {
    icon: Thermometer,
    value: "3.5°C",
    label: "Heat Reduced",
    description: "Average temperature reduction in areas with GrowPal-recommended greening.",
  },
]

export function SustainabilityImpact() {
  return (
    <section id="our-impact" className="bg-background py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
            Our Sustainability Impact
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            Every plant you grow contributes to a greener, cooler, and cleaner world.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="flex flex-col items-center rounded-2xl border border-border bg-card p-8 text-center transition-shadow hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <metric.icon className="h-8 w-8 text-primary" />
              </div>
              <span className="text-4xl font-bold text-foreground">{metric.value}</span>
              <span className="mt-1 text-sm font-semibold text-primary">{metric.label}</span>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {metric.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

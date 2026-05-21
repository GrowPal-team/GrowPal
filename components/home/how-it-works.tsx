import Image from "next/image"
import { assetPath } from "@/lib/asset-path"

const steps = [
  {
    title: "Tell Us Your Space",
    description: "Share details about your space type, sunlight, and budget. We tailor everything to your environment.",
    media: {
      kind: "video" as const,
      src: "/videos/Tell Us Your Space.mp4",
    },
  },
  {
    title: "Get Smart Packages",
    description: "Receive curated plant packages perfectly matched to your conditions and sustainability goals.",
    media: {
      kind: "image" as const,
      src: "/videos/Get Smart Packages.png",
    },
  },
  {
    title: "Watch It Grow",
    description: "Track your green impact with real-time metrics on water saved, CO2 absorbed, and heat reduced.",
    media: {
      kind: "video" as const,
      src: "/videos/Watch It Grow.mp4",
    },
  },
]

export function HowItWorks() {
  return (
    <section className="bg-background py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
            How GrowPal Works
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            Three simple steps to transform your space into a green oasis.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="group relative rounded-2xl border border-border bg-card p-8 transition-shadow hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="mb-5 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-black/5">
                {step.media.kind === "video" ? (
                  <video
                    className="h-full w-full object-cover"
                    src={assetPath(step.media.src)}
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                ) : (
                  <Image
                    src={step.media.src}
                    alt={step.title}
                    width={80}
                    height={80}
                    className="h-full w-full object-contain"
                  />
                )}
              </div>
              <span className="mb-2 block text-sm font-semibold text-primary">
                Step {i + 1}
              </span>
              <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

import Image from "next/image"
import Link from "next/link"
import { ContentPageShell } from "@/components/content-page-shell"
import { publicAssetUrl } from "@/lib/asset-path"

export default function OurStoryPage() {
  return (
    <ContentPageShell
      title="Our story"
      className="max-w-5xl"
    >
      <section className="grid gap-8 lg:grid-cols-[1.35fr_0.85fr] lg:items-start">
        <div className="space-y-5">
          <p className="text-lg text-muted-foreground">
            We are two fourth-year computer engineering students who care deeply about the environment, sustainable
            development, and using technology for something meaningful. GrowPal started from a simple belief: if
            greener living feels easier, more people will actually embrace it.
          </p>
          <p className="text-muted-foreground">
            Our goal is to help make homes, balconies, rooftops, and everyday spaces more green, more alive, and more
            connected to nature. We wanted to create a platform that encourages people to grow, learn, and contribute
            to a healthier environment in a practical and inspiring way.
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          <div className="relative aspect-square">
            <Image
              src={publicAssetUrl("/images/us.jpeg")}
              alt="GrowPal founders"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 360px"
            />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl font-semibold text-foreground">What we are building</h2>
        <p className="text-muted-foreground">
          GrowPal is our way of combining environmental awareness with software engineering. We are building a digital
          experience that helps people choose plants more confidently, care for them more easily, and feel that even
          small green steps can create visible change over time.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl font-semibold text-foreground">Why it matters to us</h2>
        <p className="text-muted-foreground">
          We believe greener spaces support healthier communities, calmer homes, and a better relationship with the
          environment around us. Through GrowPal, we hope to encourage a culture that values sustainability,
          development, and simple actions that make the world feel more green and more hopeful.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl font-semibold text-foreground">Next steps with us</h2>
        <p className="text-muted-foreground">
          Browse the{" "}
          <Link href="/shop" className="cursor-pointer font-medium text-primary underline-offset-4 hover:underline">
            shop
          </Link>
          , sketch a layout in the{" "}
          <Link href="/planner" className="cursor-pointer font-medium text-primary underline-offset-4 hover:underline">
            planner
          </Link>
          , or say hello via{" "}
          <Link href="/contact" className="cursor-pointer font-medium text-primary underline-offset-4 hover:underline">
            contact
          </Link>
          .
        </p>
      </section>
    </ContentPageShell>
  )
}

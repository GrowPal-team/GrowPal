import Link from "next/link"
import { ContentPageShell } from "@/components/content-page-shell"

export default function ContactPage() {
  return (
    <ContentPageShell
      title="Contact us"
      subtitle="Orders, partnerships, or growing questions—we read everything, even if we cannot reply instantly."
    >
      <section className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="font-serif text-xl font-semibold text-foreground">Best channel for you</h2>
        <ul className="list-inside list-disc space-y-2 text-muted-foreground">
          <li>
            <strong className="text-foreground">Order problems:</strong> subject line with order ID + photos of
            packaging and plant.
          </li>
          <li>
            <strong className="text-foreground">Plant care triage:</strong> use{" "}
            <Link href="/chat" className="cursor-pointer font-medium text-primary underline-offset-4 hover:underline">
              expert chat
            </Link>{" "}
            first so we can ask follow-ups in context.
          </li>
          <li>
            <strong className="text-foreground">Press & collaborations:</strong> short pitch + timeline; we route
            those separately.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl font-semibold text-foreground">Email</h2>
        <p className="text-muted-foreground">
          Reach us directly at:{" "}
          <a
            href="mailto:salynajjar909@gmail.com"
            className="cursor-pointer font-medium text-primary underline-offset-4 hover:underline"
          >
            salynajjar909@gmail.com
          </a>
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl font-semibold text-foreground">Hours</h2>
        <p className="text-muted-foreground">
          We aim to answer email within two business days. Peak spring season may stretch that slightly—thanks for
          patience while we are hands-on in the nursery.
        </p>
      </section>
    </ContentPageShell>
  )
}

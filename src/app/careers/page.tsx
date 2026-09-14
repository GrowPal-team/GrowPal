import Link from "next/link"
import { ContentPageShell } from "@/components/content-page-shell"

export default function CareersPage() {
  return (
    <ContentPageShell
      title="Careers & collaborations"
      subtitle="We are small, picky about culture, and always curious about people who care for plants and for users."
    >
      <section className="space-y-3">
        <h2 className="font-serif text-xl font-semibold text-foreground">How we hire</h2>
        <p className="text-muted-foreground">
          Send a short note about what you bring—operations, content, design, or full-stack—and one example of a
          project you are proud of. We reply when there is a real seat, not to flood you with automated rejection
          mail.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl font-semibold text-foreground">Partners & nurseries</h2>
        <p className="text-muted-foreground">
          If you grow clean stock and can commit to accurate hardiness labeling, we want to talk integrations,
          seasonal lists, and shared education. Pitches without photos of your operation rarely move forward—show us
          the benches.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl font-semibold text-foreground">Reach out</h2>
        <p className="text-muted-foreground">
          Use the{" "}
          <Link href="/contact" className="cursor-pointer font-medium text-primary underline-offset-4 hover:underline">
            contact page
          </Link>{" "}
          with subject line “Careers” or “Partnership” so filtering stays sane.
        </p>
      </section>
    </ContentPageShell>
  )
}

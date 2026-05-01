import Link from "next/link"
import { ContentPageShell } from "@/components/content-page-shell"

export default function WorkshopsPage() {
  return (
    <ContentPageShell
      title="Workshops & guided planning"
      subtitle="Self-serve for now: use our digital tools like a studio session—measure, sketch, then shop with intent."
    >
      <section className="space-y-3">
        <h2 className="font-serif text-xl font-semibold text-foreground">Session 1 — Measure honestly</h2>
        <p className="text-muted-foreground">
          Tape the usable floor or railing length, note hours of direct sun (phone compass + shadow lengths at 9,
          12, 16), and mark wind tunnels. The planner uses honest inputs; fantasy numbers yield fantasy beds.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl font-semibold text-foreground">Session 2 — Layer heights</h2>
        <p className="text-muted-foreground">
          Reserve vertical space for climbers or small trees, mid-tier shrubs, and ground covers. One crowded tier
          invites disease; three breathing layers usually look fuller anyway.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl font-semibold text-foreground">Session 3 — Budget & irrigation</h2>
        <p className="text-muted-foreground">
          Price durable pots and soil before rare cultivars. Decide now if you hand-water or automate—a cheap
          timer beats heroic daily memory laps.
        </p>
      </section>

      <p className="text-muted-foreground">
        Ready? Open the{" "}
        <Link href="/planner" className="cursor-pointer font-medium text-primary underline-offset-4 hover:underline">
          planner
        </Link>{" "}
        in another tab and keep this page beside it.
      </p>
    </ContentPageShell>
  )
}

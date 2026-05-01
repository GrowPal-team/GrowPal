import Link from "next/link"
import { ContentPageShell } from "@/components/content-page-shell"

const notes = [
  {
    title: "Why balconies behave like deserts",
    date: "March 2026",
    body: "Wind strips boundary-layer humidity; paired pots dry asymmetrically. Cluster plants, add pebble trays where it helps, and favor Mediterranean herbs before tropical mop-tops unless you shade.",
  },
  {
    title: "Heat domes and safe watering",
    date: "February 2026",
    body: "When night temps stay high, roots respire all night—overwatering pairs badly with heat stress. Morning water, airy mix, and moving pots 30 cm inward can matter more than extra misting.",
  },
  {
    title: "First week after delivery",
    date: "January 2026",
    body: "No repotting heroics on day one unless roots blow out the plug. Stabilize light first, then tackle pot upsize in week two if the plant is pushing.",
  },
]

export default function FieldNotesPage() {
  return (
    <ContentPageShell
      title="Field notes"
      subtitle="Occasional letters from the GrowPal team—climate quirks, packing lessons, and seasonal reminders."
    >
      <p className="text-muted-foreground">
        This is a living column: we will archive longer essays here while the homepage hero stays focused on
        discovery. Prefer data? Head to{" "}
        <Link href="/climate-zones" className="cursor-pointer font-medium text-primary underline-offset-4 hover:underline">
          climate zones
        </Link>
        .
      </p>

      <div className="space-y-6">
        {notes.map((n) => (
          <article
            key={n.title}
            className="rounded-2xl border border-border bg-card p-6 shadow-sm"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{n.date}</p>
            <h2 className="mt-2 font-serif text-xl font-semibold text-foreground">{n.title}</h2>
            <p className="mt-3 text-muted-foreground">{n.body}</p>
          </article>
        ))}
      </div>
    </ContentPageShell>
  )
}

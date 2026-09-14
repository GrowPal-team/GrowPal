import Link from "next/link"
import { ContentPageShell } from "@/components/content-page-shell"

export default function PlantCarePage() {
  return (
    <ContentPageShell
      title="Plant care library"
      subtitle="Short, practical notes you can apply this week—not encyclopedic, just honest."
    >
      <section className="space-y-3">
        <h2 className="font-serif text-xl font-semibold text-foreground">Water: feel the pot, do not clock-watch</h2>
        <p className="text-muted-foreground">
          Lift containers when dry vs after watering to learn weight cues. Outdoor pots in wind dry faster on one
          side—rotate weekly. When leaves cup or crisp at edges, you are usually past the ideal window; adjust
          before heroic soaking.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl font-semibold text-foreground">Light: acclimation beats shock</h2>
        <p className="text-muted-foreground">
          Move plants gradually across a week if light levels jump (indoors to full sun, or shade to blasting roof).
          Morning sun is gentler than afternoon bake. Yellowing with tight internodes often screams “too little,”
          while bleached patches say “too much, too fast.”
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl font-semibold text-foreground">Soil & feeding</h2>
        <p className="text-muted-foreground">
          Fast drainage for succulents, water retention for leafy tropicals—never swap the two. Weak, regular feeds
          in active growth beat rare heavy dumps that burn roots. If you are unsure, halve the label rate and
          observe for two weeks.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl font-semibold text-foreground">Go deeper with tools</h2>
        <p className="text-muted-foreground">
          Pair this library with the{" "}
          <Link href="/climate-zones" className="cursor-pointer font-medium text-primary underline-offset-4 hover:underline">
            climate zones map
          </Link>{" "}
          and the{" "}
          <Link href="/planner" className="cursor-pointer font-medium text-primary underline-offset-4 hover:underline">
            space planner
          </Link>{" "}
          so variety choices match your real exposure.
        </p>
      </section>
    </ContentPageShell>
  )
}

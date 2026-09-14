"use client"

import { PublicImage } from "@/components/public-image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { ClimateZone } from "@/lib/mocks/climateZones"
import type { CityClimateProfile } from "@/lib/mocks/cityClimate"
import type { RecommendedPlant } from "@/lib/mocks/climate-shop-products"
import { citiesInZone } from "@/lib/mocks/cityClimate"
import {
  ArrowRight,
  Building2,
  CloudSun,
  Droplets,
  Home,
  Leaf,
  MapPin,
  Snowflake,
  Sun,
  Thermometer,
  Trees,
} from "lucide-react"

type Props = {
  zone: ClimateZone
  city: CityClimateProfile | null
  onPickCity: (cityName: string) => void
}

const statClass =
  "flex flex-col gap-1 rounded-xl border border-border/80 bg-background/80 px-3 py-3 text-center shadow-sm transition-shadow duration-300 ease-out hover:shadow-md"

function PlantGrid({ plants }: { plants: RecommendedPlant[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {plants.map((p) => (
        <Link
          key={p.slug}
          href={`/product/${encodeURIComponent(p.slug)}`}
          className="overflow-hidden rounded-xl border border-border bg-background shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="relative aspect-[4/3] w-full">
            <PublicImage src={p.image} alt={p.name} fill className="object-cover" sizes="160px" />
          </div>
          <div className="p-2">
            <p className="text-xs font-semibold text-foreground line-clamp-2">{p.name}</p>
            <p className="text-[10px] text-muted-foreground line-clamp-2">{p.category}</p>
            <p className="mt-1 text-xs font-bold text-foreground">₪{p.priceIls}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}

function SpaceBlock({
  title,
  titleAr,
  icon: Icon,
  plants,
}: {
  title: string
  titleAr: string
  icon: typeof Home
  plants: RecommendedPlant[]
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-background/60 p-4 transition-shadow duration-300 hover:shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 shrink-0 text-primary" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-foreground">{title}</p>
          <p className="text-[10px] text-muted-foreground" dir="rtl">
            {titleAr}
          </p>
        </div>
      </div>
      <PlantGrid plants={plants} />
    </div>
  )
}

export function ZoneDetail({ zone, city, onPickCity }: Props) {
  const zoneCities = citiesInZone(zone.id)
  const panelKey = city ? `${zone.id}-${city.name}` : zone.id
  const shopLabel = city ? `${city.name}` : zone.name.split(" ")[0]
  const footerHint = city
    ? `Shop filters follow ${city.name} (sun, water, space).`
    : "Pick a city on the map for hyper-local plant lists. Filters use the whole zone until then."

  return (
    <div className="flex h-full min-h-[420px] flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm lg:min-h-0">
      <div className="climate-zones-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 md:px-6 md:py-6">
        <div key={panelKey} className="climate-panel-enter">
          {city ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <span
                    className="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white"
                    style={{ backgroundColor: zone.color }}
                  >
                    {zone.climateBadge}
                  </span>
                  <h2 className="mt-2 font-serif text-xl font-bold text-foreground md:text-2xl">{city.name}</h2>
                  <p className="text-sm text-muted-foreground" dir="rtl">
                    {city.nameAr}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    In zone: <span className="font-medium text-foreground">{zone.name}</span>
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{city.climateSummary}</p>
              <p className="mt-3 text-sm leading-relaxed text-foreground/90">{city.growingNote}</p>

              <div className="mt-5 grid grid-cols-2 gap-2 sm:gap-3">
                <div className={statClass}>
                  <Thermometer className="mx-auto h-4 w-4 text-primary" />
                  <span className="text-lg font-bold text-foreground">{city.tempJulAvgC}°C</span>
                  <span className="text-[10px] text-muted-foreground">July mean (summer)</span>
                </div>
                <div className={statClass}>
                  <Thermometer className="mx-auto h-4 w-4 text-primary" />
                  <span className="text-lg font-bold text-foreground">{city.tempJanAvgC}°C</span>
                  <span className="text-[10px] text-muted-foreground">January mean (winter)</span>
                </div>
                <div className={statClass}>
                  <Droplets className="mx-auto h-4 w-4 text-primary" />
                  <span className="text-lg font-bold text-foreground">{city.annualRainMm}mm</span>
                  <span className="text-[10px] text-muted-foreground">Rain / year (typical)</span>
                </div>
                <div className={statClass}>
                  <Sun className="mx-auto h-4 w-4 text-primary" />
                  <span className="text-lg font-bold text-foreground">{city.sunHoursSummer}h</span>
                  <span className="text-[10px] text-muted-foreground">Summer daylight guide</span>
                </div>
                <div className={statClass}>
                  <CloudSun className="mx-auto h-4 w-4 text-primary" />
                  <span className="text-lg font-bold leading-tight text-foreground">{city.humidityNote}</span>
                  <span className="text-[10px] text-muted-foreground">Humidity & air</span>
                </div>
                <div className={statClass}>
                  <Snowflake className="mx-auto h-4 w-4 text-primary" />
                  <span className="text-lg font-bold leading-tight text-foreground">{city.frostRisk}</span>
                  <span className="text-[10px] text-muted-foreground">Frost risk</span>
                </div>
              </div>

              <p className="mt-4 rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-[10px] leading-relaxed text-muted-foreground">
                <strong className="text-foreground">Data note:</strong> {city.dataSourceNote}
              </p>
              <p className="mt-1 text-[10px] text-muted-foreground">
                Elevation ≈ {city.elevationM > 0 ? `${city.elevationM} m` : `${city.elevationM} m (below sea level)`}.
              </p>
            </>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <span
                    className="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white transition-colors duration-300"
                    style={{ backgroundColor: zone.color }}
                  >
                    {zone.climateBadge}
                  </span>
                  <h2 className="mt-2 font-serif text-xl font-bold text-foreground md:text-2xl">{zone.name}</h2>
                  <p className="text-sm text-muted-foreground" dir="rtl">
                    {zone.arabicName}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{zone.description}</p>
              <div className="mt-4 rounded-xl border border-dashed border-primary/30 bg-primary/5 px-4 py-3 text-sm text-foreground">
                <span className="font-semibold">Tip:</span> click a{" "}
                <span className="font-medium">city dot</span> on the map or a city below for real-station-style
                numbers and indoor / balcony / garden / rooftop plant picks.
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2 sm:gap-3">
                <div className={statClass}>
                  <Thermometer className="mx-auto h-4 w-4 text-primary" />
                  <span className="text-lg font-bold text-foreground">{zone.temperature.max}°C</span>
                  <span className="text-[10px] text-muted-foreground">Zone avg. max</span>
                </div>
                <div className={statClass}>
                  <Thermometer className="mx-auto h-4 w-4 text-primary" />
                  <span className="text-lg font-bold text-foreground">{zone.temperature.min}°C</span>
                  <span className="text-[10px] text-muted-foreground">Zone avg. min</span>
                </div>
                <div className={statClass}>
                  <Droplets className="mx-auto h-4 w-4 text-primary" />
                  <span className="text-lg font-bold text-foreground">{zone.rainfall}mm</span>
                  <span className="text-[10px] text-muted-foreground">Zone rainfall / yr</span>
                </div>
                <div className={statClass}>
                  <Sun className="mx-auto h-4 w-4 text-primary" />
                  <span className="text-lg font-bold text-foreground">{zone.sunHours}h</span>
                  <span className="text-[10px] text-muted-foreground">Typical sun</span>
                </div>
                <div className={statClass}>
                  <CloudSun className="mx-auto h-4 w-4 text-primary" />
                  <span className="text-lg font-bold text-foreground">{zone.humidity}</span>
                  <span className="text-[10px] text-muted-foreground">Humidity</span>
                </div>
                <div className={statClass}>
                  <Snowflake className="mx-auto h-4 w-4 text-primary" />
                  <span className="text-lg font-bold leading-tight text-foreground">{zone.frostRisk}</span>
                  <span className="text-[10px] text-muted-foreground">Frost risk</span>
                </div>
              </div>
            </>
          )}

          <div className="mt-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Growing seasons
            </p>
            <div className="flex flex-wrap gap-2">
              {zone.growingSeasons.map((s) => (
                <span
                  key={s}
                  className="rounded-full px-3 py-1 text-xs font-medium transition-transform duration-300 ease-out hover:scale-[1.02]"
                  style={{ backgroundColor: zone.bgColor, color: zone.color }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Cities in this zone
            </p>
            <div className="flex flex-wrap gap-2">
              {zoneCities.map((c) => {
                const active = city?.name === c.name
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => onPickCity(c.name)}
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-all duration-300 ease-out ${
                      active
                        ? "border-transparent text-white shadow-md"
                        : "border-border bg-background text-foreground hover:border-primary/40"
                    }`}
                    style={
                      active
                        ? { backgroundColor: zone.color }
                        : undefined
                    }
                  >
                    <MapPin className="h-3 w-3 shrink-0 opacity-90" />
                    {c.name}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-amber-200/60 bg-amber-50/80 px-4 py-3 transition-shadow duration-300 dark:border-amber-900/40 dark:bg-amber-950/30">
            <p className="text-xs font-semibold text-foreground">Soil & conditions</p>
            <p className="mt-1 text-sm text-muted-foreground">
              <strong className="text-foreground">Soil:</strong> {zone.soilType}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              <strong className="text-foreground">Heat tolerance:</strong> {zone.heatTolerance}
            </p>
          </div>

          {city ? (
            <div className="mt-8 space-y-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Recommended by space — {city.name}
              </p>
              <SpaceBlock
                title="Indoor & office"
                titleAr="داخل المنزل والمكتب"
                icon={Home}
                plants={city.plants.indoor}
              />
              <SpaceBlock
                title="Balcony"
                titleAr="الشرفة"
                icon={Building2}
                plants={city.plants.balcony}
              />
              <SpaceBlock title="Garden" titleAr="الحديقة" icon={Trees} plants={city.plants.garden} />
              <SpaceBlock
                title="Rooftop"
                titleAr="سطح المنزل"
                icon={Leaf}
                plants={city.plants.rooftop}
              />
            </div>
          ) : (
            <div className="mt-6">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Zone overview plants
              </p>
              <PlantGrid plants={zone.recommendedPlants} />
            </div>
          )}
        </div>
      </div>

      <div className="shrink-0 border-t border-border/60 bg-card/95 px-5 py-4 backdrop-blur-sm md:px-6">
        <Button
          className="group w-full gap-2 rounded-full text-base shadow-sm transition-all duration-300 ease-out hover:opacity-95 hover:shadow-md"
          size="lg"
          style={{ backgroundColor: zone.color }}
          asChild
        >
          <Link href="/shop">
            {city ? `Shop plants for ${city.name}` : `Shop ${shopLabel} plants`}
            <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-0.5" />
          </Link>
        </Button>
        <p className="mt-2 text-center text-[10px] text-muted-foreground">{footerHint}</p>
      </div>
    </div>
  )
}

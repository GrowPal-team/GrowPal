"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ClimateLeafletMap } from "@/components/climate/climate-leaflet-map"
import { ZoneCard } from "@/components/climate/zone-card"
import { ZoneDetail } from "@/components/climate/zone-detail"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  CLIMATE_ZONES,
  MAX_RAINFALL_MOCK,
  getZoneById,
  type ClimateZone,
} from "@/lib/mocks/climateZones"
import {
  CITY_CLIMATE_PROFILES,
  citiesInZone,
  findCityBySearch,
  getCityClimate,
} from "@/lib/mocks/cityClimate"
import { saveClimatePrefsFromCity, saveClimatePrefsFromZone } from "@/lib/climate-zones"
import {
  Building2,
  CalendarDays,
  Leaf,
  Map,
  Search,
  Sparkles,
  ShoppingBag,
} from "lucide-react"

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=2000&q=80"

const CTA_IMAGE =
  "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=2000&q=80"

export default function ClimateZonesPage() {
  const [selectedZone, setSelectedZone] = useState<ClimateZone>(CLIMATE_ZONES[0])
  const [selectedCityName, setSelectedCityName] = useState<string | null>(null)
  const [hoveredZone, setHoveredZone] = useState<string | null>(null)
  const [citySearch, setCitySearch] = useState("")

  const cityProfile = useMemo(() => {
    if (!selectedCityName) return null
    return getCityClimate(selectedCityName) ?? null
  }, [selectedCityName])

  const zonePreviewCityNames = useMemo(
    () => citiesInZone(selectedZone.id).map((c) => c.name),
    [selectedZone.id]
  )

  useEffect(() => {
    if (selectedCityName && !getCityClimate(selectedCityName)) {
      setSelectedCityName(null)
    }
  }, [selectedCityName])

  const filteredZones = useMemo(() => {
    const raw = citySearch.trim()
    const q = raw.toLowerCase()
    if (!q) return CLIMATE_ZONES
    return CLIMATE_ZONES.filter((z) => {
      if (z.name.toLowerCase().includes(q) || z.arabicName.includes(raw)) return true
      return citiesInZone(z.id).some(
        (c) => c.name.toLowerCase().includes(q) || c.nameAr.includes(raw)
      )
    })
  }, [citySearch])

  const selectZoneOnly = useCallback((zone: ClimateZone) => {
    setSelectedZone(zone)
    setSelectedCityName(null)
    saveClimatePrefsFromZone(zone)
  }, [])

  const selectCityByName = useCallback((cityName: string) => {
    const city = getCityClimate(cityName)
    if (!city) return
    const zone = getZoneById(city.zoneId)
    if (!zone) return
    setSelectedZone(zone)
    setSelectedCityName(city.name)
    saveClimatePrefsFromCity(zone, city)
  }, [])

  const handleCitySearch = useCallback(
    (value: string) => {
      setCitySearch(value)
      const t = value.trim()
      if (t.length < 2) return
      const cityHit = findCityBySearch(t)
      if (cityHit) {
        const z = getZoneById(cityHit.zoneId)
        if (z) {
          setSelectedZone(z)
          setSelectedCityName(cityHit.name)
          saveClimatePrefsFromCity(z, cityHit)
        }
        return
      }
      const zoneMatch = CLIMATE_ZONES.find(
        (z) => z.name.toLowerCase().includes(t.toLowerCase()) || z.arabicName.includes(t)
      )
      if (zoneMatch) {
        selectZoneOnly(zoneMatch)
      }
    },
    [selectZoneOnly]
  )

  return (
    <div className="flex min-h-screen flex-col bg-[#fcfaf7]">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-[280px] overflow-hidden md:min-h-[340px]">
        <Image
          src={HERO_IMAGE}
          alt=""
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/45 to-black/30" />
        <div className="relative z-10 mx-auto flex max-w-6xl flex-col justify-end px-4 pb-12 pt-24 lg:px-8 lg:pb-16 lg:pt-28">
          <nav className="mb-4 text-xs font-medium text-white/80">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <span className="mx-2 text-white/50">/</span>
            <span className="text-white">Growing zones</span>
          </nav>
          <h1 className="max-w-3xl font-serif text-3xl font-bold tracking-tight text-white md:text-5xl">
            Palestine Climate Zones
          </h1>
          <p className="mt-4 max-w-2xl text-base font-light leading-relaxed text-white/95 md:text-lg">
            Discover the perfect plants for your microclimate — from Galilee&apos;s lush hills to the
            Jordan Valley&apos;s tropical warmth.
          </p>
        </div>
      </section>

      {/* Stats + search */}
      <div className="border-b border-border/60 bg-card shadow-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground md:gap-10">
            <span className="inline-flex items-center gap-2">
              <Map className="h-4 w-4 text-primary" />
              <strong className="text-foreground">5</strong> climate zones
            </span>
            <span className="inline-flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              <strong className="text-foreground">{CITY_CLIMATE_PROFILES.length}</strong> cities with
              local climate profiles
            </span>
            <span className="inline-flex items-center gap-2">
              <Leaf className="h-4 w-4 text-primary" />
              <strong className="text-foreground">150+</strong> plant varieties
            </span>
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              <strong className="text-foreground">4</strong> growing seasons
            </span>
          </div>
          <div className="relative w-full max-w-xs lg:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={citySearch}
              onChange={(e) => handleCitySearch(e.target.value)}
              placeholder="Search city (e.g. Gaza, Jerusalem)…"
              className="rounded-full border-border bg-background pl-10"
              aria-label="Search city or zone"
            />
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 lg:px-8">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Select your zone
        </p>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(260px,280px)_minmax(0,1fr)_minmax(300px,400px)] lg:items-stretch lg:gap-6 lg:min-h-[min(640px,calc(100vh-14rem))]">
          {/* Column 1 — scrollable list + legend */}
          <div className="flex min-h-[320px] flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm lg:min-h-0 lg:h-full">
            <div className="climate-zones-scroll flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain p-4 md:p-5">
              {filteredZones.map((zone) => (
                <ZoneCard
                  key={zone.id}
                  zone={zone}
                  selected={selectedZone.id === zone.id}
                  onSelect={() => selectZoneOnly(zone)}
                  onHover={setHoveredZone}
                />
              ))}
              {filteredZones.length === 0 && (
                <p className="text-sm text-muted-foreground">No zones match your search.</p>
              )}

              <div className="mt-1 rounded-2xl border border-border bg-background/80 p-4 transition-shadow duration-300">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Zone legend
                </p>
                <ul className="space-y-2 text-xs">
                  {CLIMATE_ZONES.map((z) => (
                    <li key={z.id} className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full transition-transform duration-300"
                        style={{ backgroundColor: z.color }}
                      />
                      {z.name}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Column 2 — map fills remaining height */}
          <div className="flex min-h-[380px] flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm lg:min-h-0 lg:h-full">
            <div className="shrink-0 px-4 pb-3 pt-4 md:px-5 md:pt-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="font-serif text-lg font-semibold text-foreground">Interactive climate map</h2>
                <p className="text-xs text-muted-foreground">
                  Tap a <strong className="font-medium text-foreground">city dot</strong> for station-style
                  climate & plant lists, or a colored region for the wider zone.
                </p>
                </div>
                <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-medium text-muted-foreground transition-colors duration-300">
                  Click to select
                </span>
              </div>
            </div>
            <div className="relative w-full flex-1 min-h-[260px] overflow-hidden lg:min-h-0">
              <ClimateLeafletMap
                selectedId={selectedZone.id}
                hoveredId={hoveredZone}
                selectedCityName={selectedCityName}
                onSelectZone={selectZoneOnly}
                onSelectCity={selectCityByName}
                className="!absolute !inset-0 !h-full !w-full !min-h-0 !rounded-none"
              />
            </div>
            <div className="shrink-0 border-t border-border/60 bg-card/90 px-4 py-3 backdrop-blur-sm md:px-5">
              <div
                className="flex flex-wrap items-center gap-2 rounded-xl border px-3 py-2.5 text-xs transition-all duration-300 ease-out"
                style={{ borderColor: `${selectedZone.color}55`, backgroundColor: selectedZone.bgColor }}
              >
                <span className="font-semibold text-foreground">
                  {cityProfile ? cityProfile.name : selectedZone.name}
                </span>
                <span className="text-muted-foreground">
                  {cityProfile
                    ? `${selectedZone.name} · Jan Ø ${cityProfile.tempJanAvgC}°C · Jul Ø ${cityProfile.tempJulAvgC}°C`
                    : `${zonePreviewCityNames.slice(0, 3).join(" · ")}${
                        zonePreviewCityNames.length > 3 ? "…" : ""
                      }`}
                </span>
                <span className="ml-auto shrink-0 font-medium text-foreground">
                  {cityProfile
                    ? `${cityProfile.annualRainMm} mm/yr`
                    : `${selectedZone.temperature.min}–${selectedZone.temperature.max}°C`}
                </span>
              </div>
            </div>
          </div>

          {/* Column 3 */}
          <div className="min-h-0 lg:h-full">
            <ZoneDetail zone={selectedZone} city={cityProfile} onPickCity={selectCityByName} />
          </div>
        </div>

        {/* Overview cards */}
        <section className="mt-16">
          <h2 className="mb-6 text-center font-serif text-2xl font-bold text-foreground md:text-3xl">
            Zone overview
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {CLIMATE_ZONES.map((z) => {
              const rainPct = Math.round((z.rainfall / MAX_RAINFALL_MOCK) * 100)
              const active = z.id === selectedZone.id
              return (
                <button
                  key={z.id}
                  type="button"
                  onClick={() => selectZoneOnly(z)}
                  className={`rounded-2xl border-2 p-4 text-left transition-all duration-300 ease-out ${
                    active ? "shadow-md" : "border-border hover:border-primary/30 hover:shadow-sm"
                  }`}
                  style={{
                    borderColor: active ? z.color : undefined,
                    backgroundColor: active ? z.bgColor : "var(--card)",
                  }}
                >
                  <z.icon className="h-5 w-5" style={{ color: z.color }} />
                  <p className="mt-2 text-sm font-bold text-foreground">{z.name}</p>
                  <p className="text-[10px] text-muted-foreground">{z.climateBadge}</p>
                  <p className="mt-3 text-[10px] font-medium text-muted-foreground">Rainfall</p>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${rainPct}%`, backgroundColor: z.color }}
                    />
                  </div>
                  <p className="mt-1 text-xs font-semibold text-foreground">{z.rainfall} mm</p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {z.recommendedPlants.slice(0, 2).map((p) => (
                      <span
                        key={p.name}
                        className="rounded-md bg-muted px-1.5 py-0.5 text-[9px] text-foreground"
                      >
                        {p.name}
                      </span>
                    ))}
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="relative mt-16 overflow-hidden rounded-3xl">
          <div className="absolute inset-0">
            <Image src={CTA_IMAGE} alt="" fill className="object-cover" sizes="100vw" />
            <div className="absolute inset-0 bg-black/50" />
          </div>
          <div className="relative z-10 px-6 py-16 text-center md:py-20">
            <h2 className="font-serif text-3xl font-bold text-white md:text-4xl">
              Ready to start growing?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm font-light text-white/90 md:text-base">
              Use our Smart Planner to get personalized plant recommendations based on your exact location
              and space.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button
                size="lg"
                className="gap-2 rounded-full bg-white text-primary hover:bg-white/90"
                asChild
              >
                <Link href="/planner">
                  <Sparkles className="h-4 w-4" />
                  Try Smart Planner
                </Link>
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="gap-2 rounded-full border-0 bg-primary text-primary-foreground hover:bg-primary/90"
                asChild
              >
                <Link href="/shop">
                  <ShoppingBag className="h-4 w-4" />
                  Browse all plants
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

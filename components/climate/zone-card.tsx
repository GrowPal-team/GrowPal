"use client"

import type { ClimateZone } from "@/lib/mocks/climateZones"
import { Thermometer, Droplets, Sun } from "lucide-react"

type Props = {
  zone: ClimateZone
  selected: boolean
  onSelect: () => void
  onHover: (id: string | null) => void
}

export function ZoneCard({ zone, selected, onSelect, onHover }: Props) {
  const Icon = zone.icon
  return (
    <button
      type="button"
      onClick={onSelect}
      onMouseEnter={() => onHover(zone.id)}
      onMouseLeave={() => onHover(null)}
      className="w-full rounded-2xl border-2 p-4 text-left shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:transition-[transform] active:duration-100"
      style={{
        borderColor: selected ? zone.color : "var(--border)",
        backgroundColor: selected ? zone.bgColor : "var(--card)",
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: `${zone.color}22`, color: zone.color }}
        >
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
        <span
          className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: zone.color }}
          aria-hidden
        />
      </div>
      <h3 className="mt-3 font-semibold leading-snug text-foreground">{zone.name}</h3>
      <p className="text-xs text-muted-foreground" dir="rtl">
        {zone.arabicName}
      </p>
      <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Thermometer className="h-3.5 w-3.5 text-foreground/70" />
          {zone.temperature.max}°C
        </span>
        <span className="inline-flex items-center gap-1">
          <Droplets className="h-3.5 w-3.5 text-foreground/70" />
          {zone.rainfall}mm/yr
        </span>
        <span className="inline-flex items-center gap-1">
          <Sun className="h-3.5 w-3.5 text-foreground/70" />
          {zone.sunHours}h sun
        </span>
      </div>
    </button>
  )
}

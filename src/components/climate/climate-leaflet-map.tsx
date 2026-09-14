"use client"

import dynamic from "next/dynamic"
import type { ClimateZone } from "@/lib/mocks/climateZones"

const Inner = dynamic(() => import("./climate-leaflet-map-inner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[200px] w-full items-center justify-center rounded-none border-0 bg-muted/30 text-sm text-muted-foreground transition-opacity duration-300">
      Loading map…
    </div>
  ),
})

type Props = {
  selectedId: string
  hoveredId: string | null
  selectedCityName: string | null
  onSelectZone: (zone: ClimateZone) => void
  onSelectCity?: (cityName: string) => void
  onMapClickOutside?: () => void
  className?: string
}

export function ClimateLeafletMap(props: Props) {
  return <Inner {...props} />
}

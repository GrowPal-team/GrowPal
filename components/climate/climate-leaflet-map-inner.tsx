"use client"

import { useEffect } from "react"
import L from "leaflet"
import {
  MapContainer,
  TileLayer,
  Polygon,
  CircleMarker,
  Tooltip,
  useMapEvents,
  Pane,
  useMap,
} from "react-leaflet"
import "leaflet/dist/leaflet.css"
import {
  CLIMATE_ZONES,
  findZoneAtLatLng,
  type ClimateZone,
} from "@/lib/mocks/climateZones"
import { ZONE_CITY_MARKERS } from "@/lib/mocks/cityClimate"

type Props = {
  selectedId: string
  hoveredId: string | null
  selectedCityName: string | null
  onSelectZone: (zone: ClimateZone) => void
  onSelectCity?: (cityName: string) => void
  onMapClickOutside?: () => void
  className?: string
}

function MapClickLayer({
  onSelectZone,
  onMapClickOutside,
}: {
  onSelectZone: (z: ClimateZone) => void
  onMapClickOutside?: () => void
}) {
  useMapEvents({
    click(e) {
      const z = findZoneAtLatLng(e.latlng.lat, e.latlng.lng)
      if (z) onSelectZone(z)
      else onMapClickOutside?.()
    },
  })
  return null
}

/** Leaflet needs a size refresh when the flex parent gets its height. */
function InvalidateMapSize() {
  const map = useMap()
  useEffect(() => {
    const run = () => map.invalidateSize()
    const id = requestAnimationFrame(run)
    const t1 = setTimeout(run, 120)
    const t2 = setTimeout(run, 400)
    return () => {
      cancelAnimationFrame(id)
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [map])
  return null
}

export default function ClimateLeafletMapInner({
  selectedId,
  hoveredId,
  selectedCityName,
  onSelectZone,
  onSelectCity,
  onMapClickOutside,
  className = "",
}: Props) {
  useEffect(() => {
    const proto = L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown }
    delete proto._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    })
  }, [])

  return (
    <MapContainer
      center={[31.95, 35.2]}
      zoom={8}
      className={`climate-leaflet-root z-0 !h-full !w-full min-h-[240px] rounded-xl ${className}`}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom
      attributionControl
    >
      <InvalidateMapSize />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapClickLayer onSelectZone={onSelectZone} onMapClickOutside={onMapClickOutside} />

      <Pane name="climate-halos" style={{ zIndex: 400 }}>
        {CLIMATE_ZONES.map((zone) => {
          const selected = zone.id === selectedId
          const hovered = zone.id === hoveredId
          const glow = selected ? 0.14 : hovered ? 0.1 : 0.065
          return (
            <Polygon
              key={`halo-${zone.id}`}
              positions={zone.haloPolygon}
              interactive={false}
              pathOptions={{
                stroke: false,
                fillColor: zone.color,
                fillOpacity: glow,
                smoothFactor: 1.25,
              }}
            />
          )
        })}
      </Pane>

      <Pane name="climate-zones-main" style={{ zIndex: 410 }}>
        {CLIMATE_ZONES.map((zone) => {
          const selected = zone.id === selectedId
          const hovered = zone.id === hoveredId
          const fillOpacity = selected ? 0.24 : hovered ? 0.19 : 0.12
          return (
            <Polygon
              key={zone.id}
              positions={zone.polygon}
              pathOptions={{
                color: zone.color,
                fillColor: zone.color,
                fillOpacity,
                weight: selected ? 2 : hovered ? 1.5 : 1,
                opacity: selected ? 0.88 : hovered ? 0.72 : 0.5,
                lineJoin: "round",
                lineCap: "round",
                smoothFactor: 1.2,
              }}
              eventHandlers={{
                click: (ev) => {
                  if (ev.originalEvent) L.DomEvent.stopPropagation(ev.originalEvent)
                  onSelectZone(zone)
                },
              }}
            >
              <Tooltip
                direction="top"
                className="!rounded-xl !border-border/60 !bg-card/95 !px-3 !py-2 !text-foreground !shadow-lg backdrop-blur-sm"
              >
                <span className="text-xs font-semibold tracking-tight">{zone.name}</span>
              </Tooltip>
            </Polygon>
          )
        })}
      </Pane>

      <Pane name="climate-cities" style={{ zIndex: 420 }}>
        {ZONE_CITY_MARKERS.map((c) => {
          const zoneMeta = CLIMATE_ZONES.find((z) => z.id === c.zoneId)
          const col = zoneMeta?.color ?? "#4a7c59"
          const selected = selectedCityName === c.name
          return (
            <CircleMarker
              key={c.name}
              center={[c.lat, c.lng]}
              radius={selected ? 10 : 6}
              pathOptions={{
                color: selected ? col : "rgba(26,26,26,0.55)",
                fillColor: selected ? col : "#faf8f5",
                fillOpacity: selected ? 0.92 : 1,
                weight: selected ? 3 : 1.5,
              }}
              eventHandlers={{
                click: (ev) => {
                  if (ev.originalEvent) L.DomEvent.stopPropagation(ev.originalEvent)
                  onSelectCity?.(c.name)
                },
              }}
            >
              <Tooltip direction="top" offset={[0, -4]} opacity={1} className="!rounded-md !text-xs">
                {c.name} — click for local climate
              </Tooltip>
            </CircleMarker>
          )
        })}
      </Pane>
    </MapContainer>
  )
}

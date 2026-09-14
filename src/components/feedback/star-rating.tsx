"use client"

import { useMemo, useState } from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

type StarRatingProps = {
  value: number
  onChange?: (value: number) => void
  className?: string
  starClassName?: string
  readOnly?: boolean
}

function getFillPercent(value: number, starNumber: number) {
  if (value >= starNumber) return 100
  if (value >= starNumber - 0.5) return 50
  return 0
}

export function StarRating({
  value,
  onChange,
  className,
  starClassName,
  readOnly = false,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null)
  const displayValue = useMemo(() => hoverValue ?? value, [hoverValue, value])

  function getMouseValue(event: React.MouseEvent<HTMLButtonElement>, starNumber: number) {
    const bounds = event.currentTarget.getBoundingClientRect()
    const pointerX = event.clientX - bounds.left
    return pointerX <= bounds.width / 2 ? starNumber - 0.5 : starNumber
  }

  return (
    <div
      className={cn("flex items-center gap-1", className)}
      role={readOnly ? "img" : "radiogroup"}
      aria-label={`${displayValue} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, index) => {
        const starNumber = index + 1
        const fillPercent = getFillPercent(displayValue, starNumber)

        if (readOnly || !onChange) {
          return (
            <span key={starNumber} className="relative inline-flex">
              <Star className={cn("h-5 w-5 text-slate-300", starClassName)} />
              {fillPercent > 0 ? (
                <span className="absolute inset-0 overflow-hidden" style={{ width: `${fillPercent}%` }}>
                  <Star className={cn("h-5 w-5 fill-primary text-primary", starClassName)} />
                </span>
              ) : null}
            </span>
          )
        }

        return (
          <button
            key={starNumber}
            type="button"
            className="relative inline-flex cursor-pointer rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2f6f4e] focus-visible:ring-offset-2"
            onMouseMove={(event) => setHoverValue(getMouseValue(event, starNumber))}
            onMouseLeave={() => setHoverValue(null)}
            onClick={(event) => onChange(getMouseValue(event, starNumber))}
            onKeyDown={(event) => {
              if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
                event.preventDefault()
                onChange(Math.max(0.5, value - 0.5))
              }
              if (event.key === "ArrowRight" || event.key === "ArrowUp") {
                event.preventDefault()
                onChange(Math.min(5, value + 0.5))
              }
              if (event.key === " " || event.key === "Enter") {
                event.preventDefault()
                onChange(starNumber)
              }
            }}
            aria-label={`${starNumber} stars`}
            aria-checked={value >= starNumber - 0.5 && value <= starNumber}
            role="radio"
          >
            <Star className={cn("h-7 w-7 text-slate-300 transition-colors", starClassName)} />
            {fillPercent > 0 ? (
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fillPercent}%` }}>
                <Star className={cn("h-7 w-7 fill-primary text-primary", starClassName)} />
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}

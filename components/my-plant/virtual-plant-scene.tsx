"use client"

import { cn } from "@/lib/utils"

type Props = {
  /** 0–4 growth steps */
  stage: number
  /** Full bloom + reward available */
  blooming: boolean
  className?: string
}

/** Warm, editorial plant illustration aligned with GrowPal palette. */
export function VirtualPlantScene({ stage, blooming, className }: Props) {
  const s = blooming ? 4 : Math.min(4, Math.max(0, stage))

  return (
    <div
      className={cn(
        "relative flex aspect-[5/6] w-full max-w-[min(100%,280px)] items-end justify-center",
        className
      )}
    >
      <div
        className={cn(
          "absolute inset-0 rounded-[2rem] bg-gradient-to-b from-primary/[0.07] via-transparent to-[#c4a574]/[0.12] transition-opacity duration-700",
          blooming ? "opacity-100" : "opacity-70"
        )}
      />
      {blooming && (
        <div
          className="pointer-events-none absolute inset-2 rounded-[1.75rem] opacity-90"
          style={{
            boxShadow: "inset 0 0 48px rgba(196, 165, 116, 0.35)",
          }}
        />
      )}

      <svg
        viewBox="0 0 220 260"
        className="relative z-[1] h-auto w-full drop-shadow-md"
        aria-hidden
      >
        <defs>
          <linearGradient id="potGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#c17f4a" />
            <stop offset="100%" stopColor="#8b4a22" />
          </linearGradient>
          <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5a9a5c" />
            <stop offset="100%" stopColor="#2d6b3a" />
          </linearGradient>
          <linearGradient id="stemGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4a8f52" />
            <stop offset="100%" stopColor="#356b3d" />
          </linearGradient>
        </defs>

        {/* Pot */}
        <path
          d="M55 200 L65 235 Q68 248 82 248 L138 248 Q152 248 155 235 L165 200 Z"
          fill="url(#potGrad)"
          stroke="#6b3a1a"
          strokeWidth="1.2"
        />
        <ellipse cx="110" cy="200" rx="58" ry="10" fill="#a65d32" opacity="0.5" />

        {/* Soil */}
        <ellipse cx="110" cy="198" rx="48" ry="8" fill="#4a3728" />
        <ellipse cx="110" cy="196" rx="40" ry="5" fill="#5c4330" opacity="0.85" />

        {/* Seed — stage 0 */}
        <g style={{ opacity: s >= 0 ? 1 : 0 }} className="transition-opacity duration-500">
          <ellipse cx="110" cy="188" rx="5" ry="3" fill="#6b5344" opacity={s === 0 ? 1 : 0.35} />
        </g>

        {/* Sprout — stage 1 */}
        <g style={{ opacity: s >= 1 ? 1 : 0 }} className="transition-opacity duration-500">
          <path
            d="M110 188 Q108 175 112 165"
            fill="none"
            stroke="url(#stemGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <ellipse cx="112" cy="162" rx="7" ry="4" fill="url(#leafGrad)" transform="rotate(-25 112 162)" />
        </g>

        {/* Seedling — stage 2 */}
        <g style={{ opacity: s >= 2 ? 1 : 0 }} className="transition-opacity duration-500">
          <path
            d="M110 188 Q106 168 110 148"
            fill="none"
            stroke="url(#stemGrad)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <ellipse cx="104" cy="155" rx="12" ry="6" fill="url(#leafGrad)" transform="rotate(-50 104 155)" />
          <ellipse cx="118" cy="152" rx="11" ry="6" fill="url(#leafGrad)" transform="rotate(45 118 152)" />
        </g>

        {/* Growing — stage 3 */}
        <g style={{ opacity: s >= 3 ? 1 : 0 }} className="transition-opacity duration-500">
          <path
            d="M110 188 Q104 155 110 118"
            fill="none"
            stroke="url(#stemGrad)"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          <ellipse cx="98" cy="138" rx="14" ry="7" fill="url(#leafGrad)" transform="rotate(-55 98 138)" />
          <ellipse cx="124" cy="132" rx="13" ry="7" fill="url(#leafGrad)" transform="rotate(50 124 132)" />
          <ellipse cx="110" cy="115" rx="10" ry="12" fill="url(#leafGrad)" transform="rotate(-8 110 115)" />
        </g>

        {/* Almost / full — stage 4 */}
        <g style={{ opacity: s >= 4 ? 1 : 0 }} className="transition-opacity duration-500">
          <path
            d="M110 188 Q100 140 110 88"
            fill="none"
            stroke="url(#stemGrad)"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <ellipse cx="92" cy="125" rx="16" ry="8" fill="url(#leafGrad)" transform="rotate(-60 92 125)" />
          <ellipse cx="130" cy="118" rx="15" ry="8" fill="url(#leafGrad)" transform="rotate(58 130 118)" />
          <ellipse cx="108" cy="95" rx="12" ry="14" fill="url(#leafGrad)" transform="rotate(-12 108 95)" />
          <ellipse cx="118" cy="102" rx="11" ry="9" fill="url(#leafGrad)" transform="rotate(35 118 102)" />
          {blooming && (
            <>
              <circle cx="110" cy="72" r="14" fill="#f4d58d" stroke="#c4a574" strokeWidth="1.5" />
              <circle cx="110" cy="72" r="6" fill="#fff8e7" opacity="0.9" />
            </>
          )}
        </g>
      </svg>

      {blooming && (
        <span className="pointer-events-none absolute top-6 right-8 text-2xl animate-bounce" aria-hidden>
          ✨
        </span>
      )}
    </div>
  )
}

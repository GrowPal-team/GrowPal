"use client"

import Link from "next/link"
import { MapPin, ArrowRight } from "lucide-react"

const VIDEO_SRC = "/videos/ExplorePlantsforYourZone.mp4"

/**
 * Full-width hero banner: video background (no filters on the video), text overlay, CTA to interactive map.
 */
export function GrowingZone() {
  return (
    <section
      id="growing-zones"
      className="relative flex h-[700px] max-h-[100svh] items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0 z-0">
        <video
          className="h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden
        >
          <source src={VIDEO_SRC} type="video/mp4" />
        </video>
        {/* Readability overlay only — not applied to the video element itself */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/35 to-black/40" />
      </div>

      <div className="relative z-10 max-w-4xl px-6 text-center">
        <h2 className="mb-5 font-sans text-4xl font-extrabold uppercase tracking-wider text-white sm:text-5xl md:mb-6 md:text-6xl">
          Discover Your Growing Zone
        </h2>
        <p className="mx-auto mb-10 max-w-3xl text-lg font-light leading-relaxed text-white sm:text-xl md:mb-12">
          From Haifa&apos;s Mediterranean breeze to Jericho&apos;s desert warmth,
          <br className="hidden sm:block" /> find plants perfectly matched to your Palestinian microclimate.
        </p>
        <Link
          href="/climate-zones"
          className="inline-flex cursor-pointer items-center gap-4 whitespace-nowrap rounded-full bg-black px-7 py-3.5 text-sm font-medium uppercase tracking-wide text-white shadow-lg transition-all duration-300 hover:bg-neutral-900 hover:shadow-2xl md:px-8 md:py-4"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#c65d3a]">
            <MapPin className="h-4 w-4 text-white" strokeWidth={2.5} />
          </span>
          <span>Explore Climate Zones</span>
          <ArrowRight className="h-5 w-5" aria-hidden />
        </Link>
      </div>
    </section>
  )
}

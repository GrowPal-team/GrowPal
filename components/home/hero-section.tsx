"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { clientIsLoggedIn } from "@/lib/session-client"

export function HeroSection() {
  const [logged, setLogged] = useState(false)

  useEffect(() => {
    const sync = () => setLogged(clientIsLoggedIn())
    sync()
    window.addEventListener("growpal-auth", sync)
    return () => window.removeEventListener("growpal-auth", sync)
  }, [])

  return (
    <section
      id="our-story"
      className="relative flex min-h-[70vh] items-center justify-center overflow-hidden md:min-h-[80vh]"
    >
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/videos/home.mp4" type="video/mp4" />
      </video>
      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center md:max-w-4xl md:py-32">
        <div className="mb-4 flex items-center gap-2 rounded-full bg-[#2F6F4E] px-4 py-1.5 backdrop-blur">
          <span className="text-sm font-medium text-white">Smart Green Marketplace</span>
        </div>

        <h1 className="font-serif text-4xl font-bold leading-tight tracking-tight text-emerald-50 md:text-5xl lg:text-6xl">
          <span className="text-balance">GrowPal</span>
        </h1>

        <p className="mt-3 font-serif text-lg text-emerald-100 md:text-xl">Rooted in Home, Growing for Palestine</p>

        <p className="mt-4 max-w-2xl text-base leading-relaxed text-emerald-100/90 md:text-lg">
          Transform any space into a sustainable green environment. From balconies to rooftops, GrowPal helps you
          grow smarter and greener.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {!logged && (
            <Link href="/register">
              <Button
                size="lg"
                className="gap-2 rounded-full border-transparent bg-[#3FA36A] px-6 text-white hover:bg-[#3FA36A] hover:brightness-110"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
          <Link href="/shop">
            <Button
              variant="outline"
              size="lg"
              className="rounded-full border-[#A8D5BA] bg-transparent px-6 text-[#A8D5BA] hover:bg-[#A8D5BA]/10"
            >
              Explore Plants
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

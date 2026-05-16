"use client"

import { useEffect, useState, useCallback } from "react"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { clientIsGuest } from "@/lib/session-client"
import { saveWelcomeOffer } from "@/lib/discounts"

const DELAY_MS = 10_000

function isLocalWebHostname(): boolean {
  if (typeof window === "undefined") return false
  const h = window.location.hostname
  return h === "localhost" || h === "127.0.0.1" || h === "[::1]"
}

/** Treat `/`, empty, and trailing-slash-only as home (usePathname can be null briefly in App Router). */
function normalizedHomePath(pathnameFromHook: string | null): string {
  if (typeof window === "undefined") return ""
  const raw = pathnameFromHook ?? window.location.pathname ?? ""
  const trimmed = raw.replace(/\/+$/, "")
  return trimmed === "" ? "/" : trimmed
}

export function LeadCaptureModal() {
  const router = useRouter()
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)
  const [email, setEmail] = useState("")
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const dismiss = useCallback(() => {
    setVisible(false)
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    if (!isLocalWebHostname()) return
    if (!clientIsGuest()) return
    if (normalizedHomePath(pathname) !== "/") return

    const t = window.setTimeout(() => {
      if (!isLocalWebHostname()) return
      if (!clientIsGuest()) return
      const trimmed = (window.location.pathname || "").replace(/\/+$/, "")
      const stillHome = trimmed === "" || trimmed === "/"
      if (!stillHome) return
      setVisible(true)
    }, DELAY_MS)

    return () => window.clearTimeout(t)
  }, [pathname])

  useEffect(() => {
    const onAuth = () => {
      setVisible(false)
    }
    window.addEventListener("growpal-auth", onAuth)
    return () => window.removeEventListener("growpal-auth", onAuth)
  }, [])

  const submit = async () => {
    const e = email.trim().toLowerCase()
    if (!e || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
      setErr("Please enter a valid email.")
      return
    }
    setErr(null)
    setBusy(true)
    try {
      await fetch("/api/promo-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: e, discount_label: "10%" }),
      })
    } catch {
      /* still redirect */
    } finally {
      setBusy(false)
    }
    saveWelcomeOffer(e, "next-home-modal")
    dismiss()
    router.push(`/register?promo=10&email=${encodeURIComponent(e)}`)
  }

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-[250] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="promo-title"
    >
      <div className="relative flex max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-card shadow-2xl md:max-h-[520px] md:flex-row">
        <button
          type="button"
          onClick={dismiss}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/90 text-foreground shadow md:right-4 md:top-4"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative hidden min-h-[200px] w-full md:block md:w-[45%]">
          <Image
            src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=800&q=80"
            alt="Plants"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 360px"
            priority
          />
        </div>

        <div className="flex w-full flex-col justify-center bg-[#1e4a32] px-6 py-10 text-white md:w-[55%] md:px-10">
          <h2 id="promo-title" className="font-serif text-3xl font-bold tracking-tight md:text-4xl">
            Get 10% OFF
          </h2>
          <p className="mt-2 text-sm text-white/90 md:text-base">Backed by our growing community &amp; care tips</p>

          <div className="mt-8 space-y-3">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="h-11 rounded-lg border-0 bg-white text-foreground placeholder:text-muted-foreground"
              autoComplete="email"
            />
            {err && <p className="text-sm text-amber-200">{err}</p>}
            <Button
              type="button"
              onClick={() => void submit()}
              disabled={busy}
              className="h-11 w-full cursor-pointer rounded-lg bg-[#3FA36A] text-base font-semibold text-white hover:bg-[#358f5b]"
            >
              {busy ? "Please wait…" : "GET OFFER"}
            </Button>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-white/75">
            By signing up, you agree to receive email marketing from GrowPal.
          </p>

          <button
            type="button"
            onClick={dismiss}
            className="mt-6 cursor-pointer text-center text-sm text-white/90 underline-offset-4 hover:underline"
          >
            No, thanks
          </button>
        </div>
      </div>
    </div>
  )
}

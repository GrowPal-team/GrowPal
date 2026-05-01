"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Sparkles, Leaf, MessageCircle, UserRound } from "lucide-react"
import { clientIsGuest } from "@/lib/session-client"

export default function ChatInfoPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (clientIsGuest()) {
      router.replace("/login?next=/chat")
      return
    }
    setReady(true)
  }, [router])

  useEffect(() => {
    if (!ready) return
    window.dispatchEvent(new CustomEvent("growpal-chat-open"))
  }, [ready])

  if (!ready) {
    return (
      <div className="flex min-h-screen flex-col bg-[#fcfaf7]">
        <Navbar />
        <main className="flex flex-1 items-center justify-center px-4">
          <p className="text-muted-foreground">Loading…</p>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#fcfaf7]">
      <Navbar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 lg:px-8">
        <div className="flex items-center gap-2 text-primary">
          <MessageCircle className="h-8 w-8" />
          <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl">GrowPal assistant</h1>
        </div>
        <p className="mt-4 text-lg text-muted-foreground">
          Chat lives in the <strong className="text-foreground">floating circle</strong> (bottom-right) on every
          page. There is no Chat link in the top bar—open the bubble when you need help. Everything in the assistant
          is in <strong className="text-foreground">English</strong>.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <UserRound className="h-8 w-8 text-primary" />
            <h2 className="mt-3 font-serif text-lg font-semibold text-foreground">Human expert</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              After the welcome screen choose “Talk to an expert.” You get one clear message explaining that the first
              available specialist will reply—no duplicate confirmation bubble when you send your note.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <Sparkles className="h-8 w-8 text-primary" />
            <h2 className="mt-3 font-serif text-lg font-semibold text-foreground">AI bot</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Quick-ask chips plus optional typing. The server uses free-friendly keys first:{" "}
              <code className="rounded bg-muted px-1 text-xs">GROQ_API_KEY</code>, then{" "}
              <code className="rounded bg-muted px-1 text-xs">GEMINI_API_KEY</code>, then{" "}
              <code className="rounded bg-muted px-1 text-xs">OPENAI_API_KEY</code> if set.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:col-span-2">
            <Leaf className="h-8 w-8 text-primary" />
            <h2 className="mt-3 font-serif text-lg font-semibold text-foreground">No API keys</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              A simple English rule-based fallback runs inside <code className="rounded bg-muted px-1 text-xs">/api/chat-ai</code>.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Button
            type="button"
            className="cursor-pointer rounded-full"
            onClick={() => window.dispatchEvent(new CustomEvent("growpal-chat-open"))}
          >
            Open assistant
          </Button>
          <Button type="button" variant="outline" className="cursor-pointer rounded-full" asChild>
            <Link href="/faq">FAQ</Link>
          </Button>
          <Button type="button" variant="outline" className="cursor-pointer rounded-full" asChild>
            <Link href="/contact">Contact</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  )
}

"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Inbox, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useExpertUserId } from "@/components/expert/expert-user-context"

type DashboardData = {
  newThreads: number
  uniqueCustomersHelped: number
  recentThreads: {
    id: number
    status: string
    lastMessagePreview: string | null
    updatedAt: string
    customer: { id: number; full_name: string; email: string }
  }[]
}

export default function ExpertDashboardPage() {
  const expertUserId = useExpertUserId()
  const [data, setData] = useState<DashboardData | null>(null)
  const [err, setErr] = useState<string | null>(null)

  const load = useCallback(async () => {
    setErr(null)
    try {
      const res = await fetch(`/api/expert/dashboard?expertUserId=${expertUserId}`)
      const j = await res.json().catch(() => ({}))
      if (!res.ok) {
        setErr(typeof j.error === "string" ? j.error : "Could not load dashboard")
        return
      }
      setData(j as DashboardData)
    } catch {
      setErr("Network error")
    }
  }, [expertUserId])

  useEffect(() => {
    void load()
    const t = setInterval(() => void load(), 15000)
    return () => clearInterval(t)
  }, [load])

  const card =
    "rounded-2xl border border-[#e4d5c1] bg-[#f8f1e6] p-6 shadow-sm"

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <div>
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl">Dashboard</h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            New customer threads and your impact at a glance. Open Chat to reply and manage conversations.
          </p>
        </div>
      </div>

      {err && (
        <p className="mt-6 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {err}
        </p>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className={card}>
          <div className="flex items-center gap-2 text-primary">
            <Inbox className="h-5 w-5 shrink-0" />
            <span className="text-sm font-semibold text-foreground">New requests</span>
          </div>
          <p className="mt-4 font-serif text-4xl font-bold tabular-nums text-foreground">
            {data != null ? data.newThreads : "…"}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Unclaimed threads waiting for your first reply.
          </p>
        </div>
        <div className={card}>
          <div className="flex items-center gap-2 text-primary">
            <Users className="h-5 w-5 shrink-0" />
            <span className="text-sm font-semibold text-foreground">Customers you helped</span>
          </div>
          <p className="mt-4 font-serif text-4xl font-bold tabular-nums text-foreground">
            {data != null ? data.uniqueCustomersHelped : "…"}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Distinct people after you claimed their consultation.
          </p>
        </div>
      </div>

      <section className="mt-10">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="font-serif text-xl font-semibold text-foreground">Inbox preview</h2>
          <Button variant="ghost" size="sm" className="rounded-full text-primary" asChild>
            <Link href="/expert/chat">View all in Chat</Link>
          </Button>
        </div>
        <div className="overflow-hidden rounded-2xl border border-[#e4d5c1] bg-card shadow-sm">
          <ul className="divide-y divide-border">
            {!data?.recentThreads?.length && data != null && (
              <li className="px-4 py-12 text-center text-sm text-muted-foreground">
                No active threads right now.
              </li>
            )}
            {data == null && !err && (
              <li className="px-4 py-12 text-center text-sm text-muted-foreground">Loading…</li>
            )}
            {data?.recentThreads.map((t) => {
              const label = t.customer.full_name?.trim() || t.customer.email
              return (
                <li
                  key={t.id}
                  className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{label}</p>
                    <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                      {t.lastMessagePreview || "No preview"}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
                      {t.status === "open" ? "New" : t.status === "claimed" ? "In progress" : t.status}
                    </span>
                    <Button size="sm" className="rounded-full" asChild>
                      <Link href={`/expert/chat?thread=${t.id}`}>Open</Link>
                    </Button>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </section>
    </div>
  )
}

"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { CheckCircle2, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useExpertUserId } from "@/components/expert/expert-user-context"

type HistThread = {
  id: number
  userId: number
  lastMessagePreview: string | null
  updatedAt: string
  createdAt: string
  customer: { id: number; full_name: string; email: string }
  recommendations: {
    id: number
    body: string
    product: { id: number; name: string; slug: string } | null
    createdAt: string
  }[]
}

export default function ExpertHistoryPage() {
  const expertUserId = useExpertUserId()
  const [threads, setThreads] = useState<HistThread[]>([])
  const [err, setErr] = useState<string | null>(null)

  const load = useCallback(async () => {
    setErr(null)
    try {
      const res = await fetch(`/api/expert/history?expertUserId=${expertUserId}`)
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setErr(typeof data.error === "string" ? data.error : "Failed to load history")
        return
      }
      setThreads((data.threads as HistThread[]) || [])
    } catch {
      setErr("Network error")
    }
  }, [expertUserId])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="mt-1 h-8 w-8 shrink-0 text-primary" />
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">History</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Solved consultations and recommendations you sent.
          </p>
        </div>
      </div>

      {err && (
        <p className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {err}
        </p>
      )}

      <ul className="mt-8 space-y-4">
        {threads.length === 0 && !err && (
          <li className="rounded-2xl border border-dashed border-[#e4d5c1] bg-[#f8f1e6]/50 px-4 py-12 text-center text-sm text-muted-foreground">
            No solved consultations yet.
          </li>
        )}
        {threads.map((t) => {
          const name = t.customer.full_name?.trim() || t.customer.email
          return (
            <li key={t.id} className="rounded-2xl border border-[#e4d5c1] bg-card p-4 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-medium text-foreground">{name}</p>
                  <p className="text-xs text-muted-foreground">{t.customer.email}</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t.lastMessagePreview || "—"}
                  </p>
                </div>
                <Button size="sm" variant="outline" className="shrink-0 rounded-full" asChild>
                  <Link href={`/expert/chat?thread=${t.id}`}>Open transcript</Link>
                </Button>
              </div>
              {t.recommendations.length > 0 && (
                <div className="mt-3 border-t border-border pt-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Recommendations
                  </p>
                  <ul className="mt-2 space-y-2 text-sm">
                    {t.recommendations.map((r) => (
                      <li key={r.id} className="rounded-lg bg-muted/40 px-2 py-2">
                        <p className="whitespace-pre-wrap text-foreground">{r.body}</p>
                        {r.product && (
                          <Link
                            href={`/product/${encodeURIComponent(r.product.slug)}`}
                            className="mt-1 inline-flex items-center gap-1 text-xs text-primary underline"
                          >
                            <Package className="h-3 w-3" />
                            {r.product.name}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

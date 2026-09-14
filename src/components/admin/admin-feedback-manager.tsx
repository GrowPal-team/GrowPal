"use client"

import { useMemo, useState } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { CommunityFeedbackItem } from "@/lib/community-feedback"
import { StarRating } from "@/components/feedback/star-rating"

type Props = {
  initialFeedback: CommunityFeedbackItem[]
}

export function AdminFeedbackManager({ initialFeedback }: Props) {
  const [feedback, setFeedback] = useState(initialFeedback)
  const [query, setQuery] = useState("")
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return feedback

    return feedback.filter((item) =>
      [item.name, item.email, item.title || "", item.body].some((value) => value.toLowerCase().includes(normalized))
    )
  }, [feedback, query])

  async function deleteFeedback(id: number) {
    setDeletingId(id)
    const response = await fetch(`/api/community-feedback/${id}`, { method: "DELETE" })
    if (!response.ok) {
      setDeletingId(null)
      return
    }

    setFeedback((current) => current.filter((item) => item.id !== id))
    setDeletingId(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-3xl border border-black/10 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-slate-900">Community feedback</h2>
          <p className="mt-1 text-sm text-slate-500">Review customer comments and remove anything that should not stay public.</p>
        </div>
        <div className="w-full md:max-w-sm">
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by customer, email, or content" />
        </div>
      </div>

      <div className="grid gap-4">
        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-black/10 bg-white px-6 py-12 text-center text-sm text-slate-500">
            No feedback matches the current search.
          </div>
        ) : (
          filtered.map((item) => (
            <article key={item.id} className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-serif text-xl font-semibold text-slate-900">{item.title || "Untitled feedback"}</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {item.name} · {item.email}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <StarRating value={item.rating} readOnly starClassName="h-4 w-4" />
                    <span className="text-sm font-medium text-slate-500">{item.rating.toFixed(1)} / 5</span>
                  </div>

                  <p className="max-w-3xl text-sm leading-7 text-slate-600">{item.body}</p>
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                    Posted {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="gap-2 rounded-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  disabled={deletingId === item.id}
                  onClick={() => void deleteFeedback(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  {deletingId === item.id ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  )
}

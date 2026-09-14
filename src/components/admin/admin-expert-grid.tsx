"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import type { AdminExpertRow } from "@/lib/admin-db"
import { Input } from "@/components/ui/input"

type Props = {
  initialExperts: AdminExpertRow[]
}

function approvalBadge(status: string) {
  const palette =
    status === "approved"
      ? "bg-[#eef4ee] text-[#2f6f4e]"
      : status === "pending"
        ? "bg-amber-100 text-amber-800"
        : "bg-red-100 text-red-700"

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${palette}`}>{status}</span>
  )
}

export function AdminExpertGrid({ initialExperts }: Props) {
  const router = useRouter()
  const [experts, setExperts] = useState(initialExperts)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [approvalFilter, setApprovalFilter] = useState("all")

  async function updateApprovalStatus(userId: number, approvalStatus: "approved" | "pending" | "rejected") {
    setBusyId(userId)
    setError(null)

    const response = await fetch(`/api/admin/experts/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approvalStatus }),
    })

    const result = await response.json().catch(() => ({}))
    if (!response.ok) {
      setError(typeof result.error === "string" ? result.error : "Failed to update expert status.")
      setBusyId(null)
      return
    }

    setExperts((current) =>
      current.map((expert) => (expert.id === userId ? { ...expert, approval_status: approvalStatus } : expert))
    )
    setBusyId(null)
    router.refresh()
  }

  const filteredExperts = useMemo(() => {
    const q = search.trim().toLowerCase()
    return experts.filter((expert) => {
      const matchesSearch =
        q === "" ||
        expert.full_name.toLowerCase().includes(q) ||
        expert.email.toLowerCase().includes(q) ||
        (expert.display_name || "").toLowerCase().includes(q)
      const matchesApproval = approvalFilter === "all" || expert.approval_status === approvalFilter
      return matchesSearch && matchesApproval
    })
  }, [experts, search, approvalFilter])

  return (
    <div className="space-y-4">
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="rounded-[2rem] border border-black/8 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1.6fr)_220px]">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, email, or display name"
            className="rounded-xl"
          />
          <select
            value={approvalFilter}
            onChange={(event) => setApprovalFilter(event.target.value)}
            className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
          >
            <option value="all">All approval states</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <p className="mt-3 text-sm text-slate-500">
          Showing <span className="font-semibold text-slate-800">{filteredExperts.length}</span> of{" "}
          <span className="font-semibold text-slate-800">{experts.length}</span> experts
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredExperts.map((expert) => {
          const isBusy = busyId === expert.id
          return (
            <article key={expert.id} className="rounded-[2rem] border border-black/8 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2f6f4e]">Expert account</p>
                  <h2 className="mt-2 font-serif text-2xl font-semibold text-slate-900">{expert.full_name}</h2>
                </div>
                {approvalBadge(expert.approval_status)}
              </div>

              <dl className="mt-5 space-y-3 text-sm">
                <div>
                  <dt className="text-slate-500">Email</dt>
                  <dd className="font-medium text-slate-800">{expert.email}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Joined</dt>
                  <dd className="font-medium text-slate-800">{new Date(expert.created_at).toLocaleDateString()}</dd>
                </div>
              </dl>

              <div className="mt-6 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void updateApprovalStatus(expert.id, "approved")}
                  disabled={isBusy}
                  className="rounded-full bg-[#214e36] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#2b6648] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isBusy && expert.approval_status !== "approved" ? "Saving..." : "Approve"}
                </button>
                <button
                  type="button"
                  onClick={() => void updateApprovalStatus(expert.id, "pending")}
                  disabled={isBusy}
                  className="rounded-full border border-amber-200 px-4 py-2 text-xs font-semibold text-amber-800 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isBusy && expert.approval_status !== "pending" ? "Saving..." : "Pending"}
                </button>
                <button
                  type="button"
                  onClick={() => void updateApprovalStatus(expert.id, "rejected")}
                  disabled={isBusy}
                  className="rounded-full border border-red-200 px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isBusy && expert.approval_status !== "rejected" ? "Saving..." : "Reject"}
                </button>
              </div>
            </article>
          )
        })}
      </div>
      {filteredExperts.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-black/10 bg-white/70 p-10 text-center text-sm text-slate-500">
          No experts match the current search and filters.
        </div>
      ) : null}
    </div>
  )
}

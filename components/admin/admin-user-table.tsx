"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import type { AdminUserRow } from "@/lib/admin-db"
import { Input } from "@/components/ui/input"

type Props = {
  initialUsers: AdminUserRow[]
  currentAdminId: number
}

function roleBadge(role: string) {
  const palette =
    role === "admin"
      ? "bg-amber-100 text-amber-800"
      : role === "expert"
        ? "bg-emerald-100 text-emerald-800"
        : "bg-slate-100 text-slate-700"

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${palette}`}>{role}</span>
  )
}

export function AdminUserTable({ initialUsers, currentAdminId }: Props) {
  const router = useRouter()
  const [users, setUsers] = useState(initialUsers)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")

  async function updateStatus(userId: number, status: "active" | "blocked") {
    setBusyId(userId)
    setError(null)

    const response = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })

    const result = await response.json().catch(() => ({}))
    if (!response.ok) {
      setError(typeof result.error === "string" ? result.error : "Failed to update user status.")
      setBusyId(null)
      return
    }

    setUsers((current) => current.map((user) => (user.id === userId ? { ...user, status } : user)))
    setBusyId(null)
    router.refresh()
  }

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase()
    return users.filter((user) => {
      const matchesSearch =
        q === "" ||
        user.full_name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        String(user.id).includes(q)
      const matchesRole = roleFilter === "all" || user.role === roleFilter
      return matchesSearch && matchesRole
    })
  }, [users, search, roleFilter])

  return (
    <div className="space-y-4">
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="rounded-[2rem] border border-black/8 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1.6fr)_180px]">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, email, or id"
            className="rounded-xl"
          />
          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
          >
            <option value="all">All roles</option>
            <option value="user">Users</option>
            <option value="expert">Experts</option>
            <option value="admin">Admins</option>
          </select>
        </div>
        <p className="mt-3 text-sm text-slate-500">
          Showing <span className="font-semibold text-slate-800">{filteredUsers.length}</span> of{" "}
          <span className="font-semibold text-slate-800">{users.length}</span> users
        </p>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-black/8 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-black/8 text-left text-sm">
          <thead className="bg-[#f8f5ef] text-slate-600">
            <tr>
              <th className="px-5 py-4 font-medium">User</th>
              <th className="px-5 py-4 font-medium">Email</th>
              <th className="px-5 py-4 font-medium">Role</th>
              <th className="px-5 py-4 font-medium">Verified</th>
              <th className="px-5 py-4 font-medium">Created</th>
              <th className="px-5 py-4 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 bg-white">
            {filteredUsers.map((user) => {
              const isBusy = busyId === user.id
              const canBlock = user.id !== currentAdminId

              return (
                <tr key={user.id}>
                  <td className="px-5 py-4 font-medium text-slate-900">{user.full_name}</td>
                  <td className="px-5 py-4 text-slate-600">{user.email}</td>
                  <td className="px-5 py-4">{roleBadge(user.role)}</td>
                  <td className="px-5 py-4 text-slate-600">{user.email_verified === 0 ? "No" : "Yes"}</td>
                  <td className="px-5 py-4 text-slate-600">{new Date(user.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-4">
                    {user.status === "blocked" ? (
                      <button
                        type="button"
                        onClick={() => void updateStatus(user.id, "active")}
                        disabled={isBusy}
                        className="rounded-full bg-[#214e36] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#2b6648] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isBusy ? "Saving..." : "Activate"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void updateStatus(user.id, "blocked")}
                        disabled={isBusy || !canBlock}
                        className="rounded-full border border-red-200 px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {user.id === currentAdminId ? "Current admin" : isBusy ? "Saving..." : "Block"}
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-500">
                  No users match the current search and filters.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}

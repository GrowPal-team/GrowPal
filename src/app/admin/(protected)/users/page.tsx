import { AdminUserTable } from "@/components/admin/admin-user-table"
import { getAdminUsers } from "@/lib/admin-db"
import { getServerSession } from "@/lib/session-server"

export default async function AdminUsersPage() {
  const [session, users] = await Promise.all([getServerSession(), getAdminUsers()])

  return (
    <section className="space-y-5">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Admin</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold">Users</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Review registered accounts, filter by role, and control access directly from one place.
        </p>
      </div>

      <AdminUserTable initialUsers={users} currentAdminId={session?.id ?? 0} />
    </section>
  )
}

import { AdminExpertGrid } from "@/components/admin/admin-expert-grid"
import { getAdminExperts } from "@/lib/admin-db"

export default async function AdminExpertsPage() {
  const experts = await getAdminExperts()

  return (
    <section className="space-y-5">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Admin</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold">Experts</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          This page gives the admin a simple review list for expert and agricultural engineer accounts, with direct
          approve, pending, and reject actions plus search and approval filters.
        </p>
      </div>

      <AdminExpertGrid initialExperts={experts} />

      {experts.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-black/10 bg-white/70 p-10 text-center text-sm text-slate-500">
          No expert accounts found yet.
        </div>
      ) : null}
    </section>
  )
}

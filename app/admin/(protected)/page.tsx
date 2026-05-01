import Link from "next/link"
import { getAdminAnalytics, getAdminSummary, getAdminUsers } from "@/lib/admin-db"

const statCardBase = "rounded-[1.75rem] border border-black/8 bg-white p-5 shadow-sm"

export default async function AdminDashboardPage() {
  const [summary, analytics, recentUsers] = await Promise.all([
    getAdminSummary(),
    getAdminAnalytics(),
    getAdminUsers(6),
  ])

  const stats = [
    { label: "Total users", value: summary.totalUsers, hint: "All registered accounts" },
    { label: "Blocked users", value: summary.blockedUsers, hint: "Accounts blocked by admin" },
    { label: "Pending experts", value: summary.pendingExperts, hint: "Expert approvals waiting on review" },
    { label: "Orders", value: summary.totalOrders, hint: "Current order records" },
  ]

  return (
    <div className="space-y-8">
      <section className="grid gap-5 lg:grid-cols-[1.5fr_0.9fr]">
        <article className="rounded-[2rem] bg-[#214e36] px-6 py-8 text-white shadow-lg lg:px-8">
          <p className="text-sm uppercase tracking-[0.22em] text-white/70">Admin panel</p>
          <h1 className="mt-3 font-serif text-3xl font-semibold md:text-4xl">GrowPal Administration</h1>
          <p className="mt-3 max-w-2xl text-sm text-white/80 md:text-base">
            Monitor platform activity, control account access, and manage the product catalog from one workspace.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/admin/users"
              className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-[#214e36] transition hover:bg-[#f4f0e8]"
            >
              Users
            </Link>
            <Link
              href="/admin/experts"
              className="rounded-full border border-white/25 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Experts
            </Link>
            <Link
              href="/admin/products"
              className="rounded-full border border-white/25 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Products
            </Link>
          </div>
        </article>

        <article className="rounded-[2rem] border border-black/8 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-2xl font-semibold text-slate-900">Quick snapshot</h2>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl bg-[#f8f5ef] px-4 py-4">
                <p className="text-sm text-slate-500">{stat.label}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{stat.value}</p>
                <p className="mt-1 text-xs text-slate-500">{stat.hint}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className={statCardBase}>
          <div>
            <h2 className="font-serif text-2xl font-semibold text-slate-900">Catalog overview</h2>
            <p className="mt-1 text-sm text-slate-500">Core numbers for products and catalog structure.</p>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-[#f8f5ef] px-4 py-4">
              <p className="text-sm text-slate-500">Products</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{analytics.plants.totalProducts}</p>
            </div>
            <div className="rounded-2xl bg-[#f8f5ef] px-4 py-4">
              <p className="text-sm text-slate-500">Out of stock</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{analytics.plants.outOfStockProducts}</p>
            </div>
            <div className="rounded-2xl bg-[#f8f5ef] px-4 py-4">
              <p className="text-sm text-slate-500">Categories</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{analytics.plants.categories}</p>
            </div>
          </div>
        </article>

        <article className={statCardBase}>
          <div>
            <h2 className="font-serif text-2xl font-semibold text-slate-900">Order overview</h2>
            <p className="mt-1 text-sm text-slate-500">Quick read on revenue and checkout flow.</p>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-[#f8f5ef] px-4 py-4">
              <p className="text-sm text-slate-500">Revenue</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {analytics.payments.grossRevenueIls.toFixed(2)}
              </p>
              <p className="mt-1 text-xs text-slate-500">ILS</p>
            </div>
            <div className="rounded-2xl bg-[#f8f5ef] px-4 py-4">
              <p className="text-sm text-slate-500">Average order</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {analytics.payments.averageOrderValueIls.toFixed(2)}
              </p>
              <p className="mt-1 text-xs text-slate-500">ILS</p>
            </div>
            <div className="rounded-2xl bg-[#f8f5ef] px-4 py-4">
              <p className="text-sm text-slate-500">Paid / pending</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {analytics.payments.paidOrders} / {analytics.payments.pendingOrders}
              </p>
            </div>
          </div>
        </article>
      </section>

      <section>
        <article className="rounded-[2rem] border border-black/8 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-serif text-2xl font-semibold">Recent signups</h2>
              <p className="mt-1 text-sm text-slate-500">Latest users added to the platform.</p>
            </div>
            <Link href="/admin/users" className="text-sm font-medium text-[#2f6f4e] hover:underline">
              View all
            </Link>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-black/8">
            <table className="min-w-full divide-y divide-black/8 text-left text-sm">
              <thead className="bg-[#f8f5ef] text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 bg-white">
                {recentUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-3 font-medium text-slate-900">{user.full_name}</td>
                    <td className="px-4 py-3 text-slate-600">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-[#eef4ee] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#2f6f4e]">
                        {user.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </div>
  )
}

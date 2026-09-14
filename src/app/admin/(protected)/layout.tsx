import Link from "next/link"
import { redirect } from "next/navigation"
import { AdminSignOut } from "@/components/admin/admin-sign-out"
import { getServerSession } from "@/lib/session-server"

const adminLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/experts", label: "Experts" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/feedback", label: "Feedback" },
]

export default async function AdminProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getServerSession()

  if (!session || session.role !== "admin") {
    redirect("/login?next=/admin")
  }

  return (
    <div className="min-h-screen bg-[#f6f1e8] text-slate-900">
      <header className="border-b border-black/10 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 lg:px-8">
          <div>
            <Link href="/admin" className="font-serif text-2xl font-semibold">
              GrowPal Admin
            </Link>
            <p className="text-sm text-slate-500">{session.email}</p>
          </div>

          <div className="flex items-center gap-3">
            <nav className="hidden items-center gap-2 md:flex">
              {adminLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-[#eef4ee] hover:text-[#2f6f4e]"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <AdminSignOut />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">{children}</main>
    </div>
  )
}

import { AdminProductManager } from "@/components/admin/admin-product-manager"
import { getAdminCategories, getAdminProducts } from "@/lib/admin-db"

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([getAdminProducts(), getAdminCategories()])

  return (
    <section className="space-y-5">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Admin</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold">Products</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          Manage the catalog from here: add new products using the same core criteria shown in the shop, upload a
          product image, edit prices and inventory, deactivate listings, or delete products that are not linked to
          existing platform records.
        </p>
      </div>

      <AdminProductManager initialProducts={products} categories={categories} />
    </section>
  )
}

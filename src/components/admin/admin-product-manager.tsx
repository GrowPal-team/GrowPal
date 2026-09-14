"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Pencil, Plus, Trash2 } from "lucide-react"
import type { AdminCategoryRow, AdminProductRow } from "@/lib/admin-db"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

type Props = {
  initialProducts: AdminProductRow[]
  categories: AdminCategoryRow[]
}

type ProductFormState = {
  name: string
  slug: string
  description: string
  priceIls: string
  imageUrl: string
  categoryId: string
  sunExposure: string
  waterLevel: string
  maintenanceLevel: string
  weightLevel: string
  climateZones: string
  seasons: string
  ecoScore: string
  spaceTypes: string
  stockQuantity: string
}

const defaultForm: ProductFormState = {
  name: "",
  slug: "",
  description: "",
  priceIls: "",
  imageUrl: "",
  categoryId: "",
  sunExposure: "Full_Sun",
  waterLevel: "Medium",
  maintenanceLevel: "Medium",
  weightLevel: "Medium",
  climateZones: "",
  seasons: "",
  ecoScore: "0",
  spaceTypes: "",
  stockQuantity: "0",
}

function formatCurrency(value: number | string) {
  return `${Number(value).toFixed(2)} ILS`
}

function toFormState(product: AdminProductRow): ProductFormState {
  return {
    name: product.name,
    slug: product.slug,
    description: product.description || "",
    priceIls: String(product.price_ils),
    imageUrl: product.image_url || "",
    categoryId: String(product.category_id),
    sunExposure: product.sun_exposure,
    waterLevel: product.water_level,
    maintenanceLevel: product.maintenance_level,
    weightLevel: product.weight_level,
    climateZones: product.climate_zones,
    seasons: product.seasons,
    ecoScore: String(product.eco_score),
    spaceTypes: product.space_types,
    stockQuantity: String(product.stock_quantity ?? 0),
  }
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function AdminProductManager({ initialProducts, categories }: Props) {
  const router = useRouter()
  const [products, setProducts] = useState(initialProducts)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<ProductFormState>(defaultForm)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    setProducts(initialProducts)
  }, [initialProducts])

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase()
    return products.filter((product) => {
      const matchesSearch =
        q === "" ||
        product.name.toLowerCase().includes(q) ||
        product.slug.toLowerCase().includes(q) ||
        product.category_name.toLowerCase().includes(q) ||
        String(product.id).includes(q)
      const matchesCategory = categoryFilter === "all" || String(product.category_id) === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [products, search, categoryFilter])

  function openCreateDialog() {
    setEditingId(null)
    setForm({ ...defaultForm, categoryId: categories[0] ? String(categories[0].id) : "" })
    setError(null)
    setDialogOpen(true)
  }

  function openEditDialog(product: AdminProductRow) {
    setEditingId(product.id)
    setForm(toFormState(product))
    setError(null)
    setDialogOpen(true)
  }

  function updateForm<K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) {
    setForm((current) => {
      const next = { ...current, [key]: value }
      if (key === "name" && (!current.slug || current.slug === slugify(current.name))) {
        next.slug = slugify(String(value))
      }
      return next
    })
  }

  async function submitForm() {
    setSaving(true)
    setError(null)

    const payload = {
      ...form,
      priceIls: Number(form.priceIls),
      categoryId: Number(form.categoryId),
      ecoScore: Number(form.ecoScore),
      stockQuantity: Number(form.stockQuantity),
    }

    const url = editingId == null ? "/api/admin/products" : `/api/admin/products/${editingId}`
    const method = editingId == null ? "POST" : "PATCH"

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    const result = await response.json().catch(() => ({}))
    if (!response.ok) {
      setError(typeof result.error === "string" ? result.error : "Failed to save product.")
      setSaving(false)
      return
    }

    setSaving(false)
    setDialogOpen(false)
    router.refresh()
  }

  async function uploadImage(file: File) {
    setUploadingImage(true)
    setError(null)

    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch("/api/admin/uploads/product-image", {
      method: "POST",
      body: formData,
    })

    const result = await response.json().catch(() => ({}))
    if (!response.ok) {
      setError(typeof result.error === "string" ? result.error : "Image upload failed.")
      setUploadingImage(false)
      return
    }

    updateForm("imageUrl", String(result.asset?.url || ""))
    setUploadingImage(false)
  }

  async function deleteProduct(productId: number) {
    const confirmed = window.confirm("Delete this product? This only works when it has no linked orders, wishlists, or reviews.")
    if (!confirmed) return

    setBusyId(productId)
    setError(null)

    const response = await fetch(`/api/admin/products/${productId}`, {
      method: "DELETE",
    })
    const result = await response.json().catch(() => ({}))

    if (!response.ok) {
      setError(typeof result.error === "string" ? result.error : "Failed to delete product.")
      setBusyId(null)
      return
    }

    setProducts((current) => current.filter((product) => product.id !== productId))
    setBusyId(null)
    router.refresh()
  }

  return (
    <div className="space-y-4">
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="rounded-[2rem] border border-black/8 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="grid flex-1 gap-3 md:grid-cols-[minmax(0,1.6fr)_220px]">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, slug, category, or id"
              className="rounded-xl"
            />
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
            >
              <option value="all">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={String(category.id)}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <Button type="button" className="rounded-full" onClick={openCreateDialog}>
            <Plus className="h-4 w-4" />
            Add product
          </Button>
        </div>
        <p className="mt-3 text-sm text-slate-500">
          Showing <span className="font-semibold text-slate-800">{filteredProducts.length}</span> of{" "}
          <span className="font-semibold text-slate-800">{products.length}</span> products
        </p>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-black/8 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-black/8 text-left text-sm">
          <thead className="bg-[#f8f5ef] text-slate-600">
            <tr>
              <th className="px-5 py-4 font-medium">Product</th>
              <th className="px-5 py-4 font-medium">Category</th>
              <th className="px-5 py-4 font-medium">Price</th>
              <th className="px-5 py-4 font-medium">Stock</th>
              <th className="px-5 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 bg-white">
            {filteredProducts.map((product) => {
              const isBusy = busyId === product.id
              return (
                <tr key={product.id}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-14 w-14 overflow-hidden rounded-xl border border-black/10 bg-[#f8f5ef]">
                        {product.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[11px] text-slate-400">
                            No image
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{product.name}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          #{product.id} · {product.slug}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{product.category_name}</td>
                  <td className="px-5 py-4 text-slate-600">{formatCurrency(product.price_ils)}</td>
                  <td className="px-5 py-4 text-slate-600">{product.stock_quantity ?? 0}</td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => openEditDialog(product)}>
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-full border-red-200 text-red-700 hover:bg-red-50 hover:text-red-700"
                        onClick={() => void deleteProduct(product.id)}
                        disabled={isBusy}
                      >
                        <Trash2 className="h-4 w-4" />
                        {isBusy ? "Deleting..." : "Delete"}
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-sm text-slate-500">
                  No products match the current search and filters.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-[#d8d1c2] bg-[#f7f2e8] sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>{editingId == null ? "Add product" : "Edit product"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-5 py-2 lg:grid-cols-[1.35fr_0.95fr]">
            <section className="space-y-4 rounded-[1.5rem] border border-[#d8d1c2] bg-white/70 p-5">
              <div>
                <h3 className="font-serif text-xl font-semibold text-slate-900">Basic information</h3>
                <p className="mt-1 text-sm text-slate-500">Main details that identify the product in the catalog.</p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Product name</label>
                  <Input value={form.name} onChange={(event) => updateForm("name", event.target.value)} className="rounded-xl" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Slug</label>
                  <Input value={form.slug} onChange={(event) => updateForm("slug", slugify(event.target.value))} className="rounded-xl" />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Description</label>
                <Textarea
                  value={form.description}
                  onChange={(event) => updateForm("description", event.target.value)}
                  className="min-h-28 rounded-xl"
                />
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Price (ILS)</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.priceIls}
                    onChange={(event) => updateForm("priceIls", event.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Stock quantity</label>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={form.stockQuantity}
                    onChange={(event) => updateForm("stockQuantity", event.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Eco score</label>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={form.ecoScore}
                    onChange={(event) => updateForm("ecoScore", event.target.value)}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Category</label>
                <select
                  value={form.categoryId}
                  onChange={(event) => updateForm("categoryId", event.target.value)}
                  className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={String(category.id)}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </section>

            <section className="space-y-4 rounded-[1.5rem] border border-[#d8d1c2] bg-white/70 p-5">
              <div>
                <h3 className="font-serif text-xl font-semibold text-slate-900">Product image</h3>
                <p className="mt-1 text-sm text-slate-500">Upload an image or paste a URL that should appear in the shop.</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                >
                  {uploadingImage ? "Uploading..." : "Upload image"}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (file) void uploadImage(file)
                    event.currentTarget.value = ""
                  }}
                />
              </div>

              <Input
                value={form.imageUrl}
                onChange={(event) => updateForm("imageUrl", event.target.value)}
                placeholder="/uploads/products/example.jpg or external URL"
                className="rounded-xl"
              />

              <div className="overflow-hidden rounded-[1.25rem] border border-[#d8d1c2] bg-[#efe8da] p-3">
                {form.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.imageUrl} alt="Product preview" className="h-56 w-full rounded-xl object-cover" />
                ) : (
                  <div className="flex h-56 items-center justify-center rounded-xl border border-dashed border-[#cfc5b2] text-sm text-slate-500">
                    Image preview will appear here
                  </div>
                )}
              </div>
            </section>

            <section className="space-y-4 rounded-[1.5rem] border border-[#d8d1c2] bg-white/70 p-5 lg:col-span-2">
              <div>
                <h3 className="font-serif text-xl font-semibold text-slate-900">Shop criteria</h3>
                <p className="mt-1 text-sm text-slate-500">These values drive how the product is filtered and presented in the shop.</p>
              </div>

              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Sun exposure</label>
                  <select
                    value={form.sunExposure}
                    onChange={(event) => updateForm("sunExposure", event.target.value)}
                    className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
                  >
                    <option value="Full_Sun">Full Sun</option>
                    <option value="Partial_Sun">Partial Sun</option>
                    <option value="Partial_Shade">Partial Shade</option>
                    <option value="Full_Shade">Full Shade</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Water level</label>
                  <select
                    value={form.waterLevel}
                    onChange={(event) => updateForm("waterLevel", event.target.value)}
                    className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Maintenance</label>
                  <select
                    value={form.maintenanceLevel}
                    onChange={(event) => updateForm("maintenanceLevel", event.target.value)}
                    className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Weight</label>
                  <select
                    value={form.weightLevel}
                    onChange={(event) => updateForm("weightLevel", event.target.value)}
                    className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
                  >
                    <option value="Light">Light</option>
                    <option value="Medium">Medium</option>
                    <option value="Heavy">Heavy</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Climate zones</label>
                  <Input
                    value={form.climateZones}
                    onChange={(event) => updateForm("climateZones", event.target.value)}
                    placeholder="Zone 1, Zone 2"
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Seasons</label>
                  <Input
                    value={form.seasons}
                    onChange={(event) => updateForm("seasons", event.target.value)}
                    placeholder="Spring, Summer"
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Space types</label>
                <Input
                  value={form.spaceTypes}
                  onChange={(event) => updateForm("spaceTypes", event.target.value)}
                  placeholder="Indoor, Balcony"
                  className="rounded-xl"
                />
              </div>
            </section>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={() => void submitForm()} disabled={saving}>
              {saving ? "Saving..." : editingId == null ? "Create product" : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

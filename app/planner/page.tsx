"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ArrowRight, Check, Upload } from "lucide-react"
import { clientIsGuest } from "@/lib/session-client"
import { getStoredUser } from "@/lib/shopping"

type UploadedAsset = {
  url: string
  name: string
  contentType: string
  uploadedAt: string
}

type FormState = {
  spaceType: string
  sizeM2: string
  sunExposure: string
  waterAvailability: string
  budgetLevel: string
  goal: string
  notes: string
}

const defaultForm: FormState = {
  spaceType: "",
  sizeM2: "",
  sunExposure: "",
  waterAvailability: "",
  budgetLevel: "",
  goal: "",
  notes: "",
}

export default function PlannerPage() {
  const router = useRouter()
  const [authReady, setAuthReady] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [photos, setPhotos] = useState<UploadedAsset[]>([])
  const [form, setForm] = useState<FormState>(defaultForm)

  useEffect(() => {
    if (clientIsGuest()) {
      router.replace("/login?next=/planner")
      return
    }
    setAuthReady(true)
  }, [router])

  useEffect(() => {
    if (!authReady) return
    const userId = getStoredUser()?.id
    if (!userId) return

    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/my-space?userId=${userId}`)
        const data = await res.json().catch(() => ({}))
        if (!res.ok || cancelled) return
        if (data.space) {
          setForm({
            spaceType: data.space.spaceType || "",
            sizeM2: data.space.sizeM2 != null ? String(data.space.sizeM2) : "",
            sunExposure: data.space.sunExposure || "",
            waterAvailability: data.space.waterAvailability || "",
            budgetLevel: data.space.budgetLevel || "",
            goal: data.space.goal || "",
            notes: data.extras?.notes || "",
          })
        } else if (data.extras?.notes) {
          setForm((prev) => ({ ...prev, notes: data.extras.notes }))
        }
        setPhotos(Array.isArray(data.extras?.photos) ? data.extras.photos : [])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [authReady])

  const basedOnProfileText = useMemo(() => {
    if (!form.spaceType || !form.sunExposure || !form.goal) return "Save your My Space profile to unlock better expert guidance."
    return `Based on your space profile, your expert will review your ${form.spaceType.toLowerCase()} setup, ${form.sunExposure
      .replaceAll("_", " ")
      .toLowerCase()} light, and ${form.goal.replaceAll("_", " ").toLowerCase()} goals.`
  }, [form.goal, form.spaceType, form.sunExposure])

  async function uploadFiles(files: FileList | null) {
    if (!files?.length) return
    setUploading(true)
    setError(null)
    try {
      const uploaded: UploadedAsset[] = []
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append("file", file)
        const res = await fetch("/api/expert/uploads", {
          method: "POST",
          body: formData,
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok || !data.asset) {
          throw new Error(typeof data.error === "string" ? data.error : "Image upload failed")
        }
        uploaded.push(data.asset as UploadedAsset)
      }
      setPhotos((prev) => [...prev, ...uploaded])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Image upload failed")
    } finally {
      setUploading(false)
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const userId = getStoredUser()?.id
    if (!userId) return

    setSaving(true)
    setError(null)

    try {
      const res = await fetch("/api/my-space", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          ...form,
          sizeM2: Number(form.sizeM2),
          photos,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not save My Space")
        return
      }
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 1800)
    } finally {
      setSaving(false)
    }
  }

  if (!authReady || loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex flex-1 items-center justify-center bg-background px-4 py-16">
          <p className="text-muted-foreground">Loading…</p>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-background">
        <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div className="text-center sm:text-left">
                <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl">My Space</h1>
                <p className="mt-3 text-muted-foreground">
                  Fill in your space details so your expert can review them, reply better, and tailor suggestions to your setup.
                </p>
              </div>

              {error && (
                <div className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <form className="mt-8 flex flex-col gap-6" onSubmit={onSubmit}>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label className="text-sm font-medium">Space Type</Label>
                    <Select value={form.spaceType} onValueChange={(value) => setForm((prev) => ({ ...prev, spaceType: value }))}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select space type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Indoor">Indoor</SelectItem>
                        <SelectItem value="Balcony">Balcony</SelectItem>
                        <SelectItem value="Garden">Garden</SelectItem>
                        <SelectItem value="Rooftop">Rooftop</SelectItem>
                        <SelectItem value="Office">Office</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label className="text-sm font-medium">Space Size (m²)</Label>
                    <Input
                      type="number"
                      min="1"
                      step="0.1"
                      value={form.sizeM2}
                      onChange={(e) => setForm((prev) => ({ ...prev, sizeM2: e.target.value }))}
                      placeholder="e.g. 12"
                      className="rounded-xl"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label className="text-sm font-medium">Sun Exposure</Label>
                    <Select
                      value={form.sunExposure}
                      onValueChange={(value) => setForm((prev) => ({ ...prev, sunExposure: value }))}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select sun exposure" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Full_Sun">Full Sun</SelectItem>
                        <SelectItem value="Partial_Sun">Partial Sun</SelectItem>
                        <SelectItem value="Partial_Shade">Partial Shade</SelectItem>
                        <SelectItem value="Full_Shade">Full Shade</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label className="text-sm font-medium">Budget</Label>
                    <Select
                      value={form.budgetLevel}
                      onValueChange={(value) => setForm((prev) => ({ ...prev, budgetLevel: value }))}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select budget range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Budget-friendly</SelectItem>
                        <SelectItem value="Medium">Balanced</SelectItem>
                        <SelectItem value="High">Premium</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label className="text-sm font-medium">Water Availability</Label>
                    <Select
                      value={form.waterAvailability}
                      onValueChange={(value) => setForm((prev) => ({ ...prev, waterAvailability: value }))}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select water access" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Limited">Limited</SelectItem>
                        <SelectItem value="Moderate">Moderate</SelectItem>
                        <SelectItem value="Abundant">Abundant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label className="text-sm font-medium">Goal</Label>
                    <Select value={form.goal} onValueChange={(value) => setForm((prev) => ({ ...prev, goal: value }))}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select your goal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Decor">Decor &amp; aesthetics</SelectItem>
                        <SelectItem value="Food">Food &amp; herbs</SelectItem>
                        <SelectItem value="Cooling">Cooling &amp; shade</SelectItem>
                        <SelectItem value="Air_Quality">Air quality</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium">Extra notes for your expert</Label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                    placeholder="Add anything else your expert should know about your plants, issues, timing, or goals."
                    rows={5}
                    className="w-full resize-none rounded-2xl border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <Label className="text-sm font-medium">Optional photos</Label>
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-5 text-sm text-muted-foreground hover:bg-muted/40">
                    <Upload className="h-4 w-4" />
                    {uploading ? "Uploading…" : "Attach images for your expert"}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => void uploadFiles(e.target.files)}
                      disabled={uploading}
                    />
                  </label>

                  {photos.length > 0 && (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {photos.map((photo) => (
                        <div key={photo.url} className="overflow-hidden rounded-2xl border border-border bg-card">
                          <div className="relative aspect-[4/3]">
                            <Image src={photo.url} alt={photo.name} fill className="object-cover" />
                          </div>
                          <div className="flex items-center justify-between gap-2 px-3 py-2">
                            <p className="truncate text-xs text-muted-foreground">{photo.name}</p>
                            <button
                              type="button"
                              className="text-xs font-medium text-destructive"
                              onClick={() => setPhotos((prev) => prev.filter((item) => item.url !== photo.url))}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button type="submit" className="mt-2 gap-2 rounded-full" size="lg" disabled={saving || uploading}>
                  {saving ? "Saving…" : "Save My Space"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            </section>

            <aside className="flex flex-col gap-4">
              <div className="rounded-3xl border border-[#e4d5c1] bg-[#f8f1e6] p-5 shadow-sm">
                <h2 className="font-serif text-lg font-semibold text-primary">Based on your space profile</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{basedOnProfileText}</p>
              </div>

              <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
                <h2 className="font-serif text-lg font-semibold text-foreground">Expert flow</h2>
                <ol className="mt-3 space-y-3 text-sm text-muted-foreground">
                  <li>1. Save your My Space details.</li>
                  <li>2. Start an expert consultation from the chat widget.</li>
                  <li>3. Your expert reviews this profile, your notes, and attached photos.</li>
                  <li>4. After the consultation ends, you can leave an anonymous rating.</li>
                </ol>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-4 max-w-sm rounded-2xl bg-white p-7 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#2F6F4E]">
              <Check className="h-10 w-10 text-white" strokeWidth={3} aria-hidden />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Done</h2>
            <p className="mt-1 text-sm text-gray-600">My Space saved successfully.</p>
          </div>
        </div>
      )}
    </div>
  )
}

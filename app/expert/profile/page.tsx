"use client"

import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useExpertUserId } from "@/components/expert/expert-user-context"

export default function ExpertProfilePage() {
  const expertUserId = useExpertUserId()
  const [displayName, setDisplayName] = useState("")
  const [specialization, setSpecialization] = useState("")
  const [bio, setBio] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setMsg(null)
    try {
      const res = await fetch(`/api/expert/profile?userId=${expertUserId}`)
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setMsg(typeof data.error === "string" ? data.error : "Could not load profile")
        return
      }
      const e = data.expert as {
        displayName: string
        specialization: string | null
        bio: string | null
        email: string
      }
      setDisplayName(e.displayName || "")
      setSpecialization(e.specialization || "")
      setBio(e.bio || "")
      setEmail(e.email || "")
    } finally {
      setLoading(false)
    }
  }, [expertUserId])

  useEffect(() => {
    void load()
  }, [load])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMsg(null)
    try {
      const res = await fetch("/api/expert/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: expertUserId,
          displayName: displayName.trim(),
          specialization: specialization.trim(),
          bio: bio.trim(),
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setMsg(typeof data.error === "string" ? data.error : "Save failed")
        return
      }
      setMsg("Saved.")
      await load()
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 text-center text-sm text-muted-foreground lg:px-8">
        Loading…
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8 lg:px-8">
      <h1 className="font-serif text-3xl font-bold text-foreground">Profile</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        How customers see you in consultations. This does not change shop admin settings.
      </p>

      {msg && (
        <p
          className={`mt-4 rounded-lg px-3 py-2 text-sm ${
            msg === "Saved."
              ? "border border-primary/30 bg-primary/10 text-primary"
              : "border border-destructive/40 bg-destructive/10 text-destructive"
          }`}
        >
          {msg}
        </p>
      )}

      <form className="mt-6 space-y-4" onSubmit={(e) => void save(e)}>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Account email</label>
          <Input value={email} disabled className="mt-1 rounded-xl bg-muted" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Display name</label>
          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="mt-1 rounded-xl"
            required
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Specialization</label>
          <Input
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            placeholder="e.g. Indoor plants, balcony gardens"
            className="mt-1 rounded-xl"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="mt-1 w-full resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm"
            placeholder="Short introduction for your expert profile."
          />
        </div>
        <Button type="submit" className="rounded-full" disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </form>
    </div>
  )
}

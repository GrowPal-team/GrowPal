"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Pencil, Info } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getStoredUser } from "@/lib/shopping"
import { mergeStoredUser } from "@/lib/auth-client"
import {
  addSavedAddress,
  addSavedPaymentMethod,
  getProfileExtras,
  type PaymentKind,
  type SavedAddress,
  type SavedPaymentMethod,
} from "@/lib/profile-local"

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<number | null>(null)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [newsletter, setNewsletter] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [migrationHint, setMigrationHint] = useState<string | null>(null)

  const [draftFirst, setDraftFirst] = useState("")
  const [draftLast, setDraftLast] = useState("")
  const [draftNews, setDraftNews] = useState(false)

  const [addresses, setAddresses] = useState<SavedAddress[]>([])
  const [payments, setPayments] = useState<SavedPaymentMethod[]>([])
  const [addressOpen, setAddressOpen] = useState(false)
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [addrLabel, setAddrLabel] = useState("")
  const [addrLine1, setAddrLine1] = useState("")
  const [addrLine2, setAddrLine2] = useState("")
  const [addrCity, setAddrCity] = useState("")
  const [addrPostal, setAddrPostal] = useState("")
  const [addrCountry, setAddrCountry] = useState("")
  const [payKind, setPayKind] = useState<PaymentKind>("cod")
  const [payCardNickname, setPayCardNickname] = useState("")
  const [payLast4, setPayLast4] = useState("")
  const [extrasSaving, setExtrasSaving] = useState(false)
  const [extrasError, setExtrasError] = useState<string | null>(null)

  const loadProfile = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)
    setMigrationHint(null)
    try {
      const res = await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get", userId: id }),
      })
      const data = await res.json()
      if (!data.success) {
        if (data.needs_migration) {
          setMigrationHint(
            data.message ||
              "Run sql/add_user_profile_columns.sql in MySQL, then refresh this page."
          )
          setError(null)
        } else {
          setError(data.message || "Could not load profile")
        }
        const u = getStoredUser()
        if (u) {
          setFirstName(u.firstName || (u.name?.split(/\s+/)[0] ?? ""))
          setLastName(u.lastName || u.name?.split(/\s+/).slice(1).join(" ") || "")
          setEmail(u.email || "")
          setNewsletter(!!u.newsletterOptIn)
        }
        return
      }
      const p = data.profile
      setFirstName(p.firstName || "")
      setLastName(p.lastName || "")
      setEmail(p.email || "")
      setNewsletter(!!p.newsletterOptIn)
      mergeStoredUser({
        firstName: p.firstName,
        lastName: p.lastName,
        name: p.name,
        email: p.email,
        newsletterOptIn: p.newsletterOptIn,
      })
    } catch {
      setError("Network error")
    } finally {
      setLoading(false)
    }
  }, [])

  const loadExtras = useCallback(() => {
    if (userId == null) return
    const x = getProfileExtras(userId)
    setAddresses(x.addresses)
    setPayments(x.payments)
  }, [userId])

  useEffect(() => {
    loadExtras()
  }, [loadExtras])

  useEffect(() => {
    const u = getStoredUser()
    if (!u?.id) {
      router.replace("/login")
      return
    }
    setUserId(u.id)
    loadProfile(u.id)
  }, [router, loadProfile])

  const openEdit = () => {
    setDraftFirst(firstName)
    setDraftLast(lastName)
    setDraftNews(newsletter)
    setEditOpen(true)
    setError(null)
  }

  const saveProfile = async () => {
    if (!userId) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          userId,
          firstName: draftFirst.trim(),
          lastName: draftLast.trim(),
          newsletterOptIn: draftNews,
        }),
      })
      const data = await res.json()
      if (!data.success) {
        setError(data.message || "Save failed")
        return
      }
      const u = data.user
      setFirstName(u.firstName || "")
      setLastName(u.lastName || "")
      setNewsletter(!!u.newsletterOptIn)
      mergeStoredUser({
        id: userId,
        firstName: u.firstName,
        lastName: u.lastName,
        name: u.name,
        email: u.email ?? email,
        newsletterOptIn: u.newsletterOptIn,
      })
      setEditOpen(false)
    } catch {
      setError("Network error")
    } finally {
      setSaving(false)
    }
  }

  const displayName = [firstName, lastName].filter(Boolean).join(" ").trim() || "—"

  const openAddressDialog = () => {
    setExtrasError(null)
    setAddrLabel("")
    setAddrLine1("")
    setAddrLine2("")
    setAddrCity("")
    setAddrPostal("")
    setAddrCountry("")
    setAddressOpen(true)
  }

  const saveAddress = () => {
    if (!userId || !addrLine1.trim() || !addrCity.trim() || !addrPostal.trim()) return
    setExtrasSaving(true)
    try {
      addSavedAddress(userId, {
        label: addrLabel.trim() || "Address",
        line1: addrLine1.trim(),
        line2: addrLine2.trim(),
        city: addrCity.trim(),
        postalCode: addrPostal.trim(),
        country: addrCountry.trim() || "—",
      })
      loadExtras()
      setAddressOpen(false)
    } finally {
      setExtrasSaving(false)
    }
  }

  const openPaymentDialog = () => {
    setExtrasError(null)
    setPayKind("cod")
    setPayCardNickname("")
    setPayLast4("")
    setPaymentOpen(true)
  }

  const savePayment = () => {
    if (!userId) return
    setExtrasError(null)
    let label: string
    let kind: PaymentKind = payKind
    if (payKind === "cod") {
      label = "Cash on delivery"
    } else if (payKind === "paypal") {
      label = "PayPal"
    } else {
      const four = payLast4.replace(/\D/g, "").slice(0, 4)
      if (four.length !== 4) {
        setExtrasError(
          "Enter the last 4 digits of the card (display only—we never store the full number)."
        )
        return
      }
      kind = "card_label"
      const nick = payCardNickname.trim() || "Card"
      label = `${nick} •••• ${four}`
    }
    setExtrasSaving(true)
    try {
      addSavedPaymentMethod(userId, { kind, label })
      loadExtras()
      setPaymentOpen(false)
    } finally {
      setExtrasSaving(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#fcfaf7]">
      <Navbar />

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 lg:px-8">
        <h1 className="font-serif text-3xl font-bold text-foreground">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account. Email is verified and cannot be changed here.
        </p>

        {migrationHint && (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
            {migrationHint}
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="mt-8 space-y-6">
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Name</p>
                <p className="mt-1 font-medium text-foreground">{loading ? "…" : displayName}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 text-primary hover:text-primary"
                onClick={openEdit}
                aria-label="Edit name"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-6 border-t border-border pt-6">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Email</p>
              <p className="mt-1 text-foreground">{loading ? "…" : email}</p>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-serif text-lg font-semibold text-foreground">Addresses</h2>
              <Button
                type="button"
                variant="ghost"
                className="cursor-pointer text-sm font-medium text-primary hover:text-primary"
                onClick={openAddressDialog}
              >
                + Add
              </Button>
            </div>
            {addresses.length === 0 ? (
              <div className="mt-4 flex items-start gap-2 rounded-xl bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
                <Info className="mt-0.5 h-4 w-4 shrink-0" />
                <span>No addresses added</span>
              </div>
            ) : (
              <ul className="mt-4 space-y-3">
                {addresses.map((a) => (
                  <li
                    key={a.id}
                    className="rounded-xl border border-border/80 bg-muted/30 px-4 py-3 text-sm text-foreground"
                  >
                    <p className="font-medium">{a.label}</p>
                    <p className="mt-1 text-muted-foreground">
                      {[a.line1, a.line2].filter(Boolean).join(", ")}
                      <br />
                      {[a.city, a.postalCode].filter(Boolean).join(", ")}
                      {a.country && a.country !== "—" ? ` · ${a.country}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-serif text-lg font-semibold text-foreground">Payment methods</h2>
              <Button
                type="button"
                variant="ghost"
                className="cursor-pointer text-sm font-medium text-primary hover:text-primary"
                onClick={openPaymentDialog}
              >
                + Add
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Saved on this device only. We never store full card numbers—for real checkouts use a payment
              provider (e.g. Stripe) that tokenizes cards on their servers.
            </p>
            {payments.length === 0 ? (
              <div className="mt-4 flex items-start gap-2 rounded-xl bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
                <Info className="mt-0.5 h-4 w-4 shrink-0" />
                <span>No payment methods added</span>
              </div>
            ) : (
              <ul className="mt-4 space-y-3">
                {payments.map((p) => (
                  <li
                    key={p.id}
                    className="rounded-xl border border-border/80 bg-muted/30 px-4 py-3 text-sm text-foreground"
                  >
                    {p.label}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>

      <Footer />

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="font-sans sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Edit profile</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">First name</label>
                <Input value={draftFirst} onChange={(e) => setDraftFirst(e.target.value)} className="rounded-lg" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Last name</label>
                <Input value={draftLast} onChange={(e) => setDraftLast(e.target.value)} className="rounded-lg" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Email</label>
              <Input value={email} readOnly disabled className="rounded-lg bg-muted/60" />
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox checked={draftNews} onCheckedChange={(c) => setDraftNews(c === true)} />
              Email me with news and offers
            </label>
          </div>
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={saveProfile}
              disabled={saving || (!draftFirst.trim() && !draftLast.trim())}
            >
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={addressOpen} onOpenChange={setAddressOpen}>
        <DialogContent className="font-sans sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Add address</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Label</label>
              <Input
                value={addrLabel}
                onChange={(e) => setAddrLabel(e.target.value)}
                placeholder="Home, Work…"
                className="rounded-lg"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Address line 1</label>
              <Input
                value={addrLine1}
                onChange={(e) => setAddrLine1(e.target.value)}
                className="rounded-lg"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Address line 2 (optional)
              </label>
              <Input value={addrLine2} onChange={(e) => setAddrLine2(e.target.value)} className="rounded-lg" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">City</label>
                <Input value={addrCity} onChange={(e) => setAddrCity(e.target.value)} className="rounded-lg" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Postal code</label>
                <Input value={addrPostal} onChange={(e) => setAddrPostal(e.target.value)} className="rounded-lg" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Country (optional)</label>
              <Input value={addrCountry} onChange={(e) => setAddrCountry(e.target.value)} className="rounded-lg" />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setAddressOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={saveAddress}
              disabled={
                extrasSaving || !addrLine1.trim() || !addrCity.trim() || !addrPostal.trim()
              }
            >
              {extrasSaving ? "Saving…" : "Save address"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent className="font-sans sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Add payment method</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Type</label>
              <Select
                value={payKind}
                onValueChange={(v) => setPayKind(v as PaymentKind)}
              >
                <SelectTrigger className="w-full rounded-lg">
                  <SelectValue placeholder="Choose type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cod">Cash on delivery</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="card_label">Debit / credit card (label only)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {payKind === "card_label" && (
              <>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Nickname</label>
                  <Input
                    value={payCardNickname}
                    onChange={(e) => setPayCardNickname(e.target.value)}
                    placeholder="e.g. My Visa"
                    className="rounded-lg"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    Last 4 digits (display only)
                  </label>
                  <Input
                    inputMode="numeric"
                    maxLength={4}
                    value={payLast4}
                    onChange={(e) => setPayLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder="4242"
                    className="rounded-lg"
                  />
                </div>
              </>
            )}
          </div>
          {extrasError && (
            <p className="text-sm text-destructive" role="alert">
              {extrasError}
            </p>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setPaymentOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={savePayment}
              disabled={
                extrasSaving ||
                (payKind === "card_label" && payLast4.replace(/\D/g, "").length !== 4)
              }
            >
              {extrasSaving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


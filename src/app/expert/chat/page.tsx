"use client"

import { Suspense, useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { Send, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useExpertUserId } from "@/components/expert/expert-user-context"

type ThreadRow = {
  id: number
  userId: number
  status: string
  unread?: boolean
  lastSenderRole?: string | null
  claimedByExpertUserId: number | null
  lastMessagePreview: string | null
  updatedAt: string
  customer: { id: number; full_name: string; email: string }
}

type MsgRow = {
  id: number
  senderRole: string
  body: string
  createdAt: string
  attachments?: UploadedAsset[]
}
type RecRow = {
  id: number
  body: string
  createdAt: string
  product: { id: number; name: string; slug: string; price_ils: number; imageUrl: string | null } | null
}
type ShopProduct = { id: number; name: string; slug: string; price: number; image?: string; stock?: number }

type SpaceData = {
  spaceType?: string
  sizeM2?: number
  sunExposure?: string
  waterAvailability?: string
  budgetLevel?: string
  goal?: string
  city?: { id: number; name: string } | null
  zone?: { id: number; name: string; description: string | null } | null
  notes?: string
  photos?: UploadedAsset[]
}
type UploadedAsset = { url: string; name: string; contentType: string; uploadedAt: string }

function formatStoredValue(value: string | number | null | undefined): string {
  if (value == null || value === "") return "—"
  return String(value).replaceAll("_", " ")
}

function statusLabel(status: string): string {
  if (status === "open") return "New"
  if (status === "claimed") return "In progress"
  if (status === "closed") return "Closed"
  return status
}

function ExpertChatContent() {
  const expertUserId = useExpertUserId()
  const searchParams = useSearchParams()
  const threadFromUrl = searchParams.get("thread")

  const [threads, setThreads] = useState<ThreadRow[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [messages, setMessages] = useState<MsgRow[]>([])
  const [threadMeta, setThreadMeta] = useState<ThreadRow | null>(null)
  const [space, setSpace] = useState<SpaceData | null | undefined>(undefined)
  const [reply, setReply] = useState("")
  const [replyFiles, setReplyFiles] = useState<File[]>([])
  const [recommendations, setRecommendations] = useState<RecRow[]>([])
  const [products, setProducts] = useState<ShopProduct[]>([])
  const [productId, setProductId] = useState<number | null>(null)
  const [recommending, setRecommending] = useState(false)
  const [loadingList, setLoadingList] = useState(true)
  const [loadingThread, setLoadingThread] = useState(false)
  const [sending, setSending] = useState(false)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const fetchInbox = useCallback(async () => {
    setLoadingList(true)
    try {
      const res = await fetch(`/api/expert/threads?expertUserId=${expertUserId}`)
      const data = await res.json().catch(() => ({}))
      if (res.ok && Array.isArray(data.threads)) {
        setThreads(data.threads as ThreadRow[])
      }
    } finally {
      setLoadingList(false)
    }
  }, [expertUserId])

  const loadThread = useCallback(
    async (threadId: number) => {
      setLoadingThread(true)
      try {
        const res = await fetch(`/api/expert/threads/${threadId}?expertUserId=${expertUserId}`)
        const data = await res.json().catch(() => ({}))
        if (res.ok && data.thread && Array.isArray(data.messages)) {
          setThreadMeta(data.thread as ThreadRow)
          setMessages(data.messages as MsgRow[])
          setRecommendations(Array.isArray(data.recommendations) ? (data.recommendations as RecRow[]) : [])
          const cid = (data.thread as ThreadRow).userId
          const sRes = await fetch(`/api/expert/customers/${cid}/space?expertUserId=${expertUserId}`)
          const sData = await sRes.json().catch(() => ({}))
          if (sRes.ok) {
            setSpace(sData.space as SpaceData | null)
          } else {
            setSpace(null)
          }
        }
      } finally {
        setLoadingThread(false)
      }
    },
    [expertUserId]
  )

  useEffect(() => {
    void fetchInbox()
    const t = setInterval(() => void fetchInbox(), 10000)
    return () => clearInterval(t)
  }, [fetchInbox])

  useEffect(() => {
    const tid = threadFromUrl ? parseInt(threadFromUrl, 10) : NaN
    if (!Number.isNaN(tid)) {
      setSelectedId(tid)
    }
  }, [threadFromUrl])

  useEffect(() => {
    if (selectedId) {
      void loadThread(selectedId)
      const t = setInterval(() => void loadThread(selectedId), 6000)
      return () => clearInterval(t)
    }
    setMessages([])
    setThreadMeta(null)
    setSpace(undefined)
    return undefined
  }, [selectedId, loadThread])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch("/api/products")
        const data = await res.json().catch(() => [])
        if (!cancelled && Array.isArray(data)) {
          setProducts((data as ShopProduct[]).filter((p) => (p.stock ?? 0) > 0))
        }
      } catch {
        if (!cancelled) setProducts([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return
    container.scrollTop = container.scrollHeight
  }, [messages, selectedId])

  const uploadReplyAssets = useCallback(async (): Promise<UploadedAsset[]> => {
    if (replyFiles.length === 0) return []
    const uploaded: UploadedAsset[] = []
    for (const file of replyFiles) {
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
    return uploaded
  }, [replyFiles])

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault()
    const t = reply.trim()
    if ((!t && replyFiles.length === 0) || !selectedId || sending) return
    if (threadMeta?.status === "closed") return
    setSending(true)
    try {
      const attachments = await uploadReplyAssets()
      const res = await fetch(`/api/expert/threads/${selectedId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expertUserId, body: t, attachments }),
      })
      if (res.ok) {
        setReply("")
        setReplyFiles([])
        await loadThread(selectedId)
        await fetchInbox()
      }
    } finally {
      setSending(false)
    }
  }

  const isClosed = threadMeta?.status === "closed"
  const visibleMessages = messages.filter(
    (m) => !(m.senderRole === "expert" && typeof m.body === "string" && m.body.startsWith("[Recommendation]"))
  )

  const sendRecommendation = async () => {
    if (!selectedId || !productId || recommending || isClosed) return
    setRecommending(true)
    try {
      const res = await fetch(`/api/expert/threads/${selectedId}/recommendations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expertUserId,
          productId,
          body: reply.trim() || "Recommended plant for your setup.",
        }),
      })
      if (res.ok) {
        setReply("")
        setProductId(null)
        await loadThread(selectedId)
        await fetchInbox()
      }
    } finally {
      setRecommending(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-foreground">Chat with customers</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review the customer space, chat directly, exchange images, and keep follow-up context in one place.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,380px)_minmax(0,1fr)_minmax(0,300px)]">
        <div className="rounded-2xl border border-[#e4d5c1] bg-[#f8f1e6] shadow-sm">
          <div className="border-b border-[#e4d5c1] px-3 py-2">
            <p className="font-serif text-sm font-semibold text-primary">Inbox</p>
            {loadingList && <p className="text-xs text-muted-foreground">Loading…</p>}
          </div>
          <ul className="max-h-[min(72vh,600px)] divide-y divide-[#e4d5c1] overflow-y-auto">
            {!loadingList && threads.length === 0 && (
              <li className="px-3 py-8 text-center text-sm text-muted-foreground">No active threads.</li>
            )}
            {threads.map((th) => {
              const label = th.customer.full_name?.trim() || th.customer.email
              const previewPrefix = th.lastSenderRole === "expert" ? "You" : label
              return (
                <li key={th.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(th.id)}
                    className={`flex w-full cursor-pointer items-start justify-between gap-3 px-3 py-3 text-left text-sm transition-colors hover:bg-[#efe4d4] ${
                      selectedId === th.id ? "bg-[#efe4d4]" : ""
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium text-foreground">{label}</span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {th.lastMessagePreview ? `${previewPrefix}: ${th.lastMessagePreview}` : "No message yet"}
                      </p>
                    </div>
                    <div className="shrink-0 pt-0.5 text-[11px]">
                      {th.unread ? (
                        <span className="rounded-full bg-primary px-2 py-0.5 font-semibold text-primary-foreground">
                          Unread
                        </span>
                      ) : (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground">Read</span>
                      )}
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="flex min-h-[min(72vh,620px)] flex-col rounded-2xl border border-[#e4d5c1] bg-card shadow-sm">
          {!selectedId && (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center text-muted-foreground">
              <p className="text-sm">Select a customer thread.</p>
            </div>
          )}
          {selectedId && threadMeta && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2">
                <div className="flex min-w-0 items-start gap-2">
                  <div className="min-w-0">
                    <p className="font-serif font-semibold text-foreground">
                      {threadMeta.customer.full_name?.trim() || threadMeta.customer.email}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{threadMeta.customer.email}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2" />
              </div>

              <div ref={messagesContainerRef} className="min-h-0 flex-1 overflow-y-auto bg-[#fcfaf7] px-3 py-3">
                {loadingThread && messages.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground">Loading…</p>
                )}
                <div className="flex flex-col gap-2">
                  {visibleMessages.map((m) => {
                    const isExpert = m.senderRole === "expert"
                    const isSystem = m.senderRole === "system"
                    return (
                      <div
                        key={m.id}
                        className={`flex ${isExpert || isSystem ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[92%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                            isSystem
                              ? "bg-amber-100 text-amber-950"
                              : isExpert
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-foreground"
                          }`}
                        >
                          <p className="mb-0.5 text-[10px] font-medium uppercase tracking-wide opacity-80">
                            {m.senderRole}
                          </p>
                          <p className="whitespace-pre-wrap">{m.body}</p>
                          {!!m.attachments?.length && (
                            <div className="mt-2 grid gap-2 sm:grid-cols-2">
                              {m.attachments.map((asset) => (
                                <Link
                                  key={`${m.id}-${asset.url}`}
                                  href={asset.url}
                                  target="_blank"
                                  className="overflow-hidden rounded-xl border border-border/60 bg-background/80"
                                >
                                  <div className="relative aspect-[4/3]">
                                    <Image src={asset.url} alt={asset.name} fill className="object-cover" />
                                  </div>
                                  <p className="truncate px-2 py-1 text-[10px] text-foreground/80">{asset.name}</p>
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                  {!!recommendations.length && (
                    <div className="pt-1">
                      <p className="mb-2 text-xs font-semibold text-muted-foreground">Recommended plants</p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {recommendations.map((rec) => (
                          <div key={rec.id} className="rounded-xl border border-border bg-background p-2.5">
                            <p className="line-clamp-2 text-xs text-muted-foreground">{rec.body}</p>
                            {rec.product && (
                              <Link href={`/product/${rec.product.slug}`} target="_blank" className="mt-2 block rounded-lg border border-border/70 p-2 hover:bg-muted/50">
                                <p className="text-sm font-medium text-foreground">{rec.product.name}</p>
                                <p className="mt-0.5 text-xs text-primary">₪ {rec.product.price_ils}</p>
                              </Link>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {!isClosed && (
                <form className="border-t border-border p-3" onSubmit={(e) => void sendReply(e)}>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <select
                        value={productId ?? ""}
                        onChange={(e) => setProductId(e.target.value ? Number(e.target.value) : null)}
                        className="h-10 flex-1 rounded-xl border border-input bg-background px-3 text-sm"
                        disabled={sending || recommending}
                      >
                        <option value="">Attach plant from shop</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} - ₪ {p.price}
                          </option>
                        ))}
                      </select>
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-xl"
                        disabled={!productId || recommending || sending}
                        onClick={() => void sendRecommendation()}
                      >
                        {recommending ? "Attaching…" : "Attach plant"}
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        placeholder="Write a reply…"
                        className="rounded-xl"
                        disabled={sending}
                      />
                      <Button type="submit" size="icon" className="shrink-0 rounded-xl" disabled={sending}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                    <label className="inline-flex cursor-pointer items-center gap-2 self-start rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted">
                      <Upload className="h-3.5 w-3.5" />
                      {replyFiles.length ? `${replyFiles.length} image selected` : "Choose file"}
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => setReplyFiles(Array.from(e.target.files || []))}
                        disabled={sending}
                      />
                    </label>
                  </div>
                </form>
              )}
              {isClosed && (
                <p className="border-t border-border p-3 text-center text-xs text-muted-foreground">
                  This consultation is closed.
                </p>
              )}
            </>
          )}
        </div>

        <div className="flex max-h-[min(72vh,620px)] flex-col gap-3 overflow-hidden">
          <div className="rounded-2xl border border-[#e4d5c1] bg-[#f8f1e6] p-4 shadow-sm">
            <h2 className="font-serif text-sm font-semibold text-primary">Space profile</h2>
            {!selectedId && (
              <p className="mt-2 text-xs text-muted-foreground">Select a conversation to load My Space details.</p>
            )}
            {selectedId && space === undefined && (
              <p className="mt-2 text-xs text-muted-foreground">Loading…</p>
            )}
            {selectedId && space === null && (
              <p className="mt-2 text-xs text-muted-foreground">
                This customer has not saved their My Space details yet.
              </p>
            )}
            {space && (
              <dl className="mt-3 space-y-1.5 text-xs">
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">Type</dt>
                  <dd className="text-right font-medium">{formatStoredValue(space.spaceType)}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">Area</dt>
                  <dd className="text-right font-medium">{space.sizeM2 ? `${space.sizeM2} m²` : "—"}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">Sun</dt>
                  <dd className="text-right font-medium">{formatStoredValue(space.sunExposure)}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">Water</dt>
                  <dd className="text-right font-medium">{formatStoredValue(space.waterAvailability)}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">Budget</dt>
                  <dd className="text-right font-medium">{formatStoredValue(space.budgetLevel)}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">Goal</dt>
                  <dd className="text-right font-medium">{formatStoredValue(space.goal)}</dd>
                </div>
                {space.city && (
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">City</dt>
                    <dd className="text-right font-medium">{space.city.name}</dd>
                  </div>
                )}
                {space.zone && (
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">Climate zone</dt>
                    <dd className="text-right font-medium">{space.zone.name}</dd>
                  </div>
                )}
              </dl>
            )}
            {!!space?.notes && (
              <div className="mt-3 rounded-xl border border-border/60 bg-background/70 p-3 text-xs">
                <p className="font-medium text-foreground">Extra notes</p>
                <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{space.notes}</p>
              </div>
            )}
            {!!space?.photos?.length && (
              <div className="mt-3">
                <p className="text-xs font-medium text-foreground">Attached images</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {space.photos.map((photo) => (
                    <Link key={photo.url} href={photo.url} target="_blank" className="overflow-hidden rounded-xl border border-border bg-card">
                      <div className="relative aspect-[4/3]">
                        <Image src={photo.url} alt={photo.name} fill className="object-cover" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

export default function ExpertChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
          Loading…
        </div>
      }
    >
      <ExpertChatContent />
    </Suspense>
  )
}

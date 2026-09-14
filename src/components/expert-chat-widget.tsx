"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  MessageCircle,
  X,
  Send,
  Minimize2,
  Upload,
  CreditCard,
  Star,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"
import { clientIsGuest } from "@/lib/session-client"
import { getStoredUser } from "@/lib/shopping"

type Step = "welcome" | "expert" | "bot"

type ChatRow = {
  id: string
  role: "user" | "assistant"
  content: string
  attachments?: UploadedAsset[]
  recommendation?: {
    id: number
    body: string
    product: { name: string; slug: string; price_ils: number; imageUrl: string | null } | null
  }
}

type UploadedAsset = {
  url: string
  name: string
  contentType: string
  uploadedAt: string
}

type ExpertThreadSummary = {
  id: number
  status: string
  updatedAt: string
}

type BillingSummary = {
  firstConsultationAvailable: boolean
  paidCredits: number
  followUpPriceIls: number
  activeThreadId: number | null
  activeThreadStatus: string | null
  canStartNewConsultation: boolean
}

type ExpertRating = {
  rating: number
  feedback: string
  submittedAt?: string
  anonymous?: boolean
} | null

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function toApiMessages(rows: ChatRow[]): { role: "user" | "assistant"; content: string }[] {
  return rows
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({ role: m.role, content: m.content }))
}

const BOT_SUGGESTIONS: string[] = [
  "ما هي افضل نباتات للبلكونة المشمسة بالصيف؟",
  "نبتتي أوراقها تصفر، شو السبب غالبا؟",
  "Best plants for a sunny balcony in summer?",
  "How do I know if I am overwatering?",
  "Quick watering plan for rooftop containers?",
]

const EXPERT_WELCOME = `For accurate support, please complete Your Space so the expert can review your setup clearly. You can add photos and extra details to speed up diagnosis.\n\nYour first consultation is free. A specialist will reply here as soon as one becomes available.`

const BOT_INTRO = `Welcome to GrowPal AI Assistant.\nAsk your question in Arabic or English and I will reply in the same language with practical, step-by-step plant guidance.`

export function ExpertChatWidget() {
  const [open, setOpen] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [step, setStep] = useState<Step>("welcome")
  const [messages, setMessages] = useState<ChatRow[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [expertSending, setExpertSending] = useState(false)
  const [expertFiles, setExpertFiles] = useState<File[]>([])
  const [billing, setBilling] = useState<BillingSummary | null>(null)
  const [expertThreadId, setExpertThreadId] = useState<number | null>(null)
  const [expertThreadStatus, setExpertThreadStatus] = useState<string | null>(null)
  const [expertRating, setExpertRating] = useState<ExpertRating>(null)
  const [ratingValue, setRatingValue] = useState(5)
  const [ratingFeedback, setRatingFeedback] = useState("")
  const [ratingSending, setRatingSending] = useState(false)
  const [paymentBusy, setPaymentBusy] = useState(false)
  const [guest, setGuest] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const lastSeenExpertMessageIdRef = useRef<number | null>(null)
  const botPendingRef = useRef(false)
  const messagesRef = useRef<ChatRow[]>([])

  const loadExpertMessages = useCallback(
    async (threadId: string) => {
      const uid = getStoredUser()?.id
      if (!uid) return
      const res = await fetch(`/api/expert/threads/${threadId}?userId=${uid}`)
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.thread) {
        lastSeenExpertMessageIdRef.current = null
        setExpertThreadId(null)
        setExpertThreadStatus(null)
        setExpertRating(null)
        setMessages([{ id: newId(), role: "assistant", content: EXPERT_WELCOME }])
        return
      }
      const apiMsgs = data.messages as
        | { id: number; senderRole: string; body: string; attachments?: UploadedAsset[] }[]
        | undefined
      const rows: ChatRow[] = (apiMsgs || [])
        .filter((m) => !(m.senderRole === "expert" && m.body.startsWith("[Recommendation]")))
        .map((m) => ({
          id: `m-${m.id}`,
          role: m.senderRole === "customer" ? "user" : "assistant",
          content: m.body,
          attachments: Array.isArray(m.attachments) ? m.attachments : [],
        }))
      const recRows: ChatRow[] = (Array.isArray(data.recommendations) ? data.recommendations : []).map((r: any) => ({
        id: `rec-${r.id}`,
        role: "assistant" as const,
        content: r.body || "Recommended plant for your setup.",
        recommendation: {
          id: r.id,
          body: r.body || "Recommended plant for your setup.",
          product: r.product
            ? {
                name: r.product.name,
                slug: r.product.slug,
                price_ils: Number(r.product.price_ils),
                imageUrl: r.product.imageUrl ?? null,
              }
            : null,
        },
      }))
      const latestExpertMsgId = (apiMsgs || [])
        .filter((m) => m.senderRole === "expert")
        .reduce<number | null>((latest, current) => {
          if (latest == null || current.id > latest) return current.id
          return latest
        }, null)
      setExpertThreadId(data.thread.id as number)
      setExpertThreadStatus((data.thread.status as string) || null)
      setExpertRating((data.rating as ExpertRating) || null)
      const allRows = [...rows, ...recRows]
      if (allRows.length === 0) {
        setMessages([{ id: newId(), role: "assistant", content: EXPERT_WELCOME }])
      } else {
        setMessages(allRows)
      }
      if (latestExpertMsgId == null) {
        lastSeenExpertMessageIdRef.current = null
      } else {
        const hasSeenBefore = lastSeenExpertMessageIdRef.current != null
        const isNewReply = hasSeenBefore && latestExpertMsgId > (lastSeenExpertMessageIdRef.current as number)
        if (isNewReply) {
          toast({
            title: "New expert reply",
            description: "Your expert has sent a new message.",
          })
        }
        lastSeenExpertMessageIdRef.current = latestExpertMsgId
      }
    },
    []
  )

  useEffect(() => {
    setGuest(clientIsGuest())
    const onAuth = () => setGuest(clientIsGuest())
    window.addEventListener("growpal-auth", onAuth)
    return () => window.removeEventListener("growpal-auth", onAuth)
  }, [])

  const resetSession = useCallback(() => {
    lastSeenExpertMessageIdRef.current = null
    setStep("welcome")
    setMessages([])
    setInput("")
    setLoading(false)
    setExpertSending(false)
    setExpertFiles([])
    setBilling(null)
    setExpertThreadId(null)
    setExpertThreadStatus(null)
    setExpertRating(null)
    setRatingValue(5)
    setRatingFeedback("")
    setRatingSending(false)
    setPaymentBusy(false)
  }, [])

  const closePanel = useCallback(() => {
    setOpen(false)
    setMinimized(false)
    resetSession()
  }, [resetSession])

  useEffect(() => {
    requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }))
  }, [messages, open, step, loading])

  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  useEffect(() => {
    function onOpenEvent() {
      setOpen(true)
      setMinimized(false)
    }
    window.addEventListener("growpal-chat-open", onOpenEvent)
    return () => window.removeEventListener("growpal-chat-open", onOpenEvent)
  }, [])

  const runBotAi = useCallback(async (fullThread: ChatRow[]) => {
    setLoading(true)
    try {
      const res = await fetch("/api/chat-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: toApiMessages(fullThread) }),
      })
      const data = await res.json().catch(() => ({}))
      const reply =
        typeof data.reply === "string"
          ? data.reply
          : "Could not get a reply. Try again or configure an AI API key on the server."

      setMessages((prev) => [...prev, { id: newId(), role: "assistant", content: reply }])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: newId(),
          role: "assistant",
          content: "Network error. Check your connection and try again.",
        },
      ])
    } finally {
      botPendingRef.current = false
      setLoading(false)
    }
  }, [])

  const submitBot = useCallback(
    async (userText: string) => {
      const t = userText.trim()
      if (!t || loading || step !== "bot" || botPendingRef.current) return

      const userRow: ChatRow = { id: newId(), role: "user", content: t }
      const next = [...messagesRef.current, userRow]
      botPendingRef.current = true
      setMessages(next)
      void runBotAi(next)
    },
    [loading, step, runBotAi]
  )

  const loadBillingSummary = useCallback(async () => {
    const uid = getStoredUser()?.id
    if (!uid) return null
    const res = await fetch(`/api/expert/billing?userId=${uid}`)
    const data = await res.json().catch(() => ({}))
    if (!res.ok) return null
    const summary = data as BillingSummary
    setBilling(summary)
    return summary
  }, [])

  const syncExpertState = useCallback(async () => {
    const uid = getStoredUser()?.id
    if (!uid) return
    const [summaryRes, threadsRes] = await Promise.all([
      fetch(`/api/expert/billing?userId=${uid}`),
      fetch(`/api/expert/threads?userId=${uid}`),
    ])
    const summary = (await summaryRes.json().catch(() => ({}))) as Partial<BillingSummary>
    const threadData = await threadsRes.json().catch(() => ({}))

    if (summaryRes.ok) {
      setBilling(summary as BillingSummary)
    }

    const threads = Array.isArray(threadData.threads) ? (threadData.threads as ExpertThreadSummary[]) : []
    const targetThreadId =
      (summary.activeThreadId as number | null | undefined) ?? (threads.length ? threads[0].id : null)

    if (targetThreadId) {
      await loadExpertMessages(String(targetThreadId))
    } else {
      setExpertThreadId(null)
      setExpertThreadStatus(null)
      setExpertRating(null)
      setMessages([{ id: newId(), role: "assistant", content: EXPERT_WELCOME }])
    }
  }, [loadExpertMessages])

  const pickExpert = () => {
    if (guest) return
    setStep("expert")
    void syncExpertState()
  }

  const pickBot = () => {
    if (guest) return
    setStep("bot")
    setMessages([{ id: newId(), role: "assistant", content: BOT_INTRO }])
  }

  useEffect(() => {
    if (step !== "expert" || guest) return
    const iv = setInterval(() => void syncExpertState(), 5000)
    return () => clearInterval(iv)
  }, [step, guest, syncExpertState])

  const uploadExpertFiles = useCallback(async (): Promise<UploadedAsset[]> => {
    if (expertFiles.length === 0) return []
    const uploaded: UploadedAsset[] = []
    for (const file of expertFiles) {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/expert/uploads", {
        method: "POST",
        body: formData,
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.asset) {
        throw new Error(typeof data.error === "string" ? data.error : "Could not upload the image")
      }
      uploaded.push(data.asset as UploadedAsset)
    }
    return uploaded
  }, [expertFiles])

  const sendExpert = async () => {
    const t = input.trim()
    if ((!t && expertFiles.length === 0) || step !== "expert" || expertSending) return
    const uid = getStoredUser()?.id
    if (!uid) return
    setExpertSending(true)
    try {
      const attachments = await uploadExpertFiles()
      if (!expertThreadId || expertThreadStatus === "closed") {
        const res = await fetch("/api/expert/threads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: uid, body: t, attachments }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          if ((data.threadId as number | undefined) != null) {
            await loadExpertMessages(String(data.threadId))
            await loadBillingSummary()
          }
          setMessages((prev) => [
            ...prev,
            {
              id: newId(),
              role: "assistant",
              content: typeof data.error === "string" ? data.error : "Could not start the conversation.",
            },
          ])
          return
        }
        setInput("")
        setExpertFiles([])
        await loadExpertMessages(String(data.threadId))
        await loadBillingSummary()
      } else {
        const res = await fetch(`/api/expert/threads/${expertThreadId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: uid, body: t, attachments }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          setMessages((prev) => [
            ...prev,
            {
              id: newId(),
              role: "assistant",
              content: typeof data.error === "string" ? data.error : "Could not send your message.",
            },
          ])
          return
        }
        setInput("")
        setExpertFiles([])
        await loadExpertMessages(String(expertThreadId))
      }
    } finally {
      setExpertSending(false)
    }
  }

  const payForFollowUp = async () => {
    const uid = getStoredUser()?.id
    if (!uid || paymentBusy) return
    setPaymentBusy(true)
    try {
      const res = await fetch("/api/expert/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: uid }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        await loadBillingSummary()
        setMessages((prev) => [
          ...prev,
          {
            id: newId(),
            role: "assistant",
            content:
              typeof data.message === "string"
                ? data.message
                : `Payment confirmed. You can now start another expert consultation for ₪ ${billing?.followUpPriceIls || 20}.`,
          },
        ])
      }
    } finally {
      setPaymentBusy(false)
    }
  }

  const submitRating = async () => {
    const uid = getStoredUser()?.id
    if (!uid || !expertThreadId || ratingSending) return
    setRatingSending(true)
    try {
      const res = await fetch(`/api/expert/threads/${expertThreadId}/rating`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: uid, rating: ratingValue, feedback: ratingFeedback }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setExpertRating({
          rating: ratingValue,
          feedback: ratingFeedback,
          anonymous: true,
        })
        await loadExpertMessages(String(expertThreadId))
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: newId(),
            role: "assistant",
            content: typeof data.error === "string" ? data.error : "Could not save your rating.",
          },
        ])
      }
    } finally {
      setRatingSending(false)
    }
  }

  const beginNewConsultation = () => {
    lastSeenExpertMessageIdRef.current = null
    setExpertThreadId(null)
    setExpertThreadStatus(null)
    setExpertRating(null)
    setRatingFeedback("")
    setRatingValue(5)
      setMessages([{ id: newId(), role: "assistant", content: EXPERT_WELCOME }])
  }

  const expertInputVisible = step === "expert" && (!expertThreadId || expertThreadStatus !== "closed")
  const closedThread = step === "expert" && expertThreadId != null && expertThreadStatus === "closed"
  const canStartFollowUp = !billing?.activeThreadId && (billing?.firstConsultationAvailable || (billing?.paidCredits || 0) > 0)
  const requestStatusLabel = useMemo(() => {
    if (expertThreadStatus === "claimed") return "Replied"
    if (expertThreadStatus === "open") return "Waiting"
    if (expertThreadStatus === "closed") return "Closed"
    return "Waiting"
  }, [expertThreadStatus])
  const billingHint = useMemo(() => {
    if (!billing) return null
    if (billing.firstConsultationAvailable) return "Your first expert consultation is free."
    if (billing.paidCredits > 0) return `You have ${billing.paidCredits} paid follow-up consultation credit${billing.paidCredits === 1 ? "" : "s"}.`
    return `Follow-up expert consultations require ₪ ${billing.followUpPriceIls}.`
  }, [billing])

  return (
    <div className="fixed bottom-4 right-4 z-[200] flex flex-col items-end gap-2 sm:bottom-6 sm:right-6">
      {open && !minimized && (
        <div
          className="flex max-h-[min(560px,calc(100vh-6rem))] w-[min(100vw-2rem,400px)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
          role="dialog"
          aria-label="GrowPal assistant"
        >
          <header className="flex items-start justify-between gap-2 border-b border-border bg-primary px-4 py-3 text-primary-foreground">
            <div className="min-w-0">
              <h2 className="font-serif text-lg font-semibold leading-tight">GrowPal Assistant</h2>
              <p className="mt-1 text-xs opacity-90">Professional support by expert chat or AI assistant</p>
            </div>
            <div className="flex shrink-0 gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 cursor-pointer text-primary-foreground hover:bg-white/15"
                onClick={() => setMinimized(true)}
                aria-label="Minimize"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 cursor-pointer text-primary-foreground hover:bg-white/15"
                onClick={closePanel}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto bg-[#fcfaf7] px-3 py-3">
            <div className="flex flex-col gap-3">
              {guest && (
                <div className="rounded-2xl border border-border bg-card p-4 text-sm leading-relaxed text-foreground shadow-sm">
                  <p className="font-medium">Sign in to chat</p>
                  <p className="mt-2 text-muted-foreground">
                    Create an account or sign in to message our plant experts and use the AI assistant.
                  </p>
                  <Button type="button" className="mt-4 w-full rounded-xl" asChild>
                    <Link href="/login?next=/">Sign in</Link>
                  </Button>
                </div>
              )}

              {!guest && step === "welcome" && (
                <div className="rounded-2xl border border-border bg-card p-4 text-sm leading-relaxed text-foreground shadow-sm">
                  <p className="font-medium">Welcome to GrowPal</p>
                  <p className="mt-2 text-muted-foreground">
                    Choose your support channel. Talk to an expert for case-specific help, or continue with AI for instant guidance.
                  </p>
                  <div className="mt-4 grid gap-2">
                    <Button
                      type="button"
                      className="h-auto cursor-pointer justify-start gap-2 py-3 text-left"
                      variant="default"
                      onClick={pickExpert}
                    >
                      Talk to an expert (first consultation free)
                    </Button>
                    <Button
                      type="button"
                      className="h-auto cursor-pointer justify-start gap-2 py-3 text-left"
                      variant="outline"
                      onClick={pickBot}
                    >
                      Continue with the bot
                    </Button>
                  </div>
                </div>
              )}

              {!guest &&
                step !== "welcome" &&
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      {msg.role === "assistant" && step === "bot" && (
                        <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                          AI assistant
                        </p>
                      )}
                      {msg.role === "assistant" && step === "expert" && (
                        <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-primary">
                          Expert
                        </p>
                      )}
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      {msg.recommendation?.product && (
                        <Link
                          href={`/product/${msg.recommendation.product.slug}`}
                          className="mt-2 block rounded-xl border border-border/60 bg-background p-2"
                        >
                          <p className="text-xs font-medium text-foreground">{msg.recommendation.product.name}</p>
                          <p className="mt-0.5 text-xs text-primary">
                            ₪ {msg.recommendation.product.price_ils}
                          </p>
                        </Link>
                      )}
                      {!!msg.attachments?.length && (
                        <div className="mt-2 grid gap-2 sm:grid-cols-2">
                          {msg.attachments.map((asset) => (
                            <Link
                              key={`${msg.id}-${asset.url}`}
                              href={asset.url}
                              target="_blank"
                              className="overflow-hidden rounded-xl border border-border/60 bg-background"
                            >
                              <div className="relative aspect-[4/3]">
                                <Image src={asset.url} alt={asset.name} fill className="object-cover" />
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

              {!guest && loading && step === "bot" && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">
                    <span className="animate-pulse">Thinking…</span>
                  </div>
                </div>
              )}

              {!guest && expertSending && step === "expert" && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">
                    <span className="animate-pulse">Sending…</span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </div>

          {!guest && step === "expert" && (
            <div className="border-t border-border bg-card px-3 py-2 text-xs text-muted-foreground">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-foreground">Expert support</span>
                {expertThreadId ? (
                  <span>{requestStatusLabel === "Waiting" ? "⏳ Waiting" : requestStatusLabel === "Replied" ? "💬 Replied" : "✅ Closed"}</span>
                ) : (
                  <span>Please wait until an expert becomes available.</span>
                )}
                {billingHint && <span>{billingHint}</span>}
                <Link href="/planner" className="font-medium text-primary underline">
                  Your Space
                </Link>
              </div>
            </div>
          )}

          {!guest && step === "bot" && (
            <div className="max-h-[170px] overflow-y-auto border-t border-border bg-card px-3 py-2.5">
              <p className="mb-1.5 px-1 text-[10px] font-medium uppercase text-muted-foreground">Quick asks</p>
              <div className="grid grid-cols-1 gap-1.5">
                {BOT_SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    disabled={loading || botPendingRef.current}
                    onClick={() => void submitBot(s)}
                    className="cursor-pointer rounded-xl border border-border bg-background px-3 py-2 text-left text-[11px] leading-snug text-foreground transition-colors hover:bg-accent disabled:opacity-50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!guest && closedThread && (
            <div className="border-t border-border bg-card p-3">
              <div className="mb-3 rounded-2xl border border-primary/20 bg-primary/5 p-3 text-sm">
                <p className="font-medium text-foreground">This consultation has ended</p>
                <p className="mt-1 text-muted-foreground">
                  Thank you for using the service. You can rate the experience or start a new consultation.
                </p>
              </div>
              {!expertRating ? (
                <div className="rounded-2xl border border-border bg-muted/20 p-3">
                  <div className="flex items-start gap-2">
                    <Star className="mt-0.5 h-4 w-4 text-primary" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">Rate your expert anonymously</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Your rating is private and will not be shown with your name.
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`rounded-full border px-2.5 py-1 text-xs ${ratingValue >= star ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}
                        onClick={() => setRatingValue(star)}
                      >
                        {star}
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={ratingFeedback}
                    onChange={(e) => setRatingFeedback(e.target.value)}
                    rows={3}
                    placeholder="Anonymous feedback…"
                    className="mt-3 w-full resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm"
                  />
                  <Button type="button" className="mt-3 w-full rounded-xl" disabled={ratingSending} onClick={() => void submitRating()}>
                    {ratingSending ? "Saving rating…" : "Submit anonymous rating"}
                  </Button>
                </div>
              ) : (
                <div className="flex items-start gap-2 rounded-2xl border border-primary/20 bg-primary/5 p-3 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Anonymous rating submitted</p>
                    <p className="mt-1 text-muted-foreground">Thank you. Your expert feedback was saved without showing your name.</p>
                  </div>
                </div>
              )}

              <div className="mt-3 grid gap-2">
                {canStartFollowUp && (
                  <Button type="button" variant="outline" className="rounded-xl" onClick={beginNewConsultation}>
                    Start a new expert consultation
                  </Button>
                )}
                {!billing?.firstConsultationAvailable && (billing?.paidCredits || 0) === 0 && (
                  <Button
                    type="button"
                    className="rounded-xl"
                    variant="secondary"
                    disabled={paymentBusy}
                    onClick={() => {
                      const approved = window.confirm(
                        `Your free consultation has ended.\n\nTo continue with an expert, the consultation fee is ₪ ${billing?.followUpPriceIls || 20}.\n\nDo you want to continue?`
                      )
                      if (approved) {
                        void payForFollowUp()
                      }
                    }}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    {paymentBusy ? "Processing…" : `Pay ₪ ${billing?.followUpPriceIls || 20} for another consultation`}
                  </Button>
                )}
              </div>
            </div>
          )}

          {!guest && expertInputVisible && (
            <form
              className="border-t border-border bg-card p-3"
              onSubmit={(e) => {
                e.preventDefault()
                void sendExpert()
              }}
            >
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Describe your issue, add extra details, or mention the photo…"
                    className="rounded-xl"
                    aria-label="Message to expert"
                    disabled={expertSending}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="shrink-0 cursor-pointer rounded-xl"
                    disabled={expertSending}
                  >
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Send</span>
                  </Button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted">
                    <Upload className="h-3.5 w-3.5" />
                    {expertFiles.length ? `${expertFiles.length} image selected` : "Choose file"}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => setExpertFiles(Array.from(e.target.files || []))}
                      disabled={expertSending}
                    />
                  </label>
                  {!billing?.firstConsultationAvailable && !expertThreadId && (
                    <span className="text-xs text-muted-foreground">
                      New expert conversations after the first one require ₪ {billing?.followUpPriceIls || 20}.
                    </span>
                  )}
                </div>
              </div>
            </form>
          )}

          {!guest && step === "bot" && (
            <form
              className="border-t border-border bg-card p-3"
              onSubmit={(e) => {
                e.preventDefault()
                const t = input.trim()
                if (!t) return
                void submitBot(t)
                setInput("")
              }}
            >
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Or type your own question…"
                  className="rounded-xl"
                  disabled={loading}
                  aria-label="Your question"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="shrink-0 cursor-pointer rounded-xl"
                    disabled={loading || botPendingRef.current}
                >
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send</span>
                </Button>
              </div>
            </form>
          )}
        </div>
      )}

      <Button
        type="button"
        onClick={() => {
          if (!open) {
            setOpen(true)
            setMinimized(false)
          } else if (minimized) {
            setMinimized(false)
          } else {
            closePanel()
          }
        }}
        size="icon"
        className={`h-14 w-14 shrink-0 cursor-pointer rounded-full border border-border shadow-lg ${
          open && !minimized ? "bg-muted text-foreground hover:bg-muted" : "bg-primary text-primary-foreground"
        }`}
        aria-expanded={open && !minimized}
        aria-label={!open || minimized ? "Open assistant" : "Close assistant"}
      >
        {open && !minimized ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </Button>
    </div>
  )
}

"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Copy, Gift, Leaf, Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { getStoredUser } from "@/lib/shopping"
import { ORDERS_PER_BLOOM } from "@/lib/plant-gamification"
import { VirtualPlantScene } from "@/components/my-plant/virtual-plant-scene"
import { cn } from "@/lib/utils"

type PlantPayload = {
  stage: number
  maxStage: number
  ordersPerBloom: number
  label: string
  progressPercent: number
  pendingGiftCode: string | null
  rewardCode: string | null
  rewardCodeSource: "pending" | "saved" | null
  completions: number
  displayName: string
}

export function MyPlantExperience({
  compact = false,
  rewardHint = false,
}: {
  compact?: boolean
  rewardHint?: boolean
}) {

  const [userId, setUserId] = useState<number | null>(null)
  const [data, setData] = useState<PlantPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState(false)

  const load = useCallback(async (uid: number) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/my-plant?userId=${uid}`)
      const json = (await res.json()) as PlantPayload & { message?: string }
      if (!res.ok) throw new Error(json.message || "Could not load")
      setData(json)
    } catch {
      setData(null)
      toast({ title: "Could not load your plant", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const u = getStoredUser()
    if (u?.id) {
      setUserId(u.id)
      void load(u.id)
    } else {
      setLoading(false)
    }
  }, [load])

  useEffect(() => {
    function onPlant() {
      const u = getStoredUser()
      if (u?.id) void load(u.id)
    }
    window.addEventListener("growpal-plant", onPlant)
    return () => window.removeEventListener("growpal-plant", onPlant)
  }, [load])

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      toast({ title: "Code copied", description: "Paste it at checkout for 10% off." })
    } catch {
      toast({ title: "Copy failed", description: code, variant: "destructive" })
    }
  }

  const claimReward = async () => {
    if (!userId || !data?.pendingGiftCode) return
    setClaiming(true)
    try {
      const res = await fetch("/api/my-plant/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.message || "Claim failed")
      }
      const payload = (await res.json().catch(() => ({}))) as { code?: string }
      toast({
        title: "Code saved",
        description: payload.code
          ? `${payload.code} is still valid at checkout, and your plant can grow again now.`
          : "Your reward code is still valid at checkout, and your plant can grow again now.",
      })
      await load(userId)
    } catch (e) {
      toast({
        title: "Something went wrong",
        description: e instanceof Error ? e.message : "Try again",
        variant: "destructive",
      })
    } finally {
      setClaiming(false)
    }
  }

  if (!userId && !loading) {
    return (
      <div className="rounded-3xl border border-[#e4d5c1] bg-[#f8f1e6] p-8 text-center shadow-sm">
        <Leaf className="mx-auto h-10 w-10 text-primary opacity-80" />
        <p className="mt-3 font-medium text-foreground">Sign in to grow your plant</p>
        <Button asChild className="mt-4 rounded-full">
          <Link href="/login?next=/my-plant">Sign in</Link>
        </Button>
      </div>
    )
  }

  if (loading || !data) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-3xl border border-[#e4d5c1] bg-[#f8f1e6]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const blooming = Boolean(data.pendingGiftCode)
  const rewardCode = data.rewardCode
  const ordersLeft = blooming ? 0 : ORDERS_PER_BLOOM - data.stage

  return (
    <div
      className={cn(
        "overflow-hidden rounded-3xl border border-[#e4d5c1] bg-gradient-to-br from-[#f8f1e6] via-[#f3ecdf] to-[#ebe3d4] shadow-sm",
        compact ? "p-5" : "p-6 sm:p-8"
      )}
    >
      <div className={cn("flex flex-col gap-6", !compact && "lg:flex-row lg:items-center lg:gap-10")}>
        <div className="flex flex-1 flex-col items-center lg:items-start">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Grow with every order
          </div>
          <h2
            className={cn(
              "font-serif font-bold text-foreground",
              compact ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl"
            )}
          >
            My Plant
          </h2>
          {!compact && (
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              Each completed order waters your virtual companion. After {ORDERS_PER_BLOOM} orders, it blooms and
              unlocks a 10% GrowPal reward code for your next checkout.
            </p>
          )}
          {compact && (
            <p className="mt-2 max-w-md text-xs text-muted-foreground">
              {ORDERS_PER_BLOOM} orders per bloom — sustainable perks for loyal growers.
            </p>
          )}

          <div className="mt-5 w-full max-w-md">
            <div className="flex justify-between text-xs font-medium text-muted-foreground">
              <span>{data.label}</span>
              <span>{data.progressPercent}%</span>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[#e4d5c1]/80">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-[#2d6b3a] transition-all duration-700 ease-out"
                style={{ width: `${data.progressPercent}%` }}
              />
            </div>
            {!blooming && (
              <p className="mt-2 text-xs text-muted-foreground">
                {ordersLeft === 1
                  ? "One more order until bloom & reward."
                  : `${ordersLeft} orders to go this cycle.`}
              </p>
            )}
            {data.completions > 0 && (
              <p className="mt-1 text-xs text-primary/90">
                You&apos;ve completed {data.completions} growth cycle{data.completions === 1 ? "" : "s"} so far.
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center">
          <VirtualPlantScene stage={data.stage} blooming={blooming} />
          {(rewardHint || blooming) && rewardCode && (
            <p className="mt-2 text-center text-xs font-medium text-primary">Your reward is ready below</p>
          )}
        </div>
      </div>

      {rewardCode && (
        <div className="mt-8 rounded-2xl border border-[#c4a574]/50 bg-[#fffdf8] p-5 shadow-inner">
          <div className="flex flex-wrap items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f4d58d]/40">
              <Gift className="h-5 w-5 text-[#8b6914]" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-serif text-lg font-semibold text-foreground">Your reward code</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {data.rewardCodeSource === "saved"
                  ? "This saved code is still valid at checkout for 10% off your next order."
                  : "Use this code at checkout for 10% off your next order. Tap copy, then mark it as saved when you&apos;re done."}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <code className="rounded-xl border border-[#e4d5c1] bg-white px-4 py-2.5 font-mono text-sm font-semibold tracking-wide text-foreground">
                  {rewardCode}
                </code>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full gap-1.5"
                  onClick={() => void copyCode(rewardCode)}
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
                {data.pendingGiftCode && (
                  <Button
                    type="button"
                    size="sm"
                    className="rounded-full"
                    disabled={claiming}
                    onClick={() => void claimReward()}
                  >
                    {claiming ? <Loader2 className="h-4 w-4 animate-spin" /> : "I saved my code"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

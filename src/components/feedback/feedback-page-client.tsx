"use client"

import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { getStoredUser, type StoredUser } from "@/lib/shopping"
import { toast } from "@/hooks/use-toast"
import type { CommunityFeedbackItem } from "@/lib/community-feedback"
import { StarRating } from "@/components/feedback/star-rating"

type EligibilityResponse = {
  canSubmit: boolean
  reason: string | null
}

type Props = {
  initialFeedback: CommunityFeedbackItem[]
}

export function FeedbackPageClient({ initialFeedback }: Props) {
  const [feedback, setFeedback] = useState(initialFeedback)
  const [user, setUser] = useState<StoredUser | null>(null)
  const [eligibility, setEligibility] = useState<EligibilityResponse | null>(null)
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const stored = getStoredUser()
    setUser(stored)

    if (!stored?.id) return

    fetch("/api/user/feedback-eligibility")
      .then((response) => response.json())
      .then((result) => setEligibility(result))
      .catch(() => setEligibility({ canSubmit: false, reason: "Could not verify feedback eligibility right now." }))
  }, [])

  async function submitFeedback() {
    if (!user?.id) return

    setSubmitting(true)
    try {
      const response = await fetch("/api/community-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          title,
          body,
        }),
      })

      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        toast({
          title: "Could not send feedback",
          description: typeof result.error === "string" ? result.error : "Please try again.",
          variant: "destructive",
        })
        return
      }

      setFeedback(Array.isArray(result.feedback) ? result.feedback : feedback)
      setTitle("")
      setBody("")
      setRating(5)
      toast({
        title: "Feedback added",
        description: "Your feedback is now visible to the community.",
      })
    } catch {
      toast({
        title: "Could not send feedback",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#fcfaf7]">
      <Navbar />

      <main className="flex-1">
        <section className="border-b border-border bg-[#f4efe5]">
          <div className="mx-auto max-w-7xl px-4 py-14 lg:px-8">
            <p className="text-sm uppercase tracking-[0.2em] text-[#2f6f4e]">Community feedback</p>
            <h1 className="mt-3 font-serif text-4xl font-semibold text-foreground">What customers are saying</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground md:text-base">
              Everyone can read feedback from the GrowPal community. Only signed-in customers with at least one paid
              order can leave a rating and comment.
            </p>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[1.1fr_1.4fr] lg:px-8">
          <Card className="h-fit border-black/8 shadow-sm">
            <CardHeader>
              <CardTitle className="font-serif text-2xl">Leave feedback</CardTitle>
              <CardDescription>Share your experience after your first successful purchase.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!user?.id ? (
                <Alert>
                  <AlertTitle>Sign in required</AlertTitle>
                  <AlertDescription>You can read feedback as a guest, but only signed-in customers can add it.</AlertDescription>
                </Alert>
              ) : eligibility?.canSubmit ? (
                <>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">Rating</label>
                    <div className="rounded-2xl border border-border bg-background px-4 py-4">
                      <StarRating value={rating} onChange={setRating} />
                      <p className="mt-3 text-sm text-muted-foreground">Selected rating: {rating.toFixed(1)} / 5</p>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">Title</label>
                    <Input
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      placeholder="Short summary (optional)"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">Your feedback</label>
                    <Textarea
                      value={body}
                      onChange={(event) => setBody(event.target.value)}
                      placeholder="Tell others what your experience with GrowPal was like."
                      className="min-h-32"
                    />
                  </div>

                  <Button type="button" className="rounded-full" disabled={submitting || body.trim().length < 10} onClick={() => void submitFeedback()}>
                    {submitting ? "Submitting..." : "Submit feedback"}
                  </Button>
                </>
              ) : (
                <Alert>
                  <AlertTitle>Feedback not available yet</AlertTitle>
                  <AlertDescription>
                    {eligibility?.reason || "You need at least one paid order before leaving feedback."}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            {feedback.length === 0 ? (
              <Card className="border-dashed border-black/10 bg-white/70 shadow-sm">
                <CardContent className="py-12 text-center text-sm text-muted-foreground">
                  No feedback has been posted yet.
                </CardContent>
              </Card>
            ) : (
              feedback.map((item) => (
                <Card key={item.id} className="border-black/8 shadow-sm">
                  <CardHeader>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <CardTitle className="font-serif text-xl">{item.title || item.name}</CardTitle>
                        <CardDescription className="mt-1">{item.name}</CardDescription>
                      </div>
                      <div className="flex items-center gap-3">
                        <StarRating value={item.rating} readOnly starClassName="h-4 w-4" />
                        <span className="text-sm font-medium text-slate-500">{item.rating.toFixed(1)} / 5</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-7 text-muted-foreground">{item.body}</p>
                    <p className="mt-4 text-xs text-slate-400">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

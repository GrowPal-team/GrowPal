import { AdminFeedbackManager } from "@/components/admin/admin-feedback-manager"
import { getCommunityFeedback } from "@/lib/community-feedback"

export default async function AdminFeedbackPage() {
  const feedback = await getCommunityFeedback()
  const averageRating =
    feedback.length > 0 ? feedback.reduce((sum, item) => sum + item.rating, 0) / feedback.length : 0

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
        <p className="text-sm uppercase tracking-[0.2em] text-[#2f6f4e]">Customer service</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-slate-900">Feedback management</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          Review all public community feedback in one place and remove entries when needed.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total feedback</p>
          <p className="mt-2 font-serif text-3xl font-semibold text-slate-900">{feedback.length}</p>
        </div>
        <div className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Average rating</p>
          <p className="mt-2 font-serif text-3xl font-semibold text-slate-900">{averageRating.toFixed(1)}</p>
        </div>
        <div className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Visibility</p>
          <p className="mt-2 font-serif text-2xl font-semibold text-slate-900">Publicly readable</p>
        </div>
      </div>

      <AdminFeedbackManager initialFeedback={feedback} />
    </section>
  )
}

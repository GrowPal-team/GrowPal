import { FeedbackPageClient } from "@/components/feedback/feedback-page-client"
import { getCommunityFeedback } from "@/lib/community-feedback"

export const dynamic = "force-dynamic"

export default async function FeedbackPage() {
  const feedback = await getCommunityFeedback()

  return <FeedbackPageClient initialFeedback={feedback} />
}

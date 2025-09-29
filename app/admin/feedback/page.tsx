import { Suspense } from "react"
import { FeedbackManagementPage } from "@/components/admin/feedback-management-page"

export default function AdminFeedbackPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading feedback...</div>}>
      <FeedbackManagementPage />
    </Suspense>
  )
}

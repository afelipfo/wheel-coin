import { Suspense } from "react"
import { ReportManagementPage } from "@/components/admin/report-management-page"

export default function AdminReportsPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading reports...</div>}>
      <ReportManagementPage />
    </Suspense>
  )
}

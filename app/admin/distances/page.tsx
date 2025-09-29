import { Suspense } from "react"
import { DistanceManagementPage } from "@/components/admin/distance-management-page"

export default function AdminDistancesPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading distances...</div>}>
      <DistanceManagementPage />
    </Suspense>
  )
}

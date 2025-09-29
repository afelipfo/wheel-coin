import { Suspense } from "react"
import { RewardManagementPage } from "@/components/admin/reward-management-page"

export default function AdminRewardsPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading rewards...</div>}>
      <RewardManagementPage />
    </Suspense>
  )
}

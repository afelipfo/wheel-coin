import { requireAdmin } from "@/lib/auth/admin-utils"
import { AdminLayout } from "@/components/admin/admin-layout"
import { SubscriptionManagement } from "@/components/admin/subscription-management"

export default async function AdminSubscriptionManagementPage() {
  await requireAdmin()

  return (
    <AdminLayout>
      <SubscriptionManagement />
    </AdminLayout>
  )
}

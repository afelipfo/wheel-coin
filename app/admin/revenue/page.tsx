import { requireAdmin } from "@/lib/auth/admin-utils"
import { AdminLayout } from "@/components/admin/admin-layout"
import { RevenueAnalytics } from "@/components/admin/revenue-analytics"

export default async function AdminRevenuePage() {
  await requireAdmin()

  return (
    <AdminLayout>
      <RevenueAnalytics />
    </AdminLayout>
  )
}

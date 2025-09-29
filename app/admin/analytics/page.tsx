import { requireAdmin } from "@/lib/auth/admin-utils"
import { AdminLayout } from "@/components/admin/admin-layout"
import { AnalyticsPage } from "@/components/admin/analytics-page"

export default async function AdminAnalyticsPage() {
  await requireAdmin()

  return (
    <AdminLayout>
      <AnalyticsPage />
    </AdminLayout>
  )
}

import { requireAdmin } from "@/lib/auth/admin-utils"
import { AdminLayout } from "@/components/admin/admin-layout"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

export default async function AdminPage() {
  await requireAdmin()

  return (
    <AdminLayout>
      <AdminDashboard />
    </AdminLayout>
  )
}

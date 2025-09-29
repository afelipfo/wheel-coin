import { requireAdmin } from "@/lib/auth/admin-utils"
import { AdminLayout } from "@/components/admin/admin-layout"
import { UserManagementPage } from "@/components/admin/user-management-page"

export default async function AdminUsersPage() {
  await requireAdmin()

  return (
    <AdminLayout>
      <UserManagementPage />
    </AdminLayout>
  )
}

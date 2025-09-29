import { Suspense } from "react"
import { UserProfilePage } from "@/components/admin/user-profile-page"

export default function AdminUserProfilePage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<div className="p-6">Loading user profile...</div>}>
      <UserProfilePage userId={params.id} />
    </Suspense>
  )
}

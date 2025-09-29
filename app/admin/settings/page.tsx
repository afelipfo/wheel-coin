import { Suspense } from "react"
import { SystemSettingsPage } from "@/components/admin/system-settings-page"

export default function AdminSettingsPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading settings...</div>}>
      <SystemSettingsPage />
    </Suspense>
  )
}

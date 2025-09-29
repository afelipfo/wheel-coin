import { Suspense } from "react"
import { AuditLogPage } from "@/components/admin/audit-log-page"

export default function AdminAuditPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading audit logs...</div>}>
      <AuditLogPage />
    </Suspense>
  )
}

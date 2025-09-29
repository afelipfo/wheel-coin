"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Download, Shield, Database, User, Settings } from "lucide-react"

export function AuditLogPage() {
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [filteredLogs, setFilteredLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("created_at")
  const [sortOrder, setSortOrder] = useState("desc")
  const [filterBy, setFilterBy] = useState("all")

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    fetchAuditLogs()
  }, [])

  useEffect(() => {
    filterAndSortLogs()
  }, [auditLogs, searchTerm, sortBy, sortOrder, filterBy])

  async function fetchAuditLogs() {
    try {
      const { data, error } = await supabase
        .from("admin_actions")
        .select(`
          *,
          admin:users!admin_actions_admin_id_fkey (
            id,
            username,
            email
          )
        `)
        .order("created_at", { ascending: false })
        .limit(1000)

      if (error) throw error
      setAuditLogs(data || [])
    } catch (error) {
      console.error("Error fetching audit logs:", error)
    } finally {
      setLoading(false)
    }
  }

  function filterAndSortLogs() {
    let filtered = [...auditLogs]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (log) =>
          log.admin?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.admin?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.action_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.target_table?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply category filter
    if (filterBy !== "all") {
      filtered = filtered.filter((log) => log.action_type.includes(filterBy))
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy]
      let bValue = b[sortBy]

      if (sortBy === "admin_username") {
        aValue = a.admin?.username || ""
        bValue = b.admin?.username || ""
      }

      if (typeof aValue === "string") {
        return sortOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }

      return sortOrder === "asc" ? aValue - bValue : bValue - aValue
    })

    setFilteredLogs(filtered)
  }

  async function exportLogs() {
    const csvContent = [
      ["Timestamp", "Admin", "Action Type", "Target Table", "Target ID", "Details"].join(","),
      ...filteredLogs.map((log) =>
        [
          new Date(log.created_at).toISOString(),
          log.admin?.username || "Unknown",
          log.action_type,
          log.target_table || "",
          log.target_id || "",
          `"${JSON.stringify(log.details || {}).replace(/"/g, '""')}"`,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `audit_logs_export_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  function getActionIcon(actionType: string) {
    if (actionType.includes("user")) return <User className="h-4 w-4" />
    if (actionType.includes("settings")) return <Settings className="h-4 w-4" />
    if (actionType.includes("delete")) return <Shield className="h-4 w-4 text-red-500" />
    return <Database className="h-4 w-4" />
  }

  function getActionVariant(actionType: string) {
    if (actionType.includes("delete")) return "destructive"
    if (actionType.includes("create")) return "default"
    if (actionType.includes("update")) return "secondary"
    return "outline"
  }

  if (loading) {
    return <div className="p-6">Loading audit logs...</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Audit Logs</h1>
          <p className="text-muted-foreground">Track all administrative actions and system changes</p>
        </div>
        <Button onClick={exportLogs} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Logs
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Administrative Actions ({filteredLogs.length})</CardTitle>
          <CardDescription>Complete audit trail of all admin activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by admin, action type, or table..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="user">User Actions</SelectItem>
                <SelectItem value="delete">Delete Actions</SelectItem>
                <SelectItem value="create">Create Actions</SelectItem>
                <SelectItem value="update">Update Actions</SelectItem>
                <SelectItem value="export">Export Actions</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={`${sortBy}-${sortOrder}`}
              onValueChange={(value) => {
                const [field, order] = value.split("-")
                setSortBy(field)
                setSortOrder(order)
              }}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at-desc">Newest First</SelectItem>
                <SelectItem value="created_at-asc">Oldest First</SelectItem>
                <SelectItem value="admin_username-asc">Admin A-Z</SelectItem>
                <SelectItem value="action_type-asc">Action Type A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="text-sm">
                        <p>{new Date(log.created_at).toLocaleDateString()}</p>
                        <p className="text-muted-foreground">{new Date(log.created_at).toLocaleTimeString()}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{log.admin?.username || "System"}</p>
                        <p className="text-sm text-muted-foreground">{log.admin?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getActionVariant(log.action_type)} className="flex items-center gap-1 w-fit">
                        {getActionIcon(log.action_type)}
                        {log.action_type.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium">{log.target_table || "—"}</p>
                        {log.target_id && <p className="text-muted-foreground">ID: {log.target_id}</p>}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="text-sm text-muted-foreground truncate">
                        {log.details ? JSON.stringify(log.details).substring(0, 100) + "..." : "—"}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

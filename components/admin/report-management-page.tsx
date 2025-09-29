"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, Filter, Download, Eye, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { useAuth } from "@/lib/auth/auth-context"

export function ReportManagementPage() {
  const [reports, setReports] = useState<any[]>([])
  const [filteredReports, setFilteredReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("created_at")
  const [sortOrder, setSortOrder] = useState("desc")
  const [filterBy, setFilterBy] = useState("all")
  const [selectedReport, setSelectedReport] = useState<any>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)

  const { user } = useAuth()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    fetchReports()
  }, [])

  useEffect(() => {
    filterAndSortReports()
  }, [reports, searchTerm, sortBy, sortOrder, filterBy])

  async function fetchReports() {
    try {
      const { data, error } = await supabase
        .from("reports")
        .select(`
          *,
          reporter:users!reports_reporter_id_fkey (
            id,
            username,
            email
          ),
          reported_user:users!reports_reported_user_id_fkey (
            id,
            username,
            email
          )
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      setReports(data || [])
    } catch (error) {
      console.error("Error fetching reports:", error)
    } finally {
      setLoading(false)
    }
  }

  function filterAndSortReports() {
    let filtered = [...reports]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (report) =>
          report.reporter?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.reported_user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply status filter
    if (filterBy !== "all") {
      filtered = filtered.filter((report) => report.status === filterBy)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortBy]
      const bValue = b[sortBy]

      if (typeof aValue === "string") {
        return sortOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }

      return sortOrder === "asc" ? aValue - bValue : bValue - aValue
    })

    setFilteredReports(filtered)
  }

  async function updateReportStatus(id: string, status: string) {
    try {
      const { error } = await supabase
        .from("reports")
        .update({
          status,
          resolved_at: status === "resolved" ? new Date().toISOString() : null,
          resolved_by: status === "resolved" ? user?.id : null,
        })
        .eq("id", id)

      if (error) throw error

      // Log admin action
      await supabase.from("admin_actions").insert({
        admin_id: user?.id,
        action_type: "report_status_update",
        target_table: "reports",
        target_id: id,
        details: { new_status: status },
      })

      fetchReports()
    } catch (error) {
      console.error("Error updating report status:", error)
    }
  }

  function viewReport(report: any) {
    setSelectedReport(report)
    setViewDialogOpen(true)
  }

  async function exportData() {
    const csvContent = [
      ["ID", "Reporter", "Reported User", "Status", "Description", "Created At", "Resolved At"].join(","),
      ...filteredReports.map((report) =>
        [
          report.id,
          report.reporter?.username || "Unknown",
          report.reported_user?.username || "Unknown",
          report.status,
          `"${report.description?.replace(/"/g, '""') || ""}"`,
          new Date(report.created_at).toISOString(),
          report.resolved_at ? new Date(report.resolved_at).toISOString() : "",
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `reports_export_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "dismissed":
        return <XCircle className="h-4 w-4 text-gray-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    }
  }

  function getStatusVariant(status: string) {
    switch (status) {
      case "resolved":
        return "default"
      case "dismissed":
        return "secondary"
      default:
        return "destructive"
    }
  }

  if (loading) {
    return <div className="p-6">Loading reports...</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Report Management</h1>
          <p className="text-muted-foreground">Review and manage user reports</p>
        </div>
        <Button onClick={exportData} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reports ({filteredReports.length})</CardTitle>
          <CardDescription>All user reports and their resolution status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by reporter, reported user, or description..."
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
                <SelectItem value="all">All Reports</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
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
                <SelectItem value="status-asc">Status A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reporter</TableHead>
                  <TableHead>Reported User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{report.reporter?.username || "Unknown"}</p>
                        <p className="text-sm text-muted-foreground">{report.reporter?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{report.reported_user?.username || "Unknown"}</p>
                        <p className="text-sm text-muted-foreground">{report.reported_user?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(report.status)} className="flex items-center gap-1 w-fit">
                        {getStatusIcon(report.status)}
                        {report.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{report.description}</TableCell>
                    <TableCell>{new Date(report.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => viewReport(report)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {report.status === "pending" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateReportStatus(report.id, "resolved")}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateReportStatus(report.id, "dismissed")}
                              className="text-gray-600 hover:text-gray-700"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium">Reporter</h4>
                  <p>{selectedReport.reporter?.username || "Unknown"}</p>
                  <p className="text-sm text-muted-foreground">{selectedReport.reporter?.email}</p>
                </div>
                <div>
                  <h4 className="font-medium">Reported User</h4>
                  <p>{selectedReport.reported_user?.username || "Unknown"}</p>
                  <p className="text-sm text-muted-foreground">{selectedReport.reported_user?.email}</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium">Status</h4>
                <Badge variant={getStatusVariant(selectedReport.status)} className="flex items-center gap-1 w-fit mt-1">
                  {getStatusIcon(selectedReport.status)}
                  {selectedReport.status}
                </Badge>
              </div>
              <div>
                <h4 className="font-medium">Description</h4>
                <div className="mt-2 p-3 bg-muted rounded-md">
                  <p>{selectedReport.description}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>
                  <span className="font-medium">Created:</span> {new Date(selectedReport.created_at).toLocaleString()}
                </div>
                {selectedReport.resolved_at && (
                  <div>
                    <span className="font-medium">Resolved:</span>{" "}
                    {new Date(selectedReport.resolved_at).toLocaleString()}
                  </div>
                )}
              </div>
              {selectedReport.status === "pending" && (
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => {
                      updateReportStatus(selectedReport.id, "resolved")
                      setViewDialogOpen(false)
                    }}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Resolved
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      updateReportStatus(selectedReport.id, "dismissed")
                      setViewDialogOpen(false)
                    }}
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Dismiss Report
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

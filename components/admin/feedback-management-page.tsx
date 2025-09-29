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
import { Search, Filter, Download, Eye, Star, MessageSquare } from "lucide-react"
import { useAuth } from "@/lib/auth/auth-context"

export function FeedbackManagementPage() {
  const [feedback, setFeedback] = useState<any[]>([])
  const [filteredFeedback, setFilteredFeedback] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("created_at")
  const [sortOrder, setSortOrder] = useState("desc")
  const [filterBy, setFilterBy] = useState("all")
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)

  const { user } = useAuth()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    fetchFeedback()
  }, [])

  useEffect(() => {
    filterAndSortFeedback()
  }, [feedback, searchTerm, sortBy, sortOrder, filterBy])

  async function fetchFeedback() {
    try {
      const { data, error } = await supabase
        .from("feedback")
        .select(`
          *,
          users (
            id,
            username,
            email
          )
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      setFeedback(data || [])
    } catch (error) {
      console.error("Error fetching feedback:", error)
    } finally {
      setLoading(false)
    }
  }

  function filterAndSortFeedback() {
    let filtered = [...feedback]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.users?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.users?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.category?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply category filter
    if (filterBy !== "all") {
      if (filterBy === "high_rating") {
        filtered = filtered.filter((item) => item.rating >= 4)
      } else if (filterBy === "low_rating") {
        filtered = filtered.filter((item) => item.rating <= 2)
      } else {
        filtered = filtered.filter((item) => item.category === filterBy)
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy]
      let bValue = b[sortBy]

      if (sortBy === "username") {
        aValue = a.users?.username || ""
        bValue = b.users?.username || ""
      }

      if (typeof aValue === "string") {
        return sortOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }

      return sortOrder === "asc" ? aValue - bValue : bValue - aValue
    })

    setFilteredFeedback(filtered)
  }

  function viewFeedback(feedbackItem: any) {
    setSelectedFeedback(feedbackItem)
    setViewDialogOpen(true)
  }

  async function exportData() {
    const csvContent = [
      ["ID", "User", "Category", "Rating", "Message", "Created At"].join(","),
      ...filteredFeedback.map((item) =>
        [
          item.id,
          item.users?.username || "Unknown",
          item.category || "",
          item.rating || "",
          `"${item.message?.replace(/"/g, '""') || ""}"`,
          new Date(item.created_at).toISOString(),
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `feedback_export_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  function renderStars(rating: number) {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    ))
  }

  function getRatingColor(rating: number) {
    if (rating >= 4) return "text-green-600"
    if (rating >= 3) return "text-yellow-600"
    return "text-red-600"
  }

  if (loading) {
    return <div className="p-6">Loading feedback...</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Feedback Management</h1>
          <p className="text-muted-foreground">Review and analyze user feedback</p>
        </div>
        <Button onClick={exportData} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{feedback.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {feedback.length > 0
                ? (feedback.reduce((sum, item) => sum + (item.rating || 0), 0) / feedback.length).toFixed(1)
                : "0.0"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Ratings (4-5★)</CardTitle>
            <Star className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{feedback.filter((item) => item.rating >= 4).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Ratings (1-2★)</CardTitle>
            <Star className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{feedback.filter((item) => item.rating <= 2).length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Feedback ({filteredFeedback.length})</CardTitle>
          <CardDescription>All user feedback and ratings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by username, email, message, or category..."
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
                <SelectItem value="all">All Feedback</SelectItem>
                <SelectItem value="high_rating">High Rating (4-5★)</SelectItem>
                <SelectItem value="low_rating">Low Rating (1-2★)</SelectItem>
                <SelectItem value="bug_report">Bug Report</SelectItem>
                <SelectItem value="feature_request">Feature Request</SelectItem>
                <SelectItem value="general">General</SelectItem>
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
                <SelectItem value="rating-desc">Highest Rating</SelectItem>
                <SelectItem value="rating-asc">Lowest Rating</SelectItem>
                <SelectItem value="username-asc">Username A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFeedback.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.users?.username || "Unknown"}</p>
                        <p className="text-sm text-muted-foreground">{item.users?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.category || "General"}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex">{renderStars(item.rating || 0)}</div>
                        <span className={`text-sm font-medium ${getRatingColor(item.rating || 0)}`}>
                          {item.rating || 0}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{item.message}</TableCell>
                    <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => viewFeedback(item)}>
                        <Eye className="h-4 w-4" />
                      </Button>
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
            <DialogTitle>Feedback Details</DialogTitle>
          </DialogHeader>
          {selectedFeedback && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium">User</h4>
                  <p>{selectedFeedback.users?.username || "Unknown"}</p>
                  <p className="text-sm text-muted-foreground">{selectedFeedback.users?.email}</p>
                </div>
                <div>
                  <h4 className="font-medium">Category</h4>
                  <Badge variant="outline" className="mt-1">
                    {selectedFeedback.category || "General"}
                  </Badge>
                </div>
              </div>
              <div>
                <h4 className="font-medium">Rating</h4>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex">{renderStars(selectedFeedback.rating || 0)}</div>
                  <span className={`text-lg font-medium ${getRatingColor(selectedFeedback.rating || 0)}`}>
                    {selectedFeedback.rating || 0}/5
                  </span>
                </div>
              </div>
              <div>
                <h4 className="font-medium">Message</h4>
                <div className="mt-2 p-3 bg-muted rounded-md">
                  <p>{selectedFeedback.message}</p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Submitted:</span> {new Date(selectedFeedback.created_at).toLocaleString()}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

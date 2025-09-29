"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Download, Trash2 } from "lucide-react"
import { useAuth } from "@/lib/auth/auth-context"

export function DistanceManagementPage() {
  const [distances, setDistances] = useState<any[]>([])
  const [filteredDistances, setFilteredDistances] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("created_at")
  const [sortOrder, setSortOrder] = useState("desc")
  const [filterBy, setFilterBy] = useState("all")

  const { user } = useAuth()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    fetchDistances()
  }, [])

  useEffect(() => {
    filterAndSortDistances()
  }, [distances, searchTerm, sortBy, sortOrder, filterBy])

  async function fetchDistances() {
    try {
      const { data, error } = await supabase
        .from("distances")
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
      setDistances(data || [])
    } catch (error) {
      console.error("Error fetching distances:", error)
    } finally {
      setLoading(false)
    }
  }

  function filterAndSortDistances() {
    let filtered = [...distances]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (distance) =>
          distance.users?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          distance.users?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          distance.distance_km?.toString().includes(searchTerm),
      )
    }

    // Apply category filter
    if (filterBy !== "all") {
      if (filterBy === "high_distance") {
        filtered = filtered.filter((distance) => distance.distance_km > 10)
      } else if (filterBy === "recent") {
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
        filtered = filtered.filter((distance) => new Date(distance.created_at) > oneWeekAgo)
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

    setFilteredDistances(filtered)
  }

  async function deleteDistance(id: string) {
    if (!confirm("Are you sure you want to delete this distance entry?")) return

    try {
      const { error } = await supabase.from("distances").delete().eq("id", id)

      if (error) throw error

      // Log admin action
      await supabase.from("admin_actions").insert({
        admin_id: user?.id,
        action_type: "distance_delete",
        target_table: "distances",
        target_id: id,
        details: { reason: "Admin deletion" },
      })

      fetchDistances()
    } catch (error) {
      console.error("Error deleting distance:", error)
    }
  }

  async function exportData() {
    const csvContent = [
      ["ID", "User", "Distance (km)", "Coins Earned", "Created At"].join(","),
      ...filteredDistances.map((distance) =>
        [
          distance.id,
          distance.users?.username || "Unknown",
          distance.distance_km,
          distance.coins_earned,
          new Date(distance.created_at).toISOString(),
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `distances_export_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return <div className="p-6">Loading distances...</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Distance Management</h1>
          <p className="text-muted-foreground">Manage and monitor user distance entries</p>
        </div>
        <Button onClick={exportData}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Distance Entries ({filteredDistances.length})</CardTitle>
          <CardDescription>All distance tracking entries from users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by username, email, or distance..."
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
                <SelectItem value="all">All Entries</SelectItem>
                <SelectItem value="high_distance">High Distance &gt;10km</SelectItem>
                <SelectItem value="recent">Recent (Last 7 days)</SelectItem>
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
                <SelectItem value="distance_km-desc">Highest Distance</SelectItem>
                <SelectItem value="distance_km-asc">Lowest Distance</SelectItem>
                <SelectItem value="username-asc">Username A-Z</SelectItem>
                <SelectItem value="username-desc">Username Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Distance</TableHead>
                  <TableHead>Coins Earned</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDistances.map((distance) => (
                  <TableRow key={distance.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{distance.users?.username || "Unknown"}</p>
                        <p className="text-sm text-muted-foreground">{distance.users?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{distance.distance_km} km</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{distance.coins_earned} coins</Badge>
                    </TableCell>
                    <TableCell>{new Date(distance.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteDistance(distance.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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

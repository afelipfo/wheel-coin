"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Search, Filter, Download, Trash2, Plus, Gift } from "lucide-react"
import { useAuth } from "@/lib/auth/auth-context"

export function RewardManagementPage() {
  const [rewards, setRewards] = useState<any[]>([])
  const [filteredRewards, setFilteredRewards] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("created_at")
  const [sortOrder, setSortOrder] = useState("desc")
  const [filterBy, setFilterBy] = useState("all")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newReward, setNewReward] = useState({
    user_id: "",
    reward_type: "",
    coins_amount: 0,
    description: "",
  })

  const { user } = useAuth()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    fetchRewards()
  }, [])

  useEffect(() => {
    filterAndSortRewards()
  }, [rewards, searchTerm, sortBy, sortOrder, filterBy])

  async function fetchRewards() {
    try {
      const { data, error } = await supabase
        .from("rewards")
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
      setRewards(data || [])
    } catch (error) {
      console.error("Error fetching rewards:", error)
    } finally {
      setLoading(false)
    }
  }

  function filterAndSortRewards() {
    let filtered = [...rewards]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (reward) =>
          reward.users?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          reward.users?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          reward.reward_type?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply category filter
    if (filterBy !== "all") {
      filtered = filtered.filter((reward) => reward.reward_type === filterBy)
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

    setFilteredRewards(filtered)
  }

  async function createReward() {
    try {
      const { error } = await supabase.from("rewards").insert([
        {
          ...newReward,
          coins_amount: Number(newReward.coins_amount),
        },
      ])

      if (error) throw error

      // Log admin action
      await supabase.from("admin_actions").insert({
        admin_id: user?.id,
        action_type: "reward_create",
        target_table: "rewards",
        details: { reward_data: newReward },
      })

      setCreateDialogOpen(false)
      setNewReward({ user_id: "", reward_type: "", coins_amount: 0, description: "" })
      fetchRewards()
    } catch (error) {
      console.error("Error creating reward:", error)
    }
  }

  async function deleteReward(id: string) {
    if (!confirm("Are you sure you want to delete this reward?")) return

    try {
      const { error } = await supabase.from("rewards").delete().eq("id", id)

      if (error) throw error

      // Log admin action
      await supabase.from("admin_actions").insert({
        admin_id: user?.id,
        action_type: "reward_delete",
        target_table: "rewards",
        target_id: id,
        details: { reason: "Admin deletion" },
      })

      fetchRewards()
    } catch (error) {
      console.error("Error deleting reward:", error)
    }
  }

  async function exportData() {
    const csvContent = [
      ["ID", "User", "Reward Type", "Coins Amount", "Description", "Created At"].join(","),
      ...filteredRewards.map((reward) =>
        [
          reward.id,
          reward.users?.username || "Unknown",
          reward.reward_type,
          reward.coins_amount,
          reward.description || "",
          new Date(reward.created_at).toISOString(),
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `rewards_export_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return <div className="p-6">Loading rewards...</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reward Management</h1>
          <p className="text-muted-foreground">Manage user rewards and incentives</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Reward
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Reward</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="user_id">User ID</Label>
                  <Input
                    id="user_id"
                    value={newReward.user_id}
                    onChange={(e) => setNewReward({ ...newReward, user_id: e.target.value })}
                    placeholder="Enter user ID"
                  />
                </div>
                <div>
                  <Label htmlFor="reward_type">Reward Type</Label>
                  <Select
                    value={newReward.reward_type}
                    onValueChange={(value) => setNewReward({ ...newReward, reward_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select reward type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily_bonus">Daily Bonus</SelectItem>
                      <SelectItem value="achievement">Achievement</SelectItem>
                      <SelectItem value="milestone">Milestone</SelectItem>
                      <SelectItem value="referral">Referral</SelectItem>
                      <SelectItem value="admin_bonus">Admin Bonus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="coins_amount">Coins Amount</Label>
                  <Input
                    id="coins_amount"
                    type="number"
                    value={newReward.coins_amount}
                    onChange={(e) => setNewReward({ ...newReward, coins_amount: Number(e.target.value) })}
                    placeholder="Enter coins amount"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={newReward.description}
                    onChange={(e) => setNewReward({ ...newReward, description: e.target.value })}
                    placeholder="Enter description (optional)"
                  />
                </div>
                <Button onClick={createReward} className="w-full">
                  Create Reward
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button onClick={exportData} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rewards ({filteredRewards.length})</CardTitle>
          <CardDescription>All rewards distributed to users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by username, email, or reward type..."
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
                <SelectItem value="all">All Rewards</SelectItem>
                <SelectItem value="daily_bonus">Daily Bonus</SelectItem>
                <SelectItem value="achievement">Achievement</SelectItem>
                <SelectItem value="milestone">Milestone</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
                <SelectItem value="admin_bonus">Admin Bonus</SelectItem>
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
                <SelectItem value="coins_amount-desc">Highest Value</SelectItem>
                <SelectItem value="coins_amount-asc">Lowest Value</SelectItem>
                <SelectItem value="username-asc">Username A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Reward Type</TableHead>
                  <TableHead>Coins Amount</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRewards.map((reward) => (
                  <TableRow key={reward.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{reward.users?.username || "Unknown"}</p>
                        <p className="text-sm text-muted-foreground">{reward.users?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        <Gift className="h-3 w-3 mr-1" />
                        {reward.reward_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{reward.coins_amount} coins</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{reward.description || "—"}</TableCell>
                    <TableCell>{new Date(reward.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteReward(reward.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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

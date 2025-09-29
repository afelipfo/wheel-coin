"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createBrowserClient } from "@supabase/ssr"
import { Search, MoreHorizontal, Mail, Ban, CheckCircle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface SubscriptionWithDetails {
  id: string
  user_id: string
  status: string
  billing_cycle: string
  current_period_start?: string
  current_period_end?: string
  created_at: string
  subscription_plans?: {
    name: string
    display_name: string
    price_monthly: number
    price_yearly: number
  }
  users?: {
    email: string
    username: string
  }
}

export function SubscriptionManagement() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [planFilter, setPlanFilter] = useState("all")

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    async function fetchSubscriptions() {
      try {
        const { data, error } = await supabase
          .from("user_subscriptions")
          .select(`
            *,
            subscription_plans(*),
            users(email, username)
          `)
          .order("created_at", { ascending: false })

        if (error) throw error
        setSubscriptions(data || [])
      } catch (error) {
        console.error("Error fetching subscriptions:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSubscriptions()
  }, [supabase])

  const filteredSubscriptions = subscriptions.filter((subscription) => {
    const matchesSearch =
      subscription.users?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.users?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || subscription.status === statusFilter
    const matchesPlan = planFilter === "all" || subscription.subscription_plans?.name === planFilter

    return matchesSearch && matchesStatus && matchesPlan
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Active</Badge>
      case "canceled":
        return <Badge variant="secondary">Canceled</Badge>
      case "past_due":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Past Due</Badge>
      case "unpaid":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Unpaid</Badge>
      case "trialing":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Trial</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleSubscriptionAction = async (subscriptionId: string, action: string) => {
    try {
      switch (action) {
        case "cancel":
          // Cancel subscription logic
          console.log("Canceling subscription:", subscriptionId)
          break
        case "reactivate":
          // Reactivate subscription logic
          console.log("Reactivating subscription:", subscriptionId)
          break
        case "email":
          // Send email to customer
          console.log("Sending email for subscription:", subscriptionId)
          break
        default:
          break
      }
    } catch (error) {
      console.error("Error handling subscription action:", error)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded w-48 animate-pulse"></div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded animate-pulse"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const stats = {
    total: subscriptions.length,
    active: subscriptions.filter((s) => s.status === "active").length,
    canceled: subscriptions.filter((s) => s.status === "canceled").length,
    trial: subscriptions.filter((s) => s.status === "trialing").length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Subscription Management</h1>
        <p className="text-muted-foreground">Manage user subscriptions and billing</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Canceled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.canceled}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Trial</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.trial}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription List</CardTitle>
          <CardDescription>Manage and monitor all user subscriptions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by email, username, or subscription ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
                <SelectItem value="past_due">Past Due</SelectItem>
                <SelectItem value="trialing">Trial</SelectItem>
              </SelectContent>
            </Select>
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Billing</TableHead>
                <TableHead>Current Period</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubscriptions.map((subscription) => (
                <TableRow key={subscription.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{subscription.users?.email || "Unknown"}</p>
                      <p className="text-sm text-muted-foreground">
                        {subscription.users?.username || subscription.user_id.slice(0, 8)}...
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{subscription.subscription_plans?.display_name || "Unknown"}</p>
                      <p className="text-sm text-muted-foreground">
                        $
                        {subscription.billing_cycle === "yearly"
                          ? (subscription.subscription_plans?.price_yearly || 0) / 100
                          : (subscription.subscription_plans?.price_monthly || 0) / 100}
                        /{subscription.billing_cycle === "yearly" ? "year" : "month"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(subscription.status)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{subscription.billing_cycle === "yearly" ? "Yearly" : "Monthly"}</Badge>
                  </TableCell>
                  <TableCell>
                    {subscription.current_period_start && subscription.current_period_end ? (
                      <div className="text-sm">
                        <p>{new Date(subscription.current_period_start).toLocaleDateString()}</p>
                        <p className="text-muted-foreground">
                          to {new Date(subscription.current_period_end).toLocaleDateString()}
                        </p>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{new Date(subscription.created_at).toLocaleDateString()}</div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleSubscriptionAction(subscription.id, "email")}>
                          <Mail className="w-4 h-4 mr-2" />
                          Send Email
                        </DropdownMenuItem>
                        {subscription.status === "active" ? (
                          <DropdownMenuItem onClick={() => handleSubscriptionAction(subscription.id, "cancel")}>
                            <Ban className="w-4 h-4 mr-2" />
                            Cancel Subscription
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleSubscriptionAction(subscription.id, "reactivate")}>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Reactivate
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredSubscriptions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No subscriptions found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

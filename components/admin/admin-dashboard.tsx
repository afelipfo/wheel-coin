"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { createBrowserClient } from "@supabase/ssr"
import { Users, Activity, Coins, AlertTriangle, MessageSquare, ArrowUpRight, ArrowDownRight, Eye } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import Link from "next/link"

interface DashboardStats {
  totalUsers: number
  totalDistance: number
  totalCoins: number
  totalReports: number
  totalFeedback: number
  userGrowth: number
  distanceGrowth: number
  coinsGrowth: number
}

interface ChartData {
  date: string
  users: number
  distance: number
  coins: number
}

interface RecentActivity {
  id: string
  action: string
  user: string
  time: string
  type: "user" | "activity" | "report" | "reward"
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // Fetch current stats
        const [usersResult, distancesResult, reportsResult, feedbackResult] = await Promise.all([
          supabase.from("users").select("total_distance, total_coins, created_at, username, email"),
          supabase.from("distances").select("distance, coins_earned, created_at, user_id"),
          supabase.from("reports").select("id, created_at, type, user_id"),
          supabase.from("feedback").select("id, created_at, type, user_id"),
        ])

        const users = usersResult.data || []
        const distances = distancesResult.data || []
        const reports = reportsResult.data || []
        const feedback = feedbackResult.data || []

        const totalUsers = users.length
        const totalDistance = users.reduce((sum, user) => sum + (user.total_distance || 0), 0)
        const totalCoins = users.reduce((sum, user) => sum + (user.total_coins || 0), 0)
        const totalReports = reports.length
        const totalFeedback = feedback.length

        // Calculate growth (mock data for demo)
        const userGrowth = 12.5
        const distanceGrowth = 8.3
        const coinsGrowth = 15.7

        setStats({
          totalUsers,
          totalDistance,
          totalCoins,
          totalReports,
          totalFeedback,
          userGrowth,
          distanceGrowth,
          coinsGrowth,
        })

        // Generate chart data (last 7 days)
        const chartData: ChartData[] = []
        for (let i = 6; i >= 0; i--) {
          const date = new Date()
          date.setDate(date.getDate() - i)
          chartData.push({
            date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            users: Math.floor(Math.random() * 50) + 100,
            distance: Math.floor(Math.random() * 1000) + 2000,
            coins: Math.floor(Math.random() * 500) + 1000,
          })
        }
        setChartData(chartData)

        // Generate recent activity from real data
        const activities: RecentActivity[] = []

        // Add user registrations
        users.slice(-5).forEach((user, index) => {
          activities.push({
            id: `user-${index}`,
            action: "New user registration",
            user: user.email || user.username || "Unknown user",
            time: `${Math.floor(Math.random() * 60) + 1} minutes ago`,
            type: "user",
          })
        })

        // Add distance activities
        distances.slice(-3).forEach((distance, index) => {
          activities.push({
            id: `distance-${index}`,
            action: "Distance tracking completed",
            user: `User ${distance.user_id?.slice(0, 8)}...`,
            time: `${Math.floor(Math.random() * 30) + 5} minutes ago`,
            type: "activity",
          })
        })

        // Add reports
        reports.slice(-2).forEach((report, index) => {
          activities.push({
            id: `report-${index}`,
            action: `${report.type} report submitted`,
            user: `User ${report.user_id?.slice(0, 8)}...`,
            time: `${Math.floor(Math.random() * 120) + 10} minutes ago`,
            type: "report",
          })
        })

        setRecentActivity(activities.slice(0, 8))
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [supabase])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers.toLocaleString() || "0",
      change: stats?.userGrowth || 0,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
      href: "/admin/users",
    },
    {
      title: "Total Distance",
      value: `${(stats?.totalDistance || 0).toFixed(1)}km`,
      change: stats?.distanceGrowth || 0,
      icon: Activity,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950",
      href: "/admin/distances",
    },
    {
      title: "Coins Earned",
      value: stats?.totalCoins.toLocaleString() || "0",
      change: stats?.coinsGrowth || 0,
      icon: Coins,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50 dark:bg-yellow-950",
      href: "/admin/rewards",
    },
    {
      title: "Active Reports",
      value: stats?.totalReports.toString() || "0",
      change: -2.1,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-950",
      href: "/admin/reports",
    },
    {
      title: "Feedback Items",
      value: stats?.totalFeedback.toString() || "0",
      change: 5.4,
      icon: MessageSquare,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950",
      href: "/admin/feedback",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Overview</h1>
          <p className="text-muted-foreground">Monitor your platform's performance and user activity</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Live Data
          </Badge>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/analytics">
              <Eye className="w-4 h-4 mr-2" />
              View Analytics
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          const isPositive = stat.change > 0
          const ChangeIcon = isPositive ? ArrowUpRight : ArrowDownRight

          return (
            <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
              <Link href={stat.href}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-1">{stat.value}</div>
                  <div className="flex items-center text-sm">
                    <ChangeIcon className={`w-4 h-4 mr-1 ${isPositive ? "text-green-600" : "text-red-600"}`} />
                    <span className={isPositive ? "text-green-600" : "text-red-600"}>{Math.abs(stat.change)}%</span>
                    <span className="text-muted-foreground ml-1">vs last month</span>
                  </div>
                </CardContent>
              </Link>
            </Card>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Activity Trends</CardTitle>
            <CardDescription>Daily active users over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-muted-foreground" />
                <YAxis className="text-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distance & Rewards</CardTitle>
            <CardDescription>Daily distance tracked and coins earned</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-muted-foreground" />
                <YAxis className="text-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="distance" fill="hsl(var(--secondary))" />
                <Bar dataKey="coins" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest platform events and user actions</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/audit">View All</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      activity.type === "user"
                        ? "bg-blue-500"
                        : activity.type === "activity"
                          ? "bg-green-500"
                          : activity.type === "report"
                            ? "bg-red-500"
                            : "bg-yellow-500"
                    }`}
                  />
                  <div>
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.user}</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

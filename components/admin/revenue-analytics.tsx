"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { createBrowserClient } from "@supabase/ssr"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts"
import { DollarSign, TrendingUp, TrendingDown, Users, Download, Target, AlertCircle, CheckCircle } from "lucide-react"

interface RevenueData {
  totalRevenue: number
  monthlyRecurring: number
  oneTimeRevenue: number
  activeSubscriptions: number
  churnRate: number
  averageRevenuePerUser: number
  conversionRate: number
  lifetimeValue: number
}

interface RevenueChart {
  date: string
  revenue: number
  subscriptions: number
  purchases: number
  newCustomers: number
}

interface SubscriptionMetrics {
  plan: string
  subscribers: number
  revenue: number
  churnRate: number
  growth: number
}

interface PaymentAnalytics {
  successRate: number
  failedPayments: number
  disputeRate: number
  averageTransactionValue: number
}

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"]

export function RevenueAnalytics() {
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null)
  const [chartData, setChartData] = useState<RevenueChart[]>([])
  const [subscriptionMetrics, setSubscriptionMetrics] = useState<SubscriptionMetrics[]>([])
  const [paymentAnalytics, setPaymentAnalytics] = useState<PaymentAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("30d")

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    async function fetchRevenueData() {
      try {
        const [subscriptionsResult, transactionsResult, purchasesResult] = await Promise.all([
          supabase.from("user_subscriptions").select(`
            *,
            subscription_plans(*)
          `),
          supabase.from("payment_transactions").select("*"),
          supabase.from("user_purchases").select(`
            *,
            in_app_purchases(*)
          `),
        ])

        const subscriptions = subscriptionsResult.data || []
        const transactions = transactionsResult.data || []
        const purchases = purchasesResult.data || []

        // Calculate revenue metrics
        const activeSubscriptions = subscriptions.filter((sub) => sub.status === "active").length
        const totalSubscriptionRevenue = subscriptions.reduce((sum, sub) => {
          if (sub.status === "active" && sub.subscription_plans) {
            const plan = sub.subscription_plans
            return sum + (sub.billing_cycle === "yearly" ? plan.price_yearly : plan.price_monthly)
          }
          return sum
        }, 0)

        const totalPurchaseRevenue = purchases.reduce((sum, purchase) => {
          return sum + (purchase.total_amount || 0)
        }, 0)

        const totalRevenue = totalSubscriptionRevenue + totalPurchaseRevenue
        const totalUsers = subscriptions.length
        const averageRevenuePerUser = totalUsers > 0 ? totalRevenue / totalUsers : 0

        setRevenueData({
          totalRevenue: totalRevenue / 100, // Convert from cents
          monthlyRecurring: totalSubscriptionRevenue / 100,
          oneTimeRevenue: totalPurchaseRevenue / 100,
          activeSubscriptions,
          churnRate: 5.2, // Mock data
          averageRevenuePerUser: averageRevenuePerUser / 100,
          conversionRate: 12.8,
          lifetimeValue: 450.0,
        })

        // Generate chart data for the last 30 days
        const chartData: RevenueChart[] = []
        for (let i = 29; i >= 0; i--) {
          const date = new Date()
          date.setDate(date.getDate() - i)
          chartData.push({
            date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            revenue: Math.floor(Math.random() * 5000) + 8000,
            subscriptions: Math.floor(Math.random() * 50) + 100,
            purchases: Math.floor(Math.random() * 200) + 300,
            newCustomers: Math.floor(Math.random() * 20) + 15,
          })
        }
        setChartData(chartData)

        // Subscription metrics by plan
        const planMetrics: SubscriptionMetrics[] = [
          { plan: "Basic", subscribers: 1250, revenue: 0, churnRate: 8.5, growth: 15.2 },
          { plan: "Pro", subscribers: 680, revenue: 6799, churnRate: 4.2, growth: 22.8 },
          { plan: "Premium", subscribers: 320, revenue: 6398, churnRate: 2.1, growth: 18.5 },
        ]
        setSubscriptionMetrics(planMetrics)

        // Payment analytics
        setPaymentAnalytics({
          successRate: 96.8,
          failedPayments: 24,
          disputeRate: 0.3,
          averageTransactionValue: 45.5,
        })
      } catch (error) {
        console.error("Error fetching revenue data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRevenueData()
  }, [timeRange, supabase])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-muted rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-muted rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const revenueMetrics = [
    {
      title: "Total Revenue",
      value: `$${revenueData?.totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      change: 18.2,
      icon: DollarSign,
      description: "All-time revenue",
    },
    {
      title: "Monthly Recurring Revenue",
      value: `$${revenueData?.monthlyRecurring.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      change: 12.5,
      icon: TrendingUp,
      description: "Active subscriptions",
    },
    {
      title: "Active Subscriptions",
      value: revenueData?.activeSubscriptions.toLocaleString() || "0",
      change: 8.7,
      icon: Users,
      description: "Paying subscribers",
    },
    {
      title: "Average Revenue Per User",
      value: `$${revenueData?.averageRevenuePerUser.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      change: -2.3,
      icon: Target,
      description: "Per user revenue",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Revenue Analytics</h1>
          <p className="text-muted-foreground">Comprehensive financial insights and payment analytics</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Revenue Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {revenueMetrics.map((metric, index) => {
          const Icon = metric.icon
          const isPositive = metric.change > 0

          return (
            <Card key={index}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{metric.title}</CardTitle>
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-1">{metric.value}</div>
                <div className="flex items-center text-sm">
                  {isPositive ? (
                    <TrendingUp className="w-4 h-4 mr-1 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 mr-1 text-red-600" />
                  )}
                  <span className={isPositive ? "text-green-600" : "text-red-600"}>{Math.abs(metric.change)}%</span>
                  <span className="text-muted-foreground ml-1">vs last period</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Revenue Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>Daily revenue breakdown over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={chartData}>
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
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stackId="1"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Sources</CardTitle>
                <CardDescription>Breakdown by revenue type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Subscriptions", value: revenueData?.monthlyRecurring || 0 },
                        { name: "One-time Purchases", value: revenueData?.oneTimeRevenue || 0 },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {[0, 1].map((index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[0] }} />
                      <span>Subscriptions</span>
                    </div>
                    <span className="font-medium">${revenueData?.monthlyRecurring.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[1] }} />
                      <span>One-time Purchases</span>
                    </div>
                    <span className="font-medium">${revenueData?.oneTimeRevenue.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Plans Performance</CardTitle>
                <CardDescription>Revenue and subscriber metrics by plan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subscriptionMetrics.map((plan, index) => (
                    <div key={plan.plan} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <div>
                          <p className="font-medium">{plan.plan}</p>
                          <p className="text-sm text-muted-foreground">{plan.subscribers} subscribers</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${plan.revenue.toLocaleString()}</p>
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant={plan.growth > 0 ? "default" : "secondary"}>
                            {plan.growth > 0 ? "+" : ""}
                            {plan.growth}%
                          </Badge>
                          <span className="text-muted-foreground">{plan.churnRate}% churn</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subscription Growth</CardTitle>
                <CardDescription>New subscriptions vs cancellations</CardDescription>
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
                    <Bar dataKey="subscriptions" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Payment Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-1">{paymentAnalytics?.successRate}%</div>
                <div className="flex items-center text-sm">
                  <CheckCircle className="w-4 h-4 mr-1 text-green-600" />
                  <span className="text-green-600">Excellent</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Failed Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-1">{paymentAnalytics?.failedPayments}</div>
                <div className="flex items-center text-sm">
                  <AlertCircle className="w-4 h-4 mr-1 text-red-600" />
                  <span className="text-red-600">Needs attention</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Dispute Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-1">{paymentAnalytics?.disputeRate}%</div>
                <div className="flex items-center text-sm">
                  <CheckCircle className="w-4 h-4 mr-1 text-green-600" />
                  <span className="text-green-600">Low</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Avg Transaction Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-1">${paymentAnalytics?.averageTransactionValue}</div>
                <div className="flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 mr-1 text-green-600" />
                  <span className="text-green-600">+5.2%</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Payment Volume Trends</CardTitle>
              <CardDescription>Daily payment processing volume</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
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
                    dataKey="purchases"
                    stroke="hsl(var(--secondary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--secondary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Lifetime Value</CardTitle>
                <CardDescription>Average revenue per customer over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">${revenueData?.lifetimeValue}</div>
                <p className="text-sm text-muted-foreground mb-4">Average customer lifetime value</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Basic Plan</span>
                    <span>$180</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Pro Plan</span>
                    <span>$540</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Premium Plan</span>
                    <span>$1,200</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Acquisition</CardTitle>
                <CardDescription>New paying customers over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
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
                    <Area
                      type="monotone"
                      dataKey="newCustomers"
                      stroke="hsl(var(--chart-3))"
                      fill="hsl(var(--chart-3))"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="forecasting" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Forecasting</CardTitle>
              <CardDescription>Projected revenue based on current trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">$45,200</div>
                  <p className="text-sm text-muted-foreground">Next Month</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">$138,600</div>
                  <p className="text-sm text-muted-foreground">Next Quarter</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">$542,400</div>
                  <p className="text-sm text-muted-foreground">Next Year</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={400}>
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
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

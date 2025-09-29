"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { createBrowserClient } from "@supabase/ssr"
import { Activity, Database, Zap, TrendingUp, AlertTriangle } from "lucide-react"

interface UsageMetric {
  type: string
  name: string
  current: number
  limit: number
  unit: string
  rate: number
  icon: any
  color: string
}

interface UsageBasedBillingProps {
  userId: string
}

export function UsageBasedBilling({ userId }: UsageBasedBillingProps) {
  const [usageMetrics, setUsageMetrics] = useState<UsageMetric[]>([])
  const [totalCost, setTotalCost] = useState(0)
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    async function fetchUsageData() {
      try {
        // Mock usage data - in production, this would come from your database
        const mockUsageMetrics: UsageMetric[] = [
          {
            type: "api_calls",
            name: "API Calls",
            current: 8750,
            limit: 10000,
            unit: "calls",
            rate: 0.001, // $0.001 per call over limit
            icon: Zap,
            color: "text-blue-600",
          },
          {
            type: "storage",
            name: "Storage",
            current: 2.3,
            limit: 5.0,
            unit: "GB",
            rate: 0.1, // $0.10 per GB over limit
            icon: Database,
            color: "text-green-600",
          },
          {
            type: "bandwidth",
            name: "Bandwidth",
            current: 45.2,
            limit: 100.0,
            unit: "GB",
            rate: 0.05, // $0.05 per GB over limit
            icon: Activity,
            color: "text-purple-600",
          },
          {
            type: "transactions",
            name: "Transactions",
            current: 1250,
            limit: 2000,
            unit: "txns",
            rate: 0.02, // $0.02 per transaction over limit
            icon: TrendingUp,
            color: "text-orange-600",
          },
        ]

        setUsageMetrics(mockUsageMetrics)

        // Calculate overage costs
        const overageCost = mockUsageMetrics.reduce((total, metric) => {
          const overage = Math.max(0, metric.current - metric.limit)
          return total + overage * metric.rate
        }, 0)

        setTotalCost(overageCost)
      } catch (error) {
        console.error("Error fetching usage data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsageData()
  }, [userId, supabase])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-muted rounded w-48 animate-pulse"></div>
          <div className="h-4 bg-muted rounded w-64 animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Usage-Based Billing
        </CardTitle>
        <CardDescription>Monitor your usage and overage charges for the current billing period</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Usage Metrics */}
        <div className="space-y-4">
          {usageMetrics.map((metric) => {
            const Icon = metric.icon
            const usagePercentage = (metric.current / metric.limit) * 100
            const isOverLimit = metric.current > metric.limit
            const overage = Math.max(0, metric.current - metric.limit)
            const overageCost = overage * metric.rate

            return (
              <div key={metric.type} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${metric.color}`} />
                    <span className="font-medium">{metric.name}</span>
                    {isOverLimit && (
                      <Badge variant="destructive" className="text-xs">
                        Over Limit
                      </Badge>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {metric.current.toLocaleString()} / {metric.limit.toLocaleString()} {metric.unit}
                    </div>
                    {isOverLimit && <div className="text-xs text-red-600">+${overageCost.toFixed(2)} overage</div>}
                  </div>
                </div>
                <Progress value={Math.min(usagePercentage, 100)} className={`h-2 ${isOverLimit ? "bg-red-100" : ""}`} />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{usagePercentage.toFixed(1)}% used</span>
                  <span>
                    ${metric.rate.toFixed(3)} per {metric.unit} over limit
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Total Overage Cost */}
        {totalCost > 0 && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-950 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-800 dark:text-red-200">Overage Charges</p>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    Additional charges for usage over your plan limits
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-red-600">${totalCost.toFixed(2)}</div>
                <div className="text-sm text-red-600">This billing period</div>
              </div>
            </div>
          </div>
        )}

        {/* Upgrade Suggestion */}
        {totalCost > 10 && (
          <div className="border-t pt-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-200">Consider Upgrading</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    Save money by upgrading to a higher plan with more included usage
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  View Plans
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

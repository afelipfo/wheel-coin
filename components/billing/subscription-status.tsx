"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, CheckCircle, Clock, XCircle } from "lucide-react"
import { useSubscription } from "@/lib/hooks/use-subscription"
import { formatPrice } from "@/lib/utils/payment"

export function SubscriptionStatus() {
  const { subscription, plan, loading } = useSubscription()

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-8 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!subscription || !plan) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-primary" />
            Free Plan
          </CardTitle>
          <CardDescription>You're currently on the free Basic plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Monthly cost</span>
              <span className="font-medium">Free</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Distance limit</span>
              <span className="font-medium">50 km/month</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Rewards multiplier</span>
              <span className="font-medium">1x</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-5 h-5 text-primary" />
      case "trialing":
        return <Clock className="w-5 h-5 text-secondary" />
      case "past_due":
        return <AlertTriangle className="w-5 h-5 text-destructive" />
      case "canceled":
        return <XCircle className="w-5 h-5 text-muted-foreground" />
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default"
      case "trialing":
        return "secondary"
      case "past_due":
        return "destructive"
      case "canceled":
        return "outline"
      default:
        return "outline"
    }
  }

  const calculatePeriodProgress = () => {
    if (!subscription.current_period_start || !subscription.current_period_end) return 0

    const start = new Date(subscription.current_period_start).getTime()
    const end = new Date(subscription.current_period_end).getTime()
    const now = Date.now()

    const total = end - start
    const elapsed = now - start

    return Math.max(0, Math.min(100, (elapsed / total) * 100))
  }

  const getDaysRemaining = () => {
    if (!subscription.current_period_end) return 0

    const end = new Date(subscription.current_period_end).getTime()
    const now = Date.now()
    const diff = end - now

    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }

  const progress = calculatePeriodProgress()
  const daysRemaining = getDaysRemaining()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon(subscription.status)}
          {plan.display_name} Plan
          <Badge variant={getStatusColor(subscription.status) as any}>{subscription.status}</Badge>
        </CardTitle>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Monthly cost</div>
            <div className="text-2xl font-bold">
              {formatPrice(subscription.billing_cycle === "yearly" ? plan.price_yearly / 12 : plan.price_monthly)}
            </div>
            <div className="text-xs text-muted-foreground">
              {subscription.billing_cycle === "yearly" && "Billed yearly"}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Rewards multiplier</div>
            <div className="text-2xl font-bold text-secondary">{plan.limits.rewards_multiplier}x</div>
          </div>
        </div>

        {subscription.current_period_end && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Billing period</span>
              <span className="font-medium">{daysRemaining} days remaining</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="text-xs text-muted-foreground">
              Renews on {new Date(subscription.current_period_end).toLocaleDateString()}
            </div>
          </div>
        )}

        {subscription.status === "past_due" && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <div className="flex items-center gap-2 text-destructive font-medium mb-2">
              <AlertTriangle className="w-4 h-4" />
              Payment Required
            </div>
            <p className="text-sm text-muted-foreground">
              Your payment is past due. Please update your payment method to continue enjoying premium features.
            </p>
          </div>
        )}

        {subscription.trial_end && new Date(subscription.trial_end) > new Date() && (
          <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-4">
            <div className="flex items-center gap-2 text-secondary font-medium mb-2">
              <Clock className="w-4 h-4" />
              Free Trial Active
            </div>
            <p className="text-sm text-muted-foreground">
              Your free trial ends on {new Date(subscription.trial_end).toLocaleDateString()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

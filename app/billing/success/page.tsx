"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, ArrowRight, Zap, Crown, Star } from "lucide-react"
import Link from "next/link"
import { useSubscription } from "@/lib/hooks/use-subscription"

const planIcons = {
  basic: Star,
  pro: Zap,
  premium: Crown,
}

export default function BillingSuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const { subscription, plan, refetch } = useSubscription()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Refetch subscription data to get the latest status
    const refreshData = async () => {
      await refetch()
      setLoading(false)
    }

    // Add a small delay to ensure webhook has processed
    const timer = setTimeout(refreshData, 2000)
    return () => clearTimeout(timer)
  }, [refetch])

  const Icon = plan ? planIcons[plan.name as keyof typeof planIcons] || Star : Star

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Processing your subscription...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <Card className="text-center">
          <CardHeader className="pb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-3xl mb-2">Payment Successful!</CardTitle>
            <CardDescription className="text-lg">
              Welcome to your new {plan?.display_name || "subscription"} plan
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {plan && (
              <div className="bg-muted/50 rounded-lg p-6">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{plan.display_name} Plan</h3>
                    <p className="text-muted-foreground">{plan.description}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 text-left">
                  <div>
                    <h4 className="font-medium mb-2">Plan Features:</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {plan.features.slice(0, 3).map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                          {feature}
                        </li>
                      ))}
                      {plan.features.length > 3 && (
                        <li className="text-primary">+ {plan.features.length - 3} more features</li>
                      )}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Subscription Details:</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div>
                        Status: <span className="text-primary font-medium">Active</span>
                      </div>
                      <div>
                        Billing: <span className="capitalize">{subscription?.billing_cycle || "Monthly"}</span>
                      </div>
                      <div>
                        Rewards:{" "}
                        <span className="text-secondary font-medium">{plan.limits.rewards_multiplier}x multiplier</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">What's Next?</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <Button asChild className="h-auto p-4">
                  <Link href="/dashboard" className="flex flex-col items-center gap-2">
                    <ArrowRight className="w-5 h-5" />
                    <span>Go to Dashboard</span>
                    <span className="text-xs opacity-75">Start tracking your progress</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-auto p-4 bg-transparent">
                  <Link href="/billing" className="flex flex-col items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>View Billing</span>
                    <span className="text-xs opacity-75">Manage your subscription</span>
                  </Link>
                </Button>
              </div>
            </div>

            {sessionId && <div className="text-xs text-muted-foreground border-t pt-4">Session ID: {sessionId}</div>}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Check, Zap, Crown, Star, ArrowRight } from "lucide-react"
import { useAuth } from "@/lib/auth/auth-context"
import { useSubscription } from "@/lib/hooks/use-subscription"
import { createCheckoutSession, formatPrice, calculateSavingsPercentage } from "@/lib/utils/payment"
import { toast } from "sonner"
import type { SubscriptionPlan } from "@/lib/types/payment"

const planIcons = {
  basic: Star,
  pro: Zap,
  premium: Crown,
}

const planColors = {
  basic: "border-muted",
  pro: "border-primary",
  premium: "border-secondary",
}

export default function PricingPage() {
  const { user } = useAuth()
  const { subscription, plan: currentPlan, loading: subscriptionLoading } = useSubscription()
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [isYearly, setIsYearly] = useState(false)
  const [processingPlan, setProcessingPlan] = useState<string | null>(null)

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const response = await fetch("/api/subscription-plans")
      if (response.ok) {
        const data = await response.json()
        setPlans(data)
      }
    } catch (error) {
      console.error("Error fetching plans:", error)
      // Fallback to default plans
      setPlans([
        {
          id: "basic",
          name: "basic",
          display_name: "Basic",
          description: "Perfect for getting started with Wheel-coin",
          price_monthly: 0,
          price_yearly: 0,
          features: ["Basic distance tracking", "Standard rewards", "Community access", "Mobile app"],
          limits: { distance_limit: 50, rewards_multiplier: 1.0, premium_features: false },
          is_active: true,
          created_at: "",
          updated_at: "",
        },
        {
          id: "pro",
          name: "pro",
          display_name: "Pro",
          description: "Enhanced features for active users",
          price_monthly: 9.99,
          price_yearly: 99.99,
          features: [
            "Unlimited distance tracking",
            "2x rewards multiplier",
            "Advanced analytics",
            "Priority support",
            "Premium badges",
          ],
          limits: { distance_limit: -1, rewards_multiplier: 2.0, premium_features: true, analytics: true },
          is_active: true,
          created_at: "",
          updated_at: "",
        },
        {
          id: "premium",
          name: "premium",
          display_name: "Premium",
          description: "Maximum rewards and exclusive features",
          price_monthly: 19.99,
          price_yearly: 199.99,
          features: [
            "Unlimited distance tracking",
            "3x rewards multiplier",
            "Advanced analytics",
            "Priority support",
            "Exclusive events",
            "Custom badges",
            "Early access to features",
          ],
          limits: {
            distance_limit: -1,
            rewards_multiplier: 3.0,
            premium_features: true,
            analytics: true,
            exclusive_access: true,
          },
          is_active: true,
          created_at: "",
          updated_at: "",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async (planId: string) => {
    if (!user) {
      toast.error("Please sign in to upgrade your plan")
      return
    }

    setProcessingPlan(planId)
    try {
      await createCheckoutSession(planId, isYearly ? "yearly" : "monthly")
    } catch (error) {
      console.error("Error creating checkout session:", error)
      toast.error("Failed to start checkout process")
    } finally {
      setProcessingPlan(null)
    }
  }

  const isCurrentPlan = (planName: string) => {
    return currentPlan?.name === planName
  }

  const getButtonText = (plan: SubscriptionPlan) => {
    if (!user) return "Sign In to Get Started"
    if (isCurrentPlan(plan.name)) return "Current Plan"
    if (plan.name === "basic") return "Get Started"
    return "Upgrade Now"
  }

  const getButtonVariant = (plan: SubscriptionPlan) => {
    if (isCurrentPlan(plan.name)) return "secondary"
    if (plan.name === "pro") return "default"
    if (plan.name === "premium") return "secondary"
    return "outline"
  }

  if (loading || subscriptionLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading pricing plans...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-6">
          <Zap className="w-4 h-4" />
          Introducing Credit-Based Pricing
          <ArrowRight className="w-4 h-4" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-balance mb-6">Plans and Pricing</h1>
        <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
          Get started immediately for free. Upgrade for more credits, usage and collaboration.
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-4 mb-12">
        <span className={`text-sm ${!isYearly ? "text-foreground" : "text-muted-foreground"}`}>Monthly</span>
        <Switch checked={isYearly} onCheckedChange={setIsYearly} />
        <span className={`text-sm ${isYearly ? "text-foreground" : "text-muted-foreground"}`}>Yearly</span>
        <Badge variant="secondary" className="ml-2">
          Save up to 17%
        </Badge>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
        {plans.map((plan) => {
          const Icon = planIcons[plan.name as keyof typeof planIcons] || Star
          const price = isYearly ? plan.price_yearly : plan.price_monthly
          const isPopular = plan.name === "pro"
          const isEnterprise = plan.name === "premium"

          return (
            <Card
              key={plan.id}
              className={`relative ${planColors[plan.name as keyof typeof planColors]} ${
                isPopular ? "ring-2 ring-primary" : ""
              } ${isEnterprise ? "ring-2 ring-secondary" : ""}`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">Recommended</Badge>
                </div>
              )}

              <CardHeader className="text-center pb-8">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-foreground" />
                </div>
                <CardTitle className="text-2xl">{plan.display_name}</CardTitle>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold">{formatPrice(price)}</span>
                  {plan.name !== "basic" && (
                    <span className="text-muted-foreground">/{isYearly ? "year" : "month"}</span>
                  )}
                </div>
                {isYearly && plan.price_monthly > 0 && (
                  <div className="text-sm text-muted-foreground">
                    <span className="line-through">{formatPrice(plan.price_monthly * 12)}</span>
                    <span className="text-secondary ml-2">
                      Save {calculateSavingsPercentage(plan.price_monthly, plan.price_yearly)}%
                    </span>
                  </div>
                )}
                <CardDescription className="text-balance">{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full"
                  variant={getButtonVariant(plan)}
                  disabled={isCurrentPlan(plan.name) || processingPlan === plan.id}
                  onClick={() => handleUpgrade(plan.id)}
                >
                  {processingPlan === plan.id ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                      Processing...
                    </div>
                  ) : (
                    getButtonText(plan)
                  )}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {/* Enterprise Section */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
              <Crown className="w-6 h-6 text-foreground" />
            </div>
            <div>
              <CardTitle className="text-2xl">Enterprise</CardTitle>
              <CardDescription>For large companies that require additional security.</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              {[
                "Training opt-out by default",
                "SAML SSO",
                "Priority access for better performance and no queues",
                "Dedicated customer support",
                "Access to v0 API",
              ].map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center">
              <Button variant="outline" size="lg">
                Contact Us
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

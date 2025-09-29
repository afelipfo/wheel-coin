"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { useAuth } from "@/lib/auth/auth-context"
import type { UserSubscription, SubscriptionPlan } from "@/lib/types/payment"

export function useSubscription() {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    if (!user) {
      setSubscription(null)
      setPlan(null)
      setLoading(false)
      return
    }

    fetchSubscription()
  }, [user])

  const fetchSubscription = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get user subscription with plan details
      const { data: subData, error: subError } = await supabase
        .from("user_subscriptions")
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .eq("user_id", user!.id)
        .single()

      if (subError && subError.code !== "PGRST116") {
        throw subError
      }

      if (subData) {
        setSubscription(subData)
        setPlan(subData.plan)
      } else {
        // User has no subscription, get basic plan
        const { data: basicPlan, error: planError } = await supabase
          .from("subscription_plans")
          .select("*")
          .eq("name", "basic")
          .single()

        if (planError) throw planError

        setPlan(basicPlan)
        setSubscription(null)
      }
    } catch (err) {
      console.error("Error fetching subscription:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch subscription")
    } finally {
      setLoading(false)
    }
  }

  const hasFeature = (feature: string): boolean => {
    if (!plan) return false
    return plan.features.includes(feature)
  }

  const isWithinLimit = (type: "distance", value: number): boolean => {
    if (!plan) return false
    const limit = plan.limits.distance_limit
    return limit === -1 || value <= limit
  }

  const getRewardsMultiplier = (): number => {
    return plan?.limits.rewards_multiplier || 1.0
  }

  const isPremium = (): boolean => {
    return plan?.name !== "basic"
  }

  const canUpgrade = (): boolean => {
    return plan?.name === "basic" || plan?.name === "pro"
  }

  return {
    subscription,
    plan,
    loading,
    error,
    refetch: fetchSubscription,
    hasFeature,
    isWithinLimit,
    getRewardsMultiplier,
    isPremium,
    canUpgrade,
  }
}

// Payment utility functions
import { createBrowserClient } from "@supabase/ssr"
import { getStripe } from "@/lib/stripe/client"
import type { SubscriptionPlan, BillingCycle } from "@/lib/types/payment"

export async function createCheckoutSession(
  planId: string,
  billingCycle: BillingCycle,
  successUrl?: string,
  cancelUrl?: string,
) {
  const response = await fetch("/api/stripe/create-checkout-session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      planId,
      billingCycle,
      successUrl,
      cancelUrl,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to create checkout session")
  }

  const { sessionId, url } = await response.json()

  // Redirect to Stripe Checkout
  if (url) {
    window.location.href = url
  } else {
    const stripe = await getStripe()
    if (stripe) {
      await stripe.redirectToCheckout({ sessionId })
    }
  }
}

export async function createPortalSession(returnUrl?: string) {
  const response = await fetch("/api/stripe/create-portal-session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      returnUrl,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to create portal session")
  }

  const { url } = await response.json()
  window.location.href = url
}

export function formatPrice(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount)
}

export function calculateYearlySavings(monthlyPrice: number, yearlyPrice: number): number {
  const yearlyMonthlyEquivalent = monthlyPrice * 12
  return yearlyMonthlyEquivalent - yearlyPrice
}

export function calculateSavingsPercentage(monthlyPrice: number, yearlyPrice: number): number {
  const yearlyMonthlyEquivalent = monthlyPrice * 12
  const savings = yearlyMonthlyEquivalent - yearlyPrice
  return Math.round((savings / yearlyMonthlyEquivalent) * 100)
}

export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const { data, error } = await supabase
    .from("subscription_plans")
    .select("*")
    .eq("is_active", true)
    .order("price_monthly", { ascending: true })

  if (error) {
    throw new Error("Failed to fetch subscription plans")
  }

  return data || []
}

export function getPlanFeatures(planName: string): string[] {
  const features: Record<string, string[]> = {
    basic: ["Basic distance tracking", "Standard rewards", "Community access", "Mobile app"],
    pro: [
      "Unlimited distance tracking",
      "2x rewards multiplier",
      "Advanced analytics",
      "Priority support",
      "Premium badges",
    ],
    premium: [
      "Unlimited distance tracking",
      "3x rewards multiplier",
      "Advanced analytics",
      "Priority support",
      "Exclusive events",
      "Custom badges",
      "Early access to features",
    ],
  }

  return features[planName] || []
}

export function getPlanLimits(planName: string) {
  const limits: Record<string, any> = {
    basic: {
      distance_limit: 50,
      rewards_multiplier: 1.0,
      premium_features: false,
    },
    pro: {
      distance_limit: -1,
      rewards_multiplier: 2.0,
      premium_features: true,
      analytics: true,
    },
    premium: {
      distance_limit: -1,
      rewards_multiplier: 3.0,
      premium_features: true,
      analytics: true,
      exclusive_access: true,
    },
  }

  return limits[planName] || limits.basic
}

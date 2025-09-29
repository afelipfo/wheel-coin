// Stripe configuration and utilities
import Stripe from "stripe"

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-06-20",
      typescript: true,
    })
  : null

export const getStripeInstance = (): Stripe => {
  if (!stripe) {
    throw new Error("STRIPE_SECRET_KEY is not set in environment variables")
  }
  return stripe
}

export const STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  currency: "usd",
  successUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/billing/success`,
  cancelUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/billing/cancel`,
} as const

// Subscription plan mapping
export const SUBSCRIPTION_PLANS = {
  basic: {
    name: "basic",
    displayName: "Basic",
    priceMonthly: 0,
    priceYearly: 0,
    stripePriceIdMonthly: null,
    stripePriceIdYearly: null,
  },
  pro: {
    name: "pro",
    displayName: "Pro",
    priceMonthly: 999, // $9.99 in cents
    priceYearly: 9999, // $99.99 in cents
    stripePriceIdMonthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
    stripePriceIdYearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID,
  },
  premium: {
    name: "premium",
    displayName: "Premium",
    priceMonthly: 1999, // $19.99 in cents
    priceYearly: 19999, // $199.99 in cents
    stripePriceIdMonthly: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID,
    stripePriceIdYearly: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID,
  },
} as const

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS
export type BillingCycle = "monthly" | "yearly"

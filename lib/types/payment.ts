// Payment and subscription type definitions
export interface SubscriptionPlan {
  id: string
  name: string
  display_name: string
  description: string
  price_monthly: number
  price_yearly: number
  features: string[]
  limits: {
    distance_limit: number
    rewards_multiplier: number
    premium_features: boolean
    analytics?: boolean
    exclusive_access?: boolean
  }
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UserSubscription {
  id: string
  user_id: string
  plan_id: string
  stripe_subscription_id?: string
  stripe_customer_id?: string
  status: "active" | "canceled" | "past_due" | "unpaid" | "trialing"
  billing_cycle: "monthly" | "yearly"
  current_period_start?: string
  current_period_end?: string
  trial_start?: string
  trial_end?: string
  canceled_at?: string
  created_at: string
  updated_at: string
  plan?: SubscriptionPlan
}

export interface PaymentTransaction {
  id: string
  user_id: string
  subscription_id?: string
  stripe_payment_intent_id?: string
  amount: number
  currency: string
  status: "succeeded" | "failed" | "pending" | "canceled"
  payment_method?: string
  description?: string
  metadata: Record<string, any>
  created_at: string
}

export interface InAppPurchase {
  id: string
  name: string
  description: string
  price: number
  currency: string
  type: "reward_pack" | "badge" | "boost" | "feature_unlock"
  metadata: Record<string, any>
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UserPurchase {
  id: string
  user_id: string
  purchase_id: string
  transaction_id?: string
  quantity: number
  total_amount: number
  status: "completed" | "pending" | "failed"
  created_at: string
  purchase?: InAppPurchase
}

export interface PaymentMethod {
  id: string
  user_id: string
  stripe_payment_method_id: string
  type: string
  last_four?: string
  brand?: string
  exp_month?: number
  exp_year?: number
  is_default: boolean
  created_at: string
}

export interface BillingHistory {
  id: string
  user_id: string
  subscription_id?: string
  stripe_invoice_id?: string
  amount: number
  currency: string
  status: "paid" | "open" | "void" | "uncollectible"
  billing_reason?: string
  invoice_pdf_url?: string
  created_at: string
}

export interface RevenueAnalytics {
  id: string
  date: string
  total_revenue: number
  subscription_revenue: number
  purchase_revenue: number
  new_subscriptions: number
  canceled_subscriptions: number
  active_subscriptions: number
  currency: string
  created_at: string
}

// Stripe webhook event types
export interface StripeWebhookEvent {
  id: string
  type: string
  data: {
    object: any
  }
  created: number
}

// Checkout session data
export interface CheckoutSessionData {
  planId: string
  billingCycle: "monthly" | "yearly"
  userId: string
  successUrl?: string
  cancelUrl?: string
}

// Payment form data
export interface PaymentFormData {
  email: string
  name: string
  paymentMethodId: string
  planId: string
  billingCycle: "monthly" | "yearly"
}

// Advanced payment features and international support types
export interface CurrencySupport {
  code: string
  name: string
  symbol: string
  exchange_rate: number
  is_supported: boolean
  stripe_supported: boolean
  created_at: string
  updated_at: string
}

export interface UsageBasedBilling {
  id: string
  user_id: string
  subscription_id: string
  usage_type: "api_calls" | "storage" | "bandwidth" | "transactions"
  usage_amount: number
  billing_period_start: string
  billing_period_end: string
  rate_per_unit: number
  total_cost: number
  currency: string
  created_at: string
}

export interface DunningManagement {
  id: string
  subscription_id: string
  user_id: string
  attempt_count: number
  max_attempts: number
  next_attempt_date: string
  status: "active" | "paused" | "exhausted" | "resolved"
  failure_reason?: string
  email_sent: boolean
  created_at: string
  updated_at: string
}

export interface PaymentMethodValidation {
  id: string
  user_id: string
  payment_method_id: string
  validation_type: "address" | "cvv" | "3ds" | "bank_verification"
  status: "pending" | "verified" | "failed"
  validation_data: Record<string, any>
  created_at: string
}

export interface TaxCalculation {
  id: string
  user_id: string
  country_code: string
  state_code?: string
  tax_rate: number
  tax_type: "vat" | "gst" | "sales_tax" | "none"
  tax_amount: number
  subtotal: number
  total_amount: number
  created_at: string
}

export interface PaymentAnalytics {
  id: string
  date: string
  currency: string
  total_volume: number
  transaction_count: number
  success_rate: number
  average_transaction_value: number
  chargeback_rate: number
  refund_rate: number
  top_countries: string[]
  payment_methods: Record<string, number>
  created_at: string
}

export interface EnterpriseFeatures {
  id: string
  user_id: string
  feature_type: "custom_billing" | "dedicated_support" | "sla_guarantee" | "priority_processing"
  is_enabled: boolean
  configuration: Record<string, any>
  created_at: string
  updated_at: string
}

import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    })

    const [subscriptionsResult, transactionsResult, purchasesResult, analyticsResult] = await Promise.all([
      supabase.from("user_subscriptions").select(`
        *,
        subscription_plans(*),
        users(email, username)
      `),
      supabase.from("payment_transactions").select("*"),
      supabase.from("user_purchases").select(`
        *,
        in_app_purchases(*)
      `),
      supabase.from("revenue_analytics").select("*").order("date", { ascending: false }).limit(30),
    ])

    const subscriptions = subscriptionsResult.data || []
    const transactions = transactionsResult.data || []
    const purchases = purchasesResult.data || []
    const analytics = analyticsResult.data || []

    // Calculate key metrics
    const activeSubscriptions = subscriptions.filter((sub) => sub.status === "active")
    const totalSubscriptionRevenue = activeSubscriptions.reduce((sum, sub) => {
      if (sub.subscription_plans) {
        const plan = sub.subscription_plans
        return sum + (sub.billing_cycle === "yearly" ? plan.price_yearly : plan.price_monthly)
      }
      return sum
    }, 0)

    const totalPurchaseRevenue = purchases.reduce((sum, purchase) => {
      return sum + (purchase.total_amount || 0)
    }, 0)

    const successfulTransactions = transactions.filter((t) => t.status === "succeeded")
    const failedTransactions = transactions.filter((t) => t.status === "failed")
    const paymentSuccessRate = transactions.length > 0 ? (successfulTransactions.length / transactions.length) * 100 : 0

    // Calculate churn rate (mock calculation)
    const canceledSubscriptions = subscriptions.filter((sub) => sub.status === "canceled")
    const churnRate = subscriptions.length > 0 ? (canceledSubscriptions.length / subscriptions.length) * 100 : 0

    // Calculate ARPU (Average Revenue Per User)
    const totalUsers = subscriptions.length
    const arpu = totalUsers > 0 ? (totalSubscriptionRevenue + totalPurchaseRevenue) / totalUsers : 0

    const revenueData = {
      totalRevenue: (totalSubscriptionRevenue + totalPurchaseRevenue) / 100,
      monthlyRecurringRevenue: totalSubscriptionRevenue / 100,
      oneTimeRevenue: totalPurchaseRevenue / 100,
      activeSubscriptions: activeSubscriptions.length,
      churnRate: churnRate,
      averageRevenuePerUser: arpu / 100,
      paymentSuccessRate: paymentSuccessRate,
      failedPayments: failedTransactions.length,
      totalTransactions: transactions.length,
      subscriptionsByPlan: {
        basic: subscriptions.filter((s) => s.subscription_plans?.name === "basic").length,
        pro: subscriptions.filter((s) => s.subscription_plans?.name === "pro").length,
        premium: subscriptions.filter((s) => s.subscription_plans?.name === "premium").length,
      },
      revenueByPlan: {
        basic: 0, // Basic is free
        pro:
          (subscriptions.filter((s) => s.subscription_plans?.name === "pro" && s.status === "active").length * 999) /
          100,
        premium:
          (subscriptions.filter((s) => s.subscription_plans?.name === "premium" && s.status === "active").length *
            1999) /
          100,
      },
      analytics: analytics,
    }

    return NextResponse.json(revenueData)
  } catch (error) {
    console.error("Error fetching revenue data:", error)
    return NextResponse.json({ error: "Failed to fetch revenue data" }, { status: 500 })
  }
}

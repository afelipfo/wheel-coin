import { type NextRequest, NextResponse } from "next/server"
import { stripe, STRIPE_CONFIG } from "@/lib/stripe/config"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function POST(req: NextRequest) {
  try {
    const { planId, billingCycle, successUrl, cancelUrl } = await req.json()

    const cookieStore = cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set() {},
        remove() {},
      },
    })

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get subscription plan
    const { data: plan, error: planError } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("id", planId)
      .single()

    if (planError || !plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 })
    }

    // Check if user already has a subscription
    const { data: existingSub } = await supabase.from("user_subscriptions").select("*").eq("user_id", user.id).single()

    let customerId: string | undefined

    // Get or create Stripe customer
    if (existingSub?.stripe_customer_id) {
      customerId = existingSub.stripe_customer_id
    } else {
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: {
          user_id: user.id,
        },
      })
      customerId = customer.id
    }

    // Create checkout session
    const price = billingCycle === "yearly" ? plan.price_yearly : plan.price_monthly

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: STRIPE_CONFIG.currency,
            product_data: {
              name: plan.display_name,
              description: plan.description,
            },
            unit_amount: Math.round(price * 100), // Convert to cents
            recurring:
              plan.name !== "basic"
                ? {
                    interval: billingCycle === "yearly" ? "year" : "month",
                  }
                : undefined,
          },
          quantity: 1,
        },
      ],
      mode: plan.name === "basic" ? "payment" : "subscription",
      success_url: successUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/billing/cancel`,
      metadata: {
        user_id: user.id,
        plan_id: planId,
        billing_cycle: billingCycle,
      },
    })

    // Create or update user subscription record
    if (existingSub) {
      await supabase
        .from("user_subscriptions")
        .update({
          plan_id: planId,
          billing_cycle: billingCycle,
          stripe_customer_id: customerId,
          status: "pending",
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
    } else {
      await supabase.from("user_subscriptions").insert({
        user_id: user.id,
        plan_id: planId,
        billing_cycle: billingCycle,
        stripe_customer_id: customerId,
        status: "pending",
      })
    }

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}

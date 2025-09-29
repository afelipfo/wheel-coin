import { type NextRequest, NextResponse } from "next/server"
import { getStripeInstance } from "@/lib/stripe/config"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripeInstance()

    const { purchaseId, quantity = 1 } = await req.json()

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

    // Get purchase details
    const { data: purchase, error: purchaseError } = await supabase
      .from("in_app_purchases")
      .select("*")
      .eq("id", purchaseId)
      .eq("is_active", true)
      .single()

    if (purchaseError || !purchase) {
      return NextResponse.json({ error: "Purchase not found" }, { status: 404 })
    }

    // Get or create Stripe customer
    let customerId: string
    const { data: existingSub } = await supabase
      .from("user_subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single()

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

    // Create payment intent
    const totalAmount = Math.round(purchase.price * quantity * 100) // Convert to cents

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: purchase.currency.toLowerCase(),
      customer: customerId,
      metadata: {
        user_id: user.id,
        purchase_id: purchaseId,
        quantity: quantity.toString(),
        type: "in_app_purchase",
        description: purchase.name,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (error) {
    console.error("Error creating payment intent:", error)
    return NextResponse.json({ error: "Failed to create payment intent" }, { status: 500 })
  }
}

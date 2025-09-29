import { headers } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe/config"
import { createServerClient } from "@supabase/ssr"
import type Stripe from "stripe"

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = headers().get("stripe-signature")!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      get() {
        return undefined
      },
      set() {},
      remove() {},
    },
  })

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdate(supabase, subscription)
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionCancellation(supabase, subscription)
        break
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentSucceeded(supabase, invoice)
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(supabase, invoice)
        break
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handleOneTimePayment(supabase, paymentIntent)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook handler error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}

async function handleSubscriptionUpdate(supabase: any, subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string
  const subscriptionId = subscription.id

  // Get user by Stripe customer ID
  const { data: userSub } = await supabase
    .from("user_subscriptions")
    .select("user_id, plan_id")
    .eq("stripe_customer_id", customerId)
    .single()

  if (!userSub) {
    console.error("User subscription not found for customer:", customerId)
    return
  }

  // Update subscription status
  const { error } = await supabase
    .from("user_subscriptions")
    .update({
      stripe_subscription_id: subscriptionId,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_customer_id", customerId)

  if (error) {
    console.error("Error updating subscription:", error)
  }
}

async function handleSubscriptionCancellation(supabase: any, subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string

  const { error } = await supabase
    .from("user_subscriptions")
    .update({
      status: "canceled",
      canceled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_customer_id", customerId)

  if (error) {
    console.error("Error canceling subscription:", error)
  }
}

async function handlePaymentSucceeded(supabase: any, invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string
  const subscriptionId = invoice.subscription as string

  // Get user subscription
  const { data: userSub } = await supabase
    .from("user_subscriptions")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .single()

  if (!userSub) return

  // Record billing history
  await supabase.from("billing_history").insert({
    user_id: userSub.user_id,
    stripe_invoice_id: invoice.id,
    amount: invoice.amount_paid / 100, // Convert from cents
    currency: invoice.currency.toUpperCase(),
    status: "paid",
    billing_reason: invoice.billing_reason,
    invoice_pdf_url: invoice.invoice_pdf,
  })

  // Record payment transaction
  await supabase.from("payment_transactions").insert({
    user_id: userSub.user_id,
    amount: invoice.amount_paid / 100,
    currency: invoice.currency.toUpperCase(),
    status: "succeeded",
    payment_method: "stripe",
    description: `Subscription payment - ${invoice.billing_reason}`,
  })
}

async function handlePaymentFailed(supabase: any, invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string

  const { data: userSub } = await supabase
    .from("user_subscriptions")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .single()

  if (!userSub) return

  // Update subscription status to past_due
  await supabase.from("user_subscriptions").update({ status: "past_due" }).eq("stripe_customer_id", customerId)

  // Record failed payment
  await supabase.from("payment_transactions").insert({
    user_id: userSub.user_id,
    amount: invoice.amount_due / 100,
    currency: invoice.currency.toUpperCase(),
    status: "failed",
    payment_method: "stripe",
    description: `Failed subscription payment - ${invoice.billing_reason}`,
  })
}

async function handleOneTimePayment(supabase: any, paymentIntent: Stripe.PaymentIntent) {
  const metadata = paymentIntent.metadata
  const userId = metadata.user_id

  if (!userId) return

  // Record one-time payment transaction
  await supabase.from("payment_transactions").insert({
    user_id: userId,
    stripe_payment_intent_id: paymentIntent.id,
    amount: paymentIntent.amount / 100,
    currency: paymentIntent.currency.toUpperCase(),
    status: "succeeded",
    payment_method: paymentIntent.payment_method_types[0],
    description: metadata.description || "One-time purchase",
    metadata: metadata,
  })
}

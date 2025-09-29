"use client"

import { loadStripe } from "@stripe/stripe-js"
import { STRIPE_CONFIG } from "./config"

let stripePromise: Promise<any> | null = null

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_CONFIG.publishableKey)
  }
  return stripePromise
}

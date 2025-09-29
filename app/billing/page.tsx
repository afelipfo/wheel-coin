"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreditCard, Calendar, Download, Settings, Zap, Crown, Star, AlertCircle, BarChart3 } from "lucide-react"
import { useAuth } from "@/lib/auth/auth-context"
import { useSubscription } from "@/lib/hooks/use-subscription"
import { createPortalSession, formatPrice } from "@/lib/utils/payment"
import { toast } from "sonner"
import Link from "next/link"
import { SubscriptionStatus } from "@/components/billing/subscription-status"
import { InAppPurchases } from "@/components/billing/in-app-purchases"
import { UsageBasedBilling } from "@/components/billing/usage-based-billing"
import { DunningManagement } from "@/components/billing/dunning-management"
import { EnterpriseFeatures } from "@/components/billing/enterprise-features"
import { MultiCurrencySelector } from "@/components/billing/multi-currency-selector"
import { TaxCalculator } from "@/components/billing/tax-calculator"
import type { BillingHistory, PaymentTransaction } from "@/lib/types/payment"

const planIcons = {
  basic: Star,
  pro: Zap,
  premium: Crown,
}

export default function BillingPage() {
  const { user } = useAuth()
  const { subscription, plan, loading: subscriptionLoading, refetch } = useSubscription()
  const [billingHistory, setBillingHistory] = useState<BillingHistory[]>([])
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState("USD")
  const [taxAmount, setTaxAmount] = useState(0)
  const [totalAmount, setTotalAmount] = useState(0)

  useEffect(() => {
    if (user) {
      fetchBillingData()
    }
  }, [user])

  const fetchBillingData = async () => {
    try {
      setLoading(true)

      // Fetch billing history and transactions in parallel
      const [billingResponse, transactionsResponse] = await Promise.all([
        fetch("/api/billing/history"),
        fetch("/api/billing/transactions"),
      ])

      if (billingResponse.ok) {
        const billingData = await billingResponse.json()
        setBillingHistory(billingData)
      }

      if (transactionsResponse.ok) {
        const transactionData = await transactionsResponse.json()
        setTransactions(transactionData)
      }
    } catch (error) {
      console.error("Error fetching billing data:", error)
      toast.error("Failed to load billing information")
    } finally {
      setLoading(false)
    }
  }

  const handleManageSubscription = async () => {
    if (!subscription?.stripe_customer_id) {
      toast.error("No subscription found")
      return
    }

    setPortalLoading(true)
    try {
      await createPortalSession()
    } catch (error) {
      console.error("Error opening customer portal:", error)
      toast.error("Failed to open billing portal")
    } finally {
      setPortalLoading(false)
    }
  }

  const handleTaxCalculated = (tax: number, total: number) => {
    setTaxAmount(tax)
    setTotalAmount(total)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      trialing: "secondary",
      past_due: "destructive",
      canceled: "outline",
      unpaid: "destructive",
    }
    return variants[status] || "outline"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
          <p className="text-muted-foreground mb-8">Please sign in to view your billing information.</p>
          <Button asChild>
            <Link href="/auth/login">Sign In</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (subscriptionLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading billing information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Billing & Subscription</h1>
          <p className="text-muted-foreground mt-2">Manage your subscription and billing information</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="usage">Usage</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="enterprise">Enterprise</TabsTrigger>
            <TabsTrigger value="international">International</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Subscription Status */}
              <div className="lg:col-span-2 space-y-8">
                <SubscriptionStatus />

                {/* Plan Features */}
                {plan && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Plan Features</CardTitle>
                      <CardDescription>What's included in your current plan</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* In-App Purchases */}
                <InAppPurchases />
              </div>

              {/* Right Column - Quick Actions */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button asChild className="w-full">
                      <Link href="/pricing">
                        <Zap className="w-4 h-4 mr-2" />
                        View All Plans
                      </Link>
                    </Button>

                    {subscription?.stripe_customer_id && (
                      <Button
                        onClick={handleManageSubscription}
                        disabled={portalLoading}
                        variant="outline"
                        className="w-full bg-transparent"
                      >
                        {portalLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                            Loading...
                          </div>
                        ) : (
                          <>
                            <Settings className="w-4 h-4 mr-2" />
                            Manage Subscription
                          </>
                        )}
                      </Button>
                    )}

                    <Button asChild variant="ghost" className="w-full">
                      <Link href="/dashboard">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        View Dashboard
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                {/* Usage Stats */}
                {plan && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Usage This Month</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Distance tracked</span>
                        <span className="font-medium">0 km</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Rewards earned</span>
                        <span className="font-medium text-secondary">0 coins</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Multiplier active</span>
                        <Badge variant="secondary">{plan.limits.rewards_multiplier}x</Badge>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="usage" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {user && <UsageBasedBilling userId={user.id} />}
              {user && <DunningManagement userId={user.id} />}
            </div>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>Manage your payment methods and billing preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <CreditCard className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No payment methods on file</p>
                    <Button variant="outline">Add Payment Method</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Billing Preferences</CardTitle>
                  <CardDescription>Configure your billing and invoice preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Email invoices</span>
                    <Badge variant="outline">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Auto-pay</span>
                    <Badge variant="outline">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Invoice format</span>
                    <Badge variant="outline">PDF</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="enterprise" className="space-y-6">
            {user && plan && <EnterpriseFeatures userId={user.id} planName={plan.name} />}
          </TabsContent>

          <TabsContent value="international" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <MultiCurrencySelector
                selectedCurrency={selectedCurrency}
                onCurrencyChange={setSelectedCurrency}
                amount={plan ? plan.price_monthly / 100 : 0}
              />
              <TaxCalculator subtotal={plan ? plan.price_monthly / 100 : 0} onTaxCalculated={handleTaxCalculated} />
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            {/* Billing History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Billing History
                </CardTitle>
                <CardDescription>Your recent invoices and payments</CardDescription>
              </CardHeader>
              <CardContent>
                {billingHistory.length > 0 ? (
                  <div className="space-y-4">
                    {billingHistory.map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <CreditCard className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{formatPrice(invoice.amount)}</div>
                            <div className="text-sm text-muted-foreground">
                              {formatDate(invoice.created_at)} • {invoice.billing_reason || "Subscription"}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={invoice.status === "paid" ? "default" : "destructive"}>
                            {invoice.status}
                          </Badge>
                          {invoice.invoice_pdf_url && (
                            <Button size="sm" variant="ghost" asChild>
                              <a href={invoice.invoice_pdf_url} target="_blank" rel="noopener noreferrer">
                                <Download className="w-4 h-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No billing history available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

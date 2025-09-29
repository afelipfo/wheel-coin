"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, Zap, Award, Star, Package, Clock } from "lucide-react"
import { useAuth } from "@/lib/auth/auth-context"
import { formatPrice } from "@/lib/utils/payment"
import { toast } from "sonner"
import type { InAppPurchase } from "@/lib/types/payment"

const purchaseIcons = {
  reward_pack: Package,
  badge: Award,
  boost: Zap,
  feature_unlock: Star,
}

export function InAppPurchases() {
  const { user } = useAuth()
  const [purchases, setPurchases] = useState<InAppPurchase[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    fetchPurchases()
  }, [])

  const fetchPurchases = async () => {
    try {
      const response = await fetch("/api/in-app-purchases")
      if (response.ok) {
        const data = await response.json()
        setPurchases(data)
      }
    } catch (error) {
      console.error("Error fetching purchases:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async (purchaseId: string) => {
    if (!user) {
      toast.error("Please sign in to make a purchase")
      return
    }

    setProcessingId(purchaseId)
    try {
      const response = await fetch("/api/stripe/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          purchaseId,
          quantity: 1,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create payment intent")
      }

      const { clientSecret } = await response.json()

      // In a real implementation, you would use Stripe Elements here
      // For now, we'll simulate a successful purchase
      toast.success("Purchase completed successfully!")
    } catch (error) {
      console.error("Error processing purchase:", error)
      toast.error("Failed to process purchase")
    } finally {
      setProcessingId(null)
    }
  }

  const getPurchaseDescription = (purchase: InAppPurchase) => {
    const metadata = purchase.metadata
    switch (purchase.type) {
      case "boost":
        return `${metadata.multiplier}x rewards for ${metadata.duration_days} days`
      case "reward_pack":
        return `Instant ${metadata.coin_amount} Wheel-coins`
      case "badge":
        return `${metadata.rarity} ${metadata.badge_type} badge`
      case "feature_unlock":
        return `${metadata.features?.join(", ")} for ${metadata.duration_days} days`
      default:
        return purchase.description
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            In-App Purchases
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading purchases...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          In-App Purchases
        </CardTitle>
        <CardDescription>Boost your rewards and unlock exclusive features</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          {purchases.map((purchase) => {
            const Icon = purchaseIcons[purchase.type as keyof typeof purchaseIcons] || Package
            const isProcessing = processingId === purchase.id

            return (
              <Card key={purchase.id} className="relative">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{purchase.name}</CardTitle>
                        <CardDescription className="text-sm">{getPurchaseDescription(purchase)}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {purchase.type.replace("_", " ")}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <Separator className="mb-4" />
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{formatPrice(purchase.price)}</div>
                    <Button onClick={() => handlePurchase(purchase.id)} disabled={isProcessing} size="sm">
                      {isProcessing ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                          Processing...
                        </div>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Buy Now
                        </>
                      )}
                    </Button>
                  </div>

                  {purchase.type === "boost" && purchase.metadata.duration_days && (
                    <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      Limited time offer
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {purchases.length === 0 && (
          <div className="text-center py-8">
            <ShoppingCart className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No purchases available at the moment</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

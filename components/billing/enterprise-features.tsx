"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createBrowserClient } from "@supabase/ssr"
import { Crown, Shield, Headphones, Zap, Clock, CheckCircle } from "lucide-react"

interface EnterpriseFeature {
  id: string
  type: string
  name: string
  description: string
  is_enabled: boolean
  icon: any
  color: string
}

interface EnterpriseFeaturesProps {
  userId: string
  planName: string
}

export function EnterpriseFeatures({ userId, planName }: EnterpriseFeaturesProps) {
  const [features, setFeatures] = useState<EnterpriseFeature[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    async function fetchEnterpriseFeatures() {
      try {
        // Mock enterprise features - in production, this would come from your database
        const mockFeatures: EnterpriseFeature[] = [
          {
            id: "custom_billing",
            type: "custom_billing",
            name: "Custom Billing",
            description: "Flexible billing cycles and custom invoicing",
            is_enabled: planName === "premium",
            icon: Crown,
            color: "text-purple-600",
          },
          {
            id: "dedicated_support",
            type: "dedicated_support",
            name: "Dedicated Support",
            description: "Priority support with dedicated account manager",
            is_enabled: planName === "premium",
            icon: Headphones,
            color: "text-blue-600",
          },
          {
            id: "sla_guarantee",
            type: "sla_guarantee",
            name: "SLA Guarantee",
            description: "99.9% uptime guarantee with service credits",
            is_enabled: planName === "premium",
            icon: Shield,
            color: "text-green-600",
          },
          {
            id: "priority_processing",
            type: "priority_processing",
            name: "Priority Processing",
            description: "Faster payment processing and reduced latency",
            is_enabled: planName !== "basic",
            icon: Zap,
            color: "text-yellow-600",
          },
        ]

        setFeatures(mockFeatures)
      } catch (error) {
        console.error("Error fetching enterprise features:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchEnterpriseFeatures()
  }, [userId, planName, supabase])

  const handleFeatureToggle = async (featureId: string, enabled: boolean) => {
    try {
      // Update feature status
      setFeatures((prev) =>
        prev.map((feature) => (feature.id === featureId ? { ...feature, is_enabled: enabled } : feature)),
      )

      // In production, you would make an API call here
      console.log(`Toggling feature ${featureId} to ${enabled}`)
    } catch (error) {
      console.error("Error toggling feature:", error)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-muted rounded w-48 animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const enabledFeatures = features.filter((f) => f.is_enabled)
  const availableFeatures = features.filter((f) => !f.is_enabled)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-purple-600" />
          Enterprise Features
        </CardTitle>
        <CardDescription>Advanced features and capabilities for your plan</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enabled Features */}
        {enabledFeatures.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Active Features</h4>
            {enabledFeatures.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${feature.color}`} />
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {feature.name}
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="text-sm text-muted-foreground">{feature.description}</div>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Active</Badge>
                </div>
              )
            })}
          </div>
        )}

        {/* Available Features */}
        {availableFeatures.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
              Available with Upgrade
            </h4>
            {availableFeatures.map((feature) => {
              const Icon = feature.icon
              return (
                <div key={feature.id} className="flex items-center justify-between p-4 border rounded-lg opacity-60">
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${feature.color}`} />
                    <div>
                      <div className="font-medium">{feature.name}</div>
                      <div className="text-sm text-muted-foreground">{feature.description}</div>
                    </div>
                  </div>
                  <Badge variant="outline">Premium</Badge>
                </div>
              )
            })}

            {planName !== "premium" && (
              <div className="pt-4 border-t">
                <Button className="w-full" asChild>
                  <a href="/pricing">
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade to Premium
                  </a>
                </Button>
              </div>
            )}
          </div>
        )}

        {/* SLA Information */}
        {planName === "premium" && (
          <div className="pt-6 border-t">
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <h4 className="font-medium text-blue-800 dark:text-blue-200">Service Level Agreement</h4>
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <p>• 99.9% uptime guarantee</p>
                <p>• Less than 2 hour response time for critical issues</p>
                <p>• Service credits for downtime</p>
                <p>• Dedicated account manager</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

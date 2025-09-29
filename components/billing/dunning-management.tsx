"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createBrowserClient } from "@supabase/ssr"
import { AlertTriangle, Clock, Mail, CreditCard, CheckCircle } from "lucide-react"

interface DunningCase {
  id: string
  subscription_id: string
  attempt_count: number
  max_attempts: number
  next_attempt_date: string
  status: "active" | "paused" | "exhausted" | "resolved"
  failure_reason?: string
  email_sent: boolean
  created_at: string
}

interface DunningManagementProps {
  userId: string
}

export function DunningManagement({ userId }: DunningManagementProps) {
  const [dunningCases, setDunningCases] = useState<DunningCase[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    async function fetchDunningData() {
      try {
        // Mock dunning data - in production, this would come from your database
        const mockDunningCases: DunningCase[] = [
          {
            id: "dun_1",
            subscription_id: "sub_123",
            attempt_count: 2,
            max_attempts: 4,
            next_attempt_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            status: "active",
            failure_reason: "insufficient_funds",
            email_sent: true,
            created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ]

        setDunningCases(mockDunningCases)
      } catch (error) {
        console.error("Error fetching dunning data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDunningData()
  }, [userId, supabase])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Active</Badge>
      case "paused":
        return <Badge variant="secondary">Paused</Badge>
      case "exhausted":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Exhausted</Badge>
      case "resolved":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Resolved</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getFailureReasonText = (reason?: string) => {
    switch (reason) {
      case "insufficient_funds":
        return "Insufficient funds"
      case "card_declined":
        return "Card declined"
      case "expired_card":
        return "Card expired"
      case "authentication_required":
        return "Authentication required"
      default:
        return "Unknown error"
    }
  }

  const handleRetryPayment = async (caseId: string) => {
    try {
      // Implement retry payment logic
      console.log("Retrying payment for case:", caseId)
    } catch (error) {
      console.error("Error retrying payment:", error)
    }
  }

  const handleUpdatePaymentMethod = () => {
    // Redirect to payment method update page
    window.location.href = "/billing?tab=payment-methods"
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-muted rounded w-48 animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="h-32 bg-muted rounded animate-pulse"></div>
        </CardContent>
      </Card>
    )
  }

  if (dunningCases.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Payment Status
          </CardTitle>
          <CardDescription>All payments are up to date</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <p className="text-muted-foreground">No payment issues detected</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          Payment Issues
        </CardTitle>
        <CardDescription>Automatic retry attempts for failed payments</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {dunningCases.map((dunningCase) => (
          <Alert key={dunningCase.id} className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-yellow-800 dark:text-yellow-200">
                      Payment Failed - {getFailureReasonText(dunningCase.failure_reason)}
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      Attempt {dunningCase.attempt_count} of {dunningCase.max_attempts}
                    </p>
                  </div>
                  {getStatusBadge(dunningCase.status)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-yellow-600" />
                    <span>Next attempt: {new Date(dunningCase.next_attempt_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-yellow-600" />
                    <span>Email notification: {dunningCase.email_sent ? "Sent" : "Pending"}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRetryPayment(dunningCase.id)}
                    className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Retry Payment
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleUpdatePaymentMethod}
                    className="text-yellow-700 border-yellow-300 hover:bg-yellow-100 bg-transparent"
                  >
                    Update Payment Method
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        ))}

        {/* Dunning Process Information */}
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Automatic Retry Process</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• 1st retry: 3 days after initial failure</p>
            <p>• 2nd retry: 7 days after initial failure</p>
            <p>• 3rd retry: 14 days after initial failure</p>
            <p>• Final retry: 21 days after initial failure</p>
            <p className="mt-2 font-medium">After all retries are exhausted, your subscription will be canceled.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

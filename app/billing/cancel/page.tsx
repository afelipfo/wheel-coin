"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { XCircle, ArrowLeft, HelpCircle, MessageSquare } from "lucide-react"
import Link from "next/link"

export default function BillingCancelPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <Card className="text-center">
          <CardHeader className="pb-8">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-8 h-8 text-muted-foreground" />
            </div>
            <CardTitle className="text-3xl mb-2">Payment Cancelled</CardTitle>
            <CardDescription className="text-lg">
              No worries! Your subscription upgrade was cancelled and no payment was processed.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="bg-muted/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">What happened?</h3>
              <p className="text-muted-foreground text-left">
                You cancelled the payment process before it was completed. This is completely normal and happens when:
              </p>
              <ul className="text-left text-muted-foreground mt-4 space-y-2">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-2"></div>
                  You decided to review the plan details again
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-2"></div>
                  You wanted to compare different pricing options
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-2"></div>
                  You encountered a technical issue during checkout
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Ready to try again?</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <Button asChild className="h-auto p-4">
                  <Link href="/pricing" className="flex flex-col items-center gap-2">
                    <ArrowLeft className="w-5 h-5" />
                    <span>View Pricing</span>
                    <span className="text-xs opacity-75">Compare all plans</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-auto p-4 bg-transparent">
                  <Link href="/dashboard" className="flex flex-col items-center gap-2">
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back to Dashboard</span>
                    <span className="text-xs opacity-75">Continue with current plan</span>
                  </Link>
                </Button>
              </div>
            </div>

            <div className="border-t pt-6">
              <h4 className="font-medium mb-4">Need Help?</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/feedback" className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4" />
                    Get Support
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/community" className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Ask Community
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

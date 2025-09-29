import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function SignupSuccessPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-background to-muted/20">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          {/* Logo Header */}
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Welcome to Wheel-coin!</h1>
          </div>

          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl flex items-center justify-center gap-2">
                <Mail className="w-6 h-6 text-primary" />
                Check Your Email
              </CardTitle>
              <CardDescription>We&apos;ve sent you a confirmation link</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                You&apos;ve successfully signed up for Wheel-coin! Please check your email and click the confirmation
                link to activate your account and start earning rewards for your mobility.
              </p>

              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium mb-2">What happens next?</p>
                <ul className="text-xs text-muted-foreground space-y-1 text-left">
                  <li>• Check your email inbox (and spam folder)</li>
                  <li>• Click the confirmation link</li>
                  <li>• Sign in to start tracking your distance</li>
                  <li>• Begin earning Wheel-coins for your mobility!</li>
                </ul>
              </div>

              <Button asChild className="w-full">
                <Link href="/auth/login">Return to Sign In</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

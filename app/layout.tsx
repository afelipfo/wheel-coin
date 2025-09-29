import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { AuthProvider } from "@/lib/auth/auth-context"
import { Navigation } from "@/components/navigation"
import { ChatbotWidget } from "@/components/ai/chatbot-widget"
import "./globals.css"

export const metadata: Metadata = {
  title: "Wheel-coin - Crypto Rewards for Mobility",
  description: "Revolutionary mobility tracking app that rewards wheelchair users with cryptocurrency for movement",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans antialiased">
        <AuthProvider>
          <div className="min-h-screen bg-background">
            <Navigation />
            <main>
              <Suspense
                fallback={
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                }
              >
                {children}
              </Suspense>
            </main>
            <ChatbotWidget />
          </div>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}

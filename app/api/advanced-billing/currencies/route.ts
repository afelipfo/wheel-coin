import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    })

    // Mock currency data - in production, this would come from a currency service
    const currencies = [
      { code: "USD", name: "US Dollar", symbol: "$", exchange_rate: 1.0, is_supported: true, stripe_supported: true },
      { code: "EUR", name: "Euro", symbol: "€", exchange_rate: 0.85, is_supported: true, stripe_supported: true },
      {
        code: "GBP",
        name: "British Pound",
        symbol: "£",
        exchange_rate: 0.73,
        is_supported: true,
        stripe_supported: true,
      },
      {
        code: "CAD",
        name: "Canadian Dollar",
        symbol: "C$",
        exchange_rate: 1.25,
        is_supported: true,
        stripe_supported: true,
      },
      {
        code: "AUD",
        name: "Australian Dollar",
        symbol: "A$",
        exchange_rate: 1.35,
        is_supported: true,
        stripe_supported: true,
      },
      {
        code: "JPY",
        name: "Japanese Yen",
        symbol: "¥",
        exchange_rate: 110.0,
        is_supported: true,
        stripe_supported: true,
      },
      {
        code: "CHF",
        name: "Swiss Franc",
        symbol: "CHF",
        exchange_rate: 0.92,
        is_supported: true,
        stripe_supported: true,
      },
      {
        code: "SEK",
        name: "Swedish Krona",
        symbol: "kr",
        exchange_rate: 8.5,
        is_supported: true,
        stripe_supported: true,
      },
      {
        code: "NOK",
        name: "Norwegian Krone",
        symbol: "kr",
        exchange_rate: 8.8,
        is_supported: true,
        stripe_supported: true,
      },
      {
        code: "DKK",
        name: "Danish Krone",
        symbol: "kr",
        exchange_rate: 6.3,
        is_supported: true,
        stripe_supported: true,
      },
    ]

    return NextResponse.json(currencies.filter((c) => c.is_supported))
  } catch (error) {
    console.error("Error fetching currencies:", error)
    return NextResponse.json({ error: "Failed to fetch currencies" }, { status: 500 })
  }
}

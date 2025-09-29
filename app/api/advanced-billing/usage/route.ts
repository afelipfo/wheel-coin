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

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Mock usage data - in production, this would come from your usage tracking system
    const usageData = [
      {
        id: "usage_1",
        user_id: userId,
        usage_type: "api_calls",
        usage_amount: 8750,
        billing_period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        billing_period_end: new Date().toISOString(),
        rate_per_unit: 0.001,
        total_cost: 0, // No overage yet
        currency: "USD",
        created_at: new Date().toISOString(),
      },
      {
        id: "usage_2",
        user_id: userId,
        usage_type: "storage",
        usage_amount: 2.3,
        billing_period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        billing_period_end: new Date().toISOString(),
        rate_per_unit: 0.1,
        total_cost: 0, // No overage yet
        currency: "USD",
        created_at: new Date().toISOString(),
      },
    ]

    return NextResponse.json(usageData)
  } catch (error) {
    console.error("Error fetching usage data:", error)
    return NextResponse.json({ error: "Failed to fetch usage data" }, { status: 500 })
  }
}

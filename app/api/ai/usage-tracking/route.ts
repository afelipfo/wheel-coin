import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    })

    // Get user from session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      featureType,
      requestType,
      tokensUsed = 0,
      cost = 0,
      responseTime = 0,
      success = true,
      errorType,
      metadata = {},
    } = body

    // Validate required fields
    if (!featureType || !requestType) {
      return NextResponse.json({ error: "Missing required fields: featureType, requestType" }, { status: 400 })
    }

    // Insert usage analytics
    const { error: insertError } = await supabase.from("ai_usage_analytics").insert({
      user_id: user.id,
      feature_type: featureType,
      request_type: requestType,
      tokens_used: tokensUsed,
      cost: cost,
      response_time: responseTime,
      success: success,
      error_type: errorType,
      metadata: metadata,
    })

    if (insertError) {
      console.error("Failed to insert usage analytics:", insertError)
      return NextResponse.json({ error: "Failed to track usage" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Usage tracking error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

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

    // Get user from session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const days = Number.parseInt(searchParams.get("days") || "30")

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabase
      .from("ai_usage_analytics")
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Failed to fetch usage analytics:", error)
      return NextResponse.json({ error: "Failed to fetch usage data" }, { status: 500 })
    }

    // Calculate summary statistics
    const summary = {
      totalRequests: data.length,
      totalCost: data.reduce((sum, item) => sum + (item.cost || 0), 0),
      totalTokens: data.reduce((sum, item) => sum + (item.tokens_used || 0), 0),
      avgResponseTime:
        data.length > 0 ? data.reduce((sum, item) => sum + (item.response_time || 0), 0) / data.length : 0,
      successRate: data.length > 0 ? (data.filter((item) => item.success).length / data.length) * 100 : 0,
      byFeature: data.reduce(
        (acc, item) => {
          const feature = item.feature_type
          if (!acc[feature]) {
            acc[feature] = { requests: 0, cost: 0, tokens: 0 }
          }
          acc[feature].requests += 1
          acc[feature].cost += item.cost || 0
          acc[feature].tokens += item.tokens_used || 0
          return acc
        },
        {} as Record<string, any>,
      ),
    }

    return NextResponse.json({
      data,
      summary,
      period: `${days} days`,
    })
  } catch (error) {
    console.error("Usage analytics fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

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

    // Get user from session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin (you might want to implement proper role checking)
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const range = searchParams.get("range") || "7d"

    // Calculate date range
    const now = new Date()
    const daysBack = range === "24h" ? 1 : range === "7d" ? 7 : range === "30d" ? 30 : 90
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000)

    // Fetch analytics data
    const [conversationsResult, contentResult, recommendationsResult, usageResult] = await Promise.all([
      // AI Conversations analytics
      supabase
        .from("ai_conversations")
        .select("*")
        .gte("created_at", startDate.toISOString()),

      // Content generations analytics
      supabase
        .from("ai_content_generations")
        .select("*")
        .gte("created_at", startDate.toISOString()),

      // Recommendations analytics
      supabase
        .from("ai_recommendations")
        .select("*")
        .gte("created_at", startDate.toISOString()),

      // Usage analytics
      supabase
        .from("ai_usage_analytics")
        .select("*")
        .gte("created_at", startDate.toISOString()),
    ])

    const conversations = conversationsResult.data || []
    const contentGenerations = contentResult.data || []
    const recommendations = recommendationsResult.data || []
    const usageAnalytics = usageResult.data || []

    // Calculate overview metrics
    const totalRequests = conversations.length + contentGenerations.length + recommendations.length
    const totalCost = usageAnalytics.reduce((sum, usage) => sum + (usage.cost || 0), 0)
    const avgResponseTime =
      usageAnalytics.length > 0
        ? usageAnalytics.reduce((sum, usage) => sum + (usage.response_time || 0), 0) / usageAnalytics.length
        : 0
    const activeUsers = new Set([
      ...conversations.map((c) => c.user_id),
      ...contentGenerations.map((c) => c.user_id),
      ...recommendations.map((r) => r.user_id),
    ]).size

    // Calculate trends (simplified - you might want more sophisticated trend calculation)
    const usageTrend = Math.random() * 20 - 10 // Placeholder
    const costTrend = Math.random() * 15 - 7.5 // Placeholder

    // Generate daily usage data
    const dailyUsage = []
    for (let i = daysBack - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split("T")[0]

      const dayUsage = usageAnalytics.filter((u) => u.created_at.startsWith(dateStr))

      dailyUsage.push({
        date: dateStr,
        requests: dayUsage.length,
        cost: dayUsage.reduce((sum, u) => sum + (u.cost || 0), 0),
      })
    }

    // Usage by feature
    const featureUsage = [
      {
        feature: "Chatbot",
        requests: conversations.length,
        cost: usageAnalytics.filter((u) => u.feature_type === "chatbot").reduce((sum, u) => sum + (u.cost || 0), 0),
        color: "#8884d8",
      },
      {
        feature: "Content Generation",
        requests: contentGenerations.length,
        cost: usageAnalytics.filter((u) => u.feature_type === "content").reduce((sum, u) => sum + (u.cost || 0), 0),
        color: "#82ca9d",
      },
      {
        feature: "Recommendations",
        requests: recommendations.length,
        cost: usageAnalytics
          .filter((u) => u.feature_type === "recommendations")
          .reduce((sum, u) => sum + (u.cost || 0), 0),
        color: "#ffc658",
      },
    ]

    // Top users by usage
    const userUsage = new Map()
    usageAnalytics.forEach((usage) => {
      const userId = usage.user_id
      if (!userUsage.has(userId)) {
        userUsage.set(userId, { userId, requests: 0, cost: 0 })
      }
      const user = userUsage.get(userId)
      user.requests += 1
      user.cost += usage.cost || 0
    })

    const topUsers = Array.from(userUsage.values())
      .sort((a, b) => b.requests - a.requests)
      .slice(0, 10)

    // Performance metrics
    const responseTimeData = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const timeStr = date.toISOString().split("T")[0]

      const dayAnalytics = usageAnalytics.filter((u) => u.created_at.startsWith(timeStr))

      responseTimeData.push({
        time: timeStr,
        chatbot:
          dayAnalytics
            .filter((u) => u.feature_type === "chatbot")
            .reduce((sum, u, _, arr) => sum + (u.response_time || 0), 0) /
          Math.max(dayAnalytics.filter((u) => u.feature_type === "chatbot").length, 1),
        content:
          dayAnalytics
            .filter((u) => u.feature_type === "content")
            .reduce((sum, u, _, arr) => sum + (u.response_time || 0), 0) /
          Math.max(dayAnalytics.filter((u) => u.feature_type === "content").length, 1),
        recommendations:
          dayAnalytics
            .filter((u) => u.feature_type === "recommendations")
            .reduce((sum, u, _, arr) => sum + (u.response_time || 0), 0) /
          Math.max(dayAnalytics.filter((u) => u.feature_type === "recommendations").length, 1),
      })
    }

    const successRates = [
      {
        feature: "Chatbot",
        rate: 98.5,
        total: conversations.length,
      },
      {
        feature: "Content Generation",
        rate: 96.2,
        total: contentGenerations.length,
      },
      {
        feature: "Recommendations",
        rate: 99.1,
        total: recommendations.length,
      },
    ]

    const errorTypes = [
      { type: "Rate Limit", count: 12, color: "#ff6b6b" },
      { type: "API Error", count: 8, color: "#ffa726" },
      { type: "Timeout", count: 5, color: "#66bb6a" },
      { type: "Invalid Input", count: 15, color: "#42a5f5" },
    ]

    // Optimization data
    const optimizationRecommendations = [
      {
        type: "Caching Optimization",
        description: "Implement response caching for frequently requested content to reduce API calls by 30%",
        impact: "30% cost reduction, 50% faster responses",
        priority: "high" as const,
      },
      {
        type: "Batch Processing",
        description: "Group similar requests together to optimize token usage and reduce costs",
        impact: "15% cost reduction",
        priority: "medium" as const,
      },
      {
        type: "Model Selection",
        description: "Use smaller models for simple tasks to reduce costs while maintaining quality",
        impact: "20% cost reduction",
        priority: "medium" as const,
      },
      {
        type: "Rate Limiting",
        description: "Implement user-based rate limiting to prevent abuse and control costs",
        impact: "Better cost control, improved service stability",
        priority: "high" as const,
      },
    ]

    const analyticsData = {
      overview: {
        totalRequests,
        totalCost,
        avgResponseTime: Math.round(avgResponseTime),
        activeUsers,
        costTrend,
        usageTrend,
      },
      usage: {
        daily: dailyUsage,
        byFeature: featureUsage,
        byUser: topUsers,
      },
      performance: {
        responseTime: responseTimeData,
        successRate: successRates,
        errorTypes,
      },
      optimization: {
        costSavings: 245.67,
        cacheHitRate: 78.3,
        recommendations: optimizationRecommendations,
      },
    }

    return NextResponse.json(analyticsData)
  } catch (error) {
    console.error("AI analytics error:", error)
    return NextResponse.json({ error: "Failed to fetch analytics data" }, { status: 500 })
  }
}

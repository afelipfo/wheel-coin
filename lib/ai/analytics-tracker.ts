import { createBrowserClient } from "@supabase/ssr"

interface AIUsageData {
  userId: string
  featureType: "chatbot" | "content" | "recommendations"
  requestType: string
  tokensUsed?: number
  cost?: number
  responseTime?: number
  success?: boolean
  errorType?: string
  metadata?: Record<string, any>
}

class AIAnalyticsTracker {
  private supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  async trackUsage(data: AIUsageData) {
    try {
      const { error } = await this.supabase.from("ai_usage_analytics").insert({
        user_id: data.userId,
        feature_type: data.featureType,
        request_type: data.requestType,
        tokens_used: data.tokensUsed || 0,
        cost: data.cost || 0,
        response_time: data.responseTime || 0,
        success: data.success !== false,
        error_type: data.errorType,
        metadata: data.metadata || {},
      })

      if (error) {
        console.error("Failed to track AI usage:", error)
      }
    } catch (error) {
      console.error("AI analytics tracking error:", error)
    }
  }

  async trackChatbotUsage(userId: string, messageCount: number, responseTime: number, success = true) {
    await this.trackUsage({
      userId,
      featureType: "chatbot",
      requestType: "chat_message",
      tokensUsed: messageCount * 50, // Estimated tokens
      cost: messageCount * 0.002, // Estimated cost
      responseTime,
      success,
      metadata: { message_count: messageCount },
    })
  }

  async trackContentGeneration(
    userId: string,
    contentType: string,
    tokensUsed: number,
    responseTime: number,
    success = true,
  ) {
    await this.trackUsage({
      userId,
      featureType: "content",
      requestType: contentType,
      tokensUsed,
      cost: tokensUsed * 0.00002, // GPT-4 pricing estimate
      responseTime,
      success,
      metadata: { content_type: contentType },
    })
  }

  async trackRecommendations(
    userId: string,
    recommendationType: string,
    count: number,
    responseTime: number,
    success = true,
  ) {
    await this.trackUsage({
      userId,
      featureType: "recommendations",
      requestType: recommendationType,
      tokensUsed: count * 100, // Estimated tokens per recommendation
      cost: count * 0.005, // Estimated cost per recommendation
      responseTime,
      success,
      metadata: { recommendation_count: count, type: recommendationType },
    })
  }

  async getUsageStats(userId: string, days = 30) {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const { data, error } = await this.supabase
        .from("ai_usage_analytics")
        .select("*")
        .eq("user_id", userId)
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Failed to fetch usage stats:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Usage stats error:", error)
      return null
    }
  }
}

export const aiAnalyticsTracker = new AIAnalyticsTracker()

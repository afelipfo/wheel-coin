import { type NextRequest, NextResponse } from "next/server"
import { openaiClient } from "@/lib/ai/openai-client"
import { AI_CONFIG } from "@/lib/ai/config"

// Health check endpoint for AI services
export async function GET(request: NextRequest) {
  try {
    const checks = {
      openai: false,
      config: false,
      database: false,
      timestamp: new Date().toISOString(),
    }

    // Check OpenAI API connectivity
    if (AI_CONFIG.openai.apiKey) {
      checks.openai = await openaiClient.healthCheck()
    }

    // Check configuration
    checks.config = !!(
      AI_CONFIG.openai.model &&
      AI_CONFIG.context.maxHistoryLength > 0 &&
      AI_CONFIG.performance.rateLimitPerUser > 0
    )

    // Check database connectivity (basic check)
    try {
      const { createServerClient } = await import("@/lib/supabase/server")
      const supabase = createServerClient()
      const { error } = await supabase.from("ai_conversations").select("id").limit(1)
      checks.database = !error
    } catch {
      checks.database = false
    }

    const allHealthy = Object.values(checks).every((check) => (typeof check === "boolean" ? check : true))

    return NextResponse.json(
      {
        status: allHealthy ? "healthy" : "degraded",
        checks,
        features: AI_CONFIG.features,
      },
      {
        status: allHealthy ? 200 : 503,
      },
    )
  } catch (error) {
    console.error("AI health check error:", error)
    return NextResponse.json(
      {
        status: "error",
        error: "Health check failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { recommendationId } = await request.json()

    if (!recommendationId) {
      return NextResponse.json({ error: "Recommendation ID is required" }, { status: 400 })
    }

    // Get user from auth
    const supabase = createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Mark recommendation as dismissed
    const { error: dismissError } = await supabase
      .from("ai_recommendations")
      .update({ is_dismissed: true })
      .eq("recommendation_id", recommendationId)
      .eq("user_id", user.id)

    if (dismissError) {
      console.error("Failed to dismiss recommendation:", dismissError)
      return NextResponse.json({ error: "Failed to dismiss recommendation" }, { status: 500 })
    }

    // Track the dismissal
    await supabase.from("ai_recommendation_interactions").insert({
      user_id: user.id,
      recommendation_id: recommendationId,
      interaction_type: "dismiss",
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Dismiss recommendation API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

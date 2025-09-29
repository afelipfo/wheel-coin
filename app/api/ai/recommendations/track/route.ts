import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { recommendationId, action } = await request.json()

    if (!recommendationId || !action) {
      return NextResponse.json({ error: "Recommendation ID and action are required" }, { status: 400 })
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

    // Track the interaction
    const { error: trackError } = await supabase.from("ai_recommendation_interactions").insert({
      user_id: user.id,
      recommendation_id: recommendationId,
      interaction_type: action,
      timestamp: new Date().toISOString(),
    })

    if (trackError) {
      console.error("Failed to track recommendation interaction:", trackError)
      return NextResponse.json({ error: "Failed to track interaction" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Track recommendation API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

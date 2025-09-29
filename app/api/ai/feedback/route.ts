import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { messageId, feedback, feedbackText } = await request.json()

    if (!messageId || !feedback) {
      return NextResponse.json({ error: "Message ID and feedback are required" }, { status: 400 })
    }

    if (!["positive", "negative"].includes(feedback)) {
      return NextResponse.json({ error: "Feedback must be 'positive' or 'negative'" }, { status: 400 })
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

    // Find the conversation message
    const { data: conversation, error: conversationError } = await supabase
      .from("ai_conversations")
      .select("id")
      .eq("id", messageId)
      .eq("user_id", user.id)
      .single()

    if (conversationError || !conversation) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 })
    }

    // Save feedback
    const { error: feedbackError } = await supabase.from("ai_feedback").insert({
      user_id: user.id,
      conversation_id: messageId,
      rating: feedback === "positive" ? 5 : 1,
      feedback_text: feedbackText,
      feedback_type: feedback,
    })

    if (feedbackError) {
      console.error("Feedback save error:", feedbackError)
      return NextResponse.json({ error: "Failed to save feedback" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Feedback API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

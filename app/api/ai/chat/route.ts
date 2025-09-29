import { type NextRequest, NextResponse } from "next/server"
import { openaiClient } from "@/lib/ai/openai-client"
import { contextManager } from "@/lib/ai/context-manager"
import { PROMPT_TEMPLATES, type ChatMessage } from "@/lib/ai/config"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory } = await request.json()

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
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

    // Get user context for personalization
    const userContext = await contextManager.getUserContext(user.id)

    // Build conversation messages
    const messages: ChatMessage[] = [
      {
        id: crypto.randomUUID(),
        role: "system",
        content: PROMPT_TEMPLATES.chatbot.system,
        timestamp: new Date(),
      },
    ]

    // Add user context if available
    if (userContext) {
      const contextString = contextManager.buildContextString(userContext)
      messages.push({
        id: crypto.randomUUID(),
        role: "system",
        content: `Current user context:\n${contextString}`,
        timestamp: new Date(),
      })
    }

    // Add conversation history
    if (conversationHistory && Array.isArray(conversationHistory)) {
      messages.push(...conversationHistory.slice(-5)) // Last 5 messages for context
    }

    // Add current user message
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: message,
      timestamp: new Date(),
      userId: user.id,
    }
    messages.push(userMessage)

    // Get AI response
    const aiResponse = await openaiClient.generateChatCompletion(messages, user.id)

    if (!aiResponse.success) {
      console.error("OpenAI API error:", aiResponse.error)
      return NextResponse.json({ error: "Failed to generate response" }, { status: 500 })
    }

    // Create assistant message
    const assistantMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: aiResponse.data.content,
      timestamp: new Date(),
      userId: user.id,
    }

    // Save messages to database
    await Promise.all([contextManager.saveMessage(userMessage), contextManager.saveMessage(assistantMessage)])

    // Log analytics
    await supabase.from("ai_analytics").insert({
      user_id: user.id,
      feature_type: "chatbot",
      request_type: "chat_completion",
      prompt_tokens: aiResponse.usage?.promptTokens || 0,
      completion_tokens: aiResponse.usage?.completionTokens || 0,
      total_tokens: aiResponse.usage?.totalTokens || 0,
      response_time_ms: Date.now() - new Date(userMessage.timestamp).getTime(),
      success: true,
      metadata: {
        model: "gpt-4o-mini",
        conversation_length: messages.length,
      },
    })

    return NextResponse.json({
      response: aiResponse.data.content,
      messageId: assistantMessage.id,
      usage: aiResponse.usage,
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { openaiClient } from "@/lib/ai/openai-client"
import { createServerClient } from "@/lib/supabase/server"

interface ContentGenerationRequest {
  type: string
  prompt: string
  context?: Record<string, any>
  tone?: string
  length?: string
}

const contentTypePrompts = {
  route_description: {
    system: `You are an expert accessibility consultant and route planner. Generate detailed, helpful route descriptions that prioritize wheelchair accessibility and safety. Include specific details about:
- Surface conditions (smooth pavement, gravel, etc.)
- Elevation changes and ramps
- Curb cuts and crosswalk accessibility
- Rest areas and accessible facilities
- Potential obstacles or challenges
- Estimated travel time and distance
- Safety considerations

Make descriptions practical, encouraging, and empowering for wheelchair users.`,
    userTemplate: `Create a detailed accessible route description for: {prompt}

Tone: {tone}
Length: {length}
Context: The user is a wheelchair user looking for safe, accessible routes.`,
  },
  accessibility_report: {
    system: `You are a certified accessibility specialist. Generate comprehensive accessibility reports that help wheelchair users and the broader disability community understand the accessibility features and barriers of locations. Include:
- Entrance accessibility (ramps, door widths, automatic doors)
- Interior navigation (hallway widths, elevator access, accessible restrooms)
- Parking availability and accessibility
- Service accessibility (counter heights, accessible seating)
- Communication accessibility features
- Overall accessibility rating and recommendations
- Specific improvements that could be made

Be thorough, objective, and constructive in your assessments.`,
    userTemplate: `Generate a comprehensive accessibility report for: {prompt}

Tone: {tone}
Length: {length}
Focus on practical accessibility information for wheelchair users and mobility device users.`,
  },
  community_post: {
    system: `You are a community manager for a supportive wheelchair user community. Create engaging, inclusive posts that:
- Foster connection and support among community members
- Share valuable information and resources
- Celebrate achievements and milestones
- Promote upcoming events and opportunities
- Encourage participation and engagement
- Use inclusive, empowering language
- Build a sense of belonging and community pride

Keep posts positive, informative, and action-oriented.`,
    userTemplate: `Create an engaging community post about: {prompt}

Tone: {tone}
Length: {length}
This is for a supportive community of wheelchair users and mobility advocates.`,
  },
  achievement_share: {
    system: `You are a social media expert specializing in celebrating achievements and milestones. Create compelling social media content that:
- Celebrates personal accomplishments with authenticity
- Inspires others to pursue their goals
- Highlights the journey, not just the destination
- Uses relevant hashtags and engaging language
- Encourages community interaction and support
- Balances humility with pride
- Makes achievements relatable and motivating

Focus on the personal growth, perseverance, and community impact of achievements.`,
    userTemplate: `Create inspiring social media content to share this achievement: {prompt}

Tone: {tone}
Length: {length}
This will be shared to celebrate progress in the wheelchair user community and inspire others.`,
  },
  motivational_content: {
    system: `You are a motivational speaker and disability advocate. Create inspiring, empowering content that:
- Acknowledges real challenges without being dismissive
- Focuses on strengths, capabilities, and possibilities
- Provides practical encouragement and actionable advice
- Celebrates diversity and individual journeys
- Builds confidence and self-efficacy
- Promotes a growth mindset
- Connects personal experiences to broader community strength

Use authentic, respectful language that empowers rather than patronizes.`,
    userTemplate: `Create motivational content for: {prompt}

Tone: {tone}
Length: {length}
This should inspire and empower wheelchair users and the broader disability community.`,
  },
}

export async function POST(request: NextRequest) {
  try {
    const {
      type,
      prompt,
      context,
      tone = "friendly",
      length = "medium",
    }: ContentGenerationRequest = await request.json()

    if (!type || !prompt) {
      return NextResponse.json({ error: "Type and prompt are required" }, { status: 400 })
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

    // Get content type configuration
    const contentConfig = contentTypePrompts[type as keyof typeof contentTypePrompts]
    if (!contentConfig) {
      return NextResponse.json({ error: "Invalid content type" }, { status: 400 })
    }

    // Build messages
    const messages = [
      {
        id: crypto.randomUUID(),
        role: "system" as const,
        content: contentConfig.system,
        timestamp: new Date(),
      },
      {
        id: crypto.randomUUID(),
        role: "user" as const,
        content: contentConfig.userTemplate
          .replace("{prompt}", prompt)
          .replace("{tone}", tone)
          .replace("{length}", length),
        timestamp: new Date(),
      },
    ]

    // Generate content
    const aiResponse = await openaiClient.generateChatCompletion(messages, user.id)

    if (!aiResponse.success) {
      console.error("OpenAI API error:", aiResponse.error)
      return NextResponse.json({ error: "Failed to generate content" }, { status: 500 })
    }

    // Save generation to database
    const { error: saveError } = await supabase.from("ai_content_generations").insert({
      user_id: user.id,
      content_type: type,
      prompt: prompt,
      generated_content: aiResponse.data.content,
      settings: {
        tone,
        length,
        context,
      },
      tokens_used: aiResponse.usage?.totalTokens || 0,
    })

    if (saveError) {
      console.error("Failed to save generation:", saveError)
    }

    // Log analytics
    await supabase.from("ai_analytics").insert({
      user_id: user.id,
      feature_type: "content_generation",
      request_type: type,
      prompt_tokens: aiResponse.usage?.promptTokens || 0,
      completion_tokens: aiResponse.usage?.completionTokens || 0,
      total_tokens: aiResponse.usage?.totalTokens || 0,
      response_time_ms: Date.now() - new Date(messages[1].timestamp).getTime(),
      success: true,
      metadata: {
        model: "gpt-4o-mini",
        content_type: type,
        tone,
        length,
      },
    })

    return NextResponse.json({
      content: aiResponse.data.content,
      usage: aiResponse.usage,
      metadata: {
        type,
        tone,
        length,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Content generation API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

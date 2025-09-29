import { type NextRequest, NextResponse } from "next/server"
import { openaiClient } from "@/lib/ai/openai-client"
import { contextManager } from "@/lib/ai/context-manager"
import { createServerClient } from "@/lib/supabase/server"

interface RecommendationRequest {
  category: string
  limit?: number
  excludeIds?: string[]
}

const categoryPrompts = {
  routes: {
    system: `You are an expert accessibility consultant and route planner. Generate personalized route recommendations for wheelchair users based on their activity patterns, preferences, and accessibility needs. Consider:
- Previous routes taken and preferences
- Accessibility features (ramps, smooth surfaces, curb cuts)
- Safety considerations and lighting
- Distance and difficulty level
- Points of interest along the route
- Estimated crypto rewards based on distance and difficulty
- Weather and time considerations

Provide practical, safe, and rewarding route suggestions.`,
    userPrompt: `Based on the user's activity history and preferences, recommend accessible routes that would be interesting, safe, and rewarding. Focus on routes they haven't taken recently but align with their mobility patterns and interests.`,
  },
  locations: {
    system: `You are a local accessibility expert who knows the best wheelchair-accessible places in the area. Generate location recommendations based on user preferences, accessibility needs, and activity patterns. Consider:
- Accessibility features (ramps, elevators, accessible restrooms)
- User's interests and previous location visits
- Proximity to user's common routes
- Quality of accessibility features
- Community ratings and reviews
- Services and amenities available
- Parking accessibility

Recommend places that are genuinely accessible and align with user interests.`,
    userPrompt: `Recommend accessible locations (restaurants, shops, parks, entertainment venues) that this user would enjoy based on their activity patterns and preferences. Focus on places with excellent accessibility features.`,
  },
  activities: {
    system: `You are a gamification expert specializing in mobility and cryptocurrency rewards. Generate activity recommendations that help users maximize their crypto earnings while staying active and engaged. Consider:
- Current activity levels and patterns
- Crypto earning potential
- Accessibility and safety
- Variety and engagement
- Progressive difficulty
- Community involvement opportunities
- Health and wellness benefits

Suggest activities that are achievable, rewarding, and fun.`,
    userPrompt: `Recommend activities and challenges that would help this user earn more cryptocurrency while staying active and engaged. Consider their current activity level and suggest progressive, achievable goals.`,
  },
  community: {
    system: `You are a community engagement specialist for wheelchair users and mobility advocates. Generate community recommendations based on user interests, location, and engagement patterns. Consider:
- Local accessibility-focused events
- Wheelchair sports and recreation
- Advocacy and volunteer opportunities
- Social meetups and support groups
- Educational workshops and seminars
- Accessibility testing and feedback opportunities
- Peer mentoring and support

Recommend community activities that foster connection and empowerment.`,
    userPrompt: `Recommend community events, groups, and activities that would interest this user based on their location, activity patterns, and engagement level. Focus on accessibility-focused and inclusive opportunities.`,
  },
  goals: {
    system: `You are a personal achievement coach specializing in mobility and accessibility goals. Generate personalized goal recommendations based on user progress, capabilities, and aspirations. Consider:
- Current activity levels and trends
- Previous achievements and milestones
- Realistic but challenging targets
- Crypto earning potential
- Health and wellness benefits
- Skill development opportunities
- Community impact potential

Suggest goals that are motivating, achievable, and meaningful.`,
    userPrompt: `Based on this user's activity history and current progress, recommend personalized goals that would be challenging but achievable. Focus on goals that provide both personal satisfaction and crypto rewards.`,
  },
  features: {
    system: `You are a product expert for the Wheel-coin app. Generate feature recommendations based on user behavior, engagement patterns, and unused functionality. Consider:
- Features the user hasn't tried yet
- Features that align with their activity patterns
- Features that could enhance their experience
- Features that could increase their crypto earnings
- Accessibility-focused features
- Community and social features
- Advanced tracking and analytics features

Recommend features that would genuinely add value to their experience.`,
    userPrompt: `Recommend app features that this user hasn't fully explored but would benefit from based on their usage patterns and interests. Focus on features that would enhance their mobility experience and crypto earnings.`,
  },
}

export async function POST(request: NextRequest) {
  try {
    const { category, limit = 10, excludeIds = [] }: RecommendationRequest = await request.json()

    if (!category) {
      return NextResponse.json({ error: "Category is required" }, { status: 400 })
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

    // Get category configuration
    const categoryConfig = categoryPrompts[category as keyof typeof categoryPrompts]
    if (!categoryConfig) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 })
    }

    // Get user context for personalization
    const userContext = await contextManager.getUserContext(user.id)

    // Get user's recent activity and preferences
    const { data: recentActivity } = await supabase
      .from("activity_sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10)

    const { data: userPreferences } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", user.id)
      .single()

    // Build context string
    let contextString = ""
    if (userContext) {
      contextString += contextManager.buildContextString(userContext)
    }

    if (recentActivity && recentActivity.length > 0) {
      contextString += `\n\nRecent Activity:\n${recentActivity
        .map(
          (activity) =>
            `- ${activity.activity_type}: ${activity.distance_km}km, ${activity.duration_minutes}min, ${activity.tokens_earned} tokens`,
        )
        .join("\n")}`
    }

    if (userPreferences) {
      contextString += `\n\nUser Preferences:\n${JSON.stringify(userPreferences.preferences, null, 2)}`
    }

    // Build messages for AI
    const messages = [
      {
        id: crypto.randomUUID(),
        role: "system" as const,
        content: categoryConfig.system,
        timestamp: new Date(),
      },
      {
        id: crypto.randomUUID(),
        role: "user" as const,
        content: `${categoryConfig.userPrompt}\n\nUser Context:\n${contextString}\n\nPlease provide ${limit} specific, actionable recommendations in JSON format with the following structure:
[
  {
    "title": "Recommendation title",
    "description": "Detailed description",
    "confidence": 0.85,
    "priority": "high|medium|low",
    "category": "${category}",
    "estimatedReward": 25,
    "accessibilityScore": 0.9,
    "actionUrl": "optional URL",
    "metadata": {
      "distance": "2.5km",
      "duration": "30min",
      "difficulty": "easy"
    }
  }
]`,
        timestamp: new Date(),
      },
    ]

    // Generate recommendations
    const aiResponse = await openaiClient.generateChatCompletion(messages, user.id)

    if (!aiResponse.success) {
      console.error("OpenAI API error:", aiResponse.error)
      return NextResponse.json({ error: "Failed to generate recommendations" }, { status: 500 })
    }

    // Parse AI response
    let recommendations
    try {
      const jsonMatch = aiResponse.data.content.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        recommendations = JSON.parse(jsonMatch[0])
      } else {
        throw new Error("No JSON found in response")
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError)
      return NextResponse.json({ error: "Failed to parse recommendations" }, { status: 500 })
    }

    // Add IDs and timestamps to recommendations
    const processedRecommendations = recommendations.map((rec: any) => ({
      ...rec,
      id: crypto.randomUUID(),
      type: category,
      createdAt: new Date(),
    }))

    // Save recommendations to database
    const { error: saveError } = await supabase.from("ai_recommendations").insert(
      processedRecommendations.map((rec: any) => ({
        user_id: user.id,
        recommendation_id: rec.id,
        type: rec.type,
        category: rec.category,
        title: rec.title,
        description: rec.description,
        confidence: rec.confidence,
        priority: rec.priority,
        metadata: rec,
        is_dismissed: false,
      })),
    )

    if (saveError) {
      console.error("Failed to save recommendations:", saveError)
    }

    // Log analytics
    await supabase.from("ai_analytics").insert({
      user_id: user.id,
      feature_type: "recommendations",
      request_type: category,
      prompt_tokens: aiResponse.usage?.promptTokens || 0,
      completion_tokens: aiResponse.usage?.completionTokens || 0,
      total_tokens: aiResponse.usage?.totalTokens || 0,
      response_time_ms: Date.now() - new Date(messages[1].timestamp).getTime(),
      success: true,
      metadata: {
        model: "gpt-4o-mini",
        category,
        recommendations_count: processedRecommendations.length,
      },
    })

    return NextResponse.json({
      recommendations: processedRecommendations,
      usage: aiResponse.usage,
      category,
    })
  } catch (error) {
    console.error("Recommendations API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

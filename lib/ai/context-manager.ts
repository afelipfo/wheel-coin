import { createServerClient } from "@/lib/supabase/server"
import { type UserContext, type ChatMessage, AI_CONFIG } from "./config"

// Context management for AI interactions
export class AIContextManager {
  private cache = new Map<string, { context: UserContext; expiry: number }>()

  // Get user context from database and cache
  async getUserContext(userId: string): Promise<UserContext | null> {
    try {
      // Check cache first
      const cached = this.cache.get(userId)
      if (cached && Date.now() < cached.expiry) {
        return cached.context
      }

      const supabase = createServerClient()

      // Get user profile and stats
      const { data: profile } = await supabase.from("user_profiles").select("*").eq("user_id", userId).single()

      const { data: stats } = await supabase
        .from("user_stats")
        .select("total_distance, total_earnings")
        .eq("user_id", userId)
        .single()

      // Get recent conversation history
      const { data: history } = await supabase
        .from("ai_conversations")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(AI_CONFIG.context.maxHistoryLength)

      const context: UserContext = {
        userId,
        location: profile?.location,
        mobility_preferences: profile?.mobility_preferences,
        accessibility_needs: profile?.accessibility_needs,
        activity_level: profile?.activity_level || "medium",
        total_distance: stats?.total_distance || 0,
        crypto_earned: stats?.total_earnings || 0,
        last_interaction: new Date(),
        conversation_history:
          history?.map((h) => ({
            id: h.id,
            role: h.role,
            content: h.content,
            timestamp: new Date(h.created_at),
            userId: h.user_id,
            metadata: h.metadata,
          })) || [],
      }

      // Cache the context
      this.cache.set(userId, {
        context,
        expiry: Date.now() + AI_CONFIG.context.sessionTimeout,
      })

      return context
    } catch (error) {
      console.error("Error getting user context:", error)
      return null
    }
  }

  // Save conversation message to database
  async saveMessage(message: ChatMessage): Promise<boolean> {
    try {
      const supabase = createServerClient()

      const { error } = await supabase.from("ai_conversations").insert({
        id: message.id,
        user_id: message.userId,
        role: message.role,
        content: message.content,
        metadata: message.metadata,
        created_at: message.timestamp.toISOString(),
      })

      return !error
    } catch (error) {
      console.error("Error saving message:", error)
      return false
    }
  }

  // Update user context after interaction
  async updateUserContext(userId: string, updates: Partial<UserContext>): Promise<void> {
    const cached = this.cache.get(userId)
    if (cached) {
      cached.context = { ...cached.context, ...updates }
      cached.expiry = Date.now() + AI_CONFIG.context.sessionTimeout
    }
  }

  // Clear user context (logout, etc.)
  clearUserContext(userId: string): void {
    this.cache.delete(userId)
  }

  // Build context string for prompts
  buildContextString(context: UserContext): string {
    return `User Profile:
- Location: ${context.location || "Not specified"}
- Mobility preferences: ${context.mobility_preferences || "Not specified"}
- Accessibility needs: ${context.accessibility_needs || "Not specified"}
- Activity level: ${context.activity_level}
- Total distance tracked: ${context.total_distance} meters
- Crypto earned: $${context.crypto_earned?.toFixed(2) || "0.00"}
- Recent activity: ${context.conversation_history?.length || 0} recent interactions`
  }
}

// Singleton instance
export const contextManager = new AIContextManager()

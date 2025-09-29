// AI Configuration and OpenAI client setup
export const AI_CONFIG = {
  // OpenAI Configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4o-mini", // Cost-effective model for most interactions
    maxTokens: 1000,
    temperature: 0.7,
  },

  // Context Management
  context: {
    maxHistoryLength: 10, // Keep last 10 interactions for context
    userProfileFields: ["mobility_preferences", "accessibility_needs", "location", "activity_level"],
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
  },

  // Feature Flags
  features: {
    chatbot: true,
    contentGeneration: true,
    smartRecommendations: true,
    automatedReporting: true,
    voiceProcessing: false, // Future feature
  },

  // Performance Settings
  performance: {
    cacheTimeout: 5 * 60 * 1000, // 5 minutes
    rateLimitPerUser: 50, // requests per hour
    batchSize: 5, // for batch processing
  },
} as const

// Prompt Templates for different AI features
export const PROMPT_TEMPLATES = {
  chatbot: {
    system: `You are WheelBot, an AI assistant for Wheel-coin, a mobility app that rewards wheelchair users with cryptocurrency for movement. 
    
    Your role:
    - Help users navigate the app and understand features
    - Provide accessibility information and route suggestions
    - Motivate users in their mobility journey
    - Answer questions about earning crypto rewards
    - Be empathetic, encouraging, and accessibility-focused
    
    Always be:
    - Respectful and inclusive
    - Focused on mobility and accessibility
    - Encouraging about earning rewards
    - Clear and concise in responses
    - Helpful with app navigation`,

    userContext: `User Profile:
    - Location: {location}
    - Mobility preferences: {mobility_preferences}
    - Accessibility needs: {accessibility_needs}
    - Activity level: {activity_level}
    - Total distance tracked: {total_distance}
    - Crypto earned: {crypto_earned}`,
  },

  contentGeneration: {
    motivational: `Generate a motivational message for a wheelchair user who has just completed {distance} meters of movement. 
    Focus on their achievement, the crypto rewards they've earned, and encourage continued mobility. 
    Keep it positive, empowering, and under 100 words.`,

    communityUpdate: `Create a community update highlighting recent achievements and milestones in the Wheel-coin community. 
    Include statistics about distance traveled, crypto earned, and accessibility improvements. 
    Make it engaging and celebratory. Target length: 150-200 words.`,

    accessibilityTip: `Generate a helpful accessibility tip related to {topic} for wheelchair users. 
    Make it practical, actionable, and relevant to urban mobility. 
    Include how this relates to earning more crypto rewards through better mobility.`,
  },

  recommendations: {
    routes: `Based on the user's location ({location}), accessibility needs ({accessibility_needs}), 
    and mobility preferences ({mobility_preferences}), suggest 3 wheelchair-friendly routes or destinations. 
    Focus on places that are accessible and would provide good opportunities for earning crypto rewards.`,

    activities: `Recommend activities or challenges for a wheelchair user based on their activity level ({activity_level}) 
    and current achievements. Focus on activities that would help them earn more crypto while improving accessibility awareness.`,

    community: `Suggest community events, groups, or initiatives that would interest this user based on their profile. 
    Focus on accessibility advocacy, mobility challenges, or crypto earning opportunities.`,
  },

  reporting: {
    categorize: `Categorize this accessibility report: "{report_text}"
    
    Categories: barrier, improvement, hazard, positive, suggestion
    Priority: low, medium, high, urgent
    
    Respond with JSON: {"category": "...", "priority": "...", "summary": "..."}`,

    response: `Generate a response to this accessibility report acknowledging the user's contribution 
    and explaining next steps. Report: "{report_text}"
    Keep it appreciative and informative.`,
  },
} as const

// AI Response Types
export interface AIResponse {
  success: boolean
  data?: any
  error?: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  cached?: boolean
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
  userId?: string
  metadata?: Record<string, any>
}

export interface UserContext {
  userId: string
  location?: string
  mobility_preferences?: string
  accessibility_needs?: string
  activity_level?: "low" | "medium" | "high"
  total_distance?: number
  crypto_earned?: number
  last_interaction?: Date
  conversation_history?: ChatMessage[]
}

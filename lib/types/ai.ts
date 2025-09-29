// TypeScript types for AI features
export interface AIFeatureConfig {
  enabled: boolean
  rateLimitPerHour: number
  maxTokens: number
  temperature: number
}

export interface AIUsageMetrics {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  averageResponseTime: number
  totalTokensUsed: number
  costEstimate: number
}

export interface AIConversation {
  id: string
  userId: string
  messages: any[] // ChatMessage[]
  context: any // UserContext
  createdAt: Date
  updatedAt: Date
  metadata?: Record<string, any>
}

export interface AIRecommendation {
  id: string
  type: "route" | "activity" | "community" | "content"
  title: string
  description: string
  confidence: number
  metadata: Record<string, any>
  createdAt: Date
}

export interface AIContentGeneration {
  id: string
  type: "motivational" | "community_update" | "accessibility_tip" | "notification"
  content: string
  targetAudience: string
  metadata: Record<string, any>
  createdAt: Date
}

export interface AIAnalytics {
  userId?: string
  featureType: string
  requestType: string
  promptTokens: number
  completionTokens: number
  totalTokens: number
  responseTimeMs: number
  success: boolean
  errorMessage?: string
  metadata?: Record<string, any>
  createdAt: Date
}

// Re-export from config for convenience
export type { AIResponse, ChatMessage, UserContext } from "./config"

import { AI_CONFIG, type AIResponse, type ChatMessage } from "./config"

// OpenAI client wrapper with error handling and rate limiting
class OpenAIClient {
  private apiKey: string
  private baseURL = "https://api.openai.com/v1"
  private requestCount = new Map<string, { count: number; resetTime: number }>()

  constructor() {
    this.apiKey = AI_CONFIG.openai.apiKey || ""
    if (!this.apiKey) {
      console.warn("OpenAI API key not found. AI features will be disabled.")
    }
  }

  private checkRateLimit(userId: string): boolean {
    const now = Date.now()
    const userLimit = this.requestCount.get(userId)

    if (!userLimit || now > userLimit.resetTime) {
      // Reset or initialize rate limit
      this.requestCount.set(userId, {
        count: 1,
        resetTime: now + 60 * 60 * 1000, // 1 hour
      })
      return true
    }

    if (userLimit.count >= AI_CONFIG.performance.rateLimitPerUser) {
      return false
    }

    userLimit.count++
    return true
  }

  async generateChatCompletion(
    messages: ChatMessage[],
    userId?: string,
    options?: {
      model?: string
      maxTokens?: number
      temperature?: number
    },
  ): Promise<AIResponse> {
    try {
      // Check rate limiting
      if (userId && !this.checkRateLimit(userId)) {
        return {
          success: false,
          error: "Rate limit exceeded. Please try again later.",
        }
      }

      if (!this.apiKey) {
        return {
          success: false,
          error: "OpenAI API key not configured",
        }
      }

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: options?.model || AI_CONFIG.openai.model,
          messages: messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          max_tokens: options?.maxTokens || AI_CONFIG.openai.maxTokens,
          temperature: options?.temperature || AI_CONFIG.openai.temperature,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          success: false,
          error: `OpenAI API error: ${response.status} - ${errorData.error?.message || "Unknown error"}`,
        }
      }

      const data = await response.json()

      return {
        success: true,
        data: {
          content: data.choices[0]?.message?.content || "",
          finishReason: data.choices[0]?.finish_reason,
        },
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0,
        },
      }
    } catch (error) {
      console.error("OpenAI API error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }
    }
  }

  async generateText(
    prompt: string,
    userId?: string,
    options?: {
      model?: string
      maxTokens?: number
      temperature?: number
    },
  ): Promise<AIResponse> {
    const messages: ChatMessage[] = [
      {
        id: crypto.randomUUID(),
        role: "user",
        content: prompt,
        timestamp: new Date(),
      },
    ]

    return this.generateChatCompletion(messages, userId, options)
  }

  // Health check for OpenAI API
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.generateText("Hello", undefined, { maxTokens: 5 })
      return response.success
    } catch {
      return false
    }
  }
}

// Singleton instance
export const openaiClient = new OpenAIClient()

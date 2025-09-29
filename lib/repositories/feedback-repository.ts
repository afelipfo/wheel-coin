import { createClient } from "@/lib/supabase/server"
import type { Feedback } from "@/lib/types/database"

export class FeedbackRepository {
  static async createFeedback(feedbackData: {
    user_id: string
    type: string
    message: string
    rating?: number
  }): Promise<Feedback | null> {
    const supabase = await createClient()

    const { data, error } = await supabase.from("feedback").insert(feedbackData).select().single()

    if (error) {
      console.error("Error creating feedback:", error)
      return null
    }

    return data
  }

  static async getUserFeedback(userId: string): Promise<Feedback[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("feedback")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching user feedback:", error)
      return []
    }

    return data || []
  }

  static async getFeedbackByType(type: string): Promise<Feedback[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("feedback")
      .select("*")
      .eq("type", type)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching feedback by type:", error)
      return []
    }

    return data || []
  }
}

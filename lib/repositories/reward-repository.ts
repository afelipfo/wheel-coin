import { createClient } from "@/lib/supabase/server"
import type { Reward } from "@/lib/types/database"

export class RewardRepository {
  static async getAllRewards(): Promise<Reward[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("rewards")
      .select("*")
      .eq("is_active", true)
      .order("cost", { ascending: true })

    if (error) {
      console.error("Error fetching rewards:", error)
      return []
    }

    return data || []
  }

  static async getRewardsByCategory(category: string): Promise<Reward[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("rewards")
      .select("*")
      .eq("category", category)
      .eq("is_active", true)
      .order("cost", { ascending: true })

    if (error) {
      console.error("Error fetching rewards by category:", error)
      return []
    }

    return data || []
  }

  static async getRewardById(id: string): Promise<Reward | null> {
    const supabase = await createClient()

    const { data, error } = await supabase.from("rewards").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching reward:", error)
      return null
    }

    return data
  }

  static async getAffordableRewards(userCoins: number): Promise<Reward[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("rewards")
      .select("*")
      .lte("cost", userCoins)
      .eq("is_active", true)
      .order("cost", { ascending: true })

    if (error) {
      console.error("Error fetching affordable rewards:", error)
      return []
    }

    return data || []
  }
}

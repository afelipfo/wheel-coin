import { createClient } from "@/lib/supabase/server"
import type { Distance } from "@/lib/types/database"

export class DistanceRepository {
  static async createDistance(distanceData: {
    user_id: string
    distance: number
    coins_earned: number
    route_name?: string
    start_location?: string
    end_location?: string
    duration_minutes?: number
  }): Promise<Distance | null> {
    const supabase = await createClient()

    const { data, error } = await supabase.from("distances").insert(distanceData).select().single()

    if (error) {
      console.error("Error creating distance record:", error)
      return null
    }

    return data
  }

  static async getUserDistances(userId: string): Promise<Distance[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("distances")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching user distances:", error)
      return []
    }

    return data || []
  }

  static async getUserTotalDistance(userId: string): Promise<number> {
    const supabase = await createClient()

    const { data, error } = await supabase.from("distances").select("distance").eq("user_id", userId)

    if (error) {
      console.error("Error fetching total distance:", error)
      return 0
    }

    return data?.reduce((total, record) => total + record.distance, 0) || 0
  }

  static async getUserTotalCoins(userId: string): Promise<number> {
    const supabase = await createClient()

    const { data, error } = await supabase.from("distances").select("coins_earned").eq("user_id", userId)

    if (error) {
      console.error("Error fetching total coins:", error)
      return 0
    }

    return data?.reduce((total, record) => total + record.coins_earned, 0) || 0
  }

  static async getRecentDistances(userId: string, limit = 10): Promise<Distance[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("distances")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error fetching recent distances:", error)
      return []
    }

    return data || []
  }
}

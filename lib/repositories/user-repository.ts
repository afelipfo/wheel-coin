import { createClient } from "@/lib/supabase/server"
import type { User } from "@/lib/types/database"

export class UserRepository {
  static async createUser(userData: {
    id: string
    username: string
    email: string
  }): Promise<User | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("users")
      .insert({
        id: userData.id,
        username: userData.username,
        email: userData.email,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating user:", error)
      return null
    }

    return data
  }

  static async getUserById(id: string): Promise<User | null> {
    const supabase = await createClient()

    const { data, error } = await supabase.from("users").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching user:", error)
      return null
    }

    return data
  }

  static async updateUser(
    id: string,
    updates: {
      username?: string
      email?: string
    },
  ): Promise<User | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("users")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating user:", error)
      return null
    }

    return data
  }

  static async updateUserStats(id: string, distance: number, coins: number): Promise<User | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("users")
      .update({
        total_distance: distance,
        total_coins: coins,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating user stats:", error)
      return null
    }

    return data
  }

  static async incrementUserLevel(id: string): Promise<User | null> {
    const supabase = await createClient()

    // First get current level
    const { data: currentUser } = await supabase.from("users").select("level").eq("id", id).single()

    if (!currentUser) return null

    const { data, error } = await supabase
      .from("users")
      .update({
        level: currentUser.level + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating user level:", error)
      return null
    }

    return data
  }
}

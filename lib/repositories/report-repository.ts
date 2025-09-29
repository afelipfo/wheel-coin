import { createClient } from "@/lib/supabase/server"
import type { Report } from "@/lib/types/database"

export class ReportRepository {
  static async createReport(reportData: {
    user_id: string
    type: string
    title: string
    description: string
  }): Promise<Report | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("reports")
      .insert({
        ...reportData,
        status: "pending",
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating report:", error)
      return null
    }

    return data
  }

  static async getUserReports(userId: string): Promise<Report[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching user reports:", error)
      return []
    }

    return data || []
  }

  static async updateReportStatus(id: string, status: string): Promise<Report | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("reports")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating report status:", error)
      return null
    }

    return data
  }
}

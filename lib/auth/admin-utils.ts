import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import type { User } from "@supabase/supabase-js"

export async function getServerAdmin(): Promise<User | null> {
  const cookieStore = cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    },
  )

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    // Check if user has admin role
    const { data: userData, error: userError } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (userError || userData?.role !== "admin") {
      return null
    }

    return user
  } catch (error) {
    console.error("Error in getServerAdmin:", error)
    return null
  }
}

export async function requireAdmin() {
  const admin = await getServerAdmin()

  if (!admin) {
    redirect("/auth/login?message=Admin access required")
  }

  return admin
}

export async function logAdminAction(
  adminId: string,
  actionType: string,
  targetTable?: string,
  targetId?: string,
  details?: Record<string, any>,
) {
  const cookieStore = cookies()

  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
    },
  })

  try {
    await supabase.from("admin_actions").insert({
      admin_id: adminId,
      action_type: actionType,
      target_table: targetTable,
      target_id: targetId,
      details: details,
    })
  } catch (error) {
    console.error("Error logging admin action:", error)
  }
}

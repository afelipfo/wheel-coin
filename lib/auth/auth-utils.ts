import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function getServerUser() {
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

    if (error) {
      console.error("Error getting user:", error)
      return null
    }

    return user
  } catch (error) {
    console.error("Error in getServerUser:", error)
    return null
  }
}

export async function requireAuth() {
  const user = await getServerUser()

  if (!user) {
    redirect("/auth/login")
  }

  return user
}

export async function redirectIfAuthenticated() {
  const user = await getServerUser()

  if (user) {
    redirect("/dashboard")
  }
}

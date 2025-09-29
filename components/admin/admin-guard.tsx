"use client"

import type React from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"

interface AdminGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function AdminGuard({ children, fallback }: AdminGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    async function checkAdminRole() {
      if (!user) {
        setIsAdmin(false)
        return
      }

      try {
        const { data, error } = await supabase.from("users").select("role").eq("id", user.id).single()

        if (error || data?.role !== "admin") {
          setIsAdmin(false)
          router.push("/auth/login?message=Admin access required")
          return
        }

        setIsAdmin(true)
      } catch (error) {
        console.error("Error checking admin role:", error)
        setIsAdmin(false)
        router.push("/auth/login?message=Admin access required")
      }
    }

    if (!loading) {
      checkAdminRole()
    }
  }, [user, loading, router, supabase])

  if (loading || isAdmin === null) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )
    )
  }

  if (!isAdmin) {
    return null
  }

  return <>{children}</>
}

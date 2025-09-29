"use client"

import type React from "react"

import { useAuth } from "@/lib/auth/auth-context"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

interface SessionProviderProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
}

export function SessionProvider({ children, requireAuth = false, redirectTo = "/auth/login" }: SessionProviderProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && requireAuth && !user) {
      router.push(redirectTo)
    }
  }, [user, loading, requireAuth, redirectTo, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (requireAuth && !user) {
    return null
  }

  return <>{children}</>
}

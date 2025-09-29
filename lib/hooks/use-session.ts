"use client"

import { useAuth } from "@/lib/auth/auth-context"
import { useEffect, useState } from "react"
import type { User } from "@/lib/types/database"

export function useSession() {
  const { user: authUser, loading } = useAuth()
  const [userProfile, setUserProfile] = useState<User | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!authUser || loading) return

      setProfileLoading(true)
      try {
        const response = await fetch("/api/user/profile")
        if (response.ok) {
          const profile = await response.json()
          setUserProfile(profile)
        }
      } catch (error) {
        console.error("Error fetching user profile:", error)
      } finally {
        setProfileLoading(false)
      }
    }

    fetchUserProfile()
  }, [authUser, loading])

  return {
    user: authUser,
    userProfile,
    loading: loading || profileLoading,
    isAuthenticated: !!authUser,
  }
}

"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Navigation } from "@/components/navigation"
import { Play, Pause, Square, Activity, Coins, Timer, MapPin, Zap, Trophy, Target } from "lucide-react"
import { cn } from "@/lib/utils"

interface TrackingSession {
  id: string
  startTime: Date
  endTime?: Date
  distance: number
  duration: number
  rewards: number
  isActive: boolean
}

interface RewardNotification {
  id: string
  amount: number
  distance: number
  timestamp: Date
  type: "distance" | "milestone" | "bonus"
}

export default function TrackPage() {
  const [session, setSession] = useState<TrackingSession | null>(null)
  const [notifications, setNotifications] = useState<RewardNotification[]>([])
  const [showNotification, setShowNotification] = useState<RewardNotification | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Simulate GPS tracking with realistic movement patterns
  const simulateMovement = () => {
    if (!session?.isActive) return

    setSession((prev) => {
      if (!prev) return null

      // Simulate realistic wheelchair movement (0.5-2 meters per second)
      const increment = Math.random() * 1.5 + 0.5
      const newDistance = prev.distance + increment
      const newDuration = Date.now() - prev.startTime.getTime()

      // Calculate rewards (1 coin per 10 meters)
      const newRewards = Math.floor(newDistance / 10)
      const oldRewards = Math.floor(prev.distance / 10)

      // Check for new rewards
      if (newRewards > oldRewards) {
        const rewardDiff = newRewards - oldRewards
        const notification: RewardNotification = {
          id: Date.now().toString(),
          amount: rewardDiff,
          distance: newDistance,
          timestamp: new Date(),
          type: newDistance % 100 < 10 ? "milestone" : "distance",
        }

        setNotifications((prev) => [notification, ...prev.slice(0, 4)])
        setShowNotification(notification)

        // Auto-hide notification after 3 seconds
        if (notificationTimeoutRef.current) {
          clearTimeout(notificationTimeoutRef.current)
        }
        notificationTimeoutRef.current = setTimeout(() => {
          setShowNotification(null)
        }, 3000)
      }

      return {
        ...prev,
        distance: newDistance,
        duration: newDuration,
        rewards: newRewards,
      }
    })
  }

  const startTracking = () => {
    const newSession: TrackingSession = {
      id: Date.now().toString(),
      startTime: new Date(),
      distance: 0,
      duration: 0,
      rewards: 0,
      isActive: true,
    }

    setSession(newSession)
    intervalRef.current = setInterval(simulateMovement, 1000)
  }

  const pauseTracking = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    setSession((prev) => (prev ? { ...prev, isActive: false } : null))
  }

  const resumeTracking = () => {
    if (session && !session.isActive) {
      setSession((prev) => (prev ? { ...prev, isActive: true } : null))
      intervalRef.current = setInterval(simulateMovement, 1000)
    }
  }

  const stopTracking = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (session) {
      setSession((prev) =>
        prev
          ? {
              ...prev,
              isActive: false,
              endTime: new Date(),
            }
          : null,
      )

      // Show completion notification
      const completionNotification: RewardNotification = {
        id: Date.now().toString(),
        amount: session.rewards,
        distance: session.distance,
        timestamp: new Date(),
        type: "bonus",
      }

      setNotifications((prev) => [completionNotification, ...prev.slice(0, 4)])
      setShowNotification(completionNotification)
    }
  }

  const resetSession = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setSession(null)
    setNotifications([])
    setShowNotification(null)
  }

  // Format duration
  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      return `${hours}:${(minutes % 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`
    }
    return `${minutes}:${(seconds % 60).toString().padStart(2, "0")}`
  }

  // Calculate speed (m/s)
  const calculateSpeed = () => {
    if (!session || session.duration === 0) return 0
    return (session.distance / (session.duration / 1000)).toFixed(1)
  }

  // Calculate progress to next reward
  const getRewardProgress = () => {
    if (!session) return 0
    const distanceToNext = session.distance % 10
    return (distanceToNext / 10) * 100
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Reward Notification */}
      {showNotification && (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-right-full duration-300">
          <Card className="border-secondary bg-secondary/10 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                  {showNotification.type === "milestone" ? (
                    <Trophy className="w-5 h-5 text-secondary-foreground" />
                  ) : (
                    <Coins className="w-5 h-5 text-secondary-foreground" />
                  )}
                </div>
                <div>
                  <div className="font-semibold text-secondary-foreground">
                    +{showNotification.amount} Wheel-coin{showNotification.amount !== 1 ? "s" : ""}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {showNotification.type === "milestone"
                      ? `Milestone reached: ${showNotification.distance.toFixed(0)}m`
                      : showNotification.type === "bonus"
                        ? "Session completed!"
                        : `Distance: ${showNotification.distance.toFixed(1)}m`}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Track My Distance</h1>
          <p className="text-muted-foreground">Earn cryptocurrency rewards for every meter you move</p>
        </div>

        {/* Main Tracking Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Current Session */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Current Session
                  </CardTitle>
                  <CardDescription>
                    {session?.isActive
                      ? "Tracking in progress..."
                      : session
                        ? "Session paused"
                        : "Ready to start tracking"}
                  </CardDescription>
                </div>
                <Badge variant={session?.isActive ? "default" : "secondary"}>
                  {session?.isActive ? "Active" : session ? "Paused" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{session ? session.distance.toFixed(1) : "0.0"}</div>
                  <div className="text-sm text-muted-foreground">Meters</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-secondary">{session ? session.rewards : 0}</div>
                  <div className="text-sm text-muted-foreground">Coins</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-foreground">
                    {session ? formatDuration(session.duration) : "0:00"}
                  </div>
                  <div className="text-sm text-muted-foreground">Duration</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-foreground">{calculateSpeed()}</div>
                  <div className="text-sm text-muted-foreground">m/s</div>
                </div>
              </div>

              {/* Progress to Next Reward */}
              {session && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Next Reward Progress</span>
                    <span className="text-sm text-muted-foreground">
                      {(10 - (session.distance % 10)).toFixed(1)}m to go
                    </span>
                  </div>
                  <Progress value={getRewardProgress()} className="h-2" />
                </div>
              )}

              {/* Control Buttons */}
              <div className="flex flex-wrap gap-3 justify-center">
                {!session ? (
                  <Button size="lg" onClick={startTracking} className="gap-2">
                    <Play className="w-5 h-5" />
                    Start Tracking
                  </Button>
                ) : (
                  <>
                    {session.isActive ? (
                      <Button size="lg" variant="secondary" onClick={pauseTracking} className="gap-2">
                        <Pause className="w-5 h-5" />
                        Pause
                      </Button>
                    ) : (
                      <Button size="lg" onClick={resumeTracking} className="gap-2">
                        <Play className="w-5 h-5" />
                        Resume
                      </Button>
                    )}
                    <Button size="lg" variant="destructive" onClick={stopTracking} className="gap-2">
                      <Square className="w-5 h-5" />
                      Stop
                    </Button>
                    <Button size="lg" variant="outline" onClick={resetSession} className="gap-2 bg-transparent">
                      Reset
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Notifications */}
        {notifications.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Recent Rewards
              </CardTitle>
              <CardDescription>Your latest cryptocurrency earnings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div key={notification.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center",
                          notification.type === "milestone" ? "bg-primary" : "bg-secondary",
                        )}
                      >
                        {notification.type === "milestone" ? (
                          <Trophy className="w-4 h-4 text-white" />
                        ) : (
                          <Coins className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">
                          +{notification.amount} Wheel-coin{notification.amount !== 1 ? "s" : ""}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {notification.distance.toFixed(1)}m • {notification.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <Badge variant={notification.type === "milestone" ? "default" : "secondary"}>
                      {notification.type === "milestone"
                        ? "Milestone"
                        : notification.type === "bonus"
                          ? "Bonus"
                          : "Distance"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tips & Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Earning Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <Coins className="w-5 h-5 text-secondary mt-0.5" />
                <div>
                  <div className="font-medium">Distance Rewards</div>
                  <div className="text-sm text-muted-foreground">Earn 1 Wheel-coin for every 10 meters traveled</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Trophy className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <div className="font-medium">Milestone Bonuses</div>
                  <div className="text-sm text-muted-foreground">Extra rewards at 100m, 500m, and 1km milestones</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Timer className="w-5 h-5 text-foreground mt-0.5" />
                <div>
                  <div className="font-medium">Consistency Bonus</div>
                  <div className="text-sm text-muted-foreground">Daily tracking streaks earn additional rewards</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Privacy & Safety
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-muted-foreground">
                Your location data is processed locally and never stored on our servers. Only distance metrics are
                recorded for reward calculations.
              </div>
              <div className="text-sm text-muted-foreground">
                The app works offline and syncs rewards when you're back online.
              </div>
              <div className="text-sm text-muted-foreground">
                All movement data is encrypted and you maintain full control over your privacy settings.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

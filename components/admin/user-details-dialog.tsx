"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createBrowserClient } from "@supabase/ssr"
import {
  User,
  Mail,
  Calendar,
  Activity,
  Coins,
  Clock,
  Shield,
  TrendingUp,
  AlertTriangle,
  MessageSquare,
} from "lucide-react"

interface UserDetailsDialogProps {
  user: {
    id: string
    username: string
    email: string
    total_distance: number
    total_coins: number
    level: number
    role: string
    created_at: string
    updated_at: string
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface UserActivity {
  distances: Array<{
    id: string
    distance: number
    coins_earned: number
    route_name: string
    created_at: string
  }>
  reports: Array<{
    id: string
    type: string
    title: string
    status: string
    created_at: string
  }>
  feedback: Array<{
    id: string
    type: string
    message: string
    rating: number
    created_at: string
  }>
}

export function UserDetailsDialog({ user, open, onOpenChange }: UserDetailsDialogProps) {
  const [activity, setActivity] = useState<UserActivity | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    if (open && user) {
      fetchUserActivity()
    }
  }, [open, user])

  async function fetchUserActivity() {
    try {
      const [distancesResult, reportsResult, feedbackResult] = await Promise.all([
        supabase
          .from("distances")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(10),
        supabase.from("reports").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
        supabase
          .from("feedback")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(10),
      ])

      setActivity({
        distances: distancesResult.data || [],
        reports: reportsResult.data || [],
        feedback: feedbackResult.data || [],
      })
    } catch (error) {
      console.error("Error fetching user activity:", error)
    } finally {
      setLoading(false)
    }
  }

  const stats = [
    {
      title: "Total Distance",
      value: `${user.total_distance?.toFixed(1) || "0"} km`,
      icon: Activity,
      color: "text-green-600",
    },
    {
      title: "Total Coins",
      value: user.total_coins?.toLocaleString() || "0",
      icon: Coins,
      color: "text-yellow-600",
    },
    {
      title: "Current Level",
      value: `Level ${user.level || 1}`,
      icon: TrendingUp,
      color: "text-blue-600",
    },
    {
      title: "Reports Submitted",
      value: activity?.reports.length.toString() || "0",
      icon: AlertTriangle,
      color: "text-red-600",
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            User Details
          </DialogTitle>
          <DialogDescription>Comprehensive view of user profile and activity</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Profile Information</span>
                <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                  {user.role === "admin" ? (
                    <>
                      <Shield className="w-3 h-3 mr-1" />
                      Admin
                    </>
                  ) : (
                    "User"
                  )}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Username</p>
                    <p className="font-medium">{user.username || "No username set"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Joined</p>
                    <p className="font-medium">{new Date(user.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Last Updated</p>
                    <p className="font-medium">{new Date(user.updated_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${stat.color}`} />
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.title}</p>
                        <p className="font-semibold">{stat.value}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Distances */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Recent Distance Tracking
                  </CardTitle>
                  <CardDescription>Latest distance tracking sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  {activity?.distances.length ? (
                    <div className="space-y-3">
                      {activity.distances.slice(0, 5).map((distance) => (
                        <div key={distance.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{distance.route_name || "Unnamed Route"}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(distance.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{distance.distance} km</p>
                            <p className="text-sm text-yellow-600 flex items-center gap-1">
                              <Coins className="w-3 h-3" />
                              {distance.coins_earned}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No distance tracking data</p>
                  )}
                </CardContent>
              </Card>

              {/* Recent Reports */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Recent Reports
                  </CardTitle>
                  <CardDescription>User-submitted accessibility reports</CardDescription>
                </CardHeader>
                <CardContent>
                  {activity?.reports.length ? (
                    <div className="space-y-3">
                      {activity.reports.slice(0, 5).map((report) => (
                        <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{report.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(report.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline">{report.type}</Badge>
                            <p className="text-sm text-muted-foreground mt-1">{report.status}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No reports submitted</p>
                  )}
                </CardContent>
              </Card>

              {/* Recent Feedback */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Recent Feedback
                  </CardTitle>
                  <CardDescription>User feedback and ratings</CardDescription>
                </CardHeader>
                <CardContent>
                  {activity?.feedback.length ? (
                    <div className="space-y-3">
                      {activity.feedback.slice(0, 3).map((feedback) => (
                        <div key={feedback.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline">{feedback.type}</Badge>
                            <div className="flex items-center gap-1">
                              {feedback.rating && (
                                <>
                                  <span className="text-sm font-medium">{feedback.rating}/5</span>
                                  <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                      <div
                                        key={i}
                                        className={`w-3 h-3 rounded-full ${
                                          i < feedback.rating ? "bg-yellow-400" : "bg-gray-200"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                          <p className="text-sm">{feedback.message}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(feedback.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No feedback submitted</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

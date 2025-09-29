import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { User } from "@/lib/types/database"
import { Activity, Coins, TrendingUp, Calendar } from "lucide-react"

interface ProfileStatsProps {
  user: User
}

export function ProfileStats({ user }: ProfileStatsProps) {
  const memberSince = new Date(user.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  })

  const getLevelBadgeColor = (level: number) => {
    if (level >= 10) return "bg-purple-500"
    if (level >= 5) return "bg-blue-500"
    return "bg-green-500"
  }

  return (
    <div className="space-y-6">
      {/* User Overview */}
      <Card>
        <CardHeader className="text-center">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-primary-foreground">{user.username.charAt(0).toUpperCase()}</span>
          </div>
          <CardTitle className="text-xl">{user.username}</CardTitle>
          <div className="flex items-center justify-center gap-2">
            <Badge className={`${getLevelBadgeColor(user.level)} text-white`}>Level {user.level}</Badge>
          </div>
        </CardHeader>
        <CardContent className="text-center">
          <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            Member since {memberSince}
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="space-y-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Total Distance</p>
                <p className="text-2xl font-bold">{user.total_distance.toFixed(1)} km</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <Coins className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Total Coins</p>
                <p className="text-2xl font-bold">{user.total_coins}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Experience Level</p>
                <p className="text-2xl font-bold">{user.level}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

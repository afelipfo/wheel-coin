"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Navigation } from "@/components/navigation"
import {
  BarChart3,
  TrendingUp,
  Coins,
  Activity,
  Calendar,
  Trophy,
  Target,
  Clock,
  MapPin,
  Zap,
  Award,
  Star,
  ChevronRight,
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"

// Mock data - in real app this would come from API/database
const mockUserData = {
  totalDistance: 15420.5,
  totalRewards: 1542,
  totalSessions: 47,
  currentStreak: 12,
  longestStreak: 18,
  averageSpeed: 1.8,
  totalTime: 8640000, // milliseconds
  level: 8,
  nextLevelDistance: 20000,
}

const mockWeeklyData = [
  { day: "Mon", distance: 2100, rewards: 210, sessions: 3 },
  { day: "Tue", distance: 1800, rewards: 180, sessions: 2 },
  { day: "Wed", distance: 2400, rewards: 240, sessions: 4 },
  { day: "Thu", distance: 1600, rewards: 160, sessions: 2 },
  { day: "Fri", distance: 2800, rewards: 280, sessions: 5 },
  { day: "Sat", distance: 3200, rewards: 320, sessions: 4 },
  { day: "Sun", distance: 1520, rewards: 152, sessions: 2 },
]

const mockMonthlyData = [
  { month: "Jan", distance: 12400, rewards: 1240 },
  { month: "Feb", distance: 14200, rewards: 1420 },
  { month: "Mar", distance: 16800, rewards: 1680 },
  { month: "Apr", distance: 15420, rewards: 1542 },
]

const mockRecentSessions = [
  {
    id: "1",
    date: new Date(Date.now() - 2 * 60 * 60 * 1000),
    distance: 1240,
    duration: 1800000,
    rewards: 124,
    avgSpeed: 1.9,
  },
  {
    id: "2",
    date: new Date(Date.now() - 6 * 60 * 60 * 1000),
    distance: 890,
    duration: 1200000,
    rewards: 89,
    avgSpeed: 2.1,
  },
  {
    id: "3",
    date: new Date(Date.now() - 24 * 60 * 60 * 1000),
    distance: 1560,
    duration: 2100000,
    rewards: 156,
    avgSpeed: 1.7,
  },
  {
    id: "4",
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    distance: 2100,
    duration: 2700000,
    rewards: 210,
    avgSpeed: 2.2,
  },
]

const mockAchievements = [
  { id: "1", title: "First Steps", description: "Complete your first tracking session", unlocked: true, icon: "🎯" },
  { id: "2", title: "Distance Warrior", description: "Travel 10km total", unlocked: true, icon: "🏃" },
  { id: "3", title: "Consistency King", description: "7-day tracking streak", unlocked: true, icon: "🔥" },
  { id: "4", title: "Speed Demon", description: "Maintain 2.5 m/s average", unlocked: false, icon: "⚡" },
  { id: "5", title: "Marathon Master", description: "Travel 50km total", unlocked: false, icon: "🏆" },
  { id: "6", title: "Community Helper", description: "Share 10 routes", unlocked: false, icon: "🤝" },
]

const CHART_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"]

export default function DashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month">("week")

  const formatDuration = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)}km`
    }
    return `${meters.toFixed(0)}m`
  }

  const levelProgress = useMemo(() => {
    return (mockUserData.totalDistance / mockUserData.nextLevelDistance) * 100
  }, [])

  const pieData = [
    { name: "Distance Rewards", value: mockUserData.totalRewards * 0.7, color: CHART_COLORS[0] },
    { name: "Milestone Bonuses", value: mockUserData.totalRewards * 0.2, color: CHART_COLORS[1] },
    { name: "Streak Bonuses", value: mockUserData.totalRewards * 0.1, color: CHART_COLORS[2] },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
            <p className="text-muted-foreground">Track your progress and view detailed statistics</p>
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <Badge variant="secondary" className="gap-2">
              <Trophy className="w-4 h-4" />
              Level {mockUserData.level}
            </Badge>
            <Badge variant="outline" className="gap-2">
              <Zap className="w-4 h-4" />
              {mockUserData.currentStreak} day streak
            </Badge>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Distance</CardTitle>
                <Activity className="w-4 h-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDistance(mockUserData.totalDistance)}</div>
              <div className="flex items-center gap-1 text-sm text-secondary mt-1">
                <TrendingUp className="w-3 h-3" />
                <span>+12% this week</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Rewards</CardTitle>
                <Coins className="w-4 h-4 text-secondary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockUserData.totalRewards.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground mt-1">Wheel-coins earned</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Sessions</CardTitle>
                <Calendar className="w-4 h-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockUserData.totalSessions}</div>
              <div className="text-sm text-muted-foreground mt-1">Tracking sessions</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Avg Speed</CardTitle>
                <Target className="w-4 h-4 text-secondary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockUserData.averageSpeed} m/s</div>
              <div className="text-sm text-muted-foreground mt-1">Average movement</div>
            </CardContent>
          </Card>
        </div>

        {/* Level Progress */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Level Progress
                </CardTitle>
                <CardDescription>
                  {formatDistance(mockUserData.nextLevelDistance - mockUserData.totalDistance)} to Level{" "}
                  {mockUserData.level + 1}
                </CardDescription>
              </div>
              <Badge variant="default">Level {mockUserData.level}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{levelProgress.toFixed(1)}%</span>
              </div>
              <Progress value={levelProgress} className="h-3" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatDistance(mockUserData.totalDistance)}</span>
                <span>{formatDistance(mockUserData.nextLevelDistance)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Activity Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Activity Overview
                </CardTitle>
                <Tabs value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as "week" | "month")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="week">Week</TabsTrigger>
                    <TabsTrigger value="month">Month</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  {selectedPeriod === "week" ? (
                    <BarChart data={mockWeeklyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="day" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="distance" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  ) : (
                    <LineChart data={mockMonthlyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Line type="monotone" dataKey="distance" stroke={CHART_COLORS[0]} strokeWidth={3} />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Rewards Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="w-5 h-5" />
                Rewards Breakdown
              </CardTitle>
              <CardDescription>How you earned your Wheel-coins</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-1 gap-2 mt-4">
                {pieData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="flex-1">{item.name}</span>
                    <span className="font-medium">{item.value.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Sessions and Achievements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Sessions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Sessions
                </CardTitle>
                <Button variant="ghost" size="sm">
                  View All
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRecentSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{formatDistance(session.distance)}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatDuration(session.duration)} • {session.avgSpeed} m/s
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-secondary">+{session.rewards}</div>
                      <div className="text-xs text-muted-foreground">{session.date.toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Achievements
                </CardTitle>
                <Badge variant="secondary">
                  {mockAchievements.filter((a) => a.unlocked).length}/{mockAchievements.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockAchievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      achievement.unlocked ? "bg-secondary/10 border border-secondary/20" : "bg-muted/50"
                    }`}
                  >
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <div
                        className={`font-medium ${achievement.unlocked ? "text-foreground" : "text-muted-foreground"}`}
                      >
                        {achievement.title}
                      </div>
                      <div className="text-sm text-muted-foreground">{achievement.description}</div>
                    </div>
                    {achievement.unlocked && (
                      <Badge variant="secondary" className="gap-1">
                        <Trophy className="w-3 h-3" />
                        Unlocked
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

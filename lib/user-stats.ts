export interface UserStats {
  totalDistance: number
  totalRewards: number
  totalSessions: number
  currentStreak: number
  longestStreak: number
  averageSpeed: number
  totalTime: number
  level: number
  nextLevelDistance: number
}

export interface TrackingSession {
  id: string
  date: Date
  distance: number
  duration: number
  rewards: number
  avgSpeed: number
  startLocation?: {
    latitude: number
    longitude: number
  }
  endLocation?: {
    latitude: number
    longitude: number
  }
}

export interface Achievement {
  id: string
  title: string
  description: string
  unlocked: boolean
  unlockedAt?: Date
  icon: string
  category: "distance" | "consistency" | "speed" | "community" | "special"
  requirement: {
    type: string
    value: number
  }
}

export interface WeeklyStats {
  day: string
  distance: number
  rewards: number
  sessions: number
}

export interface MonthlyStats {
  month: string
  distance: number
  rewards: number
}

/**
 * Calculate user level based on total distance
 */
export function calculateLevel(totalDistance: number): number {
  // Level progression: 1000m for level 1, then +2000m per level
  if (totalDistance < 1000) return 1
  return Math.floor((totalDistance - 1000) / 2000) + 2
}

/**
 * Calculate distance needed for next level
 */
export function getNextLevelDistance(currentLevel: number): number {
  if (currentLevel === 1) return 1000
  return 1000 + (currentLevel - 1) * 2000
}

/**
 * Calculate streak from sessions
 */
export function calculateStreak(sessions: TrackingSession[]): { current: number; longest: number } {
  if (sessions.length === 0) return { current: 0, longest: 0 }

  // Sort sessions by date (newest first)
  const sortedSessions = [...sessions].sort((a, b) => b.date.getTime() - a.date.getTime())

  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0

  // Check for current streak (consecutive days from today)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 0; i < sortedSessions.length; i++) {
    const sessionDate = new Date(sortedSessions[i].date)
    sessionDate.setHours(0, 0, 0, 0)

    const daysDiff = Math.floor((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24))

    if (daysDiff === currentStreak) {
      currentStreak++
    } else {
      break
    }
  }

  // Calculate longest streak
  const uniqueDays = new Set<string>()
  sortedSessions.forEach((session) => {
    const dateStr = session.date.toDateString()
    uniqueDays.add(dateStr)
  })

  const uniqueDaysArray = Array.from(uniqueDays).sort()

  for (let i = 0; i < uniqueDaysArray.length; i++) {
    if (i === 0) {
      tempStreak = 1
    } else {
      const prevDate = new Date(uniqueDaysArray[i - 1])
      const currDate = new Date(uniqueDaysArray[i])
      const daysDiff = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24))

      if (daysDiff === 1) {
        tempStreak++
      } else {
        longestStreak = Math.max(longestStreak, tempStreak)
        tempStreak = 1
      }
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak)

  return { current: currentStreak, longest: longestStreak }
}

/**
 * Generate weekly stats from sessions
 */
export function generateWeeklyStats(sessions: TrackingSession[]): WeeklyStats[] {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const weekStats: WeeklyStats[] = days.map((day) => ({
    day,
    distance: 0,
    rewards: 0,
    sessions: 0,
  }))

  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  sessions
    .filter((session) => session.date >= oneWeekAgo)
    .forEach((session) => {
      const dayIndex = (session.date.getDay() + 6) % 7 // Convert Sunday=0 to Monday=0
      weekStats[dayIndex].distance += session.distance
      weekStats[dayIndex].rewards += session.rewards
      weekStats[dayIndex].sessions += 1
    })

  return weekStats
}

/**
 * Check achievements based on user stats
 */
export function checkAchievements(stats: UserStats, sessions: TrackingSession[]): Achievement[] {
  const achievements: Achievement[] = [
    {
      id: "first-steps",
      title: "First Steps",
      description: "Complete your first tracking session",
      unlocked: sessions.length > 0,
      icon: "🎯",
      category: "distance",
      requirement: { type: "sessions", value: 1 },
    },
    {
      id: "distance-warrior",
      title: "Distance Warrior",
      description: "Travel 10km total",
      unlocked: stats.totalDistance >= 10000,
      icon: "🏃",
      category: "distance",
      requirement: { type: "distance", value: 10000 },
    },
    {
      id: "consistency-king",
      title: "Consistency King",
      description: "7-day tracking streak",
      unlocked: stats.currentStreak >= 7,
      icon: "🔥",
      category: "consistency",
      requirement: { type: "streak", value: 7 },
    },
    {
      id: "speed-demon",
      title: "Speed Demon",
      description: "Maintain 2.5 m/s average",
      unlocked: stats.averageSpeed >= 2.5,
      icon: "⚡",
      category: "speed",
      requirement: { type: "speed", value: 2.5 },
    },
    {
      id: "marathon-master",
      title: "Marathon Master",
      description: "Travel 50km total",
      unlocked: stats.totalDistance >= 50000,
      icon: "🏆",
      category: "distance",
      requirement: { type: "distance", value: 50000 },
    },
  ]

  return achievements
}

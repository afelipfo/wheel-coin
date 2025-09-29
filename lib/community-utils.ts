export interface CommunityMember {
  id: string
  name: string
  avatar?: string
  level: number
  verified: boolean
  joinedAt: Date
  totalRoutes: number
  totalLikes: number
  totalDistance: number
  badges: string[]
}

export interface SharedRoute {
  id: string
  title: string
  description: string
  authorId: string
  distance: number
  duration: number
  difficulty: "easy" | "moderate" | "challenging"
  accessibilityScore: number
  likes: number
  comments: number
  bookmarks: number
  tags: string[]
  createdAt: Date
  updatedAt: Date
  route: Array<{
    latitude: number
    longitude: number
    elevation?: number
    isAccessible: boolean
    notes?: string
  }>
}

export interface CommunityPost {
  id: string
  authorId: string
  content: string
  type: "achievement" | "route" | "tip" | "question" | "announcement"
  likes: number
  comments: number
  createdAt: Date
  attachments?: Array<{
    type: "image" | "route" | "link"
    url: string
    metadata?: any
  }>
  tags?: string[]
}

/**
 * Calculate community engagement score
 */
export function calculateEngagementScore(member: CommunityMember): number {
  const routeScore = member.totalRoutes * 10
  const likeScore = member.totalLikes * 2
  const distanceScore = Math.floor(member.totalDistance / 1000) * 5
  const verificationBonus = member.verified ? 50 : 0
  const levelBonus = member.level * 5

  return routeScore + likeScore + distanceScore + verificationBonus + levelBonus
}

/**
 * Determine member rank based on engagement
 */
export function getMemberRank(score: number): {
  rank: string
  color: string
  nextRankScore: number
} {
  if (score >= 1000) {
    return { rank: "Legend", color: "text-yellow-500", nextRankScore: -1 }
  } else if (score >= 500) {
    return { rank: "Expert", color: "text-purple-500", nextRankScore: 1000 }
  } else if (score >= 200) {
    return { rank: "Contributor", color: "text-blue-500", nextRankScore: 500 }
  } else if (score >= 50) {
    return { rank: "Explorer", color: "text-green-500", nextRankScore: 200 }
  } else {
    return { rank: "Newcomer", color: "text-gray-500", nextRankScore: 50 }
  }
}

/**
 * Filter routes based on criteria
 */
export function filterRoutes(
  routes: SharedRoute[],
  filters: {
    difficulty?: string[]
    accessibilityScore?: number
    tags?: string[]
    distance?: { min: number; max: number }
    search?: string
  },
): SharedRoute[] {
  return routes.filter((route) => {
    // Difficulty filter
    if (filters.difficulty && filters.difficulty.length > 0) {
      if (!filters.difficulty.includes(route.difficulty)) return false
    }

    // Accessibility score filter
    if (filters.accessibilityScore && route.accessibilityScore < filters.accessibilityScore) {
      return false
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      const hasMatchingTag = filters.tags.some((tag) =>
        route.tags.some((routeTag) => routeTag.toLowerCase().includes(tag.toLowerCase())),
      )
      if (!hasMatchingTag) return false
    }

    // Distance filter
    if (filters.distance) {
      if (route.distance < filters.distance.min || route.distance > filters.distance.max) {
        return false
      }
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const matchesTitle = route.title.toLowerCase().includes(searchLower)
      const matchesDescription = route.description.toLowerCase().includes(searchLower)
      const matchesTags = route.tags.some((tag) => tag.toLowerCase().includes(searchLower))

      if (!matchesTitle && !matchesDescription && !matchesTags) return false
    }

    return true
  })
}

/**
 * Sort routes by various criteria
 */
export function sortRoutes(
  routes: SharedRoute[],
  sortBy: "newest" | "oldest" | "most-liked" | "most-accessible" | "shortest" | "longest",
): SharedRoute[] {
  const sortedRoutes = [...routes]

  switch (sortBy) {
    case "newest":
      return sortedRoutes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    case "oldest":
      return sortedRoutes.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    case "most-liked":
      return sortedRoutes.sort((a, b) => b.likes - a.likes)
    case "most-accessible":
      return sortedRoutes.sort((a, b) => b.accessibilityScore - a.accessibilityScore)
    case "shortest":
      return sortedRoutes.sort((a, b) => a.distance - b.distance)
    case "longest":
      return sortedRoutes.sort((a, b) => b.distance - a.distance)
    default:
      return sortedRoutes
  }
}

/**
 * Generate route recommendations based on user preferences
 */
export function getRouteRecommendations(
  routes: SharedRoute[],
  userPreferences: {
    preferredDifficulty: string[]
    minAccessibilityScore: number
    maxDistance: number
    favoriteTypes: string[]
  },
  limit = 5,
): SharedRoute[] {
  const filtered = filterRoutes(routes, {
    difficulty: userPreferences.preferredDifficulty,
    accessibilityScore: userPreferences.minAccessibilityScore,
    distance: { min: 0, max: userPreferences.maxDistance },
    tags: userPreferences.favoriteTypes,
  })

  // Score routes based on user preferences
  const scored = filtered.map((route) => {
    let score = 0

    // Accessibility score weight
    score += route.accessibilityScore * 0.3

    // Likes weight
    score += route.likes * 0.2

    // Recency weight
    const daysSinceCreated = (Date.now() - route.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    score += Math.max(0, 30 - daysSinceCreated) * 0.1

    // Tag matching weight
    const matchingTags = route.tags.filter((tag) =>
      userPreferences.favoriteTypes.some((pref) => pref.toLowerCase().includes(tag.toLowerCase())),
    ).length
    score += matchingTags * 10

    return { route, score }
  })

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.route)
}

/**
 * Validate route data before sharing
 */
export function validateRouteData(routeData: Partial<SharedRoute>): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!routeData.title || routeData.title.trim().length < 3) {
    errors.push("Title must be at least 3 characters long")
  }

  if (!routeData.description || routeData.description.trim().length < 10) {
    errors.push("Description must be at least 10 characters long")
  }

  if (!routeData.route || routeData.route.length < 2) {
    errors.push("Route must have at least 2 points")
  }

  if (routeData.tags && routeData.tags.length > 10) {
    errors.push("Maximum 10 tags allowed")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

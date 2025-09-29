export interface NavigationRoute {
  points: RoutePoint[]
  distance: number
  estimatedTime: number
  accessibilityScore: number
  issues: AccessibilityIssue[]
}

export interface RoutePoint {
  latitude: number
  longitude: number
  isAccessible: boolean
  hasIssue?: boolean
  issueType?: string
  elevation?: number
  surfaceType?: "smooth" | "rough" | "gravel" | "cobblestone"
}

export interface AccessibilityIssue {
  id: string
  location: {
    latitude: number
    longitude: number
    address: string
  }
  type: "curb" | "surface" | "obstacle" | "construction" | "other"
  severity: "low" | "medium" | "high"
  description: string
  reportedAt: Date
  status: "reported" | "verified" | "resolved"
  reporter: string
}

/**
 * Calculate distance between two points using Haversine formula
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

/**
 * Calculate total route distance
 */
export function calculateRouteDistance(points: RoutePoint[]): number {
  if (points.length < 2) return 0

  let totalDistance = 0
  for (let i = 1; i < points.length; i++) {
    totalDistance += calculateDistance(
      points[i - 1].latitude,
      points[i - 1].longitude,
      points[i].latitude,
      points[i].longitude,
    )
  }

  return totalDistance
}

/**
 * Calculate accessibility score for a route
 */
export function calculateAccessibilityScore(points: RoutePoint[]): number {
  if (points.length === 0) return 0

  const accessiblePoints = points.filter((point) => point.isAccessible).length
  return Math.round((accessiblePoints / points.length) * 100)
}

/**
 * Estimate travel time based on route characteristics
 */
export function estimateTravelTime(points: RoutePoint[], averageSpeed = 1.5): number {
  const distance = calculateRouteDistance(points)
  const baseTime = distance / averageSpeed // seconds

  // Add penalties for accessibility issues
  const issuePoints = points.filter((point) => point.hasIssue).length
  const issuePenalty = issuePoints * 30 // 30 seconds per issue

  // Add penalties for surface types
  let surfacePenalty = 0
  points.forEach((point) => {
    switch (point.surfaceType) {
      case "rough":
        surfacePenalty += 10
        break
      case "gravel":
        surfacePenalty += 20
        break
      case "cobblestone":
        surfacePenalty += 30
        break
      default:
        break
    }
  })

  return Math.round((baseTime + issuePenalty + surfacePenalty) / 60) // Convert to minutes
}

/**
 * Find alternative accessible routes
 */
export function findAlternativeRoutes(
  start: { latitude: number; longitude: number },
  end: { latitude: number; longitude: number },
  avoidIssues = true,
): NavigationRoute[] {
  // This would integrate with a real routing service
  // For now, return mock alternative routes
  const mockRoutes: NavigationRoute[] = [
    {
      points: [
        { latitude: start.latitude, longitude: start.longitude, isAccessible: true },
        { latitude: start.latitude + 0.001, longitude: start.longitude + 0.001, isAccessible: true },
        { latitude: end.latitude, longitude: end.longitude, isAccessible: true },
      ],
      distance: 1200,
      estimatedTime: 15,
      accessibilityScore: 95,
      issues: [],
    },
    {
      points: [
        { latitude: start.latitude, longitude: start.longitude, isAccessible: true },
        { latitude: start.latitude + 0.002, longitude: start.longitude + 0.0005, isAccessible: false, hasIssue: true },
        { latitude: end.latitude, longitude: end.longitude, isAccessible: true },
      ],
      distance: 1000,
      estimatedTime: 18,
      accessibilityScore: 75,
      issues: [
        {
          id: "1",
          location: { latitude: start.latitude + 0.002, longitude: start.longitude + 0.0005, address: "Midpoint" },
          type: "curb",
          severity: "medium",
          description: "Missing curb cut",
          reportedAt: new Date(),
          status: "reported",
          reporter: "user123",
        },
      ],
    },
  ]

  return avoidIssues ? mockRoutes.filter((route) => route.issues.length === 0) : mockRoutes
}

/**
 * Validate if a location is accessible
 */
export function validateAccessibility(location: { latitude: number; longitude: number }): {
  isAccessible: boolean
  issues: string[]
  recommendations: string[]
} {
  // This would integrate with accessibility databases
  // For now, return mock validation
  return {
    isAccessible: Math.random() > 0.3, // 70% chance of being accessible
    issues: Math.random() > 0.7 ? ["Missing curb cut", "Steep incline"] : [],
    recommendations: ["Use alternative entrance", "Contact building management"],
  }
}

/**
 * Format navigation instructions
 */
export function generateNavigationInstructions(route: NavigationRoute): string[] {
  const instructions: string[] = []

  instructions.push("Starting navigation to your destination")

  route.points.forEach((point, index) => {
    if (index === 0) return

    const prevPoint = route.points[index - 1]
    const distance = calculateDistance(prevPoint.latitude, prevPoint.longitude, point.latitude, point.longitude)

    if (point.hasIssue) {
      instructions.push(`⚠️ Accessibility issue ahead in ${distance.toFixed(0)}m: ${point.issueType}`)
    }

    if (!point.isAccessible) {
      instructions.push(`⚠️ Non-accessible section ahead - consider alternative route`)
    }

    if (index === route.points.length - 1) {
      instructions.push("🎯 You have arrived at your destination")
    }
  })

  return instructions
}

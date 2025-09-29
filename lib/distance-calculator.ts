/**
 * Calculate distance between two geographic points using Haversine formula
 * Returns distance in meters
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180 // φ, λ in radians
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // Distance in meters
}

/**
 * Calculate total distance from an array of positions
 */
export function calculateTotalDistance(positions: Array<{ latitude: number; longitude: number }>): number {
  if (positions.length < 2) return 0

  let totalDistance = 0
  for (let i = 1; i < positions.length; i++) {
    const prev = positions[i - 1]
    const curr = positions[i]
    totalDistance += calculateDistance(prev.latitude, prev.longitude, curr.latitude, curr.longitude)
  }

  return totalDistance
}

/**
 * Calculate speed in m/s from distance and time
 */
export function calculateSpeed(distanceMeters: number, timeMs: number): number {
  if (timeMs === 0) return 0
  return distanceMeters / (timeMs / 1000)
}

/**
 * Format distance for display
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters.toFixed(1)}m`
  }
  return `${(meters / 1000).toFixed(2)}km`
}

/**
 * Calculate cryptocurrency rewards based on distance
 * 1 Wheel-coin per 10 meters
 */
export function calculateRewards(distanceMeters: number): number {
  return Math.floor(distanceMeters / 10)
}

/**
 * Check if distance qualifies for milestone bonus
 */
export function getMilestoneBonus(distanceMeters: number): number {
  const milestones = [100, 500, 1000, 2000, 5000, 10000]
  let bonus = 0

  for (const milestone of milestones) {
    if (distanceMeters >= milestone) {
      bonus += Math.floor(milestone / 100) // Bonus coins based on milestone
    }
  }

  return bonus
}

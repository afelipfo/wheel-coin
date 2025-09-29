export interface User {
  id: string
  username: string
  email: string
  total_distance: number
  total_coins: number
  level: number
  created_at: string
  updated_at: string
}

export interface Distance {
  id: string
  user_id: string
  distance: number
  coins_earned: number
  route_name?: string
  start_location?: string
  end_location?: string
  duration_minutes?: number
  created_at: string
}

export interface Reward {
  id: string
  title: string
  description?: string
  cost: number
  category: string
  image_url?: string
  is_active: boolean
  created_at: string
}

export interface Report {
  id: string
  user_id: string
  type: string
  title: string
  description: string
  status: string
  created_at: string
  updated_at: string
}

export interface Feedback {
  id: string
  user_id: string
  type: string
  message: string
  rating?: number
  created_at: string
}

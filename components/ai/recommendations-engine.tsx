"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MapPin,
  Route,
  Target,
  Users,
  TrendingUp,
  Star,
  Clock,
  Coins,
  Heart,
  RefreshCw,
  ChevronRight,
  Loader2,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth/auth-context"
import { toast } from "sonner"

interface Recommendation {
  id: string
  type: "route" | "location" | "activity" | "community" | "goal" | "feature"
  title: string
  description: string
  confidence: number
  priority: "high" | "medium" | "low"
  category: string
  metadata: Record<string, any>
  actionUrl?: string
  estimatedReward?: number
  accessibilityScore?: number
  createdAt: Date
}

interface RecommendationCategory {
  id: string
  name: string
  icon: any
  description: string
  color: string
}

const categories: RecommendationCategory[] = [
  {
    id: "routes",
    name: "Smart Routes",
    icon: Route,
    description: "Personalized accessible route suggestions",
    color: "bg-blue-500",
  },
  {
    id: "locations",
    name: "Places",
    icon: MapPin,
    description: "Accessible locations you might enjoy",
    color: "bg-green-500",
  },
  {
    id: "activities",
    name: "Activities",
    icon: Target,
    description: "Ways to maximize your crypto earnings",
    color: "bg-purple-500",
  },
  {
    id: "community",
    name: "Community",
    icon: Users,
    description: "Events and connections near you",
    color: "bg-orange-500",
  },
  {
    id: "goals",
    name: "Goals",
    icon: TrendingUp,
    description: "Personalized achievement targets",
    color: "bg-pink-500",
  },
  {
    id: "features",
    name: "Features",
    icon: Sparkles,
    description: "App features you haven't tried",
    color: "bg-indigo-500",
  },
]

export function RecommendationsEngine() {
  const [activeCategory, setActiveCategory] = useState("routes")
  const [recommendations, setRecommendations] = useState<Record<string, Recommendation[]>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const { user } = useAuth()

  const fetchRecommendations = async (category?: string) => {
    if (!user) {
      toast.error("Please sign in to get recommendations")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/ai/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category: category || activeCategory,
          limit: 10,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch recommendations")
      }

      const data = await response.json()

      setRecommendations((prev) => ({
        ...prev,
        [category || activeCategory]: data.recommendations,
      }))

      setLastUpdated(new Date())
      toast.success("Recommendations updated!")
    } catch (error) {
      console.error("Recommendations error:", error)
      toast.error("Failed to load recommendations")
    } finally {
      setIsLoading(false)
    }
  }

  const refreshAllRecommendations = async () => {
    setIsLoading(true)
    for (const category of categories) {
      await fetchRecommendations(category.id)
    }
    setIsLoading(false)
  }

  const trackRecommendationClick = async (recommendationId: string, action: string) => {
    try {
      await fetch("/api/ai/recommendations/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recommendationId,
          action,
        }),
      })
    } catch (error) {
      console.error("Failed to track recommendation click:", error)
    }
  }

  const handleRecommendationClick = (recommendation: Recommendation) => {
    trackRecommendationClick(recommendation.id, "click")
    if (recommendation.actionUrl) {
      window.open(recommendation.actionUrl, "_blank")
    }
  }

  const dismissRecommendation = async (recommendationId: string) => {
    try {
      await fetch("/api/ai/recommendations/dismiss", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recommendationId,
        }),
      })

      // Remove from local state
      setRecommendations((prev) => {
        const updated = { ...prev }
        Object.keys(updated).forEach((category) => {
          updated[category] = updated[category].filter((rec) => rec.id !== recommendationId)
        })
        return updated
      })

      toast.success("Recommendation dismissed")
    } catch (error) {
      console.error("Failed to dismiss recommendation:", error)
      toast.error("Failed to dismiss recommendation")
    }
  }

  // Load initial recommendations
  useEffect(() => {
    if (user && !recommendations[activeCategory]) {
      fetchRecommendations(activeCategory)
    }
  }, [user, activeCategory])

  const currentRecommendations = recommendations[activeCategory] || []
  const currentCategory = categories.find((cat) => cat.id === activeCategory)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600"
    if (confidence >= 0.6) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Recommendations</h2>
          <p className="text-muted-foreground">Personalized suggestions to enhance your mobility journey</p>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <p className="text-xs text-muted-foreground">
              Updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          )}
          <Button variant="outline" size="sm" onClick={refreshAllRecommendations} disabled={isLoading}>
            <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          {categories.map((category) => {
            const Icon = category.icon
            const count = recommendations[category.id]?.length || 0
            return (
              <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-1 relative">
                <Icon className="w-3 h-3" />
                <span className="hidden sm:inline">{category.name}</span>
                {count > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs px-1 py-0 min-w-[16px] h-4">
                    {count}
                  </Badge>
                )}
              </TabsTrigger>
            )
          })}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="space-y-4">
            {/* Category Header */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", category.color)}>
                    <category.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle>{category.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Recommendations List */}
            {isLoading && !currentRecommendations.length ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Loading personalized recommendations...</p>
                  </div>
                </CardContent>
              </Card>
            ) : currentRecommendations.length > 0 ? (
              <div className="space-y-3">
                {currentRecommendations.map((recommendation) => (
                  <Card
                    key={recommendation.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleRecommendationClick(recommendation)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-sm">{recommendation.title}</h3>
                            <Badge className={getPriorityColor(recommendation.priority)} variant="outline">
                              {recommendation.priority}
                            </Badge>
                            <div className="flex items-center gap-1">
                              <Star className={cn("w-3 h-3", getConfidenceColor(recommendation.confidence))} />
                              <span className={cn("text-xs", getConfidenceColor(recommendation.confidence))}>
                                {Math.round(recommendation.confidence * 100)}%
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{recommendation.description}</p>

                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            {recommendation.estimatedReward && (
                              <div className="flex items-center gap-1">
                                <Coins className="w-3 h-3" />
                                <span>+{recommendation.estimatedReward} WC</span>
                              </div>
                            )}
                            {recommendation.accessibilityScore && (
                              <div className="flex items-center gap-1">
                                <Heart className="w-3 h-3" />
                                <span>{Math.round(recommendation.accessibilityScore * 100)}% accessible</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{recommendation.createdAt.toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              dismissRecommendation(recommendation.id)
                            }}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            Dismiss
                          </Button>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <category.icon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="font-semibold mb-2">No recommendations yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Use the app more to get personalized {category.name.toLowerCase()} recommendations
                    </p>
                    <Button variant="outline" size="sm" onClick={() => fetchRecommendations(category.id)}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Check for recommendations
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

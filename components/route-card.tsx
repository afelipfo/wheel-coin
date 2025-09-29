"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, MessageCircle, Bookmark, MapPin, Clock, Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface RouteCardProps {
  route: {
    id: string
    title: string
    description: string
    author: {
      name: string
      avatar?: string
      level: number
      verified: boolean
    }
    distance: number
    duration: number
    difficulty: "easy" | "moderate" | "challenging"
    accessibilityScore: number
    likes: number
    comments: number
    bookmarks: number
    tags: string[]
    isLiked: boolean
    isBookmarked: boolean
  }
  onLike?: (routeId: string) => void
  onBookmark?: (routeId: string) => void
  onView?: (routeId: string) => void
}

export function RouteCard({ route, onLike, onBookmark, onView }: RouteCardProps) {
  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)}km`
    }
    return `${meters}m`
  }

  const formatDuration = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      return `${hours}h ${mins}m`
    }
    return `${minutes}m`
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-secondary text-secondary-foreground"
      case "moderate":
        return "bg-primary text-primary-foreground"
      case "challenging":
        return "bg-destructive text-destructive-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg line-clamp-1 group-hover:text-primary transition-colors">
              {route.title}
            </CardTitle>
            <CardDescription className="line-clamp-2 mt-1">{route.description}</CardDescription>
          </div>
          <Badge className={getDifficultyColor(route.difficulty)}>{route.difficulty}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Author */}
        <div className="flex items-center gap-2">
          <Avatar className="w-6 h-6">
            <AvatarImage src={route.author.avatar || "/placeholder.svg"} />
            <AvatarFallback>{route.author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">{route.author.name}</span>
          {route.author.verified && (
            <Badge variant="secondary" className="text-xs">
              Verified
            </Badge>
          )}
          <Badge variant="outline" className="text-xs ml-auto">
            Level {route.author.level}
          </Badge>
        </div>

        {/* Route Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
              <MapPin className="w-3 h-3" />
              Distance
            </div>
            <div className="font-semibold text-primary text-sm">{formatDistance(route.distance)}</div>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
              <Clock className="w-3 h-3" />
              Duration
            </div>
            <div className="font-semibold text-secondary text-sm">{formatDuration(route.duration)}</div>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
              <Star className="w-3 h-3" />
              Accessible
            </div>
            <div className="font-semibold text-primary text-sm">{route.accessibilityScore}%</div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {route.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {route.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{route.tags.length - 3}
            </Badge>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onLike?.(route.id)
              }}
              className={cn(
                "flex items-center gap-1 text-sm transition-colors hover:text-destructive",
                route.isLiked ? "text-destructive" : "text-muted-foreground",
              )}
            >
              <Heart className={cn("w-4 h-4", route.isLiked && "fill-current")} />
              <span>{route.likes}</span>
            </button>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MessageCircle className="w-4 h-4" />
              <span>{route.comments}</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onBookmark?.(route.id)
              }}
              className={cn(
                "flex items-center gap-1 text-sm transition-colors hover:text-primary",
                route.isBookmarked ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Bookmark className={cn("w-4 h-4", route.isBookmarked && "fill-current")} />
              <span>{route.bookmarks}</span>
            </button>
          </div>
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onView?.(route.id)
            }}
          >
            View Route
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

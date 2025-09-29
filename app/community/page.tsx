"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Navigation } from "@/components/navigation"
import {
  Users,
  Share2,
  Heart,
  MessageCircle,
  Star,
  Trophy,
  Route,
  ThumbsUp,
  Send,
  Search,
  Bookmark,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SharedRoute {
  id: string
  title: string
  description: string
  author: {
    id: string
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
  createdAt: Date
  isLiked: boolean
  isBookmarked: boolean
  route: Array<{ latitude: number; longitude: number }>
}

interface CommunityPost {
  id: string
  author: {
    id: string
    name: string
    avatar?: string
    level: number
    verified: boolean
  }
  content: string
  type: "achievement" | "route" | "tip" | "question"
  likes: number
  comments: number
  createdAt: Date
  isLiked: boolean
  attachments?: {
    type: "route" | "image"
    data: any
  }[]
}

const mockSharedRoutes: SharedRoute[] = [
  {
    id: "1",
    title: "Scenic Park Loop",
    description: "Beautiful accessible route through Golden Gate Park with smooth paths and great views",
    author: {
      id: "user1",
      name: "Alex Chen",
      avatar: "/diverse-user-avatars.png",
      level: 12,
      verified: true,
    },
    distance: 2400,
    duration: 35,
    difficulty: "easy",
    accessibilityScore: 95,
    likes: 24,
    comments: 8,
    bookmarks: 12,
    tags: ["park", "scenic", "smooth", "accessible"],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    isLiked: false,
    isBookmarked: true,
    route: [],
  },
  {
    id: "2",
    title: "Downtown Shopping District",
    description: "Accessible route connecting major shopping areas with curb cuts and ramps",
    author: {
      id: "user2",
      name: "Maria Rodriguez",
      avatar: "/diverse-woman-avatar.png",
      level: 8,
      verified: false,
    },
    distance: 1800,
    duration: 25,
    difficulty: "moderate",
    accessibilityScore: 88,
    likes: 18,
    comments: 5,
    bookmarks: 9,
    tags: ["shopping", "downtown", "accessible", "ramps"],
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    isLiked: true,
    isBookmarked: false,
    route: [],
  },
  {
    id: "3",
    title: "Waterfront Trail",
    description: "Challenging but rewarding route along the waterfront with some steep sections",
    author: {
      id: "user3",
      name: "David Kim",
      avatar: "/man-avatar.png",
      level: 15,
      verified: true,
    },
    distance: 3200,
    duration: 50,
    difficulty: "challenging",
    accessibilityScore: 75,
    likes: 31,
    comments: 12,
    bookmarks: 18,
    tags: ["waterfront", "challenging", "scenic", "workout"],
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    isLiked: false,
    isBookmarked: false,
    route: [],
  },
]

const mockCommunityPosts: CommunityPost[] = [
  {
    id: "1",
    author: {
      id: "user1",
      name: "Alex Chen",
      avatar: "/diverse-user-avatars.png",
      level: 12,
      verified: true,
    },
    content: "Just completed my 50km milestone! The community routes have been incredibly helpful. Thank you everyone!",
    type: "achievement",
    likes: 45,
    comments: 12,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    isLiked: true,
  },
  {
    id: "2",
    author: {
      id: "user4",
      name: "Sarah Johnson",
      avatar: "/woman-avatar-2.png",
      level: 6,
      verified: false,
    },
    content:
      "Pro tip: Always check the weather before heading out. Rain can make even accessible routes slippery and dangerous.",
    type: "tip",
    likes: 28,
    comments: 7,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    isLiked: false,
  },
  {
    id: "3",
    author: {
      id: "user2",
      name: "Maria Rodriguez",
      avatar: "/diverse-woman-avatar.png",
      level: 8,
      verified: false,
    },
    content: "Has anyone tried the new route through the arts district? Looking for feedback before I attempt it.",
    type: "question",
    likes: 12,
    comments: 15,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    isLiked: false,
  },
]

export default function CommunityPage() {
  const [selectedTab, setSelectedTab] = useState("routes")
  const [selectedRoute, setSelectedRoute] = useState<SharedRoute | null>(null)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [shareForm, setShareForm] = useState({
    title: "",
    description: "",
    tags: "",
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")

  const handleLikeRoute = (routeId: string) => {
    // In real app, this would make an API call
    console.log("Liked route:", routeId)
  }

  const handleBookmarkRoute = (routeId: string) => {
    // In real app, this would make an API call
    console.log("Bookmarked route:", routeId)
  }

  const handleLikePost = (postId: string) => {
    // In real app, this would make an API call
    console.log("Liked post:", postId)
  }

  const handleShareRoute = () => {
    if (!shareForm.title.trim() || !shareForm.description.trim()) return

    // In real app, this would make an API call
    console.log("Sharing route:", shareForm)
    setShowShareDialog(false)
    setShareForm({ title: "", description: "", tags: "" })
  }

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

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case "achievement":
        return <Trophy className="w-4 h-4" />
      case "route":
        return <Route className="w-4 h-4" />
      case "tip":
        return <Star className="w-4 h-4" />
      case "question":
        return <MessageCircle className="w-4 h-4" />
      default:
        return <MessageCircle className="w-4 h-4" />
    }
  }

  const filteredRoutes = mockSharedRoutes.filter((route) => {
    const matchesSearch =
      route.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesFilter =
      selectedFilter === "all" ||
      (selectedFilter === "easy" && route.difficulty === "easy") ||
      (selectedFilter === "moderate" && route.difficulty === "moderate") ||
      (selectedFilter === "challenging" && route.difficulty === "challenging") ||
      (selectedFilter === "bookmarked" && route.isBookmarked)

    return matchesSearch && matchesFilter
  })

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Community Hub</h1>
          <p className="text-muted-foreground">Connect, share, and discover with the wheelchair community</p>
        </div>

        {/* Community Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">2,847</div>
              <div className="text-sm text-muted-foreground">Active Members</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-secondary">1,234</div>
              <div className="text-sm text-muted-foreground">Shared Routes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">5,678</div>
              <div className="text-sm text-muted-foreground">Community Posts</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-secondary">892</div>
              <div className="text-sm text-muted-foreground">Issues Resolved</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <TabsList className="grid w-full md:w-auto grid-cols-3">
              <TabsTrigger value="routes">Shared Routes</TabsTrigger>
              <TabsTrigger value="community">Community</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
            </TabsList>

            <div className="flex gap-2 mt-4 md:mt-0">
              <Button onClick={() => setShowShareDialog(true)} className="gap-2">
                <Share2 className="w-4 h-4" />
                Share Route
              </Button>
            </div>
          </div>

          {/* Shared Routes Tab */}
          <TabsContent value="routes" className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search routes, tags, or descriptions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={selectedFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedFilter("all")}
                  className={selectedFilter !== "all" ? "bg-transparent" : ""}
                >
                  All
                </Button>
                <Button
                  variant={selectedFilter === "easy" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedFilter("easy")}
                  className={selectedFilter !== "easy" ? "bg-transparent" : ""}
                >
                  Easy
                </Button>
                <Button
                  variant={selectedFilter === "moderate" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedFilter("moderate")}
                  className={selectedFilter !== "moderate" ? "bg-transparent" : ""}
                >
                  Moderate
                </Button>
                <Button
                  variant={selectedFilter === "challenging" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedFilter("challenging")}
                  className={selectedFilter !== "challenging" ? "bg-transparent" : ""}
                >
                  Challenging
                </Button>
                <Button
                  variant={selectedFilter === "bookmarked" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedFilter("bookmarked")}
                  className={selectedFilter !== "bookmarked" ? "bg-transparent" : ""}
                >
                  <Bookmark className="w-4 h-4 mr-1" />
                  Saved
                </Button>
              </div>
            </div>

            {/* Routes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRoutes.map((route) => (
                <Card key={route.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-1">{route.title}</CardTitle>
                        <CardDescription className="line-clamp-2 mt-1">{route.description}</CardDescription>
                      </div>
                      <Badge className={getDifficultyColor(route.difficulty)}>{route.difficulty}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Author */}
                    <div className="flex items-center gap-2 mb-4">
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
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-2 bg-muted/50 rounded">
                        <div className="font-semibold text-primary">{formatDistance(route.distance)}</div>
                        <div className="text-xs text-muted-foreground">Distance</div>
                      </div>
                      <div className="text-center p-2 bg-muted/50 rounded">
                        <div className="font-semibold text-secondary">{route.accessibilityScore}%</div>
                        <div className="text-xs text-muted-foreground">Accessible</div>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-4">
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
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <button
                          onClick={() => handleLikeRoute(route.id)}
                          className={cn(
                            "flex items-center gap-1 hover:text-destructive transition-colors",
                            route.isLiked && "text-destructive",
                          )}
                        >
                          <Heart className={cn("w-4 h-4", route.isLiked && "fill-current")} />
                          {route.likes}
                        </button>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          {route.comments}
                        </div>
                        <button
                          onClick={() => handleBookmarkRoute(route.id)}
                          className={cn(
                            "flex items-center gap-1 hover:text-primary transition-colors",
                            route.isBookmarked && "text-primary",
                          )}
                        >
                          <Bookmark className={cn("w-4 h-4", route.isBookmarked && "fill-current")} />
                          {route.bookmarks}
                        </button>
                      </div>
                      <Button size="sm" onClick={() => setSelectedRoute(route)}>
                        View Route
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Community Tab */}
          <TabsContent value="community" className="space-y-6">
            <div className="space-y-4">
              {mockCommunityPosts.map((post) => (
                <Card key={post.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={post.author.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">{post.author.name}</span>
                          {post.author.verified && (
                            <Badge variant="secondary" className="text-xs">
                              Verified
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            Level {post.author.level}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                            {getPostTypeIcon(post.type)}
                            <span className="capitalize">{post.type}</span>
                          </div>
                        </div>
                        <p className="text-sm mb-4">{post.content}</p>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => handleLikePost(post.id)}
                            className={cn(
                              "flex items-center gap-1 text-sm text-muted-foreground hover:text-destructive transition-colors",
                              post.isLiked && "text-destructive",
                            )}
                          >
                            <ThumbsUp className={cn("w-4 h-4", post.isLiked && "fill-current")} />
                            {post.likes}
                          </button>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MessageCircle className="w-4 h-4" />
                            {post.comments}
                          </div>
                          <div className="text-xs text-muted-foreground ml-auto">
                            {post.createdAt.toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-primary" />
                    Top Contributors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: "Alex Chen", routes: 23, level: 12 },
                      { name: "Maria Rodriguez", routes: 18, level: 8 },
                      { name: "David Kim", routes: 15, level: 15 },
                    ].map((user, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">#{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.routes} routes shared</div>
                        </div>
                        <Badge variant="outline">Level {user.level}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-secondary" />
                    Most Liked Routes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockSharedRoutes
                      .sort((a, b) => b.likes - a.likes)
                      .slice(0, 3)
                      .map((route, index) => (
                        <div key={route.id} className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-secondary">#{index + 1}</span>
                          </div>
                          <div className="flex-1">
                            <div className="font-medium line-clamp-1">{route.title}</div>
                            <div className="text-sm text-muted-foreground">{route.likes} likes</div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Community Impact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">15,420km</div>
                      <div className="text-sm text-muted-foreground">Total distance shared</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-secondary">892</div>
                      <div className="text-sm text-muted-foreground">Issues resolved</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">2,847</div>
                      <div className="text-sm text-muted-foreground">Lives improved</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Route Detail Dialog */}
        <Dialog open={!!selectedRoute} onOpenChange={() => setSelectedRoute(null)}>
          <DialogContent className="max-w-2xl">
            {selectedRoute && (
              <>
                <DialogHeader>
                  <DialogTitle>{selectedRoute.title}</DialogTitle>
                  <DialogDescription>{selectedRoute.description}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {/* Author Info */}
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Avatar>
                      <AvatarImage src={selectedRoute.author.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{selectedRoute.author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{selectedRoute.author.name}</div>
                      <div className="text-sm text-muted-foreground">Level {selectedRoute.author.level}</div>
                    </div>
                    {selectedRoute.author.verified && <Badge variant="secondary">Verified</Badge>}
                  </div>

                  {/* Route Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="font-bold text-primary">{formatDistance(selectedRoute.distance)}</div>
                      <div className="text-sm text-muted-foreground">Distance</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="font-bold text-secondary">{formatDuration(selectedRoute.duration)}</div>
                      <div className="text-sm text-muted-foreground">Duration</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="font-bold text-primary">{selectedRoute.accessibilityScore}%</div>
                      <div className="text-sm text-muted-foreground">Accessible</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <Badge className={getDifficultyColor(selectedRoute.difficulty)}>{selectedRoute.difficulty}</Badge>
                      <div className="text-sm text-muted-foreground mt-1">Difficulty</div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {selectedRoute.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button className="flex-1">Use This Route</Button>
                    <Button variant="outline" className="bg-transparent">
                      <Bookmark className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" className="bg-transparent">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Share Route Dialog */}
        <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share Your Route</DialogTitle>
              <DialogDescription>Help the community by sharing your accessible route with others.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Route Title</label>
                <Input
                  placeholder="Give your route a descriptive title..."
                  value={shareForm.title}
                  onChange={(e) => setShareForm((prev) => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  placeholder="Describe the route, accessibility features, and any tips..."
                  value={shareForm.description}
                  onChange={(e) => setShareForm((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Tags (comma-separated)</label>
                <Input
                  placeholder="accessible, park, smooth, scenic..."
                  value={shareForm.tags}
                  onChange={(e) => setShareForm((prev) => ({ ...prev, tags: e.target.value }))}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowShareDialog(false)} className="bg-transparent">
                  Cancel
                </Button>
                <Button
                  onClick={handleShareRoute}
                  disabled={!shareForm.title.trim() || !shareForm.description.trim()}
                  className="gap-2"
                >
                  <Send className="w-4 h-4" />
                  Share Route
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

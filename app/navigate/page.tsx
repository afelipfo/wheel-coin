"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Navigation } from "@/components/navigation"
import {
  MapPin,
  NavigationIcon,
  AlertTriangle,
  Route,
  Accessibility,
  Shield,
  Search,
  Locate,
  Flag,
  Send,
  XCircle,
  Info,
} from "lucide-react"

interface Location {
  latitude: number
  longitude: number
  address: string
}

interface RoutePoint {
  latitude: number
  longitude: number
  isAccessible: boolean
  hasIssue?: boolean
  issueType?: string
}

interface AccessibilityIssue {
  id: string
  location: Location
  type: "curb" | "surface" | "obstacle" | "construction" | "other"
  severity: "low" | "medium" | "high"
  description: string
  reportedAt: Date
  status: "reported" | "verified" | "resolved"
  reporter: string
}

const mockCurrentLocation: Location = {
  latitude: 37.7749,
  longitude: -122.4194,
  address: "Current Location",
}

const mockDestinations = [
  { latitude: 37.7849, longitude: -122.4094, address: "Golden Gate Park" },
  { latitude: 37.7649, longitude: -122.4294, address: "Mission District" },
  { latitude: 37.7949, longitude: -122.3994, address: "Financial District" },
]

const mockRoute: RoutePoint[] = [
  { latitude: 37.7749, longitude: -122.4194, isAccessible: true },
  { latitude: 37.7759, longitude: -122.4184, isAccessible: true },
  { latitude: 37.7769, longitude: -122.4174, isAccessible: false, hasIssue: true, issueType: "curb" },
  { latitude: 37.7779, longitude: -122.4164, isAccessible: true },
  { latitude: 37.7789, longitude: -122.4154, isAccessible: true },
  { latitude: 37.7799, longitude: -122.4144, isAccessible: true },
  { latitude: 37.7809, longitude: -122.4134, isAccessible: false, hasIssue: true, issueType: "construction" },
  { latitude: 37.7819, longitude: -122.4124, isAccessible: true },
  { latitude: 37.7829, longitude: -122.4114, isAccessible: true },
  { latitude: 37.7849, longitude: -122.4094, isAccessible: true },
]

const mockIssues: AccessibilityIssue[] = [
  {
    id: "1",
    location: { latitude: 37.7769, longitude: -122.4174, address: "Market St & 5th St" },
    type: "curb",
    severity: "high",
    description: "Missing curb cut makes crossing difficult",
    reportedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: "reported",
    reporter: "user123",
  },
  {
    id: "2",
    location: { latitude: 37.7809, longitude: -122.4134, address: "Mission St & 8th St" },
    type: "construction",
    severity: "medium",
    description: "Temporary construction blocking sidewalk",
    reportedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    status: "verified",
    reporter: "user456",
  },
]

export default function NavigatePage() {
  const [destination, setDestination] = useState("")
  const [currentRoute, setCurrentRoute] = useState<RoutePoint[] | null>(null)
  const [isNavigating, setIsNavigating] = useState(false)
  const [showIssueDialog, setShowIssueDialog] = useState(false)
  const [selectedIssueLocation, setSelectedIssueLocation] = useState<Location | null>(null)
  const [issueForm, setIssueForm] = useState({
    type: "",
    severity: "",
    description: "",
  })
  const [reportedIssues, setReportedIssues] = useState<AccessibilityIssue[]>(mockIssues)
  const mapRef = useRef<HTMLDivElement>(null)

  const handleSearch = () => {
    if (!destination.trim()) return

    // Simulate route calculation
    setCurrentRoute(mockRoute)
    setIsNavigating(false)
  }

  const startNavigation = () => {
    if (!currentRoute) return
    setIsNavigating(true)
  }

  const stopNavigation = () => {
    setIsNavigating(false)
  }

  const clearRoute = () => {
    setCurrentRoute(null)
    setIsNavigating(false)
    setDestination("")
  }

  const reportIssue = (location: Location) => {
    setSelectedIssueLocation(location)
    setShowIssueDialog(true)
  }

  const submitIssueReport = () => {
    if (!selectedIssueLocation || !issueForm.type || !issueForm.severity || !issueForm.description.trim()) return

    const newIssue: AccessibilityIssue = {
      id: Date.now().toString(),
      location: selectedIssueLocation,
      type: issueForm.type as any,
      severity: issueForm.severity as any,
      description: issueForm.description,
      reportedAt: new Date(),
      status: "reported",
      reporter: "current_user",
    }

    setReportedIssues((prev) => [newIssue, ...prev])
    setShowIssueDialog(false)
    setIssueForm({ type: "", severity: "", description: "" })
    setSelectedIssueLocation(null)
  }

  const getRouteStats = () => {
    if (!currentRoute) return null

    const accessiblePoints = currentRoute.filter((p) => p.isAccessible).length
    const totalPoints = currentRoute.length
    const accessibilityScore = Math.round((accessiblePoints / totalPoints) * 100)
    const estimatedTime = Math.round(totalPoints * 2.5) // 2.5 minutes per point
    const issues = currentRoute.filter((p) => p.hasIssue).length

    return { accessibilityScore, estimatedTime, issues }
  }

  const routeStats = getRouteStats()

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Navigate Safely</h1>
          <p className="text-muted-foreground">Find accessible routes with real-time navigation</p>
        </div>

        {/* Search and Controls */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Route Planning
            </CardTitle>
            <CardDescription>Search for accessible routes to your destination</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Current Location */}
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Locate className="w-5 h-5 text-primary" />
                <div>
                  <div className="font-medium">Current Location</div>
                  <div className="text-sm text-muted-foreground">{mockCurrentLocation.address}</div>
                </div>
              </div>

              {/* Destination Search */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="Enter destination address..."
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <Button onClick={handleSearch} disabled={!destination.trim()}>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>

              {/* Quick Destinations */}
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-muted-foreground">Quick destinations:</span>
                {mockDestinations.map((dest, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDestination(dest.address)
                      setCurrentRoute(mockRoute)
                    }}
                  >
                    {dest.address}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Route Information */}
        {currentRoute && routeStats && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Route className="w-5 h-5" />
                  Route Information
                </CardTitle>
                <div className="flex gap-2">
                  {!isNavigating ? (
                    <Button onClick={startNavigation} className="gap-2">
                      <NavigationIcon className="w-4 h-4" />
                      Start Navigation
                    </Button>
                  ) : (
                    <Button variant="destructive" onClick={stopNavigation} className="gap-2">
                      <XCircle className="w-4 h-4" />
                      Stop Navigation
                    </Button>
                  )}
                  <Button variant="outline" onClick={clearRoute} className="gap-2 bg-transparent">
                    Clear Route
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-secondary">{routeStats.accessibilityScore}%</div>
                  <div className="text-sm text-muted-foreground">Accessibility Score</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{routeStats.estimatedTime}min</div>
                  <div className="text-sm text-muted-foreground">Estimated Time</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-destructive">{routeStats.issues}</div>
                  <div className="text-sm text-muted-foreground">Reported Issues</div>
                </div>
              </div>

              {isNavigating && (
                <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                  <div className="flex items-center gap-2 text-primary font-medium mb-2">
                    <NavigationIcon className="w-5 h-5" />
                    Navigation Active
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Follow the accessible route highlighted on the map. You'll receive audio directions for turns and
                    accessibility alerts.
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Map and Issues */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Display */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Interactive Map
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="gap-1">
                      <Accessibility className="w-3 h-3" />
                      Accessible Routes
                    </Badge>
                    <Badge variant="destructive" className="gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Issues
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div
                  ref={mapRef}
                  className="w-full h-96 bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/20 flex items-center justify-center relative overflow-hidden"
                >
                  {/* Simulated Map Interface */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5">
                    {/* Current Location */}
                    <div className="absolute top-1/2 left-1/4 w-4 h-4 bg-primary rounded-full border-2 border-white shadow-lg animate-pulse" />

                    {/* Route Path */}
                    {currentRoute && (
                      <svg className="absolute inset-0 w-full h-full">
                        <path
                          d="M 25% 50% Q 40% 30% 60% 40% T 75% 25%"
                          stroke={isNavigating ? "#3B82F6" : "#10B981"}
                          strokeWidth="4"
                          fill="none"
                          strokeDasharray={isNavigating ? "10,5" : "none"}
                          className={isNavigating ? "animate-pulse" : ""}
                        />
                      </svg>
                    )}

                    {/* Destination */}
                    {currentRoute && (
                      <div className="absolute top-1/4 right-1/4 w-6 h-6 bg-secondary rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                        <Flag className="w-3 h-3 text-white" />
                      </div>
                    )}

                    {/* Issue Markers */}
                    <div className="absolute top-2/5 left-2/5 w-5 h-5 bg-destructive rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                      <AlertTriangle className="w-3 h-3 text-white" />
                    </div>
                    <div className="absolute top-1/3 right-2/5 w-5 h-5 bg-destructive rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                      <AlertTriangle className="w-3 h-3 text-white" />
                    </div>
                  </div>

                  <div className="text-center z-10">
                    <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <div className="text-lg font-medium text-muted-foreground">Interactive Map</div>
                    <div className="text-sm text-muted-foreground">
                      {currentRoute
                        ? "Route displayed with accessibility information"
                        : "Search for a destination to view route"}
                    </div>
                  </div>

                  {/* Map Controls */}
                  <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => reportIssue(mockCurrentLocation)}
                      className="gap-2"
                    >
                      <Flag className="w-4 h-4" />
                      Report Issue
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Issues Panel */}
          <div className="space-y-6">
            {/* Accessibility Legend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Map Legend
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-primary rounded-full" />
                  <span className="text-sm">Current Location</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-secondary rounded-full" />
                  <span className="text-sm">Destination</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-1 bg-secondary rounded" />
                  <span className="text-sm">Accessible Route</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-destructive rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-2 h-2 text-white" />
                  </div>
                  <span className="text-sm">Accessibility Issue</span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Issues */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Recent Issues
                </CardTitle>
                <CardDescription>Community-reported accessibility problems</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reportedIssues.slice(0, 3).map((issue) => (
                    <div key={issue.id} className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              issue.severity === "high"
                                ? "destructive"
                                : issue.severity === "medium"
                                  ? "default"
                                  : "secondary"
                            }
                          >
                            {issue.type}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {issue.status}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">{issue.reportedAt.toLocaleDateString()}</div>
                      </div>
                      <div className="text-sm font-medium mb-1">{issue.location.address}</div>
                      <div className="text-xs text-muted-foreground">{issue.description}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Safety Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Safety Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div>• Always verify route conditions before starting your journey</div>
                <div>• Report any new accessibility issues you encounter</div>
                <div>• Use voice navigation to keep your hands free</div>
                <div>• Check weather conditions that might affect accessibility</div>
                <div>• Keep emergency contacts easily accessible</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Issue Reporting Dialog */}
        <Dialog open={showIssueDialog} onOpenChange={setShowIssueDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Report Accessibility Issue</DialogTitle>
              <DialogDescription>
                Help improve accessibility by reporting issues you encounter during navigation.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Issue Type</label>
                <Select
                  value={issueForm.type}
                  onValueChange={(value) => setIssueForm((prev) => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select issue type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="curb">Missing/Damaged Curb Cut</SelectItem>
                    <SelectItem value="surface">Poor Surface Condition</SelectItem>
                    <SelectItem value="obstacle">Blocked Path/Obstacle</SelectItem>
                    <SelectItem value="construction">Construction/Temporary Barrier</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Severity</label>
                <Select
                  value={issueForm.severity}
                  onValueChange={(value) => setIssueForm((prev) => ({ ...prev, severity: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - Minor inconvenience</SelectItem>
                    <SelectItem value="medium">Medium - Significant difficulty</SelectItem>
                    <SelectItem value="high">High - Impassable/Dangerous</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  placeholder="Describe the accessibility issue in detail..."
                  value={issueForm.description}
                  onChange={(e) => setIssueForm((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowIssueDialog(false)} className="bg-transparent">
                  Cancel
                </Button>
                <Button
                  onClick={submitIssueReport}
                  disabled={!issueForm.type || !issueForm.severity || !issueForm.description.trim()}
                  className="gap-2"
                >
                  <Send className="w-4 h-4" />
                  Submit Report
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

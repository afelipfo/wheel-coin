"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, MapPin, MessageSquare, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface FeedbackItem {
  id: string
  type: "accessibility" | "safety" | "route" | "app"
  title: string
  description: string
  location?: string
  status: "pending" | "in-review" | "resolved"
  priority: "low" | "medium" | "high"
  submittedAt: string
  photos?: string[]
}

export default function FeedbackPage() {
  const [activeTab, setActiveTab] = useState<"submit" | "history">("submit")
  const [formData, setFormData] = useState({
    type: "",
    title: "",
    description: "",
    location: "",
    priority: "medium",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Mock feedback history
  const feedbackHistory: FeedbackItem[] = [
    {
      id: "1",
      type: "accessibility",
      title: "Broken curb ramp on Main Street",
      description: "The curb ramp at Main St and 5th Ave has a large crack making it difficult to navigate.",
      location: "Main St & 5th Ave",
      status: "in-review",
      priority: "high",
      submittedAt: "2024-01-15T10:30:00Z",
      photos: ["/broken-curb-ramp.jpg"],
    },
    {
      id: "2",
      type: "route",
      title: "Suggest alternative route to library",
      description: "Current route has steep incline. Alternative through park would be more accessible.",
      location: "City Library",
      status: "resolved",
      priority: "medium",
      submittedAt: "2024-01-10T14:20:00Z",
    },
    {
      id: "3",
      type: "app",
      title: "Distance tracking seems inaccurate",
      description: "The app recorded 2.5km but I only traveled about 2km according to my manual tracking.",
      status: "pending",
      priority: "low",
      submittedAt: "2024-01-08T09:15:00Z",
    },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    toast({
      title: "Feedback Submitted",
      description: "Thank you for your feedback! We'll review it and get back to you soon.",
    })

    // Reset form
    setFormData({
      type: "",
      title: "",
      description: "",
      location: "",
      priority: "medium",
    })
    setIsSubmitting(false)
    setActiveTab("history")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "in-review":
        return "bg-blue-100 text-blue-800"
      case "resolved":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-orange-100 text-orange-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Feedback & Support</h1>
          <p className="text-muted-foreground">
            Help us improve accessibility by reporting issues or suggesting improvements
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex mb-6 bg-muted rounded-lg p-1">
          <button
            onClick={() => setActiveTab("submit")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "submit"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Submit Feedback
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "history"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            My Feedback
          </button>
        </div>

        {activeTab === "submit" ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Submit New Feedback
              </CardTitle>
              <CardDescription>
                Report accessibility issues, suggest route improvements, or provide app feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Feedback Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select feedback type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="accessibility">Accessibility Issue</SelectItem>
                        <SelectItem value="safety">Safety Concern</SelectItem>
                        <SelectItem value="route">Route Suggestion</SelectItem>
                        <SelectItem value="app">App Feedback</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority Level</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, priority: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low Priority</SelectItem>
                        <SelectItem value="medium">Medium Priority</SelectItem>
                        <SelectItem value="high">High Priority</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Brief description of the issue or suggestion"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location (Optional)</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                    placeholder="Street address or landmark"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Detailed Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Provide detailed information about the issue or suggestion..."
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Photos (Optional)</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Upload photos to help us understand the issue better
                    </p>
                    <Button type="button" variant="outline" size="sm">
                      Choose Files
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Feedback"}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Your Feedback History</h2>
              <Badge variant="secondary">{feedbackHistory.length} submissions</Badge>
            </div>

            {feedbackHistory.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-foreground">{item.title}</h3>
                        <Badge className={getStatusColor(item.status)}>{item.status.replace("-", " ")}</Badge>
                        <Badge className={getPriorityColor(item.priority)}>{item.priority} priority</Badge>
                      </div>
                      <p className="text-muted-foreground mb-2">{item.description}</p>
                      {item.location && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {item.location}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">{new Date(item.submittedAt).toLocaleDateString()}</p>
                      {item.status === "resolved" && <CheckCircle className="h-5 w-5 text-green-600 ml-auto mt-1" />}
                      {item.status === "in-review" && <AlertCircle className="h-5 w-5 text-blue-600 ml-auto mt-1" />}
                    </div>
                  </div>

                  {item.photos && (
                    <div className="flex gap-2 mt-4">
                      {item.photos.map((photo, index) => (
                        <img
                          key={index}
                          src={photo || "/placeholder.svg"}
                          alt={`Feedback photo ${index + 1}`}
                          className="w-16 h-16 object-cover rounded-lg border"
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

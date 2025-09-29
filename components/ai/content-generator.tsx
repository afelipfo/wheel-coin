"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Sparkles,
  Copy,
  Download,
  Share2,
  MapPin,
  MessageSquare,
  Trophy,
  Heart,
  Loader2,
  RefreshCw,
  CheckCircle,
} from "lucide-react"
import { useAuth } from "@/lib/auth/auth-context"
import { toast } from "sonner"

interface ContentGenerationRequest {
  type: string
  prompt: string
  context?: Record<string, any>
  tone?: string
  length?: string
}

interface GeneratedContent {
  id: string
  content: string
  type: string
  timestamp: Date
  metadata?: Record<string, any>
}

const contentTypes = [
  {
    id: "route_description",
    name: "Route Description",
    icon: MapPin,
    description: "Generate detailed, accessible route descriptions",
    placeholder: "Describe the route from downtown to the park, including accessibility features...",
  },
  {
    id: "accessibility_report",
    name: "Accessibility Report",
    icon: Heart,
    description: "Create comprehensive accessibility assessments",
    placeholder: "Generate an accessibility report for the new shopping center...",
  },
  {
    id: "community_post",
    name: "Community Post",
    icon: MessageSquare,
    description: "Write engaging community posts and updates",
    placeholder: "Create a post about the upcoming wheelchair basketball tournament...",
  },
  {
    id: "achievement_share",
    name: "Achievement Share",
    icon: Trophy,
    description: "Generate social media content for achievements",
    placeholder: "I just completed my 100th mile this month and earned 50 WC tokens...",
  },
  {
    id: "motivational_content",
    name: "Motivational Content",
    icon: Sparkles,
    description: "Create inspiring and motivational messages",
    placeholder: "Generate motivational content for users who are just starting their journey...",
  },
]

const toneOptions = [
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly" },
  { value: "inspiring", label: "Inspiring" },
  { value: "casual", label: "Casual" },
  { value: "informative", label: "Informative" },
]

const lengthOptions = [
  { value: "short", label: "Short (1-2 paragraphs)" },
  { value: "medium", label: "Medium (3-4 paragraphs)" },
  { value: "long", label: "Long (5+ paragraphs)" },
]

export function ContentGenerator() {
  const [activeType, setActiveType] = useState("route_description")
  const [prompt, setPrompt] = useState("")
  const [tone, setTone] = useState("friendly")
  const [length, setLength] = useState("medium")
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [history, setHistory] = useState<GeneratedContent[]>([])
  const { user } = useAuth()

  const currentType = contentTypes.find((type) => type.id === activeType)

  const generateContent = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt")
      return
    }

    if (!user) {
      toast.error("Please sign in to generate content")
      return
    }

    setIsGenerating(true)

    try {
      const request: ContentGenerationRequest = {
        type: activeType,
        prompt: prompt.trim(),
        tone,
        length,
        context: {
          userPreferences: {
            accessibilityNeeds: true,
            mobilityDevice: "wheelchair",
          },
        },
      }

      const response = await fetch("/api/ai/generate-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        throw new Error("Failed to generate content")
      }

      const data = await response.json()

      const newContent: GeneratedContent = {
        id: crypto.randomUUID(),
        content: data.content,
        type: activeType,
        timestamp: new Date(),
        metadata: {
          tone,
          length,
          originalPrompt: prompt,
          tokens: data.usage?.totalTokens || 0,
        },
      }

      setGeneratedContent(newContent)
      setHistory((prev) => [newContent, ...prev.slice(0, 9)]) // Keep last 10
      toast.success("Content generated successfully!")
    } catch (error) {
      console.error("Content generation error:", error)
      toast.error("Failed to generate content")
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      toast.success("Content copied to clipboard!")
    } catch (error) {
      toast.error("Failed to copy content")
    }
  }

  const shareContent = async (content: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Generated Content - Wheel-coin",
          text: content,
        })
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      copyToClipboard(content)
    }
  }

  const downloadContent = (content: string, type: string) => {
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${type}_${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success("Content downloaded!")
  }

  const regenerateContent = () => {
    if (generatedContent) {
      generateContent()
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">AI Content Generator</h2>
        <p className="text-muted-foreground">
          Create engaging, accessible content powered by AI for your mobility journey
        </p>
      </div>

      <Tabs value={activeType} onValueChange={setActiveType} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          {contentTypes.map((type) => {
            const Icon = type.icon
            return (
              <TabsTrigger key={type.id} value={type.id} className="flex items-center gap-1">
                <Icon className="w-3 h-3" />
                <span className="hidden sm:inline">{type.name}</span>
              </TabsTrigger>
            )
          })}
        </TabsList>

        {contentTypes.map((type) => (
          <TabsContent key={type.id} value={type.id} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <type.icon className="w-5 h-5" />
                  {type.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{type.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Content Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tone">Tone</Label>
                    <Select value={tone} onValueChange={setTone}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {toneOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="length">Length</Label>
                    <Select value={length} onValueChange={setLength}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {lengthOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Prompt Input */}
                <div className="space-y-2">
                  <Label htmlFor="prompt">Content Prompt</Label>
                  <Textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={type.placeholder}
                    className="min-h-[100px]"
                    disabled={isGenerating}
                  />
                </div>

                {/* Generate Button */}
                <Button onClick={generateContent} disabled={!prompt.trim() || isGenerating} className="w-full">
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Content
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Generated Content */}
      {generatedContent && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Generated Content
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{generatedContent.type.replace("_", " ")}</Badge>
                <Badge variant="outline">{tone}</Badge>
                <Badge variant="outline">{length}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted rounded-lg p-4">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">{generatedContent.content}</div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(generatedContent.content)}>
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
              <Button variant="outline" size="sm" onClick={() => shareContent(generatedContent.content)}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadContent(generatedContent.content, generatedContent.type)}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" size="sm" onClick={regenerateContent} disabled={isGenerating}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate
              </Button>
            </div>

            {/* Metadata */}
            {generatedContent.metadata && (
              <div className="text-xs text-muted-foreground pt-2 border-t">
                Generated on {generatedContent.timestamp.toLocaleString()}
                {generatedContent.metadata.tokens && ` • ${generatedContent.metadata.tokens} tokens used`}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Content History */}
      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Generations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {history.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
                  onClick={() => setGeneratedContent(item)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-xs">
                        {item.type.replace("_", " ")}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{item.timestamp.toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm truncate">
                      {item.metadata?.originalPrompt || item.content.substring(0, 100)}...
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

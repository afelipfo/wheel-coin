"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Bot, User, Send, Loader2, ThumbsUp, ThumbsDown, MessageCircle, Sparkles, Zap, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth/auth-context"
import { toast } from "sonner"
import Link from "next/link"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  feedback?: "positive" | "negative"
}

export default function AIChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const { user } = useAuth()

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `Welcome to WheelBot AI Chat! 🤖✨

I'm your dedicated AI assistant for Wheel-coin, designed specifically to help wheelchair users maximize their mobility experience and crypto earnings.

**I can help you with:**
• 🗺️ Finding accessible routes and locations
• 💰 Maximizing your cryptocurrency rewards
• 📱 Navigating app features and settings
• 🏘️ Connecting with the community
• ♿ Accessibility tips and advice
• 📊 Understanding your progress and achievements

**Quick Start Tips:**
• Ask me "How can I earn more crypto?" 
• Try "Find accessible restaurants near me"
• Say "Show me my progress" for personalized insights

What would you like to know about your mobility journey today?`,
        timestamp: new Date(),
      }
      setMessages([welcomeMessage])
    }
  }, [messages.length])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return
    if (!user) {
      toast.error("Please sign in to use the AI assistant")
      return
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setIsTyping(true)

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversationHistory: messages.slice(-8), // Send last 8 messages for context
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get AI response")
      }

      const data = await response.json()

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Chat error:", error)
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "I'm sorry, I'm having trouble responding right now. Please try again in a moment, or check your internet connection.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
      toast.error("Failed to get AI response")
    } finally {
      setIsLoading(false)
      setIsTyping(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const provideFeedback = async (messageId: string, feedback: "positive" | "negative") => {
    try {
      await fetch("/api/ai/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messageId,
          feedback,
        }),
      })

      setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, feedback } : msg)))

      toast.success("Thank you for your feedback!")
    } catch (error) {
      console.error("Feedback error:", error)
      toast.error("Failed to submit feedback")
    }
  }

  const clearChat = () => {
    setMessages([])
  }

  const quickPrompts = [
    "How can I earn more crypto?",
    "Find accessible routes near me",
    "Show me my progress",
    "Community events this week",
    "Accessibility tips",
    "App features guide",
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-16 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                  <Bot className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">WheelBot AI Assistant</h1>
                  <p className="text-sm text-muted-foreground">
                    {isTyping ? "Typing..." : "Ready to help with your mobility journey"}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="w-3 h-3" />
                AI Powered
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Zap className="w-3 h-3" />
                {messages.length - 1} messages
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Quick Actions Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {quickPrompts.map((prompt, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-left h-auto py-2 px-3"
                    onClick={() => setInput(prompt)}
                    disabled={isLoading}
                  >
                    <MessageCircle className="w-3 h-3 mr-2 flex-shrink-0" />
                    <span className="text-xs">{prompt}</span>
                  </Button>
                ))}

                {messages.length > 1 && (
                  <Button variant="outline" size="sm" onClick={clearChat} className="w-full mt-4 bg-transparent">
                    Clear Chat
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <Card className="h-[calc(100vh-200px)]">
              <CardContent className="p-0 flex flex-col h-full">
                {/* Messages */}
                <ScrollArea className="flex-1 p-6">
                  <div className="space-y-6">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn("flex gap-4", message.role === "user" ? "justify-end" : "justify-start")}
                      >
                        {message.role === "assistant" && (
                          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
                            <Bot className="w-5 h-5 text-primary-foreground" />
                          </div>
                        )}

                        <div
                          className={cn(
                            "max-w-[85%] rounded-xl px-4 py-3",
                            message.role === "user" ? "bg-primary text-primary-foreground ml-auto" : "bg-muted",
                          )}
                        >
                          <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
                          <div className="text-xs opacity-70 mt-2">
                            {message.timestamp.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>

                          {/* Feedback buttons for assistant messages */}
                          {message.role === "assistant" && !message.feedback && (
                            <div className="flex gap-2 mt-3">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => provideFeedback(message.id, "positive")}
                                className="h-7 px-2 hover:bg-green-100 hover:text-green-600"
                              >
                                <ThumbsUp className="w-3 h-3 mr-1" />
                                Helpful
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => provideFeedback(message.id, "negative")}
                                className="h-7 px-2 hover:bg-red-100 hover:text-red-600"
                              >
                                <ThumbsDown className="w-3 h-3 mr-1" />
                                Not helpful
                              </Button>
                            </div>
                          )}

                          {/* Feedback indicator */}
                          {message.feedback && (
                            <Badge variant="secondary" className="mt-2 text-xs">
                              {message.feedback === "positive" ? "👍 Marked as helpful" : "👎 Marked as not helpful"}
                            </Badge>
                          )}
                        </div>

                        {message.role === "user" && (
                          <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-secondary-foreground" />
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Typing indicator */}
                    {isTyping && (
                      <div className="flex gap-4 justify-start">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
                          <Bot className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div className="bg-muted rounded-xl px-4 py-3">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100" />
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200" />
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Input */}
                <div className="border-t p-6">
                  <div className="flex gap-3">
                    <Textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Ask me anything about Wheel-coin, accessibility, or earning crypto..."
                      className="min-h-[60px] max-h-[120px] resize-none"
                      disabled={isLoading}
                    />
                    <Button onClick={sendMessage} disabled={!input.trim() || isLoading} size="lg" className="px-6">
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground mt-2">Press Enter to send, Shift+Enter for new line</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

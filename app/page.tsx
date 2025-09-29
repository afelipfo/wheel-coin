"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Activity,
  BarChart3,
  Users,
  MessageSquare,
  Download,
  Coins,
  Navigation,
  Shield,
  Zap,
  Star,
  CheckCircle,
  ArrowRight,
  Play,
  Globe,
  Smartphone,
  Award,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function HomePage() {
  const [activeFeature, setActiveFeature] = useState<string | null>(null)

  const features = [
    {
      id: "track",
      title: "Smart Distance Tracking",
      description: "AI-powered tracking that rewards every meter with cryptocurrency",
      icon: Activity,
      href: "/track",
      color: "bg-primary",
      priority: "Core",
    },
    {
      id: "navigate",
      title: "Accessible Route Planning",
      description: "Find wheelchair-friendly paths with real-time accessibility data",
      icon: Navigation,
      href: "/navigate",
      color: "bg-secondary",
      priority: "Core",
    },
    {
      id: "dashboard",
      title: "Earnings Dashboard",
      description: "Track your crypto rewards and mobility achievements",
      icon: BarChart3,
      href: "/dashboard",
      color: "bg-primary",
      priority: "Core",
    },
    {
      id: "community",
      title: "Global Community",
      description: "Connect with 70M+ wheelchair users worldwide",
      icon: Users,
      href: "/community",
      color: "bg-secondary",
      priority: "Social",
    },
    {
      id: "feedback",
      title: "Accessibility Reports",
      description: "Help improve urban accessibility for everyone",
      icon: MessageSquare,
      href: "/feedback",
      color: "bg-accent",
      priority: "Impact",
    },
    {
      id: "offline",
      title: "Offline Maps",
      description: "Access maps anywhere, even without internet",
      icon: Download,
      href: "/offline",
      color: "bg-muted",
      priority: "Utility",
    },
  ]

  const testimonials = [
    {
      name: "Sarah Chen",
      location: "San Francisco, CA",
      quote:
        "I've earned over $200 in crypto just from my daily commute. Wheel-coin has completely changed how I think about mobility.",
      rating: 5,
      avatar: "/professional-woman-wheelchair-user-smiling.jpg",
    },
    {
      name: "Marcus Rodriguez",
      location: "Austin, TX",
      quote:
        "The accessible route planning is incredible. I've discovered so many new places I never knew were wheelchair-friendly.",
      rating: 5,
      avatar: "/hispanic-man-wheelchair-user-outdoors.jpg",
    },
    {
      name: "Emma Thompson",
      location: "London, UK",
      quote:
        "Being part of this community has been life-changing. We're not just earning crypto, we're building a more accessible world.",
      rating: 5,
      avatar: "/british-woman-wheelchair-user-city-background.jpg",
    },
  ]

  const stats = [
    { value: "70M+", label: "Active Users", icon: Users },
    { value: "$2.4M", label: "Crypto Earned", icon: Coins },
    { value: "150+", label: "Cities Covered", icon: Globe },
    { value: "99.9%", label: "Uptime", icon: Shield },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Coins className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Wheel-coin</h1>
                <p className="text-sm text-muted-foreground">Move More, Earn More</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="hidden sm:flex">
                <Zap className="w-3 h-3 mr-1" />
                Live Beta
              </Badge>
              <Button variant="outline" size="sm">
                Sign In
              </Button>
              <Button size="sm" className="hidden sm:flex" asChild>
                <Link href="/track">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />

        <div className="container mx-auto text-center max-w-5xl relative">
          <div className="mb-8">
            <Badge variant="secondary" className="mb-6 text-sm px-4 py-2">
              <Award className="w-4 h-4 mr-2" />
              Revolutionizing Mobility Worldwide
            </Badge>

            <h2 className="text-5xl md:text-7xl font-bold text-balance mb-8 leading-tight">
              Move More, Earn More
              <br />
              <span className="text-primary">Transform Your Mobility</span>
              <br />
              <span className="text-secondary">into Cryptocurrency Rewards</span>
            </h2>

            <p className="text-xl md:text-2xl text-muted-foreground text-pretty max-w-3xl mx-auto mb-8 leading-relaxed">
              Join a community that rewards your movement and helps improve urban accessibility. Every meter you move
              earns you cryptocurrency while building a more inclusive world.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button size="lg" className="text-lg px-10 py-6 h-auto" asChild>
              <Link href="/track">
                <Activity className="w-6 h-6 mr-3" />
                Start Earning Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-10 py-6 h-auto bg-transparent" asChild>
              <Link href="/dashboard">
                <Play className="w-6 h-6 mr-3" />
                Watch Demo
              </Link>
            </Button>
          </div>

          {/* Hero Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center mb-3">
                    <Icon className="w-6 h-6 text-primary mr-2" />
                    <div className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</div>
                  </div>
                  <div className="text-sm md:text-base text-muted-foreground font-medium">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold mb-4 text-balance">Trusted by Millions Worldwide</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Real stories from real users who are transforming their mobility into meaningful rewards
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="border-2 border-transparent hover:border-primary/20 transition-all duration-300"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4 mb-4">
                    <Image
                      src={testimonial.avatar || "/placeholder.svg"}
                      alt={`${testimonial.name} profile`}
                      width={60}
                      height={60}
                      className="rounded-full"
                    />
                    <div>
                      <h4 className="font-semibold text-lg">{testimonial.name}</h4>
                      <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground italic leading-relaxed">"{testimonial.quote}"</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span className="text-sm font-medium">Bank-Grade Security</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">GDPR Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              <span className="text-sm font-medium">150+ Cities</span>
            </div>
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              <span className="text-sm font-medium">iOS & Android</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              Complete Solution
            </Badge>
            <h3 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
              Everything You Need for
              <span className="text-primary"> Smart Mobility</span>
            </h3>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
              From AI-powered tracking to community-driven accessibility reports, we've built the most comprehensive
              mobility platform for wheelchair users.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Card
                  key={feature.id}
                  className={`group transition-all duration-500 hover:shadow-xl cursor-pointer border-2 hover:-translate-y-2 ${
                    activeFeature === feature.id
                      ? "border-primary shadow-xl scale-105"
                      : "border-transparent hover:border-primary/20"
                  }`}
                  onMouseEnter={() => setActiveFeature(feature.id)}
                  onMouseLeave={() => setActiveFeature(null)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                      >
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <Badge variant={feature.priority === "Core" ? "default" : "secondary"}>{feature.priority}</Badge>
                    </div>
                    <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                    <CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button
                      variant="ghost"
                      className="w-full justify-between p-0 h-auto text-primary hover:text-primary-foreground hover:bg-primary group-hover:translate-x-2 transition-all duration-300"
                      asChild
                    >
                      <Link href={feature.href}>
                        Explore Feature
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="mb-8">
            <h3 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
              Ready to Transform Your
              <span className="text-primary"> Mobility Journey?</span>
            </h3>
            <p className="text-xl text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
              Join over 70 million users who are already earning cryptocurrency while building a more accessible world.
              Your movement matters.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <Button
              size="lg"
              className="text-xl px-12 py-8 h-auto shadow-lg hover:shadow-xl transition-all duration-300"
              asChild
            >
              <Link href="/track">
                <Coins className="w-6 h-6 mr-3" />
                Start Earning Today
                <ArrowRight className="w-5 h-5 ml-3" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-xl px-12 py-8 h-auto bg-transparent border-2" asChild>
              <Link href="/community">
                <Users className="w-6 h-6 mr-3" />
                Join Our Community
              </Link>
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              🔒 Your data is secure • 🌍 Available worldwide • 📱 iOS & Android
            </p>
            <div className="flex justify-center gap-4">
              <Badge variant="secondary">Free to Start</Badge>
              <Badge variant="secondary">No Hidden Fees</Badge>
              <Badge variant="secondary">Instant Rewards</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-12 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Coins className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-bold text-2xl">Wheel-coin</span>
            </div>
            <p className="text-muted-foreground max-w-md">
              Empowering mobility through technology, community, and cryptocurrency rewards. Building a more accessible
              world, one meter at a time.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/track" className="hover:text-primary transition-colors">
                    Distance Tracking
                  </Link>
                </li>
                <li>
                  <Link href="/navigate" className="hover:text-primary transition-colors">
                    Route Planning
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-primary transition-colors">
                    Earnings Dashboard
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Community</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/community" className="hover:text-primary transition-colors">
                    Global Network
                  </Link>
                </li>
                <li>
                  <Link href="/feedback" className="hover:text-primary transition-colors">
                    Accessibility Reports
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary transition-colors">
                    Success Stories
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-primary transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/offline" className="hover:text-primary transition-colors">
                    Offline Mode
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-primary transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary transition-colors">
                    Security
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Wheel-coin. All rights reserved. Empowering mobility worldwide.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import {
  Menu,
  X,
  Activity,
  BarChart3,
  NavigationIcon,
  Users,
  MessageSquare,
  Download,
  Coins,
  Home,
  Shield,
  CreditCard,
  Bot,
  Sparkles,
  Target,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { UserMenu } from "@/components/auth/user-menu"
import { useAuth } from "@/lib/auth/auth-context"
import { createBrowserClient } from "@supabase/ssr"

const navigationItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Track Distance", href: "/track", icon: Activity, priority: "Must" },
  { name: "Dashboard", href: "/dashboard", icon: BarChart3, priority: "Must" },
  { name: "Navigate", href: "/navigate", icon: NavigationIcon, priority: "Must" },
  { name: "Community", href: "/community", icon: Users, priority: "Should" },
  { name: "Feedback", href: "/feedback", icon: MessageSquare, priority: "Should" },
  { name: "AI Assistant", href: "/ai-chat", icon: Bot, priority: "Pro" },
  { name: "AI Content", href: "/ai-content", icon: Sparkles, priority: "Pro" },
  { name: "AI Recommendations", href: "/ai-recommendations", icon: Target, priority: "Pro" },
  { name: "Offline Maps", href: "/offline", icon: Download, priority: "Should" },
  { name: "Pricing", href: "/pricing", icon: CreditCard, priority: "Pro" },
]

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const pathname = usePathname()
  const { user } = useAuth()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    async function checkAdminRole() {
      if (!user) {
        setIsAdmin(false)
        return
      }

      try {
        const { data } = await supabase.from("users").select("role").eq("id", user.id).single()

        setIsAdmin(data?.role === "admin")
      } catch (error) {
        setIsAdmin(false)
      }
    }

    checkAdminRole()
  }, [user, supabase])

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Coins className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">Wheel-coin</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Button
                  key={item.href}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className={cn("gap-2 relative", isActive && "bg-primary text-primary-foreground")}
                  asChild
                >
                  <Link href={item.href}>
                    <Icon className="w-4 h-4" />
                    {item.name}
                    {item.priority && (
                      <Badge
                        variant={item.priority === "Must" ? "secondary" : "outline"}
                        className="ml-1 text-xs px-1 py-0"
                      >
                        {item.priority}
                      </Badge>
                    )}
                  </Link>
                </Button>
              )
            })}
            {isAdmin && (
              <Button
                variant={pathname.startsWith("/admin") ? "default" : "ghost"}
                size="sm"
                className={cn("gap-2 relative", pathname.startsWith("/admin") && "bg-primary text-primary-foreground")}
                asChild
              >
                <Link href="/admin">
                  <Shield className="w-4 h-4" />
                  Admin
                  <Badge variant="secondary" className="ml-1 text-xs px-1 py-0">
                    Pro
                  </Badge>
                </Link>
              </Button>
            )}
            <UserMenu />
          </div>

          {/* Mobile Navigation */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="sm">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <Coins className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <span className="font-bold text-lg">Wheel-coin</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href

                  return (
                    <Button
                      key={item.href}
                      variant={isActive ? "default" : "ghost"}
                      className={cn("w-full justify-start gap-3", isActive && "bg-primary text-primary-foreground")}
                      onClick={() => setIsOpen(false)}
                      asChild
                    >
                      <Link href={item.href}>
                        <Icon className="w-5 h-5" />
                        <span className="flex-1 text-left">{item.name}</span>
                        {item.priority && (
                          <Badge variant={item.priority === "Must" ? "secondary" : "outline"} className="text-xs">
                            {item.priority}
                          </Badge>
                        )}
                      </Link>
                    </Button>
                  )
                })}
                {isAdmin && (
                  <Button
                    variant={pathname.startsWith("/admin") ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3",
                      pathname.startsWith("/admin") && "bg-primary text-primary-foreground",
                    )}
                    onClick={() => setIsOpen(false)}
                    asChild
                  >
                    <Link href="/admin">
                      <Shield className="w-5 h-5" />
                      <span className="flex-1 text-left">Admin</span>
                      <Badge variant="secondary" className="text-xs">
                        Pro
                      </Badge>
                    </Link>
                  </Button>
                )}
                <div className="pt-4 border-t">
                  <UserMenu />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}

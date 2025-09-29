"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  BarChart3,
  Users,
  Activity,
  MessageSquare,
  AlertTriangle,
  Gift,
  Settings,
  Shield,
  Database,
  FileText,
  Download,
  ChevronLeft,
  ChevronRight,
  Home,
  DollarSign,
  Brain,
} from "lucide-react"

const adminNavItems = [
  { name: "Overview", href: "/admin", icon: BarChart3, category: "Analytics" },
  { name: "Revenue", href: "/admin/revenue", icon: DollarSign, category: "Analytics" }, // Added revenue analytics
  { name: "AI Analytics", href: "/admin/ai-analytics", icon: Brain, category: "Analytics", badge: "AI" }, // Added AI Analytics to admin navigation
  { name: "Users", href: "/admin/users", icon: Users, category: "Management" },
  { name: "Distances", href: "/admin/distances", icon: Activity, category: "Data" },
  { name: "Reports", href: "/admin/reports", icon: AlertTriangle, category: "Management", badge: "New" },
  { name: "Feedback", href: "/admin/feedback", icon: MessageSquare, category: "Data" },
  { name: "Rewards", href: "/admin/rewards", icon: Gift, category: "Management" },
  { name: "Analytics", href: "/admin/analytics", icon: Database, category: "Analytics" },
  { name: "Audit Logs", href: "/admin/audit", icon: FileText, category: "Security" },
  { name: "Export Data", href: "/admin/export", icon: Download, category: "Tools" },
  { name: "Settings", href: "/admin/settings", icon: Settings, category: "System" },
]

const categories = {
  Analytics: "Analytics & Insights",
  Management: "User Management",
  Data: "Data Operations",
  Security: "Security & Audit",
  Tools: "Admin Tools",
  System: "System Settings",
}

interface AdminSidebarProps {
  collapsed?: boolean
  onToggle?: () => void
}

export function AdminSidebar({ collapsed = false, onToggle }: AdminSidebarProps) {
  const pathname = usePathname()

  const groupedItems = adminNavItems.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = []
      }
      acc[item.category].push(item)
      return acc
    },
    {} as Record<string, typeof adminNavItems>,
  )

  return (
    <div
      className={cn(
        "bg-card border-r border-border transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              <div>
                <h2 className="font-semibold text-sm">Admin Panel</h2>
                <p className="text-xs text-muted-foreground">Wheel-coin</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="flex justify-center w-full">
              <Shield className="w-6 h-6 text-primary" />
            </div>
          )}
          {onToggle && (
            <Button variant="ghost" size="sm" onClick={onToggle} className="h-8 w-8 p-0">
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>
          )}
        </div>
      </div>

      {/* Back to App */}
      <div className="p-2 border-b border-border">
        <Button
          variant="ghost"
          size="sm"
          className={cn("w-full justify-start gap-2", collapsed && "justify-center")}
          asChild
        >
          <Link href="/">
            <Home className="w-4 h-4" />
            {!collapsed && "Back to App"}
          </Link>
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-2">
        {Object.entries(groupedItems).map(([category, items]) => (
          <div key={category} className="mb-6">
            {!collapsed && (
              <h3 className="px-2 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {categories[category as keyof typeof categories]}
              </h3>
            )}
            <div className="space-y-1">
              {items.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <Button
                    key={item.href}
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    className={cn(
                      "w-full justify-start gap-2 h-9",
                      collapsed && "justify-center px-2",
                      isActive && "bg-primary/10 text-primary border-primary/20",
                    )}
                    asChild
                  >
                    <Link href={item.href}>
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-left">{item.name}</span>
                          {item.badge && (
                            <Badge variant="secondary" className="text-xs px-1.5 py-0">
                              {item.badge}
                            </Badge>
                          )}
                        </>
                      )}
                    </Link>
                  </Button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

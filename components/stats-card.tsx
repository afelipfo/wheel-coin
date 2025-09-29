import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: {
    value: string
    isPositive: boolean
  }
  badge?: {
    text: string
    variant?: "default" | "secondary" | "outline"
  }
  className?: string
}

export function StatsCard({ title, value, subtitle, icon: Icon, trend, badge, className }: StatsCardProps) {
  return (
    <Card className={cn("transition-all duration-200 hover:shadow-md", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-primary" />
            {badge && (
              <Badge variant={badge.variant || "secondary"} className="text-xs">
                {badge.text}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className="text-2xl font-bold">{value}</div>
          {subtitle && <div className="text-sm text-muted-foreground">{subtitle}</div>}
          {trend && (
            <div
              className={cn(
                "flex items-center gap-1 text-sm",
                trend.isPositive ? "text-secondary" : "text-destructive",
              )}
            >
              <span>{trend.value}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

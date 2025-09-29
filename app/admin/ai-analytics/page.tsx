import { AIAnalyticsDashboard } from "@/components/ai/ai-analytics-dashboard"

export default function AdminAIAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Analytics</h1>
          <p className="text-muted-foreground">Monitor AI feature usage, performance, and optimization opportunities</p>
        </div>
      </div>

      <AIAnalyticsDashboard />
    </div>
  )
}

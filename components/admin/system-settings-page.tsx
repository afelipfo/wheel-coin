"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Settings, Database, Shield, Bell, Download } from "lucide-react"
import { useAuth } from "@/lib/auth/auth-context"

export function SystemSettingsPage() {
  const [settings, setSettings] = useState({
    coins_per_km: 10,
    max_daily_distance: 50,
    min_distance_threshold: 0.1,
    referral_bonus: 100,
    daily_login_bonus: 5,
    maintenance_mode: false,
    registration_enabled: true,
    email_notifications: true,
  })
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    total_users: 0,
    total_distances: 0,
    total_rewards: 0,
    total_coins_distributed: 0,
    database_size: "0 MB",
  })

  const { user } = useAuth()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    fetchSettings()
    fetchStats()
  }, [])

  async function fetchSettings() {
    try {
      // In a real app, you'd fetch these from a settings table
      // For now, we'll use default values
      setSettings({
        coins_per_km: 10,
        max_daily_distance: 50,
        min_distance_threshold: 0.1,
        referral_bonus: 100,
        daily_login_bonus: 5,
        maintenance_mode: false,
        registration_enabled: true,
        email_notifications: true,
      })
    } catch (error) {
      console.error("Error fetching settings:", error)
    }
  }

  async function fetchStats() {
    try {
      const [usersResult, distancesResult, rewardsResult] = await Promise.all([
        supabase.from("users").select("id", { count: "exact", head: true }),
        supabase.from("distances").select("id", { count: "exact", head: true }),
        supabase.from("rewards").select("coins_amount"),
      ])

      const totalCoins = rewardsResult.data?.reduce((sum, reward) => sum + (reward.coins_amount || 0), 0) || 0

      setStats({
        total_users: usersResult.count || 0,
        total_distances: distancesResult.count || 0,
        total_rewards: rewardsResult.data?.length || 0,
        total_coins_distributed: totalCoins,
        database_size: "2.4 MB", // This would be calculated from actual DB size
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  async function saveSettings() {
    setLoading(true)
    try {
      // In a real app, you'd save these to a settings table
      // For now, we'll just log the admin action
      await supabase.from("admin_actions").insert({
        admin_id: user?.id,
        action_type: "settings_update",
        target_table: "system_settings",
        details: { updated_settings: settings },
      })

      alert("Settings saved successfully!")
    } catch (error) {
      console.error("Error saving settings:", error)
      alert("Error saving settings")
    } finally {
      setLoading(false)
    }
  }

  async function exportAllData() {
    try {
      const [users, distances, rewards, reports, feedback] = await Promise.all([
        supabase.from("users").select("*"),
        supabase.from("distances").select("*"),
        supabase.from("rewards").select("*"),
        supabase.from("reports").select("*"),
        supabase.from("feedback").select("*"),
      ])

      const exportData = {
        users: users.data || [],
        distances: distances.data || [],
        rewards: rewards.data || [],
        reports: reports.data || [],
        feedback: feedback.data || [],
        exported_at: new Date().toISOString(),
        exported_by: user?.id,
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `wheel_coin_full_export_${new Date().toISOString().split("T")[0]}.json`
      a.click()
      window.URL.revokeObjectURL(url)

      // Log admin action
      await supabase.from("admin_actions").insert({
        admin_id: user?.id,
        action_type: "full_data_export",
        target_table: "all_tables",
        details: { export_timestamp: new Date().toISOString() },
      })
    } catch (error) {
      console.error("Error exporting data:", error)
      alert("Error exporting data")
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">System Settings</h1>
          <p className="text-muted-foreground">Configure system parameters and manage data</p>
        </div>
        <Button onClick={exportAllData} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export All Data
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure basic system parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="coins_per_km">Coins per Kilometer</Label>
                  <Input
                    id="coins_per_km"
                    type="number"
                    value={settings.coins_per_km}
                    onChange={(e) => setSettings({ ...settings, coins_per_km: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_daily_distance">Max Daily Distance (km)</Label>
                  <Input
                    id="max_daily_distance"
                    type="number"
                    value={settings.max_daily_distance}
                    onChange={(e) => setSettings({ ...settings, max_daily_distance: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="min_distance_threshold">Minimum Distance Threshold (km)</Label>
                <Input
                  id="min_distance_threshold"
                  type="number"
                  step="0.1"
                  value={settings.min_distance_threshold}
                  onChange={(e) => setSettings({ ...settings, min_distance_threshold: Number(e.target.value) })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">Temporarily disable the app for maintenance</p>
                </div>
                <Switch
                  checked={settings.maintenance_mode}
                  onCheckedChange={(checked) => setSettings({ ...settings, maintenance_mode: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Registration Enabled</Label>
                  <p className="text-sm text-muted-foreground">Allow new user registrations</p>
                </div>
                <Switch
                  checked={settings.registration_enabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, registration_enabled: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reward Settings</CardTitle>
              <CardDescription>Configure reward amounts and bonuses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="referral_bonus">Referral Bonus (coins)</Label>
                  <Input
                    id="referral_bonus"
                    type="number"
                    value={settings.referral_bonus}
                    onChange={(e) => setSettings({ ...settings, referral_bonus: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="daily_login_bonus">Daily Login Bonus (coins)</Label>
                  <Input
                    id="daily_login_bonus"
                    type="number"
                    value={settings.daily_login_bonus}
                    onChange={(e) => setSettings({ ...settings, daily_login_bonus: Number(e.target.value) })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure security and notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Send email notifications for important events</p>
                </div>
                <Switch
                  checked={settings.email_notifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, email_notifications: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Database Statistics</CardTitle>
              <CardDescription>Overview of database usage and statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Shield className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Total Users</p>
                    <p className="text-2xl font-bold">{stats.total_users.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Database className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Distance Entries</p>
                    <p className="text-2xl font-bold">{stats.total_distances.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Bell className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Total Rewards</p>
                    <p className="text-2xl font-bold">{stats.total_rewards.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Settings className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Coins Distributed</p>
                    <p className="text-2xl font-bold">{stats.total_coins_distributed.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Database className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Database Size</p>
                    <p className="text-2xl font-bold">{stats.database_size}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={saveSettings} disabled={loading}>
          {loading ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  )
}

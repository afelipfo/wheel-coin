"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Download, MapPin, Wifi, WifiOff, HardDrive, Trash2, RefreshCw, CheckCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface OfflineMap {
  id: string
  name: string
  area: string
  size: string
  downloadDate: string
  lastUpdated: string
  status: "downloaded" | "downloading" | "outdated" | "available"
  downloadProgress?: number
}

interface OfflineData {
  routes: number
  places: number
  accessibility: number
  lastSync: string
}

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(true)
  const [storageUsed, setStorageUsed] = useState(245) // MB
  const [storageLimit] = useState(1000) // MB
  const { toast } = useToast()

  // Mock offline maps data
  const [offlineMaps, setOfflineMaps] = useState<OfflineMap[]>([
    {
      id: "1",
      name: "Downtown Area",
      area: "5.2 km²",
      size: "45 MB",
      downloadDate: "2024-01-15",
      lastUpdated: "2024-01-15",
      status: "downloaded",
    },
    {
      id: "2",
      name: "University District",
      area: "3.8 km²",
      size: "32 MB",
      downloadDate: "2024-01-10",
      lastUpdated: "2024-01-20",
      status: "outdated",
    },
    {
      id: "3",
      name: "Medical Center",
      area: "2.1 km²",
      size: "18 MB",
      downloadDate: "",
      lastUpdated: "",
      status: "available",
    },
    {
      id: "4",
      name: "Shopping District",
      area: "4.5 km²",
      size: "38 MB",
      downloadDate: "",
      lastUpdated: "",
      status: "available",
    },
  ])

  const offlineData: OfflineData = {
    routes: 127,
    places: 89,
    accessibility: 234,
    lastSync: "2024-01-20T14:30:00Z",
  }

  useEffect(() => {
    const handleOnlineStatus = () => setIsOnline(navigator.onLine)

    window.addEventListener("online", handleOnlineStatus)
    window.addEventListener("offline", handleOnlineStatus)

    return () => {
      window.removeEventListener("online", handleOnlineStatus)
      window.removeEventListener("offline", handleOnlineStatus)
    }
  }, [])

  const handleDownload = async (mapId: string) => {
    setOfflineMaps((prev) =>
      prev.map((map) => (map.id === mapId ? { ...map, status: "downloading", downloadProgress: 0 } : map)),
    )

    // Simulate download progress
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise((resolve) => setTimeout(resolve, 200))
      setOfflineMaps((prev) => prev.map((map) => (map.id === mapId ? { ...map, downloadProgress: progress } : map)))
    }

    // Complete download
    setOfflineMaps((prev) =>
      prev.map((map) =>
        map.id === mapId
          ? {
              ...map,
              status: "downloaded",
              downloadDate: new Date().toISOString().split("T")[0],
              lastUpdated: new Date().toISOString().split("T")[0],
              downloadProgress: undefined,
            }
          : map,
      ),
    )

    const map = offlineMaps.find((m) => m.id === mapId)
    if (map) {
      setStorageUsed((prev) => prev + Number.parseInt(map.size))
      toast({
        title: "Download Complete",
        description: `${map.name} is now available offline`,
      })
    }
  }

  const handleUpdate = async (mapId: string) => {
    const map = offlineMaps.find((m) => m.id === mapId)
    if (!map) return

    setOfflineMaps((prev) =>
      prev.map((m) => (m.id === mapId ? { ...m, status: "downloading", downloadProgress: 0 } : m)),
    )

    // Simulate update progress
    for (let progress = 0; progress <= 100; progress += 15) {
      await new Promise((resolve) => setTimeout(resolve, 150))
      setOfflineMaps((prev) => prev.map((m) => (m.id === mapId ? { ...m, downloadProgress: progress } : m)))
    }

    setOfflineMaps((prev) =>
      prev.map((m) =>
        m.id === mapId
          ? {
              ...m,
              status: "downloaded",
              lastUpdated: new Date().toISOString().split("T")[0],
              downloadProgress: undefined,
            }
          : m,
      ),
    )

    toast({
      title: "Update Complete",
      description: `${map.name} has been updated`,
    })
  }

  const handleDelete = (mapId: string) => {
    const map = offlineMaps.find((m) => m.id === mapId)
    if (!map) return

    setOfflineMaps((prev) =>
      prev.map((m) => (m.id === mapId ? { ...m, status: "available", downloadDate: "", lastUpdated: "" } : m)),
    )

    setStorageUsed((prev) => prev - Number.parseInt(map.size))

    toast({
      title: "Map Deleted",
      description: `${map.name} removed from offline storage`,
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "downloaded":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "downloading":
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
      case "outdated":
        return <AlertCircle className="h-4 w-4 text-orange-600" />
      default:
        return <Download className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "downloaded":
        return "bg-green-100 text-green-800"
      case "downloading":
        return "bg-blue-100 text-blue-800"
      case "outdated":
        return "bg-orange-100 text-orange-800"
      case "available":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-foreground">Offline Maps & Data</h1>
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Badge className="bg-green-100 text-green-800">
                  <Wifi className="h-3 w-3 mr-1" />
                  Online
                </Badge>
              ) : (
                <Badge className="bg-red-100 text-red-800">
                  <WifiOff className="h-3 w-3 mr-1" />
                  Offline
                </Badge>
              )}
            </div>
          </div>
          <p className="text-muted-foreground">Download maps and data for offline access when you're on the go</p>
        </div>

        {/* Storage Overview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Storage Usage
            </CardTitle>
            <CardDescription>Manage your offline storage space</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Used: {storageUsed} MB</span>
                  <span>Available: {storageLimit - storageUsed} MB</span>
                </div>
                <Progress value={(storageUsed / storageLimit) * 100} className="h-2" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{offlineData.routes}</div>
                  <div className="text-sm text-muted-foreground">Saved Routes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{offlineData.places}</div>
                  <div className="text-sm text-muted-foreground">Accessible Places</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{offlineData.accessibility}</div>
                  <div className="text-sm text-muted-foreground">Accessibility Reports</div>
                </div>
              </div>

              <div className="text-center pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Last synced: {new Date(offlineData.lastSync).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Offline Maps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Offline Maps
            </CardTitle>
            <CardDescription>Download map areas for offline navigation and accessibility information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {offlineMaps.map((map) => (
                <div key={map.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(map.status)}
                      <h3 className="font-semibold">{map.name}</h3>
                      <Badge className={getStatusColor(map.status)}>
                        {map.status === "downloading" ? "Downloading..." : map.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Area: {map.area}</span>
                      <span>Size: {map.size}</span>
                      {map.downloadDate && <span>Downloaded: {new Date(map.downloadDate).toLocaleDateString()}</span>}
                    </div>

                    {map.status === "downloading" && map.downloadProgress !== undefined && (
                      <div className="mt-2">
                        <Progress value={map.downloadProgress} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">{map.downloadProgress}% complete</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {map.status === "available" && (
                      <Button onClick={() => handleDownload(map.id)} disabled={!isOnline} size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    )}

                    {map.status === "outdated" && (
                      <Button onClick={() => handleUpdate(map.id)} disabled={!isOnline} size="sm" variant="outline">
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Update
                      </Button>
                    )}

                    {(map.status === "downloaded" || map.status === "outdated") && (
                      <Button onClick={() => handleDelete(map.id)} size="sm" variant="outline">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {!isOnline && (
              <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-2 text-orange-800">
                  <WifiOff className="h-5 w-5" />
                  <p className="font-medium">You're currently offline</p>
                </div>
                <p className="text-sm text-orange-700 mt-1">
                  You can still use downloaded maps and access your saved data. Connect to the internet to download new
                  maps or sync your data.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

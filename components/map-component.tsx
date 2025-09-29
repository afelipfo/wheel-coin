"use client"

import type React from "react"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Accessibility, Locate, ZoomIn, ZoomOut } from "lucide-react"

interface MapComponentProps {
  center?: { latitude: number; longitude: number }
  zoom?: number
  route?: Array<{ latitude: number; longitude: number; isAccessible: boolean }>
  issues?: Array<{ latitude: number; longitude: number; type: string; severity: string }>
  onLocationSelect?: (location: { latitude: number; longitude: number }) => void
  showControls?: boolean
  className?: string
}

export function MapComponent({
  center = { latitude: 37.7749, longitude: -122.4194 },
  zoom = 14,
  route,
  issues,
  onLocationSelect,
  showControls = true,
  className = "",
}: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [currentZoom, setCurrentZoom] = useState(zoom)
  const [mapCenter, setMapCenter] = useState(center)

  const handleZoomIn = () => {
    setCurrentZoom((prev) => Math.min(prev + 1, 20))
  }

  const handleZoomOut = () => {
    setCurrentZoom((prev) => Math.max(prev - 1, 1))
  }

  const handleRecenter = () => {
    setMapCenter(center)
    setCurrentZoom(zoom)
  }

  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!onLocationSelect || !mapRef.current) return

    const rect = mapRef.current.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Convert pixel coordinates to lat/lng (simplified)
    const latitude = center.latitude + (0.5 - y / rect.height) * 0.01
    const longitude = center.longitude + (x / rect.width - 0.5) * 0.01

    onLocationSelect({ latitude, longitude })
  }

  return (
    <div className={`relative bg-muted/30 rounded-lg border overflow-hidden ${className}`}>
      <div
        ref={mapRef}
        className="w-full h-full cursor-crosshair relative"
        onClick={handleMapClick}
        style={{ minHeight: "300px" }}
      >
        {/* Simulated Map Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
          {/* Grid Pattern */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
              `,
              backgroundSize: "20px 20px",
            }}
          />

          {/* Current Location */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-4 h-4 bg-primary rounded-full border-2 border-white shadow-lg animate-pulse" />
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1">
              <Badge variant="secondary" className="text-xs whitespace-nowrap">
                You are here
              </Badge>
            </div>
          </div>

          {/* Route Path */}
          {route && route.length > 1 && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <defs>
                <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
              </defs>
              <path
                d="M 30% 60% Q 45% 40% 60% 50% T 80% 30%"
                stroke="url(#routeGradient)"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="5,5"
                className="animate-pulse"
              />
            </svg>
          )}

          {/* Accessibility Issues */}
          {issues?.map((issue, index) => (
            <div
              key={index}
              className="absolute"
              style={{
                top: `${30 + index * 15}%`,
                left: `${40 + index * 10}%`,
              }}
            >
              <div className="w-6 h-6 bg-destructive rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                <AlertTriangle className="w-3 h-3 text-white" />
              </div>
            </div>
          ))}

          {/* Accessible Features */}
          <div className="absolute top-1/4 right-1/3">
            <div className="w-5 h-5 bg-secondary rounded-full border-2 border-white shadow-lg flex items-center justify-center">
              <Accessibility className="w-3 h-3 text-white" />
            </div>
          </div>
          <div className="absolute bottom-1/3 left-1/3">
            <div className="w-5 h-5 bg-secondary rounded-full border-2 border-white shadow-lg flex items-center justify-center">
              <Accessibility className="w-3 h-3 text-white" />
            </div>
          </div>
        </div>

        {/* Map Controls */}
        {showControls && (
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <Button size="sm" variant="secondary" onClick={handleZoomIn}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="secondary" onClick={handleZoomOut}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="secondary" onClick={handleRecenter}>
              <Locate className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Zoom Level Indicator */}
        <div className="absolute bottom-4 left-4">
          <Badge variant="outline" className="bg-background/80">
            Zoom: {currentZoom}
          </Badge>
        </div>
      </div>
    </div>
  )
}

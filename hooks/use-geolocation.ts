"use client"

import { useState, useEffect, useRef } from "react"

interface GeolocationPosition {
  latitude: number
  longitude: number
  accuracy: number
  timestamp: number
}

interface GeolocationError {
  code: number
  message: string
}

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean
  timeout?: number
  maximumAge?: number
}

interface UseGeolocationReturn {
  position: GeolocationPosition | null
  error: GeolocationError | null
  isLoading: boolean
  startTracking: () => void
  stopTracking: () => void
  isTracking: boolean
}

export function useGeolocation(options: UseGeolocationOptions = {}): UseGeolocationReturn {
  const [position, setPosition] = useState<GeolocationPosition | null>(null)
  const [error, setError] = useState<GeolocationError | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isTracking, setIsTracking] = useState(false)
  const watchIdRef = useRef<number | null>(null)

  const defaultOptions: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 60000,
    ...options,
  }

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError({
        code: 0,
        message: "Geolocation is not supported by this browser.",
      })
      return
    }

    setIsLoading(true)
    setError(null)
    setIsTracking(true)

    const handleSuccess = (pos: GeolocationPosition) => {
      setPosition({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        timestamp: pos.timestamp,
      })
      setIsLoading(false)
    }

    const handleError = (err: GeolocationPositionError) => {
      setError({
        code: err.code,
        message: err.message,
      })
      setIsLoading(false)
      setIsTracking(false)
    }

    watchIdRef.current = navigator.geolocation.watchPosition(handleSuccess, handleError, defaultOptions)
  }

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    setIsTracking(false)
    setIsLoading(false)
  }

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [])

  return {
    position,
    error,
    isLoading,
    startTracking,
    stopTracking,
    isTracking,
  }
}

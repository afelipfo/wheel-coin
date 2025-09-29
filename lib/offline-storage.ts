// Offline storage utilities for Wheel-coin app
interface StoredRoute {
  id: string
  name: string
  coordinates: [number, number][]
  distance: number
  accessibilityScore: number
  savedAt: string
}

interface StoredPlace {
  id: string
  name: string
  address: string
  coordinates: [number, number]
  accessibilityFeatures: string[]
  rating: number
  savedAt: string
}

interface OfflineSession {
  id: string
  startTime: string
  endTime: string
  distance: number
  coinsEarned: number
  route: [number, number][]
  synced: boolean
}

class OfflineStorageManager {
  private dbName = "WheelCoinOfflineDB"
  private version = 1
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create object stores
        if (!db.objectStoreNames.contains("routes")) {
          const routeStore = db.createObjectStore("routes", { keyPath: "id" })
          routeStore.createIndex("name", "name", { unique: false })
        }

        if (!db.objectStoreNames.contains("places")) {
          const placeStore = db.createObjectStore("places", { keyPath: "id" })
          placeStore.createIndex("name", "name", { unique: false })
        }

        if (!db.objectStoreNames.contains("sessions")) {
          const sessionStore = db.createObjectStore("sessions", { keyPath: "id" })
          sessionStore.createIndex("synced", "synced", { unique: false })
        }

        if (!db.objectStoreNames.contains("mapTiles")) {
          db.createObjectStore("mapTiles", { keyPath: "key" })
        }
      }
    })
  }

  async saveRoute(route: StoredRoute): Promise<void> {
    if (!this.db) throw new Error("Database not initialized")

    const transaction = this.db.transaction(["routes"], "readwrite")
    const store = transaction.objectStore("routes")

    return new Promise((resolve, reject) => {
      const request = store.put(route)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getRoutes(): Promise<StoredRoute[]> {
    if (!this.db) throw new Error("Database not initialized")

    const transaction = this.db.transaction(["routes"], "readonly")
    const store = transaction.objectStore("routes")

    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async savePlace(place: StoredPlace): Promise<void> {
    if (!this.db) throw new Error("Database not initialized")

    const transaction = this.db.transaction(["places"], "readwrite")
    const store = transaction.objectStore("places")

    return new Promise((resolve, reject) => {
      const request = store.put(place)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getPlaces(): Promise<StoredPlace[]> {
    if (!this.db) throw new Error("Database not initialized")

    const transaction = this.db.transaction(["places"], "readonly")
    const store = transaction.objectStore("places")

    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async saveSession(session: OfflineSession): Promise<void> {
    if (!this.db) throw new Error("Database not initialized")

    const transaction = this.db.transaction(["sessions"], "readwrite")
    const store = transaction.objectStore("sessions")

    return new Promise((resolve, reject) => {
      const request = store.put(session)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getUnsyncedSessions(): Promise<OfflineSession[]> {
    if (!this.db) throw new Error("Database not initialized")

    const transaction = this.db.transaction(["sessions"], "readonly")
    const store = transaction.objectStore("sessions")
    const index = store.index("synced")

    return new Promise((resolve, reject) => {
      const request = index.getAll(false)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async markSessionSynced(sessionId: string): Promise<void> {
    if (!this.db) throw new Error("Database not initialized")

    const transaction = this.db.transaction(["sessions"], "readwrite")
    const store = transaction.objectStore("sessions")

    return new Promise((resolve, reject) => {
      const getRequest = store.get(sessionId)
      getRequest.onsuccess = () => {
        const session = getRequest.result
        if (session) {
          session.synced = true
          const putRequest = store.put(session)
          putRequest.onsuccess = () => resolve()
          putRequest.onerror = () => reject(putRequest.error)
        } else {
          reject(new Error("Session not found"))
        }
      }
      getRequest.onerror = () => reject(getRequest.error)
    })
  }

  async saveMapTile(key: string, tileData: Blob): Promise<void> {
    if (!this.db) throw new Error("Database not initialized")

    const transaction = this.db.transaction(["mapTiles"], "readwrite")
    const store = transaction.objectStore("mapTiles")

    return new Promise((resolve, reject) => {
      const request = store.put({ key, data: tileData, savedAt: new Date().toISOString() })
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getMapTile(key: string): Promise<Blob | null> {
    if (!this.db) throw new Error("Database not initialized")

    const transaction = this.db.transaction(["mapTiles"], "readonly")
    const store = transaction.objectStore("mapTiles")

    return new Promise((resolve, reject) => {
      const request = store.get(key)
      request.onsuccess = () => {
        const result = request.result
        resolve(result ? result.data : null)
      }
      request.onerror = () => reject(request.error)
    })
  }

  async clearOldData(daysOld = 30): Promise<void> {
    if (!this.db) throw new Error("Database not initialized")

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)
    const cutoffString = cutoffDate.toISOString()

    const transaction = this.db.transaction(["routes", "places", "mapTiles"], "readwrite")

    // Clear old routes
    const routeStore = transaction.objectStore("routes")
    const routeCursor = routeStore.openCursor()
    routeCursor.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result
      if (cursor) {
        if (cursor.value.savedAt < cutoffString) {
          cursor.delete()
        }
        cursor.continue()
      }
    }

    // Clear old places
    const placeStore = transaction.objectStore("places")
    const placeCursor = placeStore.openCursor()
    placeCursor.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result
      if (cursor) {
        if (cursor.value.savedAt < cutoffString) {
          cursor.delete()
        }
        cursor.continue()
      }
    }

    // Clear old map tiles
    const tileStore = transaction.objectStore("mapTiles")
    const tileCursor = tileStore.openCursor()
    tileCursor.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result
      if (cursor) {
        if (cursor.value.savedAt < cutoffString) {
          cursor.delete()
        }
        cursor.continue()
      }
    }
  }

  async getStorageSize(): Promise<number> {
    if (!navigator.storage || !navigator.storage.estimate) {
      return 0
    }

    const estimate = await navigator.storage.estimate()
    return estimate.usage || 0
  }
}

// Export singleton instance
export const offlineStorage = new OfflineStorageManager()

// Utility functions for offline functionality
export const isOnline = (): boolean => {
  return navigator.onLine
}

export const setupOfflineSync = () => {
  // Listen for online/offline events
  window.addEventListener("online", async () => {
    console.log("[v0] App came online, syncing data...")
    await syncOfflineData()
  })

  window.addEventListener("offline", () => {
    console.log("[v0] App went offline, enabling offline mode...")
  })
}

export const syncOfflineData = async (): Promise<void> => {
  if (!isOnline()) return

  try {
    // Get unsynced sessions
    const unsyncedSessions = await offlineStorage.getUnsyncedSessions()

    // Sync each session
    for (const session of unsyncedSessions) {
      try {
        // Simulate API call to sync session data
        const response = await fetch("/api/sessions/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(session),
        })

        if (response.ok) {
          await offlineStorage.markSessionSynced(session.id)
          console.log(`[v0] Synced session ${session.id}`)
        }
      } catch (error) {
        console.error(`[v0] Failed to sync session ${session.id}:`, error)
      }
    }

    console.log("[v0] Offline data sync completed")
  } catch (error) {
    console.error("[v0] Error during offline sync:", error)
  }
}

// Initialize offline storage when module loads
if (typeof window !== "undefined") {
  offlineStorage
    .init()
    .then(() => {
      console.log("[v0] Offline storage initialized")
      setupOfflineSync()
    })
    .catch((error) => {
      console.error("[v0] Failed to initialize offline storage:", error)
    })
}

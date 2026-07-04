import { useState, useEffect } from 'react'
import { StorageService } from './storage'
import type { Case, Correspondence } from '../types'

export interface QueuedAction {
  id: string
  type: 'create' | 'update' | 'delete'
  entityType: 'case' | 'correspondence'
  data: any
  timestamp: string
  retryCount: number
}

export interface SyncStatus {
  isOnline: boolean
  lastSync: string | null
  pendingActions: number
  syncInProgress: boolean
}

class OfflineManager {
  private static instance: OfflineManager
  private queuedActions: QueuedAction[] = []
  private syncInProgress = false
  private isOnline = navigator.onLine
  private listeners: ((status: SyncStatus) => void)[] = []

  static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager()
    }
    return OfflineManager.instance
  }

  constructor() {
    this.setupEventListeners()
    this.loadQueuedActions()
  }

  private setupEventListeners() {
    // Online/offline detection
    window.addEventListener('online', () => {
      this.isOnline = true
      this.notifyListeners()
      this.processQueue()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
      this.notifyListeners()
    })

    // Page visibility change - sync when page becomes visible
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.isOnline) {
        this.processQueue()
      }
    })
  }

  private async loadQueuedActions() {
    try {
      const stored = localStorage.getItem('lcm_queued_actions')
      if (stored) {
        this.queuedActions = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load queued actions:', error)
    }
  }

  private saveQueuedActions() {
    try {
      localStorage.setItem('lcm_queued_actions', JSON.stringify(this.queuedActions))
    } catch (error) {
      console.error('Failed to save queued actions:', error)
    }
  }

  private notifyListeners() {
    const status: SyncStatus = {
      isOnline: this.isOnline,
      lastSync: localStorage.getItem('lcm_last_sync'),
      pendingActions: this.queuedActions.length,
      syncInProgress: this.syncInProgress
    }
    this.listeners.forEach(listener => listener(status))
  }

  // Queue actions for offline processing
  queueAction(action: Omit<QueuedAction, 'id' | 'timestamp' | 'retryCount'>) {
    const queuedAction: QueuedAction = {
      ...action,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      retryCount: 0
    }

    this.queuedActions.push(queuedAction)
    this.saveQueuedActions()
    this.notifyListeners()

    // Try to process immediately if online
    if (this.isOnline) {
      this.processQueue()
    }
  }

  // Process queued actions when online
  private async processQueue() {
    if (this.syncInProgress || !this.isOnline || this.queuedActions.length === 0) {
      return
    }

    this.syncInProgress = true
    this.notifyListeners()

    try {
      const actionsToProcess = [...this.queuedActions]
      const failedActions: QueuedAction[] = []

      for (const action of actionsToProcess) {
        try {
          await this.executeAction(action)
          // Remove successful action
          this.queuedActions = this.queuedActions.filter(a => a.id !== action.id)
        } catch (error) {
          console.error(`Failed to execute action ${action.id}:`, error)
          
          // Retry logic with exponential backoff
          action.retryCount++
          const maxRetries = 3
          const backoffDelay = Math.min(1000 * Math.pow(2, action.retryCount), 30000)
          
          if (action.retryCount < maxRetries) {
            setTimeout(() => {
              failedActions.push(action)
            }, backoffDelay)
          } else {
            console.error(`Max retries exceeded for action ${action.id}`)
          }
        }
      }

      this.saveQueuedActions()
      this.notifyListeners()

      // Update last sync time
      if (this.queuedActions.length === 0) {
        localStorage.setItem('lcm_last_sync', new Date().toISOString())
      }

    } catch (error) {
      console.error('Error processing queue:', error)
    } finally {
      this.syncInProgress = false
      this.notifyListeners()
    }
  }

  private async executeAction(action: QueuedAction): Promise<void> {
    switch (action.entityType) {
      case 'case':
        return this.executeCaseAction(action)
      case 'correspondence':
        return this.executeCorrespondenceAction(action)
      default:
        throw new Error(`Unknown entity type: ${action.entityType}`)
    }
  }

  private async executeCaseAction(action: QueuedAction): Promise<void> {
    // This would integrate with your API or sync service
    console.log(`Executing case action: ${action.type}`, action.data)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // In a real implementation, this would call your API
    // Example: await apiClient.updateCase(action.data.id, action.data)
  }

  private async executeCorrespondenceAction(action: QueuedAction): Promise<void> {
    // This would integrate with your API or sync service
    console.log(`Executing correspondence action: ${action.type}`, action.data)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // In a real implementation, this would call your API
    // Example: await apiClient.updateCorrespondence(action.data.id, action.data)
  }

  // Public API
  getStatus(): SyncStatus {
    return {
      isOnline: this.isOnline,
      lastSync: localStorage.getItem('lcm_last_sync'),
      pendingActions: this.queuedActions.length,
      syncInProgress: this.syncInProgress
    }
  }

  subscribe(listener: (status: SyncStatus) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  // Manual sync trigger
  async forceSync() {
    if (this.isOnline) {
      await this.processQueue()
    }
  }

  // Clear queue (for debugging or reset)
  clearQueue() {
    this.queuedActions = []
    this.saveQueuedActions()
    this.notifyListeners()
  }

  // Get offline statistics
  getOfflineStats() {
    return {
      queuedActions: this.queuedActions.length,
      isOnline: this.isOnline,
      lastSync: localStorage.getItem('lcm_last_sync'),
      actionsByType: this.queuedActions.reduce((acc, action) => {
        const key = `${action.entityType}_${action.type}`
        acc[key] = (acc[key] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    }
  }
}

export const offlineManager = OfflineManager.getInstance()

// React hook for offline functionality
export function useOfflineManager() {
  const [status, setStatus] = useState<SyncStatus>(offlineManager.getStatus())

  useEffect(() => {
    const unsubscribe = offlineManager.subscribe(setStatus)
    return unsubscribe
  }, [])

  return {
    ...status,
    forceSync: offlineManager.forceSync.bind(offlineManager),
    clearQueue: offlineManager.clearQueue.bind(offlineManager),
    getStats: offlineManager.getOfflineStats.bind(offlineManager)
  }
}

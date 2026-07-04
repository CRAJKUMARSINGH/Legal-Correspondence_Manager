import { useState, useEffect } from 'react'

export interface UserAction {
  type: 'create_case' | 'edit_case' | 'delete_case' | 'create_correspondence' | 'edit_correspondence' | 'delete_correspondence' | 'search' | 'export' | 'import' | 'sync' | 'generate_draft'
  timestamp: string
  metadata?: Record<string, any>
  duration?: number
  success?: boolean
  error?: string
}

export interface PerformanceMetrics {
  pageLoadTime: number
  apiResponseTime: number
  searchResponseTime: number
  renderTime: number
  memoryUsage: number
  storageUsage: number
}

export interface FeatureUsage {
  feature: string
  usageCount: number
  lastUsed: string
  averageDuration: number
  errorRate: number
}

export interface AnalyticsData {
  actions: UserAction[]
  performance: PerformanceMetrics[]
  featureUsage: Record<string, FeatureUsage>
  sessionStart: string
  sessionDuration: number
  errorCount: number
}

class AnalyticsManager {
  private static instance: AnalyticsManager
  private data: AnalyticsData
  private performanceObservers: PerformanceObserver[] = []

  static getInstance(): AnalyticsManager {
    if (!AnalyticsManager.instance) {
      AnalyticsManager.instance = new AnalyticsManager()
    }
    return AnalyticsManager.instance
  }

  constructor() {
    this.data = this.loadAnalyticsData()
    this.setupPerformanceMonitoring()
    this.setupErrorTracking()
  }

  private loadAnalyticsData(): AnalyticsData {
    try {
      const stored = localStorage.getItem('lcm_analytics')
      if (stored) {
        const data = JSON.parse(stored)
        // Clean old data (keep only last 30 days)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        
        return {
          ...data,
          actions: data.actions.filter((action: UserAction) => 
            new Date(action.timestamp) > thirtyDaysAgo
          )
        }
      }
    } catch (error) {
      console.error('Failed to load analytics data:', error)
    }

    return {
      actions: [],
      performance: [],
      featureUsage: {},
      sessionStart: new Date().toISOString(),
      sessionDuration: 0,
      errorCount: 0
    }
  }

  private saveAnalyticsData() {
    try {
      localStorage.setItem('lcm_analytics', JSON.stringify(this.data))
    } catch (error) {
      console.error('Failed to save analytics data:', error)
    }
  }

  private setupPerformanceMonitoring() {
    // Monitor navigation timing
    if ('performance' in window && 'getEntriesByType' in performance) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach(entry => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming
            this.recordPerformance({
              pageLoadTime: navEntry.loadEventEnd - navEntry.loadEventStart,
              apiResponseTime: 0,
              searchResponseTime: 0,
              renderTime: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
              memoryUsage: this.getMemoryUsage(),
              storageUsage: this.getStorageUsage()
            })
          }
        })
      })
      
      observer.observe({ entryTypes: ['navigation'] })
      this.performanceObservers.push(observer)
    }
  }

  private setupErrorTracking() {
    // Track JavaScript errors
    window.addEventListener('error', (event) => {
      this.recordError('JavaScript Error', event.error?.message || event.message)
    })

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.recordError('Unhandled Promise Rejection', event.reason?.message || 'Unknown error')
    })
  }

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize
    }
    return 0
  }

  private getStorageUsage(): number {
    let totalSize = 0
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('lcm_')) {
        const value = localStorage.getItem(key)
        if (value) {
          totalSize += key.length + value.length
        }
      }
    }
    return totalSize
  }

  // Public API methods
  trackAction(action: Omit<UserAction, 'timestamp'>) {
    const userAction: UserAction = {
      ...action,
      timestamp: new Date().toISOString()
    }

    this.data.actions.push(userAction)
    this.updateFeatureUsage(action.type, action.duration, action.success !== false)
    this.saveAnalyticsData()
  }

  private updateFeatureUsage(feature: string, duration?: number, success = true) {
    if (!this.data.featureUsage[feature]) {
      this.data.featureUsage[feature] = {
        feature,
        usageCount: 0,
        lastUsed: '',
        averageDuration: 0,
        errorRate: 0
      }
    }

    const usage = this.data.featureUsage[feature]
    usage.usageCount++
    usage.lastUsed = new Date().toISOString()

    if (duration) {
      usage.averageDuration = (usage.averageDuration * (usage.usageCount - 1) + duration) / usage.usageCount
    }

    if (!success) {
      usage.errorRate = (usage.errorRate * (usage.usageCount - 1) + 1) / usage.usageCount
    }
  }

  recordPerformance(metrics: Partial<PerformanceMetrics>) {
    const performanceMetric: PerformanceMetrics = {
      pageLoadTime: 0,
      apiResponseTime: 0,
      searchResponseTime: 0,
      renderTime: 0,
      memoryUsage: 0,
      storageUsage: 0,
      ...metrics
    }

    this.data.performance.push(performanceMetric)
    this.saveAnalyticsData()
  }

  recordError(type: string, message: string) {
    this.data.errorCount++
    this.saveAnalyticsData()
  }

  // Analytics queries
  getMostUsedFeatures(limit: number = 10): FeatureUsage[] {
    return Object.values(this.data.featureUsage)
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit)
  }

  getAverageResponseTime(): number {
    if (this.data.performance.length === 0) return 0
    
    const apiTimes = this.data.performance
      .filter(p => p.apiResponseTime > 0)
      .map(p => p.apiResponseTime)

    if (apiTimes.length === 0) return 0

    return apiTimes.reduce((sum, time) => sum + time, 0) / apiTimes.length
  }

  getErrorRate(): number {
    const totalActions = this.data.actions.length
    if (totalActions === 0) return 0

    const failedActions = this.data.actions.filter(action => action.success === false).length
    return (failedActions / totalActions) * 100
  }

  getSessionDuration(): number {
    return Date.now() - new Date(this.data.sessionStart).getTime()
  }

  getStorageStats(): {
    totalSize: number
    itemCount: number
    averageItemSize: number
  } {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('lcm_'))
    let totalSize = 0

    keys.forEach(key => {
      const value = localStorage.getItem(key)
      if (value) {
        totalSize += key.length + value.length
      }
    })

    return {
      totalSize,
      itemCount: keys.length,
      averageItemSize: keys.length > 0 ? totalSize / keys.length : 0
    }
  }

  // Export analytics data
  exportAnalytics(): string {
    const exportData = {
      ...this.data,
      exportedAt: new Date().toISOString(),
      summary: {
        totalActions: this.data.actions.length,
        totalErrors: this.data.errorCount,
        sessionDuration: this.getSessionDuration(),
        mostUsedFeatures: this.getMostUsedFeatures(5),
        averageResponseTime: this.getAverageResponseTime(),
        errorRate: this.getErrorRate(),
        storageStats: this.getStorageStats()
      }
    }

    return JSON.stringify(exportData, null, 2)
  }
}

export const analyticsManager = AnalyticsManager.getInstance()

// React hook for analytics
export function useAnalytics() {
  const [sessionDuration, setSessionDuration] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setSessionDuration(analyticsManager.getSessionDuration())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return {
    trackAction: analyticsManager.trackAction.bind(analyticsManager),
    recordPerformance: analyticsManager.recordPerformance.bind(analyticsManager),
    getMostUsedFeatures: analyticsManager.getMostUsedFeatures.bind(analyticsManager),
    getAverageResponseTime: analyticsManager.getAverageResponseTime.bind(analyticsManager),
    getErrorRate: analyticsManager.getErrorRate.bind(analyticsManager),
    exportAnalytics: analyticsManager.exportAnalytics.bind(analyticsManager),
    sessionDuration,
    storageStats: analyticsManager.getStorageStats()
  }
}

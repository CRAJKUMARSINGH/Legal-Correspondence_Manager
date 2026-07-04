import { useState, useEffect } from 'react'
import { fetchLuminaireCases, fetchLuminaireCorrespondence } from './luminaireApi'
import { offlineManager } from './offlineManager'
import type { Case, Correspondence } from '../types'
import type { LuminaireCase, LuminaireCorrespondence } from './luminaireApi'

export interface WebhookConfig {
  url: string
  secret?: string
  events: string[]
  retryAttempts: number
  timeout: number
}

export interface ConnectionStatus {
  isOnline: boolean
  apiConnected: boolean
  lastApiCheck: string | null
  consecutiveFailures: number
  webhookStatus: 'connected' | 'disconnected' | 'error'
}

export interface RetryConfig {
  maxAttempts: number
  baseDelay: number
  maxDelay: number
  backoffMultiplier: number
}

class IntegrationManager {
  private static instance: IntegrationManager
  private connectionStatus: ConnectionStatus
  private retryConfig: RetryConfig
  private webhookConfigs: WebhookConfig[] = []
  private listeners: ((status: ConnectionStatus) => void)[] = []

  static getInstance(): IntegrationManager {
    if (!IntegrationManager.instance) {
      IntegrationManager.instance = new IntegrationManager()
    }
    return IntegrationManager.instance
  }

  constructor() {
    this.connectionStatus = {
      isOnline: navigator.onLine,
      apiConnected: false,
      lastApiCheck: null,
      consecutiveFailures: 0,
      webhookStatus: 'disconnected'
    }

    this.retryConfig = {
      maxAttempts: 3,
      baseDelay: 1000,
      maxDelay: 30000,
      backoffMultiplier: 2
    }

    this.setupEventListeners()
    this.startConnectionMonitoring()
  }

  private setupEventListeners() {
    window.addEventListener('online', () => {
      this.connectionStatus.isOnline = true
      this.notifyListeners()
      this.checkApiConnection()
    })

    window.addEventListener('offline', () => {
      this.connectionStatus.isOnline = false
      this.connectionStatus.apiConnected = false
      this.notifyListeners()
    })
  }

  private startConnectionMonitoring() {
    // Check API connection every 30 seconds
    setInterval(() => {
      if (this.connectionStatus.isOnline) {
        this.checkApiConnection()
      }
    }, 30000)

    // Initial check
    this.checkApiConnection()
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.connectionStatus))
  }

  // API connection health check
  private async checkApiConnection(): Promise<boolean> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const response = await fetch('https://luminaire-docs.preview.emergentagent.com/api/health', {
        signal: controller.signal,
        method: 'HEAD'
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        this.connectionStatus.apiConnected = true
        this.connectionStatus.consecutiveFailures = 0
        this.connectionStatus.lastApiCheck = new Date().toISOString()
      } else {
        throw new Error(`API returned ${response.status}`)
      }

      this.notifyListeners()
      return true

    } catch (error) {
      this.connectionStatus.apiConnected = false
      this.connectionStatus.consecutiveFailures++
      this.connectionStatus.lastApiCheck = new Date().toISOString()
      
      this.notifyListeners()
      return false
    }
  }

  // Retry logic with exponential backoff
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    config: Partial<RetryConfig> = {}
  ): Promise<T> {
    const retryConfig = { ...this.retryConfig, ...config }
    let lastError: Error

    for (let attempt = 1; attempt <= retryConfig.maxAttempts; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error as Error
        
        if (attempt === retryConfig.maxAttempts) {
          throw lastError
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          retryConfig.baseDelay * Math.pow(retryConfig.backoffMultiplier, attempt - 1),
          retryConfig.maxDelay
        )

        console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms:`, error)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    throw lastError!
  }

  // Enhanced sync with retry logic
  async syncWithRetry(): Promise<{ cases: LuminaireCase[], correspondence: LuminaireCorrespondence[] }> {
    return this.executeWithRetry(async () => {
      const [cases, correspondence] = await Promise.all([
        fetchLuminaireCases(),
        fetchLuminaireCorrespondence()
      ])

      if (!cases.length && !correspondence.length) {
        throw new Error('No data received from API')
      }

      return { cases, correspondence }
    }, {
      maxAttempts: 5,
      baseDelay: 2000,
      maxDelay: 60000
    })
  }

  // Webhook management
  addWebhook(config: WebhookConfig) {
    this.webhookConfigs.push(config)
    this.testWebhook(config)
  }

  removeWebhook(url: string) {
    this.webhookConfigs = this.webhookConfigs.filter(config => config.url !== url)
  }

  private async testWebhook(config: WebhookConfig) {
    try {
      const payload = {
        event: 'test',
        timestamp: new Date().toISOString(),
        data: { message: 'Webhook connectivity test' }
      }

      await this.sendWebhook(config, payload)
      this.connectionStatus.webhookStatus = 'connected'
    } catch (error) {
      this.connectionStatus.webhookStatus = 'error'
      console.error('Webhook test failed:', error)
    }

    this.notifyListeners()
  }

  async sendWebhook(config: WebhookConfig, payload: any) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'Legal-Correspondence-Manager/1.0'
    }

    if (config.secret) {
      // Simple HMAC signature (in production, use proper crypto)
      const signature = btoa(JSON.stringify(payload) + config.secret)
      headers['X-Signature'] = signature
    }

    const response = await fetch(config.url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(config.timeout || 10000)
    })

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Send webhooks for events
  async triggerWebhooks(event: string, data: any) {
    const relevantWebhooks = this.webhookConfigs.filter(config => 
      config.events.includes('*') || config.events.includes(event)
    )

    const promises = relevantWebhooks.map(config => 
      this.executeWithRetry(() => this.sendWebhook(config, {
        event,
        timestamp: new Date().toISOString(),
        data
      }), {
        maxAttempts: config.retryAttempts || 3
      })
    )

    try {
      await Promise.allSettled(promises)
    } catch (error) {
      console.error('Webhook delivery failed:', error)
    }
  }

  // Monitor API performance metrics
  async getApiMetrics() {
    const startTime = Date.now()
    
    try {
      await this.checkApiConnection()
      const responseTime = Date.now() - startTime
      
      return {
        responseTime,
        status: this.connectionStatus.apiConnected ? 'healthy' : 'unhealthy',
        consecutiveFailures: this.connectionStatus.consecutiveFailures,
        lastCheck: this.connectionStatus.lastApiCheck,
        uptime: this.connectionStatus.apiConnected ? '100%' : '0%'
      }
    } catch (error) {
      return {
        responseTime: Date.now() - startTime,
        status: 'error',
        consecutiveFailures: this.connectionStatus.consecutiveFailures,
        lastCheck: this.connectionStatus.lastApiCheck,
        uptime: '0%',
        error: (error as Error).message
      }
    }
  }

  // Public API
  getStatus(): ConnectionStatus {
    return { ...this.connectionStatus }
  }

  subscribe(listener: (status: ConnectionStatus) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  // Graceful degradation
  async syncWithFallback() {
    try {
      // Try online sync first
      return await this.syncWithRetry()
    } catch (error) {
      console.warn('Online sync failed, falling back to offline mode:', error)
      
      // Return cached data or empty result
      return {
        cases: [],
        correspondence: []
      }
    }
  }

  // Batch operations for better performance
  async batchOperation<T>(
    operations: Array<() => Promise<T>>,
    batchSize: number = 5
  ): Promise<T[]> {
    const results: T[] = []
    
    for (let i = 0; i < operations.length; i += batchSize) {
      const batch = operations.slice(i, i + batchSize)
      const batchResults = await Promise.allSettled(batch)
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push((result as PromiseFulfilledResult<T>).value)
        } else {
          console.error(`Batch operation ${i + index} failed:`, result.reason)
          // Could add to retry queue here
        }
      })
    }
    
    return results
  }
}

export const integrationManager = IntegrationManager.getInstance()

// React hook for integration status
export function useIntegrationManager() {
  const [status, setStatus] = useState(integrationManager.getStatus())

  useEffect(() => {
    const unsubscribe = integrationManager.subscribe(setStatus)
    return unsubscribe
  }, [])

  return {
    ...status,
    syncWithRetry: integrationManager.syncWithRetry.bind(integrationManager),
    syncWithFallback: integrationManager.syncWithFallback.bind(integrationManager),
    triggerWebhooks: integrationManager.triggerWebhooks.bind(integrationManager),
    getMetrics: integrationManager.getApiMetrics.bind(integrationManager),
    addWebhook: integrationManager.addWebhook.bind(integrationManager),
    removeWebhook: integrationManager.removeWebhook.bind(integrationManager)
  }
}

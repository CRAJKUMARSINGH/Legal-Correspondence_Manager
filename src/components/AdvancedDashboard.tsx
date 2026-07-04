import { useState, useEffect } from 'react'
import { 
  Activity, 
  Database, 
  Wifi, 
  WifiOff, 
  Clock, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle,
  BarChart3,
  Zap,
  Shield,
  Download,
  RefreshCw
} from 'lucide-react'
import { useAnalytics } from '../lib/analytics'
import { useOfflineManager } from '../lib/offlineManager'
import { useIntegrationManager } from '../lib/integrationManager'
import { DataValidator } from '../lib/dataValidation'
import { usePerformanceOptimizations } from '../hooks/usePerformanceOptimizations'
import type { Case, Correspondence } from '../types'

interface Props {
  cases: Case[]
  correspondence: Correspondence[]
  lang: 'en' | 'hi'
}

export default function AdvancedDashboard({ cases, correspondence, lang }: Props) {
  const analytics = useAnalytics()
  const offlineStatus = useOfflineManager()
  const integrationStatus = useIntegrationManager()
  const { getDashboardStats } = usePerformanceOptimizations()
  
  const [dataIntegrityReport, setDataIntegrityReport] = useState<any>(null)
  const [isCheckingIntegrity, setIsCheckingIntegrity] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'analytics' | 'offline' | 'data'>('overview')

  const stats = getDashboardStats(cases, correspondence)

  useEffect(() => {
    // Track dashboard view
    analytics.trackAction({
      type: 'search', // Using existing type for dashboard view
      metadata: { action: 'view_advanced_dashboard' }
    })
  }, [])

  const checkDataIntegrity = async () => {
    setIsCheckingIntegrity(true)
    try {
      const report = await DataValidator.checkDataIntegrity(cases, correspondence)
      setDataIntegrityReport(report)
    } catch (error) {
      console.error('Data integrity check failed:', error)
    } finally {
      setIsCheckingIntegrity(false)
    }
  }

  const exportAnalytics = () => {
    const data = analytics.exportAnalytics()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `analytics-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
  }

  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Connection Status */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">Connection</span>
          {integrationStatus.isOnline ? (
            <Wifi className="w-4 h-4 text-green-500" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-500" />
          )}
        </div>
        <div className="text-2xl font-bold text-gray-900">
          {integrationStatus.isOnline ? 'Online' : 'Offline'}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          API: {integrationStatus.apiConnected ? 'Connected' : 'Disconnected'}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">Performance</span>
          <Zap className="w-4 h-4 text-yellow-500" />
        </div>
        <div className="text-2xl font-bold text-gray-900">
          {Math.round(analytics.getAverageResponseTime())}ms
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Avg API Response
        </div>
      </div>

      {/* Data Integrity */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">Data Health</span>
          <Shield className="w-4 h-4 text-blue-500" />
        </div>
        <div className="text-2xl font-bold text-gray-900">
          {dataIntegrityReport ? dataIntegrityReport.totalIssues : '—'}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Issues Found
        </div>
      </div>

      {/* Storage Usage */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">Storage</span>
          <Database className="w-4 h-4 text-purple-500" />
        </div>
        <div className="text-2xl font-bold text-gray-900">
          {formatBytes(analytics.storageStats.totalSize)}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {analytics.storageStats.itemCount} items
        </div>
      </div>
    </div>
  )

  const renderPerformance = () => (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-500" />
          Performance Metrics
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-gray-600">Page Load Time</div>
            <div className="text-xl font-bold text-gray-900">
              {analytics.getAverageResponseTime()}ms
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Error Rate</div>
            <div className="text-xl font-bold text-gray-900">
              {analytics.getErrorRate().toFixed(1)}%
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Session Duration</div>
            <div className="text-xl font-bold text-gray-900">
              {formatDuration(analytics.sessionDuration)}
            </div>
          </div>
        </div>
      </div>

      {/* Feature Usage */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-500" />
          Most Used Features
        </h3>
        
        <div className="space-y-2">
          {analytics.getMostUsedFeatures(5).map((feature, index) => (
            <div key={feature.feature} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                <span className="text-sm text-gray-900">{feature.feature}</span>
              </div>
              <div className="text-sm text-gray-600">{feature.usageCount} uses</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderOffline = () => (
    <div className="space-y-6">
      {/* Offline Status */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          {offlineStatus.isOnline ? (
            <Wifi className="w-5 h-5 text-green-500" />
          ) : (
            <WifiOff className="w-5 h-5 text-red-500" />
          )}
          Offline Status
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-600">Status</div>
            <div className={`text-xl font-bold ${offlineStatus.isOnline ? 'text-green-600' : 'text-red-600'}`}>
              {offlineStatus.isOnline ? 'Online' : 'Offline'}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Pending Actions</div>
            <div className="text-xl font-bold text-gray-900">
              {offlineStatus.pendingActions}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Last Sync</div>
            <div className="text-sm text-gray-900">
              {offlineStatus.lastSync ? 
                new Date(offlineStatus.lastSync).toLocaleString() : 
                'Never'
              }
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Sync Status</div>
            <div className={`text-sm font-medium ${offlineStatus.syncInProgress ? 'text-yellow-600' : 'text-green-600'}`}>
              {offlineStatus.syncInProgress ? 'In Progress' : 'Idle'}
            </div>
          </div>
        </div>

        {offlineStatus.pendingActions > 0 && (
          <button
            onClick={offlineStatus.forceSync}
            disabled={offlineStatus.syncInProgress}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${offlineStatus.syncInProgress ? 'animate-spin' : ''}`} />
            Force Sync
          </button>
        )}
      </div>
    </div>
  )

  const renderData = () => (
    <div className="space-y-6">
      {/* Data Integrity */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-500" />
          Data Integrity
        </h3>
        
        <button
          onClick={checkDataIntegrity}
          disabled={isCheckingIntegrity}
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isCheckingIntegrity ? 'animate-spin' : ''}`} />
          Check Data Integrity
        </button>

        {dataIntegrityReport && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {dataIntegrityReport.totalIssues === 0 ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-500" />
              )}
              <span className="text-sm font-medium text-gray-700">
                {dataIntegrityReport.totalIssues} issues found
              </span>
            </div>

            {dataIntegrityReport.orphanedCorrespondence.length > 0 && (
              <div className="text-sm text-red-600">
                {dataIntegrityReport.orphanedCorrespondence.length} orphaned correspondence items
              </div>
            )}

            {dataIntegrityReport.invalidDates.length > 0 && (
              <div className="text-sm text-yellow-600">
                {dataIntegrityReport.invalidDates.length} invalid dates
              </div>
            )}
          </div>
        )}
      </div>

      {/* Storage Statistics */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-purple-500" />
          Storage Statistics
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-gray-600">Total Size</div>
            <div className="text-xl font-bold text-gray-900">
              {formatBytes(analytics.storageStats.totalSize)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Items Count</div>
            <div className="text-xl font-bold text-gray-900">
              {analytics.storageStats.itemCount}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Average Item Size</div>
            <div className="text-xl font-bold text-gray-900">
              {formatBytes(analytics.storageStats.averageItemSize)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Advanced Dashboard</h2>
        <button
          onClick={exportAnalytics}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export Analytics
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'performance', label: 'Performance', icon: TrendingUp },
            { id: 'offline', label: 'Offline', icon: Wifi },
            { id: 'data', label: 'Data', icon: Database }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'performance' && renderPerformance()}
        {activeTab === 'offline' && renderOffline()}
        {activeTab === 'data' && renderData()}
      </div>
    </div>
  )
}

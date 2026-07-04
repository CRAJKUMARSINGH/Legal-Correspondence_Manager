import React, { useState, useEffect } from 'react'
import { Search, Download, Upload, Keyboard, Calculator, Database, Zap, BarChart3, Settings, HelpCircle } from 'lucide-react'
import { useSearch } from '../hooks/useSearch'
import { useKeyboardShortcuts, createAppShortcuts, useShortcutHelp } from '../hooks/useKeyboardShortcuts'
import { useInterestCalculator } from '../lib/interestCalculator'
import { DataManager } from '../lib/dataManager'
import { templateCache } from '../lib/templateCache'
import { StorageService } from '../lib/storage'
import { VirtualizedCorrespondenceList } from './VirtualizedCorrespondenceList'
import type { Correspondence } from '../types'

export const EfficiencyDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'search' | 'calculator' | 'data' | 'shortcuts'>('overview')
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [stats, setStats] = useState<any>(null)
  
  const search = useSearch()
  const calculator = useInterestCalculator()
  const [showHelp, setShowHelp] = useState(false)

  // Load statistics
  useEffect(() => {
    const loadStats = async () => {
      try {
        const dataStats = await StorageService.getDataStats()
        const cacheStats = templateCache.getCacheStats()
        
        setStats({
          ...dataStats,
          ...cacheStats,
          searchResults: search.totalCases + search.totalCorrespondence
        })
      } catch (error) {
        console.error('Failed to load stats:', error)
      }
    }
    
    loadStats()
  }, [search.totalCases, search.totalCorrespondence])

  // Keyboard shortcuts
  const shortcuts = createAppShortcuts({
    newCase: () => console.log('New case shortcut'),
    search: () => setActiveTab('search'),
    exportData: handleExport,
    importData: handleImport,
    toggleTheme: () => console.log('Toggle theme'),
    print: () => window.print(),
    refresh: () => window.location.reload(),
    focusSearch: () => setActiveTab('search'),
    clearSearch: () => search.setSearchQuery(''),
    selectAll: handleSelectAll,
    deleteSelected: handleDeleteSelected,
    archiveSelected: handleArchiveSelected,
    newCorrespondence: () => console.log('New correspondence'),
    syncData: () => console.log('Sync data'),
    showHelp: () => setShowHelp(true),
    showShortcuts: () => setActiveTab('shortcuts')
  })

  useKeyboardShortcuts(shortcuts)

  async function handleExport() {
    try {
      await DataManager.downloadJSON()
      alert('Data exported successfully!')
    } catch (error) {
      alert('Export failed: ' + error)
    }
  }

  async function handleImport() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        try {
          await DataManager.importFromFile(file)
          alert('Data imported successfully!')
          window.location.reload()
        } catch (error) {
          alert('Import failed: ' + error)
        }
      }
    }
    input.click()
  }

  function handleSelectAll() {
    if (search.searchResults.length === 0) return
    
    const allIds = new Set(
      search.searchResults
        .filter(r => r.type === 'correspondence')
        .map(r => (r.item as Correspondence).id)
    )
    setSelectedItems(allIds)
  }

  function handleDeleteSelected() {
    if (selectedItems.size === 0) return
    if (confirm(`Delete ${selectedItems.size} selected items?`)) {
      console.log('Deleting items:', selectedItems)
      setSelectedItems(new Set())
    }
  }

  function handleArchiveSelected() {
    if (selectedItems.size === 0) return
    console.log('Archiving items:', selectedItems)
    setSelectedItems(new Set())
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'calculator', label: 'Interest Calculator', icon: Calculator },
    { id: 'data', label: 'Data Management', icon: Database },
    { id: 'shortcuts', label: 'Shortcuts', icon: Keyboard }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Efficiency Dashboard</h1>
              <p className="text-sm text-gray-500">Legal Correspondence Manager - Enhanced Features</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowHelp(true)}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
              <button
                onClick={() => window.location.reload()}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex space-x-8">
            {tabs.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Database className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Cases</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.casesCount || 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Search className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Correspondence</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.correspondenceCount || 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Zap className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Templates</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.templatesCount || 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Storage Used</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats ? (stats.totalStorageUsed / 1024 / 1024).toFixed(1) : '0'} MB
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Features Summary */}
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Enhanced Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <Database className="w-5 h-5 text-blue-500 mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-900">IndexedDB Storage</h3>
                    <p className="text-sm text-gray-600">Enhanced data persistence with automatic migration from localStorage</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Search className="w-5 h-5 text-green-500 mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-900">Full-Text Search</h3>
                    <p className="text-sm text-gray-600">Advanced search with Fuse.js for instant results</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Zap className="w-5 h-5 text-purple-500 mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-900">Template Caching</h3>
                    <p className="text-sm text-gray-600">AI drafting templates with offline access</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Keyboard className="w-5 h-5 text-orange-500 mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-900">Keyboard Shortcuts</h3>
                    <p className="text-sm text-gray-600">Productivity shortcuts for common actions</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Calculator className="w-5 h-5 text-red-500 mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-900">Interest Calculator</h3>
                    <p className="text-sm text-gray-600">Real-time calculations with multiple scenarios</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Download className="w-5 h-5 text-indigo-500 mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-900">Data Export/Import</h3>
                    <p className="text-sm text-gray-600">JSON and CSV export with validation</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search Tab */}
        {activeTab === 'search' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search cases and correspondence... (Ctrl+F)"
                    value={search.searchQuery}
                    onChange={(e) => search.setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={() => search.setSearchQuery('')}
                  className="px-4 py-2 text-gray-500 hover:text-gray-700"
                >
                  Clear
                </button>
              </div>
              
              <div className="text-sm text-gray-600 mb-4">
                Found {search.searchResults.length} results
              </div>
              
              <VirtualizedCorrespondenceList
                items={search.searchResults
                  .filter(r => r.type === 'correspondence')
                  .map(r => r.item as Correspondence)}
                onItemClick={(item) => console.log('Clicked:', item)}
                onItemSelect={(item, selected) => {
                  setSelectedItems(prev => {
                    const newSet = new Set(prev)
                    if (selected) {
                      newSet.add(item.id)
                    } else {
                      newSet.delete(item.id)
                    }
                    return newSet
                  })
                }}
                selectedItems={selectedItems}
                searchQuery={search.searchQuery}
              />
            </div>
          </div>
        )}

        {/* Calculator Tab */}
        {activeTab === 'calculator' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Interest Calculator</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Principal Amount</label>
                  <input
                    type="number"
                    value={calculator.principal}
                    onChange={(e) => calculator.setPrincipal(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Interest Rate (%)</label>
                  <input
                    type="number"
                    value={calculator.rate}
                    onChange={(e) => calculator.setRate(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="18"
                    step="0.1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={calculator.startDate}
                    onChange={(e) => calculator.setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={calculator.endDate}
                    onChange={(e) => calculator.setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              {calculator.calculation && (
                <div className="border-t pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-600 font-medium">Principal</p>
                      <p className="text-xl font-bold text-blue-900">
                        {calculator.formatCurrency(calculator.calculation.principal)}
                      </p>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-green-600 font-medium">Compound Interest</p>
                      <p className="text-xl font-bold text-green-900">
                        {calculator.formatCurrency(calculator.calculation.compoundInterest)}
                      </p>
                    </div>
                    
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-sm text-purple-600 font-medium">Total Amount</p>
                      <p className="text-xl font-bold text-purple-900">
                        {calculator.formatCurrency(calculator.calculation.totalAmount)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <p>Period: {calculator.calculation.days} days</p>
                    <p>Rate: {calculator.formatRate(calculator.calculation.rate)}</p>
                    <p>Simple Interest: {calculator.formatCurrency(calculator.calculation.simpleInterest)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Data Management Tab */}
        {activeTab === 'data' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Data Management</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-4">Export Data</h3>
                  <p className="text-sm text-gray-600 mb-4">Export your data for backup or migration</p>
                  <div className="space-y-2">
                    <button
                      onClick={handleExport}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export as JSON</span>
                    </button>
                    <button
                      onClick={() => DataManager.downloadCSV()}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export as CSV</span>
                    </button>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-4">Import Data</h3>
                  <p className="text-sm text-gray-600 mb-4">Import data from backup file</p>
                  <button
                    onClick={handleImport}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Import JSON File</span>
                  </button>
                </div>
              </div>
              
              {stats && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Storage Statistics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Cases</p>
                      <p className="font-medium">{stats.casesCount}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Correspondence</p>
                      <p className="font-medium">{stats.correspondenceCount}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Storage Used</p>
                      <p className="font-medium">{(stats.totalStorageUsed / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Cache Hit Rate</p>
                      <p className="font-medium">{(stats.cacheHitRate * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Shortcuts Tab */}
        {activeTab === 'shortcuts' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Keyboard Shortcuts</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(
                  shortcuts.reduce((acc, shortcut) => {
                    if (!acc[shortcut.category]) acc[shortcut.category] = []
                    acc[shortcut.category].push(shortcut)
                    return acc
                  }, {} as Record<string, typeof shortcuts>)
                ).map(([category, categoryShortcuts]) => (
                  <div key={category}>
                    <h3 className="font-medium text-gray-900 capitalize mb-3">{category}</h3>
                    <div className="space-y-2">
                      {categoryShortcuts.map(shortcut => (
                        <div key={shortcut.key} className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-sm text-gray-700">{shortcut.description}</span>
                          <kbd className="px-2 py-1 text-xs bg-gray-100 border border-gray-300 rounded">
                            {[
                              shortcut.ctrlKey && 'Ctrl',
                              shortcut.altKey && 'Alt',
                              shortcut.shiftKey && 'Shift',
                              shortcut.metaKey && 'Cmd',
                              shortcut.key
                            ].filter(Boolean).join(' + ')}
                          </kbd>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

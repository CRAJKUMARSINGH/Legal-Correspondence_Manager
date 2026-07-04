import { StorageService } from './storage'

// App-specific keys that should be cleared
const APP_KEYS = [
  'lcm_cases',
  'lcm_correspondence', 
  'lcm_settings',
  'lcm_seeded',
  'lcm_last_sync'
]

// Clear only app-specific data, not other localStorage items
export function clearAppData(): void {
  try {
    // Clear localStorage keys
    APP_KEYS.forEach(key => {
      localStorage.removeItem(key)
    })

    // Clear IndexedDB
    if (typeof indexedDB !== 'undefined') {
      const deleteRequest = indexedDB.deleteDatabase('LegalCorrespondenceDB')
      deleteRequest.onsuccess = () => {
        console.log('IndexedDB cleared successfully')
      }
      deleteRequest.onerror = () => {
        console.error('Failed to clear IndexedDB:', deleteRequest.error)
      }
    }
  } catch (error) {
    console.error('Failed to clear app data:', error)
  }
}

// Export data before clearing (for backup)
export async function exportDataBeforeReset(): Promise<string> {
  try {
    const data = await StorageService.exportData()
    const exportData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      backupReason: 'error_recovery',
      ...data
    }
    return JSON.stringify(exportData, null, 2)
  } catch (error) {
    console.error('Failed to export data before reset:', error)
    return ''
  }
}

// Download backup before clearing
export function downloadBackup(data: string): void {
  if (!data) return
  
  try {
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `legal-correspondence-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Failed to download backup:', error)
  }
}

// Complete reset with backup
export async function resetWithBackup(): Promise<void> {
  try {
    // Export current data
    const backupData = await exportDataBeforeReset()
    
    // Download backup if there's data
    if (backupData) {
      downloadBackup(backupData)
    }
    
    // Clear app data
    clearAppData()
    
    // Reload the page
    window.location.reload()
  } catch (error) {
    console.error('Failed to reset with backup:', error)
    // Fallback to simple clear and reload
    clearAppData()
    window.location.reload()
  }
}

// Check if app has data
export function hasAppData(): boolean {
  return APP_KEYS.some(key => localStorage.getItem(key) !== null)
}

// Get storage usage info
export function getStorageInfo(): {
  localStorageSize: number
  localStorageKeys: string[]
  hasIndexedDB: boolean
  appDataExists: boolean
} {
  let localStorageSize = 0
  const localStorageKeys: string[] = []
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key) {
      localStorageKeys.push(key)
      const value = localStorage.getItem(key)
      if (value) {
        localStorageSize += key.length + value.length
      }
    }
  }
  
  return {
    localStorageSize,
    localStorageKeys,
    hasIndexedDB: typeof indexedDB !== 'undefined',
    appDataExists: hasAppData()
  }
}

import Dexie, { Table } from 'dexie'
import type { Correspondence, Case, Settings } from '../types'

export interface StorageSettings extends Settings {
  id?: number
}

export class LegalCorrespondenceDB extends Dexie {
  cases!: Table<Case>
  correspondence!: Table<Correspondence>
  settings!: Table<StorageSettings>

  constructor() {
    super('LegalCorrespondenceDB')
    this.version(1).stores({
      cases: '++id, title, clientName, createdAt, luminaireId',
      correspondence: '++id, caseId, subject, type, status, date, createdAt, luminaireId',
      settings: '++id, apiKey, defaultLang'
    })
  }
}

export const db = new LegalCorrespondenceDB()

// Debounced save utility
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

// Storage operations with error handling
export class StorageService {
  static async saveCases(cases: Case[]): Promise<void> {
    try {
      await db.transaction('rw', db.cases, async () => {
        await db.cases.clear()
        await db.cases.bulkAdd(cases)
      })
    } catch (error) {
      console.error('Failed to save cases:', error)
      throw new Error('Failed to save cases to IndexedDB')
    }
  }

  static async loadCases(): Promise<Case[]> {
    try {
      return await db.cases.toArray()
    } catch (error) {
      console.error('Failed to load cases:', error)
      return []
    }
  }

  static async saveCorrespondence(items: Correspondence[]): Promise<void> {
    try {
      await db.transaction('rw', db.correspondence, async () => {
        await db.correspondence.clear()
        await db.correspondence.bulkAdd(items)
      })
    } catch (error) {
      console.error('Failed to save correspondence:', error)
      throw new Error('Failed to save correspondence to IndexedDB')
    }
  }

  static async loadCorrespondence(): Promise<Correspondence[]> {
    try {
      return await db.correspondence.toArray()
    } catch (error) {
      console.error('Failed to load correspondence:', error)
      return []
    }
  }

  static async saveSettings(settings: Settings): Promise<void> {
    try {
      await db.transaction('rw', db.settings, async () => {
        await db.settings.clear()
        await db.settings.add(settings)
      })
    } catch (error) {
      console.error('Failed to save settings:', error)
      throw new Error('Failed to save settings to IndexedDB')
    }
  }

  static async loadSettings(): Promise<Settings> {
    try {
      const settings = await db.settings.limit(1).toArray()
      return settings[0] || { apiKey: '', defaultLang: 'en' }
    } catch (error) {
      console.error('Failed to load settings:', error)
      return { apiKey: '', defaultLang: 'en' }
    }
  }

  // Search functionality
  static async searchCases(query: string): Promise<Case[]> {
    try {
      const lowerQuery = query.toLowerCase()
      return await db.cases.filter(case_ => 
        (case_.title?.toLowerCase().includes(lowerQuery) || false) ||
        (case_.clientName?.toLowerCase().includes(lowerQuery) || false) ||
        (case_.description?.toLowerCase().includes(lowerQuery) || false) ||
        (case_.caseNumber?.toLowerCase().includes(lowerQuery) || false)
      ).toArray()
    } catch (error) {
      console.error('Failed to search cases:', error)
      return []
    }
  }

  static async searchCorrespondence(query: string): Promise<Correspondence[]> {
    try {
      const lowerQuery = query.toLowerCase()
      return await db.correspondence.filter(item => 
        (item.subject?.toLowerCase().includes(lowerQuery) || false) ||
        (item.body?.toLowerCase().includes(lowerQuery) || false) ||
        (item.from?.toLowerCase().includes(lowerQuery) || false) ||
        (item.to?.toLowerCase().includes(lowerQuery) || false) ||
        (item.referenceNumber?.toLowerCase().includes(lowerQuery) || false)
      ).toArray()
    } catch (error) {
      console.error('Failed to search correspondence:', error)
      return []
    }
  }

  // Export/Import functionality
  static async exportData(): Promise<{
    cases: Case[]
    correspondence: Correspondence[]
    settings: Settings
  }> {
    try {
      const [cases, correspondence, settings] = await Promise.all([
        this.loadCases(),
        this.loadCorrespondence(),
        this.loadSettings()
      ])
      return { cases, correspondence, settings }
    } catch (error) {
      console.error('Failed to export data:', error)
      throw new Error('Failed to export data')
    }
  }

  static async importData(data: {
    cases: Case[]
    correspondence: Correspondence[]
    settings: Settings
  }): Promise<void> {
    try {
      await db.transaction('rw', db.cases, db.correspondence, db.settings, async () => {
        await Promise.all([
          db.cases.clear(),
          db.correspondence.clear(),
          db.settings.clear()
        ])
        await Promise.all([
          db.cases.bulkAdd(data.cases),
          db.correspondence.bulkAdd(data.correspondence),
          db.settings.add(data.settings)
        ])
      })
    } catch (error) {
      console.error('Failed to import data:', error)
      throw new Error('Failed to import data')
    }
  }

  // Data statistics
  static async getDataStats(): Promise<{
    casesCount: number
    correspondenceCount: number
    oldestRecord: string | null
    newestRecord: string | null
    totalStorageUsed: number
  }> {
    try {
      const data = await this.exportData()
      
      const allDates = [
        ...data.cases.map(c => new Date(c.createdAt)),
        ...data.correspondence.map(c => new Date(c.createdAt))
      ]
      
      const oldestRecord = allDates.length > 0 ? 
        new Date(Math.min(...allDates.map(d => d.getTime()))).toISOString() : null
      const newestRecord = allDates.length > 0 ? 
        new Date(Math.max(...allDates.map(d => d.getTime()))).toISOString() : null
      
      // Estimate storage size
      const jsonString = JSON.stringify(data)
      const totalStorageUsed = new Blob([jsonString]).size
      
      return {
        casesCount: data.cases.length,
        correspondenceCount: data.correspondence.length,
        oldestRecord,
        newestRecord,
        totalStorageUsed
      }
    } catch (error) {
      console.error('Failed to get data stats:', error)
      return {
        casesCount: 0,
        correspondenceCount: 0,
        oldestRecord: null,
        newestRecord: null,
        totalStorageUsed: 0
      }
    }
  }

  // Migration from localStorage
  static async migrateFromLocalStorage(): Promise<void> {
    try {
      const localCases = localStorage.getItem('lcm_cases')
      const localCorr = localStorage.getItem('lcm_correspondence')
      const localSettings = localStorage.getItem('lcm_settings')

      if (localCases || localCorr || localSettings) {
        const cases = localCases ? JSON.parse(localCases) : []
        const correspondence = localCorr ? JSON.parse(localCorr) : []
        const settings = localSettings ? JSON.parse(localSettings) : { apiKey: '', defaultLang: 'en' }

        await this.importData({ cases, correspondence, settings })
        
        // Clear localStorage after successful migration
        localStorage.removeItem('lcm_cases')
        localStorage.removeItem('lcm_correspondence')
        localStorage.removeItem('lcm_settings')
        localStorage.removeItem('lcm_seeded')
        localStorage.removeItem('lcm_last_sync')
        
        console.log('Successfully migrated data from localStorage to IndexedDB')
      }
    } catch (error) {
      console.error('Failed to migrate from localStorage:', error)
      throw new Error('Failed to migrate data from localStorage')
    }
  }
}

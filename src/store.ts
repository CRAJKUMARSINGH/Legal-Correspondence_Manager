import { useState, useEffect, useCallback } from 'react'
import type { Correspondence, Case } from './types'
import { fetchLuminaireCases, fetchLuminaireCorrespondence } from './lib/luminaireApi'
import type { LuminaireCase, LuminaireCorrespondence } from './lib/luminaireApi'
import { SEED_CASE, SEED_CASE_ID, buildSeedCorrespondence } from './lib/seedData'
import { StorageService, debounce } from './lib/storage'

const CASES_KEY = 'lcm_cases'
const CORR_KEY = 'lcm_correspondence'
const SETTINGS_KEY = 'lcm_settings'

export interface Settings {
  apiKey: string
  defaultLang: 'en' | 'hi'
}

// ── One-time seed and migration ────────────────────────────────────────
async function runSeedAndMigrationOnce() {
  // First migrate from localStorage if needed
  try {
    await StorageService.migrateFromLocalStorage()
  } catch (error) {
    console.warn('Migration from localStorage failed:', error)
  }

  // Check if we need to seed
  const existingCases = await StorageService.loadCases()
  if (existingCases.length > 0) return

  const caseId = SEED_CASE_ID
  const seedCase: Case = { ...SEED_CASE }

  const now = new Date().toISOString()
  const seededCorr: Correspondence[] = buildSeedCorrespondence(caseId).map(item => ({
    ...item,
    createdAt: now,
    updatedAt: now,
  }))

  await StorageService.saveCases([seedCase])
  await StorageService.saveCorrespondence(seededCorr)
}

// Initialize seed/migration
runSeedAndMigrationOnce()

// ── Hooks ────────────────────────────────────────────────────────────────────

export function useCases() {
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)

  // Load cases on mount
  useEffect(() => {
    let mounted = true
    StorageService.loadCases().then(loadedCases => {
      if (mounted) {
        setCases(loadedCases)
        setLoading(false)
      }
    }).catch(error => {
      console.error('Failed to load cases:', error)
      if (mounted) setLoading(false)
    })
    return () => { mounted = false }
  }, [])

  // Debounced save
  const debouncedSave = useCallback(
    debounce(async (casesToSave: Case[]) => {
      try {
        await StorageService.saveCases(casesToSave)
      } catch (error) {
        console.error('Failed to save cases:', error)
      }
    }, 400),
    []
  )

  useEffect(() => {
    if (cases.length > 0) {
      debouncedSave(cases)
    }
  }, [cases, debouncedSave])

  const addCase = useCallback((c: Omit<Case, 'id' | 'createdAt'>): Case => {
    const newCase: Case = { ...c, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
    setCases(prev => [newCase, ...prev])
    return newCase
  }, [])

  const updateCase = useCallback((id: string, updates: Partial<Case>) => {
    setCases(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
  }, [])

  const deleteCase = useCallback((id: string) => {
    setCases(prev => prev.filter(c => c.id !== id))
  }, [])

  // Delete case with cascade option
  const deleteCaseWithCorrespondence = useCallback((id: string, cascade: boolean = false) => {
    setCases(prev => prev.filter(c => c.id !== id))
    return cascade // Return whether cascade was requested for UI to handle
  }, [])

  return { cases, loading, addCase, updateCase, deleteCase, deleteCaseWithCorrespondence }
}

export function useCorrespondence() {
  const [items, setItems] = useState<Correspondence[]>([])
  const [loading, setLoading] = useState(true)

  // Load correspondence on mount
  useEffect(() => {
    let mounted = true
    StorageService.loadCorrespondence().then(loadedItems => {
      if (mounted) {
        setItems(loadedItems)
        setLoading(false)
      }
    }).catch(error => {
      console.error('Failed to load correspondence:', error)
      if (mounted) setLoading(false)
    })
    return () => { mounted = false }
  }, [])

  // Debounced save
  const debouncedSave = useCallback(
    debounce(async (itemsToSave: Correspondence[]) => {
      try {
        await StorageService.saveCorrespondence(itemsToSave)
      } catch (error) {
        console.error('Failed to save correspondence:', error)
      }
    }, 400),
    []
  )

  useEffect(() => {
    if (items.length > 0) {
      debouncedSave(items)
    }
  }, [items, debouncedSave])

  const addItem = useCallback((item: Omit<Correspondence, 'id' | 'createdAt' | 'updatedAt'>): Correspondence => {
    const now = new Date().toISOString()
    const newItem: Correspondence = { ...item, id: crypto.randomUUID(), createdAt: now, updatedAt: now }
    setItems(prev => [newItem, ...prev])
    return newItem
  }, [])

  const updateItem = useCallback((id: string, updates: Partial<Correspondence>) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...updates, updatedAt: new Date().toISOString() } : i))
  }, [])

  const deleteItem = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }, [])

  // Delete all correspondence for a specific case (cascade delete)
  const deleteItemsByCaseId = useCallback((caseId: string) => {
    setItems(prev => prev.filter(i => i.caseId !== caseId))
  }, [])

  return { items, loading, addItem, updateItem, deleteItem, deleteItemsByCaseId }
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>({ apiKey: '', defaultLang: 'en' })
  const [loading, setLoading] = useState(true)

  // Load settings on mount
  useEffect(() => {
    let mounted = true
    StorageService.loadSettings().then(loadedSettings => {
      if (mounted) {
        setSettings(loadedSettings)
        setLoading(false)
      }
    }).catch(error => {
      console.error('Failed to load settings:', error)
      if (mounted) setLoading(false)
    })
    return () => { mounted = false }
  }, [])

  const saveSettings = useCallback((s: Settings) => {
    setSettings(s)
    StorageService.saveSettings(s).catch(error => {
      console.error('Failed to save settings:', error)
    })
  }, [])

  return { settings, loading, saveSettings }
}

// ── Luminaire API sync ───────────────────────────────────────────────────────

function mapLuminaireCase(lc: LuminaireCase): Omit<Case, 'id' | 'createdAt'> {
  return {
    title: lc.title,
    caseNumber: lc.case_number,
    contractNo: lc.case_number,
    clientName: lc.client.name,
    clientDesignation: lc.client.designation,
    department: lc.client.department,
    email: lc.client.email ?? undefined,
    phone: lc.client.phone ?? undefined,
    address: lc.client.address ?? undefined,
    description: lc.description,
    luminaireId: lc.id,
  }
}

function mapLuminaireCorrespondence(
  lc: LuminaireCorrespondence,
  localCaseId: string,
): Omit<Correspondence, 'id' | 'createdAt' | 'updatedAt'> {
  const type = (
    ['notice', 'reminder', 'payment_demand', 'escalation', 'reply', 'response', 'order', 'complaint'].includes(lc.type)
      ? lc.type
      : 'other'
  ) as Correspondence['type']

  const status = (
    ['sent', 'pending_reply', 'replied', 'escalated', 'resolved', 'overdue', 'draft'].includes(lc.status)
      ? lc.status
      : 'draft'
  ) as Correspondence['status']

  return {
    caseId: localCaseId,
    subject: lc.subject,
    type,
    status,
    date: (lc.sent_at ?? lc.created_at).split('T')[0],
    from: `${lc.sender.name}${lc.sender.designation ? ` (${lc.sender.designation})` : ''}`,
    to: lc.recipients.map(r => `${r.name}${r.designation ? ` (${r.designation})` : ''}`).join('; '),
    cc: lc.cc.map(c => c.name),
    body: lc.language === 'en' ? lc.content : '',
    body_hi: lc.language === 'hi' ? lc.content : '',
    language: lc.language,
    referenceNumber: lc.reference_number,
    parentId: lc.parent_id ?? undefined,
    luminaireId: lc.id,
  }
}

export function useLuminaireSync(
  cases: Case[],
  addCase: (c: Omit<Case, 'id' | 'createdAt'>) => Case,
  updateCase: (id: string, updates: Partial<Case>) => void,
  items: Correspondence[],
  addItem: (i: Omit<Correspondence, 'id' | 'createdAt' | 'updatedAt'>) => Correspondence,
  updateItem: (id: string, updates: Partial<Correspondence>) => void,
) {
  const [syncing, setSyncing] = useState(false)
  const [lastSync, setLastSync] = useState<string | null>(null)
  const [syncError, setSyncError] = useState<string | null>(null)

  // Load last sync time from IndexedDB via localStorage fallback
  useEffect(() => {
    const saved = localStorage.getItem('lcm_last_sync')
    if (saved) setLastSync(saved)
  }, [])

  const sync = useCallback(async () => {
    setSyncing(true)
    setSyncError(null)
    try {
      // Create Maps for O(1) lookups instead of O(n) array.find()
      const casesByLuminaireId = new Map(
        cases.filter(c => c.luminaireId).map(c => [c.luminaireId!, c])
      )
      const itemsByLuminaireId = new Map(
        items.filter(i => i.luminaireId).map(i => [i.luminaireId!, i])
      )

      // Sync cases with proper upsert logic
      const luminaireCases = await fetchLuminaireCases()
      const caseIdMap: Record<string, string> = {}

      for (const lc of luminaireCases) {
        const existing = casesByLuminaireId.get(lc.id)
        
        if (!existing) {
          // Insert new case
          const newCase = addCase(mapLuminaireCase(lc))
          caseIdMap[lc.id] = newCase.id
        } else {
          // Update if remote is newer
          const remoteUpdatedAt = new Date(lc.updated_at || lc.created_at)
          const localUpdatedAt = new Date(existing.createdAt)
          
          if (remoteUpdatedAt > localUpdatedAt) {
            updateCase(existing.id, mapLuminaireCase(lc))
          }
          caseIdMap[lc.id] = existing.id
        }
      }

      // Sync correspondence with proper upsert logic
      const luminaireCorr = await fetchLuminaireCorrespondence()
      for (const lc of luminaireCorr) {
        const existing = itemsByLuminaireId.get(lc.id)
        const localCaseId = caseIdMap[lc.case_id]
        
        if (!localCaseId) continue // Skip if case doesn't exist locally
        
        if (!existing) {
          // Insert new correspondence
          addItem(mapLuminaireCorrespondence(lc, localCaseId))
        } else {
          // Update if remote is newer
          const remoteUpdatedAt = new Date(lc.sent_at || lc.created_at)
          const localUpdatedAt = new Date(existing.createdAt)
          
          if (remoteUpdatedAt > localUpdatedAt) {
            updateItem(existing.id, mapLuminaireCorrespondence(lc, localCaseId))
          }
        }
      }

      const now = new Date().toISOString()
      setLastSync(now)
      localStorage.setItem('lcm_last_sync', now)
    } catch (e) {
      setSyncError((e as Error).message)
    } finally {
      setSyncing(false)
    }
  }, [cases, addCase, updateCase, items, addItem, updateItem])

  return { sync, syncing, lastSync, syncError }
}

import { useState, useEffect, useCallback } from 'react'
import type { Correspondence, Case } from './types'
import { fetchLuminaireCases, fetchLuminaireCorrespondence } from './lib/luminaireApi'
import type { LuminaireCase, LuminaireCorrespondence } from './lib/luminaireApi'
import { SEED_CASE, buildSeedCorrespondence } from './lib/seedData'

const CASES_KEY = 'lcm_cases'
const CORR_KEY = 'lcm_correspondence'
const SETTINGS_KEY = 'lcm_settings'

export interface Settings {
  apiKey: string
  defaultLang: 'en' | 'hi'
}

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function save<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}

// ── One-time seed — runs synchronously before any hook initializes ──────────
function runSeedOnce() {
  if (localStorage.getItem('lcm_seeded')) return

  const caseId = crypto.randomUUID()
  const seedCase: Case = {
    ...SEED_CASE,
    id: caseId,
    createdAt: new Date().toISOString(),
  }
  save(CASES_KEY, [seedCase])

  const now = new Date().toISOString()
  const seededCorr: Correspondence[] = buildSeedCorrespondence(caseId).map(item => ({
    ...item,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  }))
  save(CORR_KEY, seededCorr)

  localStorage.setItem('lcm_seeded', '1')
}

// Run immediately at module load — safe because localStorage is always available in browser
runSeedOnce()

// ── Hooks ────────────────────────────────────────────────────────────────────

export function useCases() {
  const [cases, setCases] = useState<Case[]>(() => load<Case[]>(CASES_KEY, []))

  useEffect(() => { save(CASES_KEY, cases) }, [cases])

  const addCase = (c: Omit<Case, 'id' | 'createdAt'>): Case => {
    const newCase: Case = { ...c, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
    setCases(prev => [newCase, ...prev])
    return newCase
  }

  const updateCase = (id: string, updates: Partial<Case>) => {
    setCases(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
  }

  const deleteCase = (id: string) => {
    setCases(prev => prev.filter(c => c.id !== id))
  }

  return { cases, addCase, updateCase, deleteCase }
}

export function useCorrespondence() {
  const [items, setItems] = useState<Correspondence[]>(() => load<Correspondence[]>(CORR_KEY, []))

  useEffect(() => { save(CORR_KEY, items) }, [items])

  const addItem = (item: Omit<Correspondence, 'id' | 'createdAt' | 'updatedAt'>): Correspondence => {
    const now = new Date().toISOString()
    const newItem: Correspondence = { ...item, id: crypto.randomUUID(), createdAt: now, updatedAt: now }
    setItems(prev => [newItem, ...prev])
    return newItem
  }

  const updateItem = (id: string, updates: Partial<Correspondence>) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...updates, updatedAt: new Date().toISOString() } : i))
  }

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  return { items, addItem, updateItem, deleteItem }
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(() =>
    load<Settings>(SETTINGS_KEY, { apiKey: '', defaultLang: 'en' })
  )

  const saveSettings = (s: Settings) => {
    setSettings(s)
    save(SETTINGS_KEY, s)
  }

  return { settings, saveSettings }
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
  items: Correspondence[],
  addItem: (i: Omit<Correspondence, 'id' | 'createdAt' | 'updatedAt'>) => Correspondence,
) {
  const [syncing, setSyncing] = useState(false)
  const [lastSync, setLastSync] = useState<string | null>(() => localStorage.getItem('lcm_last_sync'))
  const [syncError, setSyncError] = useState<string | null>(null)

  const sync = useCallback(async () => {
    setSyncing(true)
    setSyncError(null)
    try {
      const luminaireCases = await fetchLuminaireCases()
      const caseIdMap: Record<string, string> = {}

      for (const lc of luminaireCases) {
        const existing = cases.find(c => c.luminaireId === lc.id)
        if (existing) {
          caseIdMap[lc.id] = existing.id
        } else {
          const newCase = addCase(mapLuminaireCase(lc))
          caseIdMap[lc.id] = newCase.id
        }
      }

      const luminaireCorr = await fetchLuminaireCorrespondence()
      for (const lc of luminaireCorr) {
        if (items.find(i => i.luminaireId === lc.id)) continue
        const localCaseId = caseIdMap[lc.case_id]
        if (!localCaseId) continue
        addItem(mapLuminaireCorrespondence(lc, localCaseId))
      }

      const now = new Date().toISOString()
      setLastSync(now)
      localStorage.setItem('lcm_last_sync', now)
    } catch (e) {
      setSyncError((e as Error).message)
    } finally {
      setSyncing(false)
    }
  }, [cases, items, addCase, addItem])

  return { sync, syncing, lastSync, syncError }
}

// Luminaire Docs API integration
// Source: https://luminaire-docs.preview.emergentagent.com/

const BASE = 'https://luminaire-docs.preview.emergentagent.com/api'

export interface LuminaireParty {
  id: string
  name: string
  designation: string
  department: string
  address: string | null
  email: string | null
  phone: string | null
}

export interface LuminaireCase {
  id: string
  case_number: string
  title: string
  description: string
  client: LuminaireParty
  opposing_parties: LuminaireParty[]
  created_at: string
  updated_at: string
  status: string
}

export interface LuminaireCorrespondence {
  id: string
  case_id: string
  type: string
  status: string
  subject: string
  content: string
  language: 'en' | 'hi'
  sender: LuminaireParty
  recipients: LuminaireParty[]
  cc: LuminaireParty[]
  reference_number: string
  parent_id: string | null
  attachments: string[]
  created_at: string
  sent_at: string | null
  metadata: Record<string, unknown>
}

export async function fetchLuminaireCases(): Promise<LuminaireCase[]> {
  const res = await fetch(`${BASE}/cases`)
  if (!res.ok) throw new Error(`Luminaire API error: ${res.status}`)
  return res.json()
}

export async function fetchLuminaireCorrespondence(caseId?: string): Promise<LuminaireCorrespondence[]> {
  const url = caseId ? `${BASE}/correspondence?case_id=${caseId}` : `${BASE}/correspondence`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Luminaire API error: ${res.status}`)
  return res.json()
}

export async function createLuminaireCorrespondence(payload: Partial<LuminaireCorrespondence>): Promise<LuminaireCorrespondence> {
  const res = await fetch(`${BASE}/correspondence`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`Luminaire API error: ${res.status}`)
  return res.json()
}

export async function updateLuminaireCorrespondence(id: string, payload: Partial<LuminaireCorrespondence>): Promise<LuminaireCorrespondence> {
  const res = await fetch(`${BASE}/correspondence/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`Luminaire API error: ${res.status}`)
  return res.json()
}

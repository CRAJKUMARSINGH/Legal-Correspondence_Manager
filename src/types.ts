export type Lang = 'en' | 'hi'

export type CorrespondenceType =
  | 'notice'
  | 'reminder'
  | 'payment_demand'
  | 'escalation'
  | 'reply'
  | 'response'
  | 'order'
  | 'complaint'
  | 'other'

export type Status = 'sent' | 'pending_reply' | 'replied' | 'escalated' | 'resolved' | 'overdue' | 'draft'

export interface Correspondence {
  id: string
  caseId: string
  subject: string
  subject_hi?: string
  type: CorrespondenceType
  status: Status
  date: string           // ISO date string
  dueDate?: string
  from: string
  to: string
  cc?: string[]
  body: string
  body_hi?: string
  language?: 'en' | 'hi'
  referenceNumber?: string
  parentId?: string      // for threaded replies
  attachments?: string[]
  tags?: string[]
  amount?: number        // for payment demands
  interestRate?: number  // % per annum
  daysOverdue?: number
  luminaireId?: string   // synced from Luminaire API
  createdAt: string
  updatedAt: string
}

export interface Case {
  id: string
  title: string
  title_hi?: string
  contractNo?: string
  caseNumber?: string    // from Luminaire
  workName?: string
  workName_hi?: string
  clientName: string
  clientDesignation?: string
  department?: string
  description?: string
  opposingParties?: OpposingParty[]
  luminaireId?: string   // synced from Luminaire API
  createdAt: string
}

export interface OpposingParty {
  name: string
  designation: string
  department: string
  email?: string
  phone?: string
}

export interface DraftRequest {
  type: 'reminder' | 'payment_demand' | 'escalation' | 'fresh_notice'
  originalCorrespondence?: Correspondence
  letterChain?: Correspondence[]   // full thread for context
  caseInfo?: Case
  lang: Lang
  additionalContext?: string
  amount?: number
  interestRate?: number
  daysOverdue?: number
  escalateTo?: string
  negligenceDetails?: string
}

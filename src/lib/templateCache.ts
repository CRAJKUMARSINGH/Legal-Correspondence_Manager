import type { DraftRequest, CorrespondenceType, Lang } from '../types'

export interface Template {
  id: string
  type: CorrespondenceType
  language: Lang
  subject: string
  body: string
  variables: TemplateVariable[]
  category: string
  usageCount: number
  lastUsed: string
  createdAt: string
  isBuiltIn: boolean
}

export interface TemplateVariable {
  name: string
  placeholder: string
  type: 'text' | 'number' | 'date' | 'select'
  options?: string[]
  required: boolean
}

export interface CachedDraft {
  id: string
  request: DraftRequest
  response: string
  timestamp: string
  hits: number
}

class TemplateCache {
  private templates: Map<string, Template> = new Map()
  private drafts: Map<string, CachedDraft> = new Map()
  private readonly STORAGE_KEY = 'lcm_template_cache'
  private readonly DRAFT_CACHE_KEY = 'lcm_draft_cache'
  private readonly MAX_CACHE_SIZE = 100
  private readonly MAX_DRAFT_CACHE_SIZE = 50

  constructor() {
    this.loadFromStorage()
    this.initializeBuiltInTemplates()
  }

  // Built-in templates
  private initializeBuiltInTemplates() {
    const builtInTemplates: Template[] = [
      {
        id: 'payment-demand-1',
        type: 'payment_demand',
        language: 'en',
        subject: 'Urgent: Payment Demand - {contractNumber}',
        body: `Dear {recipientName},

This is a formal demand for payment of outstanding amount {amount} for contract {contractNumber}.

The payment was due on {dueDate} and as of today, {currentDate}, the amount is {daysOverdue} days overdue.

Total outstanding amount: {amount}
Interest accrued at {interestRate}% per annum: {interestAmount}
Total payable: {totalAmount}

We request immediate payment to avoid further legal action.

Sincerely,
{senderName}
{senderDesignation}`,
        variables: [
          { name: 'recipientName', placeholder: 'Recipient Name', type: 'text', required: true },
          { name: 'contractNumber', placeholder: 'Contract Number', type: 'text', required: true },
          { name: 'amount', placeholder: 'Amount', type: 'number', required: true },
          { name: 'dueDate', placeholder: 'Due Date', type: 'date', required: true },
          { name: 'currentDate', placeholder: 'Current Date', type: 'date', required: true },
          { name: 'daysOverdue', placeholder: 'Days Overdue', type: 'number', required: true },
          { name: 'interestRate', placeholder: 'Interest Rate (%)', type: 'number', required: true },
          { name: 'interestAmount', placeholder: 'Interest Amount', type: 'number', required: true },
          { name: 'totalAmount', placeholder: 'Total Amount', type: 'number', required: true },
          { name: 'senderName', placeholder: 'Sender Name', type: 'text', required: true },
          { name: 'senderDesignation', placeholder: 'Sender Designation', type: 'text', required: true }
        ],
        category: 'Payment',
        usageCount: 0,
        lastUsed: '',
        createdAt: new Date().toISOString(),
        isBuiltIn: true
      },
      {
        id: 'reminder-1',
        type: 'reminder',
        language: 'en',
        subject: 'Reminder: {subject}',
        body: `Dear {recipientName},

This is a reminder regarding {subject}.

Our records indicate that this matter requires your attention. Please find the details below:

{details}

We request your prompt response to resolve this matter.

Sincerely,
{senderName}
{senderDesignation}`,
        variables: [
          { name: 'recipientName', placeholder: 'Recipient Name', type: 'text', required: true },
          { name: 'subject', placeholder: 'Subject', type: 'text', required: true },
          { name: 'details', placeholder: 'Details', type: 'text', required: true },
          { name: 'senderName', placeholder: 'Sender Name', type: 'text', required: true },
          { name: 'senderDesignation', placeholder: 'Sender Designation', type: 'text', required: true }
        ],
        category: 'Reminder',
        usageCount: 0,
        lastUsed: '',
        createdAt: new Date().toISOString(),
        isBuiltIn: true
      },
      {
        id: 'notice-1',
        type: 'notice',
        language: 'en',
        subject: 'Legal Notice: {subject}',
        body: `Dear {recipientName},

NOTICE UNDER SECTION {legalSection} OF {act}

This notice is served on behalf of {clientName} regarding {subject}.

{legalContent}

You are hereby required to:
1. {requirement1}
2. {requirement2}

Failure to comply within {complianceDays} days will result in legal proceedings.

Sincerely,
{senderName}
{senderDesignation}
{lawFirmName}`,
        variables: [
          { name: 'recipientName', placeholder: 'Recipient Name', type: 'text', required: true },
          { name: 'legalSection', placeholder: 'Legal Section', type: 'text', required: true },
          { name: 'act', placeholder: 'Act', type: 'text', required: true },
          { name: 'clientName', placeholder: 'Client Name', type: 'text', required: true },
          { name: 'subject', placeholder: 'Subject', type: 'text', required: true },
          { name: 'legalContent', placeholder: 'Legal Content', type: 'text', required: true },
          { name: 'requirement1', placeholder: 'First Requirement', type: 'text', required: true },
          { name: 'requirement2', placeholder: 'Second Requirement', type: 'text', required: true },
          { name: 'complianceDays', placeholder: 'Compliance Days', type: 'number', required: true },
          { name: 'senderName', placeholder: 'Sender Name', type: 'text', required: true },
          { name: 'senderDesignation', placeholder: 'Sender Designation', type: 'text', required: true },
          { name: 'lawFirmName', placeholder: 'Law Firm Name', type: 'text', required: true }
        ],
        category: 'Legal Notice',
        usageCount: 0,
        lastUsed: '',
        createdAt: new Date().toISOString(),
        isBuiltIn: true
      }
    ]

    builtInTemplates.forEach(template => {
      if (!this.templates.has(template.id)) {
        this.templates.set(template.id, template)
      }
    })
  }

  // Storage operations
  private loadFromStorage() {
    try {
      const templatesData = localStorage.getItem(this.STORAGE_KEY)
      const draftsData = localStorage.getItem(this.DRAFT_CACHE_KEY)

      if (templatesData) {
        const templates = JSON.parse(templatesData) as Template[]
        templates.forEach(template => {
          this.templates.set(template.id, template)
        })
      }

      if (draftsData) {
        const drafts = JSON.parse(draftsData) as CachedDraft[]
        drafts.forEach(draft => {
          this.drafts.set(draft.id, draft)
        })
      }
    } catch (error) {
      console.error('Failed to load template cache:', error)
    }
  }

  private saveToStorage() {
    try {
      const templates = Array.from(this.templates.values())
      const drafts = Array.from(this.drafts.values())
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(templates))
      localStorage.setItem(this.DRAFT_CACHE_KEY, JSON.stringify(drafts))
    } catch (error) {
      console.error('Failed to save template cache:', error)
    }
  }

  // Template management
  getTemplate(id: string): Template | undefined {
    const template = this.templates.get(id)
    if (template && !template.isBuiltIn) {
      template.usageCount++
      template.lastUsed = new Date().toISOString()
      this.saveToStorage()
    }
    return template
  }

  getTemplatesByType(type: CorrespondenceType, language: Lang): Template[] {
    return Array.from(this.templates.values())
      .filter(template => template.type === type && template.language === language)
      .sort((a, b) => b.usageCount - a.usageCount)
  }

  getTemplatesByCategory(category: string): Template[] {
    return Array.from(this.templates.values())
      .filter(template => template.category === category)
      .sort((a, b) => b.usageCount - a.usageCount)
  }

  getAllTemplates(): Template[] {
    return Array.from(this.templates.values())
      .sort((a, b) => b.usageCount - a.usageCount)
  }

  addTemplate(template: Omit<Template, 'id' | 'createdAt' | 'usageCount' | 'lastUsed'>): Template {
    const newTemplate: Template = {
      ...template,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      usageCount: 0,
      lastUsed: ''
    }

    // Limit cache size
    if (this.templates.size >= this.MAX_CACHE_SIZE) {
      const oldestTemplate = Array.from(this.templates.values())
        .filter(t => !t.isBuiltIn)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0]
      
      if (oldestTemplate) {
        this.templates.delete(oldestTemplate.id)
      }
    }

    this.templates.set(newTemplate.id, newTemplate)
    this.saveToStorage()
    return newTemplate
  }

  updateTemplate(id: string, updates: Partial<Template>): boolean {
    const template = this.templates.get(id)
    if (!template || template.isBuiltIn) return false

    const updatedTemplate = { ...template, ...updates }
    this.templates.set(id, updatedTemplate)
    this.saveToStorage()
    return true
  }

  deleteTemplate(id: string): boolean {
    const template = this.templates.get(id)
    if (!template || template.isBuiltIn) return false

    this.templates.delete(id)
    this.saveToStorage()
    return true
  }

  // Draft caching
  cacheDraft(request: DraftRequest, response: string): string {
    const cacheKey = this.generateDraftCacheKey(request)
    const existingDraft = this.drafts.get(cacheKey)

    if (existingDraft) {
      existingDraft.hits++
      existingDraft.timestamp = new Date().toISOString()
    } else {
      // Limit cache size
      if (this.drafts.size >= this.MAX_DRAFT_CACHE_SIZE) {
        const oldestDraft = Array.from(this.drafts.values())
          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())[0]
        
        this.drafts.delete(oldestDraft.id)
      }

      const newDraft: CachedDraft = {
        id: cacheKey,
        request,
        response,
        timestamp: new Date().toISOString(),
        hits: 1
      }
      this.drafts.set(cacheKey, newDraft)
    }

    this.saveToStorage()
    return cacheKey
  }

  getCachedDraft(request: DraftRequest): CachedDraft | undefined {
    const cacheKey = this.generateDraftCacheKey(request)
    const draft = this.drafts.get(cacheKey)
    
    if (draft) {
      draft.hits++
      this.saveToStorage()
    }
    
    return draft
  }

  private generateDraftCacheKey(request: DraftRequest): string {
    const keyData = {
      type: request.type,
      lang: request.lang,
      amount: request.amount,
      interestRate: request.interestRate,
      daysOverdue: request.daysOverdue,
      escalateTo: request.escalateTo
    }
    return btoa(JSON.stringify(keyData)).replace(/[+/=]/g, '').substring(0, 16)
  }

  // Template preprocessing
  fillTemplate(template: Template, variables: Record<string, any>): string {
    let body = template.body
    
    template.variables.forEach(variable => {
      const value = variables[variable.name] || ''
      const placeholder = `{${variable.name}}`
      body = body.replace(new RegExp(placeholder, 'g'), value)
    })
    
    return body
  }

  extractVariables(template: Template, text: string): Record<string, any> {
    const variables: Record<string, any> = {}
    
    template.variables.forEach(variable => {
      const placeholder = `{${variable.name}}`
      if (text.includes(placeholder)) {
        variables[variable.name] = '' // Will be filled by user
      }
    })
    
    return variables
  }

  // Template suggestions
  getTemplateSuggestions(request: DraftRequest): Template[] {
    // Map request type to correspondence type
    const typeMapping: Record<string, CorrespondenceType> = {
      'reminder': 'reminder',
      'payment_demand': 'payment_demand',
      'escalation': 'escalation',
      'fresh_notice': 'notice',
      'improve': 'other'
    }
    
    const correspondenceType = typeMapping[request.type] || 'other'
    const templates = this.getTemplatesByType(correspondenceType, request.lang)
    
    // Score templates based on relevance to request
    const scoredTemplates = templates.map(template => {
      let score = 0
      
      // Boost recently used templates
      if (template.lastUsed) {
        const daysSinceUsed = Math.floor((Date.now() - new Date(template.lastUsed).getTime()) / (1000 * 60 * 60 * 24))
        score += Math.max(0, 10 - daysSinceUsed)
      }
      
      // Boost frequently used templates
      score += Math.min(template.usageCount / 10, 5)
      
      // Boost templates with relevant variables
      if (request.amount && template.variables.some(v => v.name === 'amount')) score += 3
      if (request.interestRate && template.variables.some(v => v.name === 'interestRate')) score += 2
      if (request.daysOverdue && template.variables.some(v => v.name === 'daysOverdue')) score += 2
      
      return { template, score }
    })
    
    return scoredTemplates
      .sort((a, b) => b.score - a.score)
      .map(item => item.template)
      .slice(0, 5)
  }

  // Statistics
  getCacheStats(): {
    templatesCount: number
    draftsCount: number
    mostUsedTemplate?: Template
    cacheHitRate: number
  } {
    const templates = Array.from(this.templates.values())
    const drafts = Array.from(this.drafts.values())
    
    const mostUsedTemplate = templates
      .sort((a, b) => b.usageCount - a.usageCount)[0]
    
    const totalHits = drafts.reduce((sum, draft) => sum + draft.hits, 0)
    const cacheHitRate = drafts.length > 0 ? totalHits / drafts.length : 0
    
    return {
      templatesCount: templates.length,
      draftsCount: drafts.length,
      mostUsedTemplate,
      cacheHitRate
    }
  }

  // Clear cache
  clearCache(): void {
    this.drafts.clear()
    localStorage.removeItem(this.DRAFT_CACHE_KEY)
  }

  resetTemplates(): void {
    this.templates.clear()
    localStorage.removeItem(this.STORAGE_KEY)
    this.initializeBuiltInTemplates()
  }
}

export const templateCache = new TemplateCache()

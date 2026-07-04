import type { Case, Correspondence, Settings } from '../types'

export interface ValidationRule {
  field: string
  required?: boolean
  type?: 'string' | 'number' | 'email' | 'date' | 'array'
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any) => string | null
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export interface DataIntegrityReport {
  orphanedCorrespondence: string[]
  missingCaseReferences: string[]
  invalidDates: string[]
  invalidEmails: string[]
  duplicateReferences: string[]
  totalIssues: number
}

export class DataValidator {
  // Validation schemas
  private static caseValidationRules: ValidationRule[] = [
    { field: 'title', required: true, minLength: 3, maxLength: 200 },
    { field: 'clientName', required: true, minLength: 2, maxLength: 100 },
    { field: 'email', type: 'email', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    { field: 'phone', pattern: /^[\+]?[1-9][\d\s\-\(\)]{7,15}$/ },
    { field: 'description', maxLength: 2000 }
  ]

  private static correspondenceValidationRules: ValidationRule[] = [
    { field: 'subject', required: true, minLength: 5, maxLength: 200 },
    { field: 'from', required: true, minLength: 3, maxLength: 200 },
    { field: 'to', required: true, minLength: 3, maxLength: 500 },
    { field: 'date', required: true, type: 'date' },
    { field: 'body', required: true, minLength: 10, maxLength: 50000 },
    { field: 'amount', type: 'number', custom: (value) => {
      if (value !== undefined && (value < 0 || value > 999999999)) {
        return 'Amount must be between 0 and 999,999,999'
      }
      return null
    }},
    { field: 'interestRate', type: 'number', custom: (value) => {
      if (value !== undefined && (value < 0 || value > 100)) {
        return 'Interest rate must be between 0 and 100'
      }
      return null
    }}
  ]

  private static settingsValidationRules: ValidationRule[] = [
    { field: 'apiKey', required: false, minLength: 10, maxLength: 200 },
    { field: 'defaultLang', required: true, custom: (value) => {
      if (!['en', 'hi'].includes(value)) {
        return 'Language must be either "en" or "hi"'
      }
      return null
    }}
  ]

  // Validate case data
  static validateCase(caseData: Partial<Case>): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    for (const rule of this.caseValidationRules) {
      const value = caseData[rule.field as keyof Case]
      const error = this.validateField(rule.field, value, rule)
      
      if (error) {
        if (rule.required) {
          errors.push(error)
        } else {
          warnings.push(error)
        }
      }
    }

    // Custom case validations
    if (caseData.opposingParties && caseData.opposingParties.length > 0) {
      caseData.opposingParties.forEach((party, index) => {
        if (!party.name || party.name.trim().length < 2) {
          errors.push(`Opposing party ${index + 1}: Name is required`)
        }
        if (!party.designation || party.designation.trim().length < 2) {
          errors.push(`Opposing party ${index + 1}: Designation is required`)
        }
      })
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  // Validate correspondence data
  static validateCorrespondence(corrData: Partial<Correspondence>): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    for (const rule of this.correspondenceValidationRules) {
      const value = corrData[rule.field as keyof Correspondence]
      const error = this.validateField(rule.field, value, rule)
      
      if (error) {
        if (rule.required) {
          errors.push(error)
        } else {
          warnings.push(error)
        }
      }
    }

    // Custom correspondence validations
    if (corrData.dueDate && corrData.date) {
      const dueDate = new Date(corrData.dueDate)
      const createdDate = new Date(corrData.date)
      
      if (dueDate < createdDate) {
        errors.push('Due date cannot be before correspondence date')
      }
    }

    if (corrData.amount && corrData.amount > 0 && !corrData.interestRate) {
      warnings.push('Payment demand without interest rate')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  // Validate settings
  static validateSettings(settings: Partial<Settings>): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    for (const rule of this.settingsValidationRules) {
      const value = settings[rule.field as keyof Settings]
      const error = this.validateField(rule.field, value, rule)
      
      if (error) {
        if (rule.required) {
          errors.push(error)
        } else {
          warnings.push(error)
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  // Validate individual field
  private static validateField(fieldName: string, value: any, rule: ValidationRule): string | null {
    const fieldLabel = fieldName.charAt(0).toUpperCase() + fieldName.slice(1)

    // Required validation
    if (rule.required && (value === undefined || value === null || value === '')) {
      return `${fieldLabel} is required`
    }

    // Skip other validations if field is empty and not required
    if (!value && !rule.required) {
      return null
    }

    // Type validation
    if (rule.type) {
      switch (rule.type) {
        case 'string':
          if (typeof value !== 'string') {
            return `${fieldLabel} must be a string`
          }
          break
        case 'number':
          const numValue = Number(value)
          if (isNaN(numValue)) {
            return `${fieldLabel} must be a number`
          }
          value = numValue
          break
        case 'email':
          if (typeof value !== 'string' || !rule.pattern!.test(value)) {
            return `${fieldLabel} must be a valid email address`
          }
          break
        case 'date':
          const dateValue = new Date(value)
          if (isNaN(dateValue.getTime())) {
            return `${fieldLabel} must be a valid date`
          }
          break
        case 'array':
          if (!Array.isArray(value)) {
            return `${fieldLabel} must be an array`
          }
          break
      }
    }

    // Length validation
    if (typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        return `${fieldLabel} must be at least ${rule.minLength} characters`
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        return `${fieldLabel} must not exceed ${rule.maxLength} characters`
      }
    }

    // Pattern validation
    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      return `${fieldLabel} format is invalid`
    }

    // Custom validation
    if (rule.custom) {
      return rule.custom(value)
    }

    return null
  }

  // Data integrity checks
  static async checkDataIntegrity(cases: Case[], correspondence: Correspondence[]): Promise<DataIntegrityReport> {
    const report: DataIntegrityReport = {
      orphanedCorrespondence: [],
      missingCaseReferences: [],
      invalidDates: [],
      invalidEmails: [],
      duplicateReferences: [],
      totalIssues: 0
    }

    const caseIds = new Set(cases.map(c => c.id))

    // Check for orphaned correspondence
    for (const corr of correspondence) {
      if (!caseIds.has(corr.caseId)) {
        report.orphanedCorrespondence.push(corr.id)
      }
    }

    // Check for invalid dates
    const allItems = [...cases, ...correspondence]
    for (const item of allItems) {
      const date = new Date(item.createdAt)
      if (isNaN(date.getTime()) || date > new Date()) {
        report.invalidDates.push(item.id)
      }
    }

    // Check for invalid emails
    const emailFields = [
      ...cases.map(c => ({ id: c.id, email: c.email })),
      ...correspondence.map(c => ({ id: c.id, email: c.to }))
    ]

    for (const { id, email } of emailFields) {
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        report.invalidEmails.push(id)
      }
    }

    // Check for duplicate reference numbers
    const refNumbers = new Map<string, string[]>()
    for (const corr of correspondence) {
      if (corr.referenceNumber) {
        const existing = refNumbers.get(corr.referenceNumber) || []
        existing.push(corr.id)
        refNumbers.set(corr.referenceNumber, existing)
      }
    }

    for (const [refNumber, ids] of refNumbers) {
      if (ids.length > 1) {
        report.duplicateReferences.push(`Reference ${refNumber}: ${ids.join(', ')}`)
      }
    }

    report.totalIssues = report.orphanedCorrespondence.length + 
                           report.missingCaseReferences.length + 
                           report.invalidDates.length + 
                           report.invalidEmails.length + 
                           report.duplicateReferences.length

    return report
  }

  // Schema validation for imports
  static validateImportData(data: any): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // Check required top-level properties
    if (!data.version) {
      errors.push('Missing version information')
    }

    if (!Array.isArray(data.cases)) {
      errors.push('Cases must be an array')
    }

    if (!Array.isArray(data.correspondence)) {
      errors.push('Correspondence must be an array')
    }

    if (!data.settings || typeof data.settings !== 'object') {
      errors.push('Settings must be an object')
    }

    // Validate each case
    if (Array.isArray(data.cases)) {
      data.cases.forEach((case_: any, index: number) => {
        const validation = this.validateCase(case_)
        if (!validation.isValid) {
          errors.push(`Case ${index + 1}: ${validation.errors.join(', ')}`)
        }
        warnings.push(`Case ${index + 1}: ${validation.warnings.join(', ')}`)
      })
    }

    // Validate each correspondence
    if (Array.isArray(data.correspondence)) {
      data.correspondence.forEach((corr: any, index: number) => {
        const validation = this.validateCorrespondence(corr)
        if (!validation.isValid) {
          errors.push(`Correspondence ${index + 1}: ${validation.errors.join(', ')}`)
        }
        warnings.push(`Correspondence ${index + 1}: ${validation.warnings.join(', ')}`)
      })
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  // Auto-fix common data issues
  static autoFixData(cases: Case[], correspondence: Correspondence[]): {
    fixedCases: Case[]
    fixedCorrespondence: Correspondence[]
    fixesApplied: string[]
  } {
    const fixesApplied: string[] = []
    const fixedCases = [...cases]
    const fixedCorrespondence = [...correspondence]

    // Fix missing IDs
    fixedCases.forEach((case_, index) => {
      if (!case_.id) {
        case_.id = crypto.randomUUID()
        fixesApplied.push(`Generated ID for case ${index}`)
      }
    })

    fixedCorrespondence.forEach((corr, index) => {
      if (!corr.id) {
        corr.id = crypto.randomUUID()
        fixesApplied.push(`Generated ID for correspondence ${index}`)
      }
    })

    // Fix missing dates
    const now = new Date().toISOString()
    fixedCases.forEach((case_) => {
      if (!case_.createdAt) {
        case_.createdAt = now
        fixesApplied.push(`Added creation date for case ${case_.title}`)
      }
    })

    fixedCorrespondence.forEach((corr) => {
      if (!corr.createdAt) {
        corr.createdAt = now
        fixesApplied.push(`Added creation date for correspondence ${corr.subject}`)
      }
      if (!corr.updatedAt) {
        corr.updatedAt = now
        fixesApplied.push(`Added update date for correspondence ${corr.subject}`)
      }
    })

    return {
      fixedCases,
      fixedCorrespondence,
      fixesApplied
    }
  }
}

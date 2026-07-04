import { StorageService } from './storage'
import type { Case, Correspondence, Settings } from '../types'

export interface ExportData {
  version: string
  exportedAt: string
  cases: Case[]
  correspondence: Correspondence[]
  settings: Settings
}

export class DataManager {
  static async exportToJSON(): Promise<string> {
    try {
      const data = await StorageService.exportData()
      const exportData: ExportData = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        ...data
      }
      return JSON.stringify(exportData, null, 2)
    } catch (error) {
      console.error('Failed to export data:', error)
      throw new Error('Failed to export data to JSON')
    }
  }

  static async exportToCSV(): Promise<{ cases: string; correspondence: string }> {
    try {
      const data = await StorageService.exportData()
      
      // Convert cases to CSV
      const casesCSV = this.convertCasesToCSV(data.cases)
      
      // Convert correspondence to CSV
      const correspondenceCSV = this.convertCorrespondenceToCSV(data.correspondence)
      
      return { cases: casesCSV, correspondence: correspondenceCSV }
    } catch (error) {
      console.error('Failed to export CSV:', error)
      throw new Error('Failed to export data to CSV')
    }
  }

  static async importFromJSON(jsonString: string): Promise<void> {
    try {
      const importData: ExportData = JSON.parse(jsonString)
      
      // Validate data structure
      if (!importData.cases || !importData.correspondence || !importData.settings) {
        throw new Error('Invalid import data format')
      }

      await StorageService.importData({
        cases: importData.cases,
        correspondence: importData.correspondence,
        settings: importData.settings
      })
    } catch (error) {
      console.error('Failed to import JSON:', error)
      throw new Error('Failed to import data from JSON')
    }
  }

  static downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  static downloadJSON(): Promise<void> {
    return this.exportToJSON().then(json => {
      const timestamp = new Date().toISOString().split('T')[0]
      this.downloadFile(json, `legal-correspondence-${timestamp}.json`, 'application/json')
    })
  }

  static downloadCSV(): Promise<void> {
    return this.exportToCSV().then(({ cases, correspondence }) => {
      const timestamp = new Date().toISOString().split('T')[0]
      this.downloadFile(cases, `legal-cases-${timestamp}.csv`, 'text/csv')
      this.downloadFile(correspondence, `legal-correspondence-${timestamp}.csv`, 'text/csv')
    })
  }

  static async importFromFile(file: File): Promise<void> {
    const text = await file.text()
    
    if (file.name.endsWith('.json')) {
      await this.importFromJSON(text)
    } else if (file.name.endsWith('.csv')) {
      throw new Error('CSV import not yet implemented. Please use JSON format.')
    } else {
      throw new Error('Unsupported file format. Please use JSON.')
    }
  }

  private static convertCasesToCSV(cases: Case[]): string {
    const headers = [
      'ID', 'Title', 'Client Name', 'Contract No', 'Case Number',
      'Department', 'Email', 'Phone', 'Address', 'Description', 'Created At'
    ]
    
    const rows = cases.map(case_ => [
      case_.id,
      `"${this.escapeCsvField(case_.title)}"`,
      `"${this.escapeCsvField(case_.clientName)}"`,
      `"${this.escapeCsvField(case_.contractNo || '')}"`,
      `"${this.escapeCsvField(case_.caseNumber || '')}"`,
      `"${this.escapeCsvField(case_.department || '')}"`,
      `"${this.escapeCsvField(case_.email || '')}"`,
      `"${this.escapeCsvField(case_.phone || '')}"`,
      `"${this.escapeCsvField(case_.address || '')}"`,
      `"${this.escapeCsvField(case_.description || '')}"`,
      case_.createdAt
    ])
    
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
  }

  private static convertCorrespondenceToCSV(correspondence: Correspondence[]): string {
    const headers = [
      'ID', 'Case ID', 'Subject', 'Type', 'Status', 'Date', 'Due Date',
      'From', 'To', 'CC', 'Reference Number', 'Amount', 'Interest Rate',
      'Days Overdue', 'Created At', 'Updated At'
    ]
    
    const rows = correspondence.map(item => [
      item.id,
      item.caseId,
      `"${this.escapeCsvField(item.subject)}"`,
      item.type,
      item.status,
      item.date,
      `"${item.dueDate || ''}"`,
      `"${this.escapeCsvField(item.from)}"`,
      `"${this.escapeCsvField(item.to)}"`,
      `"${(item.cc || []).join('; ')}"`,
      `"${this.escapeCsvField(item.referenceNumber || '')}"`,
      item.amount || '',
      item.interestRate || '',
      item.daysOverdue || '',
      item.createdAt,
      item.updatedAt
    ])
    
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
  }

  private static escapeCsvField(field: string): string {
    return field.replace(/"/g, '""').replace(/\n/g, '\\n').replace(/\r/g, '\\r')
  }

  // Data validation
  static validateImportData(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = []
    
    if (!data.version) errors.push('Missing version information')
    if (!Array.isArray(data.cases)) errors.push('Cases must be an array')
    if (!Array.isArray(data.correspondence)) errors.push('Correspondence must be an array')
    if (!data.settings) errors.push('Missing settings data')
    
    if (data.cases) {
      data.cases.forEach((case_: any, index: number) => {
        if (!case_.id) errors.push(`Case ${index + 1}: Missing ID`)
        if (!case_.title) errors.push(`Case ${index + 1}: Missing title`)
        if (!case_.clientName) errors.push(`Case ${index + 1}: Missing client name`)
      })
    }
    
    if (data.correspondence) {
      data.correspondence.forEach((item: any, index: number) => {
        if (!item.id) errors.push(`Correspondence ${index + 1}: Missing ID`)
        if (!item.caseId) errors.push(`Correspondence ${index + 1}: Missing case ID`)
        if (!item.subject) errors.push(`Correspondence ${index + 1}: Missing subject`)
      })
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Backup and restore utilities
  static async createBackup(): Promise<string> {
    return this.exportToJSON()
  }

  static async restoreBackup(jsonString: string): Promise<void> {
    const validation = this.validateImportData(JSON.parse(jsonString))
    if (!validation.isValid) {
      throw new Error(`Invalid backup data: ${validation.errors.join(', ')}`)
    }
    
    await this.importFromJSON(jsonString)
  }

  // Data statistics
  static async getDataStats(): Promise<{
    casesCount: number
    correspondenceCount: number
    oldestRecord: string | null
    newestRecord: string | null
    totalStorageUsed: number
  }> {
    const data = await StorageService.exportData()
    
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
  }
}

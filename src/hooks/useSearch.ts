import { useState, useEffect, useMemo, useCallback } from 'react'
import Fuse from 'fuse.js'
import type { Case, Correspondence } from '../types'
import { StorageService } from '../lib/storage'

interface SearchOptions {
  includeCases?: boolean
  includeCorrespondence?: boolean
  caseStatus?: string[]
  correspondenceType?: string[]
  dateRange?: {
    start: string
    end: string
  }
  limit?: number
}

interface SearchResult {
  type: 'case' | 'correspondence'
  item: Case | Correspondence
  score: number
  matches?: import('fuse.js').FuseResult<Case | Correspondence>['matches']
}

export function useSearch() {
  const [cases, setCases] = useState<Case[]>([])
  const [correspondence, setCorrespondence] = useState<Correspondence[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOptions, setSearchOptions] = useState<SearchOptions>({
    includeCases: true,
    includeCorrespondence: true
  })

  // Load data on mount
  useEffect(() => {
    let mounted = true
    const loadData = async () => {
      try {
        const [casesData, correspondenceData] = await Promise.all([
          StorageService.loadCases(),
          StorageService.loadCorrespondence()
        ])
        if (mounted) {
          setCases(casesData)
          setCorrespondence(correspondenceData)
          setLoading(false)
        }
      } catch (error) {
        console.error('Failed to load search data:', error)
        if (mounted) setLoading(false)
      }
    }
    loadData()
    return () => { mounted = false }
  }, [])

  // Configure Fuse.js for cases
  const casesFuse = useMemo(() => {
    if (!cases.length) return null
    return new Fuse(cases, {
      keys: [
        { name: 'title', weight: 0.3 },
        { name: 'clientName', weight: 0.25 },
        { name: 'description', weight: 0.2 },
        { name: 'caseNumber', weight: 0.15 },
        { name: 'contractNo', weight: 0.1 }
      ],
      threshold: 0.3,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2,
      ignoreLocation: true
    })
  }, [cases])

  // Configure Fuse.js for correspondence
  const correspondenceFuse = useMemo(() => {
    if (!correspondence.length) return null
    return new Fuse(correspondence, {
      keys: [
        { name: 'subject', weight: 0.25 },
        { name: 'body', weight: 0.2 },
        { name: 'from', weight: 0.15 },
        { name: 'to', weight: 0.15 },
        { name: 'referenceNumber', weight: 0.1 },
        { name: 'body_hi', weight: 0.1 },
        { name: 'subject_hi', weight: 0.05 }
      ],
      threshold: 0.3,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2,
      ignoreLocation: true
    })
  }, [correspondence])

  // Perform search
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    
    const results: SearchResult[] = []
    const query = searchQuery.trim()

    // Search cases
    if (searchOptions.includeCases && casesFuse) {
      const caseResults = casesFuse.search(query)
      caseResults.forEach(result => {
        results.push({
          type: 'case',
          item: result.item,
          score: result.score || 0,
          matches: result.matches
        })
      })
    }

    // Search correspondence
    if (searchOptions.includeCorrespondence && correspondenceFuse) {
      const correspondenceResults = correspondenceFuse.search(query)
      correspondenceResults.forEach(result => {
        results.push({
          type: 'correspondence',
          item: result.item,
          score: result.score || 0,
          matches: result.matches
        })
      })
    }

    // Sort by relevance score
    return results.sort((a, b) => a.score - b.score)
  }, [searchQuery, searchOptions, casesFuse, correspondenceFuse])

  // Filtered results based on additional options
  const filteredResults = useMemo(() => {
    let filtered = searchResults

    // Filter by case status
    if (searchOptions.caseStatus && searchOptions.caseStatus.length > 0) {
      filtered = filtered.filter(result => {
        if (result.type === 'case') {
          const case_ = result.item as Case
          // Assuming cases might have a status field or we derive it from correspondence
          return true // No status filter for cases currently
        }
        return true
      })
    }

    // Filter by correspondence type
    if (searchOptions.correspondenceType && searchOptions.correspondenceType.length > 0) {
      filtered = filtered.filter(result => {
        if (result.type === 'correspondence') {
          const corr = result.item as Correspondence
          return searchOptions.correspondenceType!.includes(corr.type)
        }
        return true
      })
    }

    // Filter by date range
    if (searchOptions.dateRange) {
      const { start, end } = searchOptions.dateRange
      filtered = filtered.filter(result => {
        const item = result.item
        const itemDate = result.type === 'correspondence' 
          ? new Date((item as Correspondence).date || item.createdAt)
          : new Date(item.createdAt)
        const startDate = new Date(start)
        const endDate = new Date(end)
        return itemDate >= startDate && itemDate <= endDate
      })
    }

    // Apply limit
    if (searchOptions.limit && searchOptions.limit > 0) {
      filtered = filtered.slice(0, searchOptions.limit)
    }

    return filtered
  }, [searchResults, searchOptions])

  // Quick search functions
  const searchCases = useCallback((query: string) => {
    if (!casesFuse) return []
    return casesFuse.search(query).map(result => ({
      type: 'case' as const,
      item: result.item,
      score: result.score || 0,
      matches: result.matches
    }))
  }, [casesFuse])

  const searchCorrespondence = useCallback((query: string) => {
    if (!correspondenceFuse) return []
    return correspondenceFuse.search(query).map(result => ({
      type: 'correspondence' as const,
      item: result.item,
      score: result.score || 0,
      matches: result.matches
    }))
  }, [correspondenceFuse])

  // Advanced search with multiple criteria
  const advancedSearch = useCallback((
    criteria: {
      query?: string
      caseIds?: string[]
      types?: string[]
      statuses?: string[]
      dateRange?: { start: string; end: string }
      hasAmount?: boolean
      minAmount?: number
      maxAmount?: number
    }
  ) => {
    let results: SearchResult[] = []

    // Start with all items if no query, or use fuzzy search
    if (criteria.query) {
      results = searchResults
    } else {
      if (searchOptions.includeCases) {
        cases.forEach(case_ => {
          results.push({
            type: 'case',
            item: case_,
            score: 0
          })
        })
      }
      if (searchOptions.includeCorrespondence) {
        correspondence.forEach(item => {
          results.push({
            type: 'correspondence',
            item,
            score: 0
          })
        })
      }
    }

    // Apply filters
    results = results.filter(result => {
      const item = result.item

      // Filter by case IDs
      if (criteria.caseIds && criteria.caseIds.length > 0) {
        if (result.type === 'case') {
          if (!criteria.caseIds!.includes(item.id)) return false
        } else {
          if (!criteria.caseIds!.includes((item as Correspondence).caseId)) return false
        }
      }

      // Filter by types (for correspondence)
      if (criteria.types && criteria.types.length > 0) {
        if (result.type === 'correspondence') {
          if (!criteria.types!.includes((item as Correspondence).type)) return false
        }
      }

      // Filter by statuses (for correspondence)
      if (criteria.statuses && criteria.statuses.length > 0) {
        if (result.type === 'correspondence') {
          if (!criteria.statuses!.includes((item as Correspondence).status)) return false
        }
      }

      // Filter by amount
      if (criteria.hasAmount !== undefined) {
        if (result.type === 'correspondence') {
          const hasAmountField = (item as Correspondence).amount !== undefined
          if (criteria.hasAmount !== hasAmountField) return false
        }
      }

      if (criteria.minAmount !== undefined || criteria.maxAmount !== undefined) {
        if (result.type === 'correspondence') {
          const amount = (item as Correspondence).amount
          if (amount === undefined) return false
          if (criteria.minAmount && amount < criteria.minAmount) return false
          if (criteria.maxAmount && amount > criteria.maxAmount) return false
        }
      }

      return true
    })

    return results
  }, [searchResults, searchOptions, cases, correspondence])

  // Get search suggestions
  const getSuggestions = useCallback((query: string, limit: number = 5): string[] => {
    if (!query.trim() || query.length < 2) return []

    const suggestions = new Set<string>()

    // Get suggestions from case titles and client names
    cases.forEach(case_ => {
      if (case_.title.toLowerCase().includes(query.toLowerCase())) {
        suggestions.add(case_.title)
      }
      if (case_.clientName.toLowerCase().includes(query.toLowerCase())) {
        suggestions.add(case_.clientName)
      }
    })

    // Get suggestions from correspondence subjects
    correspondence.forEach(item => {
      if (item.subject.toLowerCase().includes(query.toLowerCase())) {
        suggestions.add(item.subject)
      }
    })

    return Array.from(suggestions).slice(0, limit)
  }, [cases, correspondence])

  return {
    loading,
    searchQuery,
    setSearchQuery,
    searchOptions,
    setSearchOptions,
    searchResults: filteredResults,
    allResults: searchResults,
    searchCases,
    searchCorrespondence,
    advancedSearch,
    getSuggestions,
    totalCases: cases.length,
    totalCorrespondence: correspondence.length
  }
}

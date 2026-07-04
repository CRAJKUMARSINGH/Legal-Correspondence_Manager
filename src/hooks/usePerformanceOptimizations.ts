import { useMemo, useCallback, useRef, useState } from 'react'
import { useDeferredValue } from 'react'
import type { Case, Correspondence, CorrespondenceType, Status } from '../types'

// Memoized case lookup Map for O(1) access
export function useCaseMap(cases: Case[]) {
  return useMemo(() => {
    const map = new Map<string, Case>()
    cases.forEach(case_ => {
      map.set(case_.id, case_)
      if (case_.luminaireId) {
        map.set(case_.luminaireId, case_)
      }
    })
    return map
  }, [cases])
}

// Memoized correspondence filtering with deferred search
export function useFilteredCorrespondence(
  correspondence: Correspondence[],
  cases: Case[],
  searchQuery: string,
  selectedCaseId?: string,
  selectedType?: CorrespondenceType,
  selectedStatus?: Status
) {
  // Defer search query to prevent blocking UI during typing
  const deferredSearchQuery = useDeferredValue(searchQuery)
  const caseMap = useCaseMap(cases)

  const filteredItems = useMemo(() => {
    let filtered = correspondence

    // Filter by search query
    if (deferredSearchQuery.trim()) {
      const query = deferredSearchQuery.toLowerCase()
      filtered = filtered.filter(item => 
        item.subject.toLowerCase().includes(query) ||
        item.body.toLowerCase().includes(query) ||
        item.from.toLowerCase().includes(query) ||
        item.to.toLowerCase().includes(query) ||
        item.referenceNumber?.toLowerCase().includes(query)
      )
    }

    // Filter by case
    if (selectedCaseId) {
      filtered = filtered.filter(item => item.caseId === selectedCaseId)
    }

    // Filter by type
    if (selectedType) {
      filtered = filtered.filter(item => item.type === selectedType)
    }

    // Filter by status
    if (selectedStatus) {
      filtered = filtered.filter(item => item.status === selectedStatus)
    }

    return filtered
  }, [correspondence, deferredSearchQuery, selectedCaseId, selectedType, selectedStatus])

  return filteredItems
}

// Memoized dashboard statistics
export function useDashboardStats(cases: Case[], correspondence: Correspondence[]) {
  const stats = useMemo(() => {
    // Basic counts
    const totalCases = cases.length
    const totalCorrespondence = correspondence.length

    // Cases by status (derived from correspondence)
    const activeCases = new Set(
      correspondence
        .filter(item => item.status !== 'resolved')
        .map(item => item.caseId)
    ).size

    // Correspondence by type
    const correspondenceByType = correspondence.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1
      return acc
    }, {} as Record<CorrespondenceType, number>)

    // Correspondence by status
    const correspondenceByStatus = correspondence.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1
      return acc
    }, {} as Record<Status, number>)

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const recentCorrespondence = correspondence.filter(item => 
      new Date(item.createdAt) > sevenDaysAgo
    ).length

    // Overdue items
    const overdueItems = correspondence.filter(item => 
      item.status === 'overdue' || 
      (item.dueDate && new Date(item.dueDate) < new Date())
    ).length

    // Total amounts (for payment demands)
    const totalAmounts = correspondence
      .filter(item => item.amount && item.type === 'payment_demand')
      .reduce((sum, item) => sum + (item.amount || 0), 0)

    return {
      totalCases,
      totalCorrespondence,
      activeCases,
      correspondenceByType,
      correspondenceByStatus,
      recentCorrespondence,
      overdueItems,
      totalAmounts
    }
  }, [cases, correspondence])

  return stats
}

// Memoized timeline data
export function useTimelineData(cases: Case[], correspondence: Correspondence[]) {
  const timelineData = useMemo(() => {
    // Combine and sort all items by date
    const allItems = [
      ...cases.map(case_ => ({
        id: case_.id,
        type: 'case' as const,
        title: case_.title,
        date: case_.createdAt,
        data: case_
      })),
      ...correspondence.map(item => ({
        id: item.id,
        type: 'correspondence' as const,
        title: item.subject,
        date: item.date || item.createdAt,
        data: item
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    // Group by month
    const groupedByMonth = allItems.reduce((acc, item) => {
      const date = new Date(item.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!acc[monthKey]) {
        acc[monthKey] = []
      }
      acc[monthKey].push(item)
      return acc
    }, {} as Record<string, typeof allItems>)

    return {
      allItems,
      groupedByMonth,
      totalItems: allItems.length
    }
  }, [cases, correspondence])

  return timelineData
}

// Optimized search with debouncing
export function useOptimizedSearch<T extends Record<string, any>>(
  items: T[],
  searchFields: (keyof T)[],
  searchQuery: string
) {
  const deferredSearchQuery = useDeferredValue(searchQuery)

  const searchResults = useMemo(() => {
    if (!deferredSearchQuery.trim()) return items

    const query = deferredSearchQuery.toLowerCase()
    return items.filter(item =>
      searchFields.some(field => {
        const value = item[field]
        return value && String(value).toLowerCase().includes(query)
      })
    )
  }, [items, searchFields, deferredSearchQuery])

  return searchResults
}

// Performance monitoring hook
export function usePerformanceMonitor(componentName: string) {
  const renderCount = useRef(0)
  const lastRenderTime = useRef(Date.now())

  const trackRender = useCallback(() => {
    renderCount.current++
    const now = Date.now()
    const timeSinceLastRender = now - lastRenderTime.current
    lastRenderTime.current = now

    // Simple development mode check without relying on import.meta.env
    if (typeof window !== 'undefined' && (window as any).__DEV__) {
      console.log(
        `${componentName} render #${renderCount.current} ` +
        `(${timeSinceLastRender}ms since last render)`
      )
    }
  }, [componentName])

  return { trackRender, renderCount: renderCount.current }
}

// Memoized calculations with cache invalidation
export function useMemoizedCalculation<T>(
  calculation: () => T,
  dependencies: any[]
) {
  const cacheRef = useRef<{
    result: T
    dependencies: any[]
  } | null>(null)

  return useMemo(() => {
    // Check if dependencies changed
    if (
      !cacheRef.current ||
      !dependencies.every((dep, index) => dep === cacheRef.current!.dependencies[index])
    ) {
      const result = calculation()
      cacheRef.current = { result, dependencies: [...dependencies] }
      return result
    }

    return cacheRef.current.result
  }, dependencies)
}

// Optimized pagination hook
export function usePagination<T>(items: T[], itemsPerPage: number = 20) {
  const [currentPage, setCurrentPage] = useState(1)

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return items.slice(startIndex, endIndex)
  }, [items, currentPage, itemsPerPage])

  const totalPages = Math.ceil(items.length / itemsPerPage)
  const hasNextPage = currentPage < totalPages
  const hasPreviousPage = currentPage > 1

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }, [totalPages])

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setCurrentPage((prev: number) => prev + 1)
    }
  }, [hasNextPage])

  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      setCurrentPage((prev: number) => prev - 1)
    }
  }, [hasPreviousPage])

  const resetPage = useCallback(() => {
    setCurrentPage(1)
  }, [])

  return {
    currentPage,
    totalPages,
    paginatedItems,
    hasNextPage,
    hasPreviousPage,
    goToPage,
    nextPage,
    previousPage,
    resetPage
  }
}

// Virtual scrolling preparation hook
export function useVirtualScrollData<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const visibleCount = Math.ceil(containerHeight / itemHeight)
  const overscan = 5 // Extra items to render outside viewport

  const getItemData = useCallback((startIndex: number) => {
    const endIndex = Math.min(startIndex + visibleCount + overscan, items.length)
    return items.slice(startIndex, endIndex)
  }, [items, visibleCount, overscan])

  const totalHeight = items.length * itemHeight

  return {
    totalHeight,
    visibleCount,
    overscan,
    getItemData
  }
}

// Barrel export for convenience
export function usePerformanceOptimizations() {
  return {
    getDashboardStats: useDashboardStats,
  }
}

import React, { useCallback, useMemo, useState, useEffect } from 'react'
import { List } from 'react-window'
import type { Correspondence } from '../types'
import { format } from 'date-fns'

interface VirtualizedCorrespondenceListProps {
  items: Correspondence[]
  loading?: boolean
  hasNextPage?: boolean
  isNextPageLoading?: boolean
  loadNextPage?: () => void
  onItemClick?: (item: Correspondence) => void
  onItemSelect?: (item: Correspondence, selected: boolean) => void
  selectedItems?: Set<string>
  itemHeight?: number
  height?: number
  className?: string
  searchQuery?: string
}

interface ItemProps {
  index: number
  style: React.CSSProperties
  data: {
    items: Correspondence[]
    onItemClick?: (item: Correspondence) => void
    onItemSelect?: (item: Correspondence, selected: boolean) => void
    selectedItems?: Set<string>
    searchQuery?: string
  }
}

const CorrespondenceItem: React.FC<ItemProps> = ({ index, style, data }) => {
  const { items, onItemClick, onItemSelect, selectedItems, searchQuery } = data
  const item = items[index]
  
  const handleClick = useCallback(() => {
    onItemClick?.(item)
  }, [item, onItemClick])

  const handleSelect = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onItemSelect?.(item, !selectedItems?.has(item.id))
  }, [item, onItemSelect, selectedItems])

  const isSelected = selectedItems?.has(item.id) || false

  // Highlight search terms
  const highlightText = (text: string) => {
    if (!searchQuery || !text) return text
    
    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, i) => 
      regex.test(part) ? <mark key={i} className="bg-yellow-200 text-yellow-900">{part}</mark> : part
    )
  }

  return (
    <div
      style={style}
      className={`border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors ${
        isSelected ? 'bg-blue-50 border-blue-200' : ''
      }`}
      onClick={handleClick}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => {}}
                onClick={handleSelect}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                item.type === 'payment_demand' ? 'bg-red-100 text-red-800' :
                item.type === 'notice' ? 'bg-orange-100 text-orange-800' :
                item.type === 'reminder' ? 'bg-yellow-100 text-yellow-800' :
                item.type === 'reply' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {item.type.replace('_', ' ')}
              </span>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                item.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                item.status === 'pending_reply' ? 'bg-yellow-100 text-yellow-800' :
                item.status === 'replied' ? 'bg-green-100 text-green-800' :
                item.status === 'overdue' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {item.status.replace('_', ' ')}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {highlightText(item.subject)}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              From: {highlightText(item.from)} → To: {highlightText(item.to)}
            </p>
            {item.referenceNumber && (
              <p className="text-xs text-gray-500">
                Ref: {highlightText(item.referenceNumber)}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end ml-4">
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {format(new Date(item.date), 'MMM dd, yyyy')}
            </span>
            {item.amount && (
              <span className="text-xs font-medium text-gray-900 mt-1">
                ₹{item.amount.toLocaleString('en-IN')}
              </span>
            )}
            {item.interestRate && (
              <span className="text-xs text-gray-500">
                @ {item.interestRate}% p.a.
              </span>
            )}
          </div>
        </div>
        
        {/* Preview of body content */}
        <div className="text-xs text-gray-600 line-clamp-2 mt-2">
          {highlightText(item.body.substring(0, 150))}
          {item.body.length > 150 && '...'}
        </div>

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {item.tags.map(tag => (
              <span key={tag} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-700">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// v2 rowComponent adapter — rowProps only contains extra data (not index/style/ariaAttributes)
type RowData = ItemProps['data']

const RowRenderer = ({
  index,
  style,
  ...data
}: {
  ariaAttributes: { 'aria-posinset': number; 'aria-setsize': number; role: 'listitem' }
  index: number
  style: React.CSSProperties
} & RowData) => (
  <CorrespondenceItem index={index} style={style} data={data as RowData} />
)

export const VirtualizedCorrespondenceList: React.FC<VirtualizedCorrespondenceListProps> = ({
  items,
  loading = false,
  hasNextPage = false,
  isNextPageLoading = false,
  loadNextPage,
  onItemClick,
  onItemSelect,
  selectedItems = new Set(),
  itemHeight = 200,
  height = 600,
  className = '',
  searchQuery
}) => {
  const [containerHeight, setContainerHeight] = useState(height)

  // Adjust height based on viewport
  useEffect(() => {
    const updateHeight = () => {
      const viewportHeight = window.innerHeight
      const adjustedHeight = Math.min(viewportHeight - 200, 800)
      setContainerHeight(adjustedHeight)
    }

    updateHeight()
    window.addEventListener('resize', updateHeight)
    return () => window.removeEventListener('resize', updateHeight)
  }, [])

  // Memoize item data to prevent unnecessary re-renders
  const itemData = useMemo(() => ({
    items,
    onItemClick,
    onItemSelect,
    selectedItems,
    searchQuery
  }), [items, onItemClick, onItemSelect, selectedItems, searchQuery])

  // Handle infinite loading
  const isItemLoaded = useCallback((index: number) => {
    return !hasNextPage || index < items.length
  }, [hasNextPage, items.length])

  const loadMoreItems = useCallback(() => {
    if (loadNextPage && !isNextPageLoading) {
      loadNextPage()
    }
  }, [loadNextPage, isNextPageLoading])

  // If no items, show empty state
  if (!loading && items.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center h-96 text-gray-500 ${className}`}>
        <svg className="w-12 h-12 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p className="text-lg font-medium mb-2">No correspondence found</p>
        <p className="text-sm">Start by adding your first correspondence item</p>
      </div>
    )
  }

  // For small lists, don't use virtualization
  if (items.length < 20) {
    return (
      <div className={`border border-gray-200 rounded-lg overflow-hidden ${className}`}>
        {items.map((item, index) => (
          <CorrespondenceItem
            key={item.id}
            index={index}
            style={{}}
            data={itemData}
          />
        ))}
        {loading && (
          <div className="p-4 text-center text-gray-500">
            <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading...</span>
          </div>
        )}
      </div>
    )
  }

  // Use infinite loader for large lists — simplified to avoid type issues with react-window-infinite-loader
  if (hasNextPage) {
    return (
      <div className={className}>
        <List
          rowCount={items.length}
          rowHeight={itemHeight}
          rowComponent={RowRenderer}
          rowProps={itemData as any}
          className="border border-gray-200 rounded-lg overflow-hidden"
          style={{ height: containerHeight }}
          onRowsRendered={({ stopIndex }) => {
            if (stopIndex >= items.length - 5 && !isNextPageLoading) {
              loadMoreItems?.()
            }
          }}
        />
      </div>
    )
  }

  // Simple virtual list for known number of items
  return (
    <div className={className}>
      <List
        rowCount={items.length}
        rowHeight={itemHeight}
        rowComponent={RowRenderer}
        rowProps={itemData as any}
        className="border border-gray-200 rounded-lg overflow-hidden"
        style={{ height: containerHeight }}
      />
    </div>
  )
}

// Hook for managing virtualized list state
export function useVirtualizedList<T extends { id: string }>(
  fetchItems: (page: number, limit: number) => Promise<{ items: T[]; hasMore: boolean }>,
  initialLimit: number = 50
) {
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const loadMoreItems = useCallback(async () => {
    if (loading || !hasMore) return

    setLoading(true)
    setError(null)

    try {
      const result = await fetchItems(page + 1, initialLimit)
      setItems(prev => [...prev, ...result.items])
      setHasMore(result.hasMore)
      setPage(prev => prev + 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load items')
    } finally {
      setLoading(false)
    }
  }, [fetchItems, page, initialLimit, loading, hasMore])

  const refresh = useCallback(async () => {
    setItems([])
    setPage(0)
    setHasMore(true)
    setError(null)
    
    setLoading(true)
    try {
      const result = await fetchItems(0, initialLimit)
      setItems(result.items)
      setHasMore(result.hasMore)
      setPage(1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load items')
    } finally {
      setLoading(false)
    }
  }, [fetchItems, initialLimit])

  // Load initial items
  useEffect(() => {
    refresh()
  }, [])

  return {
    items,
    loading,
    hasMore,
    error,
    loadMoreItems,
    refresh
  }
}

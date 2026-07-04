import { useEffect, useCallback, useState, useMemo } from 'react'

export interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  altKey?: boolean
  shiftKey?: boolean
  metaKey?: boolean
  action: () => void
  description: string
  category: 'navigation' | 'actions' | 'search' | 'forms' | 'data'
  preventDefault?: boolean
}

export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  enabled: boolean = true
) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return

    // Don't trigger shortcuts when user is typing in input fields
    const target = event.target as HTMLElement
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.contentEditable === 'true' ||
      target.getAttribute('role') === 'textbox'
    ) {
      // Allow only specific shortcuts in input fields
      const allowedInInput = shortcuts.filter(s => s.category === 'forms')
      const matchingShortcut = allowedInInput.find(shortcut => 
        matchesShortcut(event, shortcut)
      )
      
      if (matchingShortcut) {
        if (matchingShortcut.preventDefault) {
          event.preventDefault()
        }
        matchingShortcut.action()
      }
      return
    }

    // Check all other shortcuts
    const matchingShortcut = shortcuts.find(shortcut => 
      matchesShortcut(event, shortcut)
    )

    if (matchingShortcut) {
      if (matchingShortcut.preventDefault !== false) {
        event.preventDefault()
      }
      matchingShortcut.action()
    }
  }, [enabled, shortcuts])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  return { shortcuts }
}

function matchesShortcut(event: KeyboardEvent, shortcut: KeyboardShortcut): boolean {
  const key = event.key.toLowerCase()
  const expectedKey = shortcut.key.toLowerCase()
  
  return (
    key === expectedKey &&
    !!event.ctrlKey === !!shortcut.ctrlKey &&
    !!event.altKey === !!shortcut.altKey &&
    !!event.shiftKey === !!shortcut.shiftKey &&
    !!event.metaKey === !!shortcut.metaKey
  )
}

// Predefined shortcuts for the application
export const createAppShortcuts = (
  actions: {
    newCase: () => void
    search: () => void
    exportData: () => void
    importData: () => void
    toggleTheme: () => void
    print: () => void
    refresh: () => void
    focusSearch: () => void
    clearSearch: () => void
    selectAll: () => void
    deleteSelected: () => void
    archiveSelected: () => void
    newCorrespondence: () => void
    syncData: () => void
    showHelp: () => void
    showShortcuts: () => void
  }
): KeyboardShortcut[] => [
  {
    key: 'n',
    ctrlKey: true,
    action: actions.newCase,
    description: 'New Case',
    category: 'actions'
  },
  {
    key: 'f',
    ctrlKey: true,
    action: actions.focusSearch,
    description: 'Focus Search',
    category: 'search'
  },
  {
    key: 'k',
    ctrlKey: true,
    action: actions.focusSearch,
    description: 'Focus Search (Alternative)',
    category: 'search'
  },
  {
    key: 'Escape',
    action: actions.clearSearch,
    description: 'Clear Search',
    category: 'search'
  },
  {
    key: 'e',
    ctrlKey: true,
    action: actions.exportData,
    description: 'Export Data',
    category: 'data'
  },
  {
    key: 'i',
    ctrlKey: true,
    action: actions.importData,
    description: 'Import Data',
    category: 'data'
  },
  {
    key: 'p',
    ctrlKey: true,
    action: actions.print,
    description: 'Print',
    category: 'actions'
  },
  {
    key: 'r',
    ctrlKey: true,
    action: actions.refresh,
    description: 'Refresh Data',
    category: 'actions'
  },
  {
    key: 's',
    ctrlKey: true,
    action: actions.syncData,
    description: 'Sync with Luminaire',
    category: 'data'
  },
  {
    key: 'a',
    ctrlKey: true,
    action: actions.selectAll,
    description: 'Select All',
    category: 'actions',
    preventDefault: false
  },
  {
    key: 'Delete',
    action: actions.deleteSelected,
    description: 'Delete Selected',
    category: 'actions'
  },
  {
    key: 'Archive',
    action: actions.archiveSelected,
    description: 'Archive Selected',
    category: 'actions'
  },
  {
    key: 'c',
    ctrlKey: true,
    shiftKey: true,
    action: actions.newCorrespondence,
    description: 'New Correspondence',
    category: 'actions'
  },
  {
    key: 'd',
    ctrlKey: true,
    action: actions.toggleTheme,
    description: 'Toggle Dark Mode',
    category: 'actions'
  },
  {
    key: 'h',
    ctrlKey: true,
    action: actions.showHelp,
    description: 'Show Help',
    category: 'navigation'
  },
  {
    key: '/',
    action: actions.showShortcuts,
    description: 'Show Keyboard Shortcuts',
    category: 'navigation'
  },
  // Form shortcuts
  {
    key: 'Enter',
    ctrlKey: true,
    action: () => {
      // Submit form logic should be handled by the form component
      const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement
      if (submitButton && !submitButton.disabled) {
        submitButton.click()
      }
    },
    description: 'Submit Form',
    category: 'forms',
    preventDefault: false
  },
  {
    key: 's',
    ctrlKey: true,
    action: () => {
      // Save form logic should be handled by the form component
      const saveButton = document.querySelector('[data-action="save"]') as HTMLButtonElement
      if (saveButton && !saveButton.disabled) {
        saveButton.click()
      }
    },
    description: 'Save Form',
    category: 'forms',
    preventDefault: false
  },
  // Navigation shortcuts
  {
    key: 'ArrowLeft',
    altKey: true,
    action: () => {
      window.history.back()
    },
    description: 'Go Back',
    category: 'navigation'
  },
  {
    key: 'ArrowRight',
    altKey: true,
    action: () => {
      window.history.forward()
    },
    description: 'Go Forward',
    category: 'navigation'
  },
  {
    key: 'Home',
    ctrlKey: true,
    action: () => {
      window.location.href = '/'
    },
    description: 'Go to Home',
    category: 'navigation'
  }
]

// Hook for managing shortcut help display
export function useShortcutHelp(shortcuts: KeyboardShortcut[]) {
  const [showHelp, setShowHelp] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredShortcuts = useMemo(() => {
    if (!searchQuery) return shortcuts
    
    const query = searchQuery.toLowerCase()
    return shortcuts.filter(shortcut =>
      shortcut.description.toLowerCase().includes(query) ||
      shortcut.category.toLowerCase().includes(query) ||
      shortcut.key.toLowerCase().includes(query)
    )
  }, [shortcuts, searchQuery])

  const shortcutsByCategory = useMemo(() => {
    const categories: Record<string, KeyboardShortcut[]> = {}
    
    filteredShortcuts.forEach(shortcut => {
      if (!categories[shortcut.category]) {
        categories[shortcut.category] = []
      }
      categories[shortcut.category].push(shortcut)
    })
    
    return categories
  }, [filteredShortcuts])

  const formatShortcut = (shortcut: KeyboardShortcut): string => {
    const parts: string[] = []
    
    if (shortcut.ctrlKey) parts.push('Ctrl')
    if (shortcut.altKey) parts.push('Alt')
    if (shortcut.shiftKey) parts.push('Shift')
    if (shortcut.metaKey) parts.push('Cmd')
    
    parts.push(shortcut.key)
    
    return parts.join(' + ')
  }

  return {
    showHelp,
    setShowHelp,
    searchQuery,
    setSearchQuery,
    shortcutsByCategory,
    formatShortcut,
    totalShortcuts: shortcuts.length,
    filteredCount: filteredShortcuts.length
  }
}

// Global shortcut manager for context-aware shortcuts
export class ShortcutManager {
  private static instance: ShortcutManager
  private contextShortcuts: Map<string, KeyboardShortcut[]> = new Map()
  private currentContext: string = 'global'

  static getInstance(): ShortcutManager {
    if (!ShortcutManager.instance) {
      ShortcutManager.instance = new ShortcutManager()
    }
    return ShortcutManager.instance
  }

  setContext(context: string) {
    this.currentContext = context
  }

  registerContext(context: string, shortcuts: KeyboardShortcut[]) {
    this.contextShortcuts.set(context, shortcuts)
  }

  getShortcutsForContext(context?: string): KeyboardShortcut[] {
    const ctx = context || this.currentContext
    return this.contextShortcuts.get(ctx) || []
  }

  getAllShortcuts(): KeyboardShortcut[] {
    const allShortcuts: KeyboardShortcut[] = []
    this.contextShortcuts.forEach(shortcuts => {
      allShortcuts.push(...shortcuts)
    })
    return allShortcuts
  }

  isShortcutAvailable(key: string, context?: string): boolean {
    const shortcuts = this.getShortcutsForContext(context)
    return !shortcuts.some(s => s.key.toLowerCase() === key.toLowerCase())
  }
}

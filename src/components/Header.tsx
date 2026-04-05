import { Scale, Settings, Globe, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react'
import type { Lang } from '../types'
import { t } from '../i18n'

interface Props {
  lang: Lang
  onToggleLang: () => void
  onOpenSettings: () => void
  activeTab: string
  onTabChange: (tab: string) => void
  onSync: () => void
  syncing: boolean
  lastSync: string | null
  syncError: string | null
}

export default function Header({ lang, onToggleLang, onOpenSettings, activeTab, onTabChange, onSync, syncing, lastSync, syncError }: Props) {
  const tabs = ['dashboard', 'cases', 'correspondence', 'timeline']

  const syncTitle = syncError
    ? `Sync error: ${syncError}`
    : lastSync
    ? `Last synced: ${new Date(lastSync).toLocaleTimeString()}`
    : 'Sync from Luminaire Docs'

  return (
    <header className="bg-legal-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Scale className="w-7 h-7 text-amber-400" />
          <div>
            <h1 className="text-lg font-bold leading-tight">{t('appTitle', lang)}</h1>
            <p className="text-xs text-blue-200 hidden sm:block">{t('appSubtitle', lang)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Luminaire sync button */}
          <button
            onClick={onSync}
            disabled={syncing}
            title={syncTitle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-600 hover:bg-amber-500 disabled:opacity-60 text-sm font-medium transition-colors"
          >
            {syncError
              ? <AlertCircle className="w-4 h-4 text-red-200" />
              : lastSync && !syncing
              ? <CheckCircle2 className="w-4 h-4 text-green-200" />
              : <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            }
            <span className="hidden sm:inline">{syncing ? 'Syncing…' : 'Luminaire Sync'}</span>
          </button>
          <button
            onClick={onToggleLang}
            className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-legal-700 hover:bg-legal-600 text-sm font-medium transition-colors"
            title={t('language', lang)}
          >
            <Globe className="w-4 h-4" />
            <span>{lang === 'en' ? 'हिंदी' : 'English'}</span>
          </button>
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-md bg-legal-700 hover:bg-legal-600 transition-colors"
            title={t('settings', lang)}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
      <nav className="max-w-7xl mx-auto px-4 flex gap-1 pb-0">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors capitalize ${
              activeTab === tab
                ? 'bg-white text-legal-800'
                : 'text-blue-200 hover:text-white hover:bg-legal-700'
            }`}
          >
            {t(tab, lang)}
          </button>
        ))}
      </nav>
    </header>
  )
}

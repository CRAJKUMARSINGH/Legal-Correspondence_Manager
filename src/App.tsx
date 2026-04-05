import { useState } from 'react'
import type { Lang } from './types'
import { useCases, useCorrespondence, useSettings, useLuminaireSync } from './store'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import CaseManager from './components/CaseManager'
import CorrespondenceList from './components/CorrList'
import Timeline from './components/Timeline'
import SettingsModal from './components/SettingsModal'

export default function App() {
  const { settings, saveSettings } = useSettings()
  const [lang, setLang] = useState<Lang>(settings.defaultLang)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showSettings, setShowSettings] = useState(false)

  const { cases, addCase, updateCase, deleteCase } = useCases()
  const { items, addItem, updateItem, deleteItem } = useCorrespondence()
  const { sync, syncing, lastSync, syncError } = useLuminaireSync(cases, addCase, items, addItem)

  const toggleLang = () => setLang(l => l === 'en' ? 'hi' : 'en')

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        lang={lang}
        onToggleLang={toggleLang}
        onOpenSettings={() => setShowSettings(true)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSync={sync}
        syncing={syncing}
        lastSync={lastSync}
        syncError={syncError}
      />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'dashboard' && (
          <Dashboard cases={cases} items={items} lang={lang} onSync={sync} syncing={syncing} />
        )}
        {activeTab === 'cases' && (
          <CaseManager cases={cases} onAdd={addCase} onDelete={deleteCase} lang={lang} />
        )}
        {activeTab === 'correspondence' && (
          <CorrespondenceList
            items={items}
            cases={cases}
            lang={lang}
            apiKey={settings.apiKey}
            onAdd={addItem}
            onUpdate={updateItem}
            onDelete={deleteItem}
          />
        )}
        {activeTab === 'timeline' && (
          <Timeline items={items} cases={cases} lang={lang} />
        )}
      </main>

      {showSettings && (
        <SettingsModal
          settings={settings}
          lang={lang}
          onSave={saveSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}

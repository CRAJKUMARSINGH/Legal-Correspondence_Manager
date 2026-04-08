import { useState } from 'react'
import type { Lang } from './types'
import { useCases, useCorrespondence, useSettings, useLuminaireSync } from './store'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import CaseManager from './components/CaseManager'
import CorrespondenceList from './components/CorrList'
import Timeline from './components/Timeline'
import SettingsModal from './components/SettingsModal'
import Landing from './components/Landing'
import DraftWizard from './components/DraftWizard'

export default function App() {
  const { settings, saveSettings } = useSettings()
  const [lang, setLang] = useState<Lang>(settings.defaultLang)
  const [activeTab, setActiveTab] = useState('landing')
  const [showSettings, setShowSettings] = useState(false)
  const [showWizard, setShowWizard] = useState(false)

  const { cases, addCase, updateCase, deleteCase } = useCases()
  const { items, addItem, updateItem, deleteItem } = useCorrespondence()
  const { sync, syncing, lastSync, syncError } = useLuminaireSync(cases, addCase, items, addItem)

  const toggleLang = () => setLang(l => l === 'en' ? 'hi' : 'en')

  // Show landing only on first visit or when explicitly on landing tab
  const isLanding = activeTab === 'landing' && !showWizard

  if (showWizard) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header lang={lang} onToggleLang={toggleLang} onOpenSettings={() => setShowSettings(true)}
          activeTab={activeTab} onTabChange={tab => { setShowWizard(false); setActiveTab(tab) }}
          onSync={sync} syncing={syncing} lastSync={lastSync} syncError={syncError} />
        <main className="max-w-7xl mx-auto px-4 py-6">
          <DraftWizard cases={cases} lang={lang} apiKey={settings.apiKey}
            onBack={() => setShowWizard(false)}
            onSaveCorrespondence={item => { addItem(item); setActiveTab('correspondence') }} />
        </main>
        {showSettings && <SettingsModal settings={settings} lang={lang} onSave={saveSettings} onClose={() => setShowSettings(false)} />}
      </div>
    )
  }

  if (isLanding) {
    return (
      <>
        <div className="fixed top-0 right-0 z-50 flex items-center gap-2 p-3">
          <button onClick={toggleLang}
            className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-lg backdrop-blur transition-colors">
            {lang === 'en' ? 'हिंदी' : 'English'}
          </button>
          <button onClick={() => setShowSettings(true)}
            className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-lg backdrop-blur transition-colors">
            ⚙ Settings
          </button>
          <button onClick={() => setActiveTab('dashboard')}
            className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-lg backdrop-blur transition-colors">
            {lang === 'hi' ? 'डैशबोर्ड' : 'Dashboard'}
          </button>
        </div>
        <Landing lang={lang}
          onGetStarted={() => setShowWizard(true)}
          onViewWork={() => setActiveTab('correspondence')}
          hasExistingWork={items.length > 0} />
        {showSettings && <SettingsModal settings={settings} lang={lang} onSave={saveSettings} onClose={() => setShowSettings(false)} />}
      </>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header lang={lang} onToggleLang={toggleLang} onOpenSettings={() => setShowSettings(true)}
        activeTab={activeTab} onTabChange={setActiveTab}
        onSync={sync} syncing={syncing} lastSync={lastSync} syncError={syncError} />
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'dashboard' && (
          <Dashboard cases={cases} items={items} lang={lang} onSync={sync} syncing={syncing}
            onTabChange={tab => tab === 'wizard' ? setShowWizard(true) : setActiveTab(tab)} />
        )}
        {activeTab === 'cases' && (
          <CaseManager cases={cases} onAdd={addCase} onDelete={deleteCase} lang={lang} />
        )}
        {activeTab === 'correspondence' && (
          <CorrespondenceList items={items} cases={cases} lang={lang} apiKey={settings.apiKey}
            onAdd={addItem} onUpdate={updateItem} onDelete={deleteItem} />
        )}
        {activeTab === 'timeline' && (
          <Timeline items={items} cases={cases} lang={lang} />
        )}
      </main>
      {showSettings && <SettingsModal settings={settings} lang={lang} onSave={saveSettings} onClose={() => setShowSettings(false)} />}
    </div>
  )
}

import { X } from 'lucide-react'
import { useState } from 'react'
import type { Lang } from '../types'
import type { Settings } from '../store'
import { t } from '../i18n'

interface Props {
  settings: Settings
  lang: Lang
  onSave: (s: Settings) => void
  onClose: () => void
}

export default function SettingsModal({ settings, lang, onSave, onClose }: Props) {
  const [form, setForm] = useState(settings)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="font-semibold text-gray-800">{t('settings', lang)}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="label">{t('apiKey', lang)}</label>
            <input
              type="password"
              className="input-field"
              value={form.apiKey}
              onChange={e => setForm(p => ({ ...p, apiKey: e.target.value }))}
              placeholder={t('apiKeyPlaceholder', lang)}
            />
            <p className="text-xs text-gray-400 mt-1">Used for AI-powered letter drafting (OpenAI GPT-4o)</p>
          </div>
          <div>
            <label className="label">{t('language', lang)}</label>
            <select className="input-field" value={form.defaultLang} onChange={e => setForm(p => ({ ...p, defaultLang: e.target.value as Lang }))}>
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
            </select>
          </div>
        </div>
        <div className="p-5 border-t flex gap-3 justify-end">
          <button onClick={onClose} className="btn-secondary">{t('cancel', lang)}</button>
          <button onClick={() => { onSave(form); onClose() }} className="btn-primary">{t('saveSettings', lang)}</button>
        </div>
      </div>
    </div>
  )
}

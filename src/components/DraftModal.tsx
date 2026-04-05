import { useState } from 'react'
import { X, Wand2, Copy, Check, RefreshCw } from 'lucide-react'
import type { Correspondence, Case, Lang, DraftRequest } from '../types'
import { t } from '../i18n'
import { generateDraft } from '../lib/aiDraft'

interface Props {
  type: DraftRequest['type']
  correspondence?: Correspondence
  caseInfo?: Case
  lang: Lang
  apiKey: string
  onClose: () => void
  onUseDraft: (text: string) => void
}

export default function DraftModal({ type, correspondence, caseInfo, lang, apiKey, onClose, onUseDraft }: Props) {
  const [draftLang, setDraftLang] = useState<Lang>(lang)
  const [context, setContext] = useState('')
  const [amount, setAmount] = useState(correspondence?.amount?.toString() ?? '')
  const [interestRate, setInterestRate] = useState(correspondence?.interestRate?.toString() ?? '18')
  const [daysOverdue, setDaysOverdue] = useState(correspondence?.daysOverdue?.toString() ?? '')
  const [escalateTo, setEscalateTo] = useState('Chief Engineer')
  const [negligence, setNegligence] = useState('')
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    if (!apiKey) { setError('Please set your API key in Settings first.'); return }
    setLoading(true)
    setError('')
    try {
      const req: DraftRequest = {
        type,
        originalCorrespondence: correspondence,
        caseInfo,
        lang: draftLang,
        additionalContext: context || undefined,
        amount: amount ? parseFloat(amount) : undefined,
        interestRate: interestRate ? parseFloat(interestRate) : undefined,
        daysOverdue: daysOverdue ? parseInt(daysOverdue) : undefined,
        escalateTo: type === 'escalation' ? escalateTo : undefined,
        negligenceDetails: type === 'escalation' ? negligence : undefined,
      }
      const result = await generateDraft(req, apiKey)
      setDraft(result)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(draft)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const typeLabels: Record<DraftRequest['type'], string> = {
    reminder: t('draftReminder', lang),
    payment_demand: t('draftPaymentDemand', lang),
    escalation: t('escalate', lang),
    fresh_notice: t('newLetter', lang),
    improve: t('improveLetter', lang),
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b">
          <div className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-legal-700" />
            <h2 className="font-semibold text-gray-800">{typeLabels[type]}</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Language selector */}
          <div className="flex gap-3 items-center">
            <span className="text-sm font-medium text-gray-600">{t('language', lang)}:</span>
            <button
              onClick={() => setDraftLang('en')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${draftLang === 'en' ? 'bg-legal-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >English</button>
            <button
              onClick={() => setDraftLang('hi')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${draftLang === 'hi' ? 'bg-legal-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >हिंदी</button>
          </div>

          {/* Payment fields */}
          {(type === 'payment_demand' || type === 'reminder') && (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="label">{t('amount', lang)}</label>
                <input type="number" className="input-field" value={amount} onChange={e => setAmount(e.target.value)} placeholder="500000" />
              </div>
              <div>
                <label className="label">{t('interestRate', lang)}</label>
                <input type="number" step="0.1" className="input-field" value={interestRate} onChange={e => setInterestRate(e.target.value)} />
              </div>
              <div>
                <label className="label">{t('daysOverdue', lang)}</label>
                <input type="number" className="input-field" value={daysOverdue} onChange={e => setDaysOverdue(e.target.value)} />
              </div>
            </div>
          )}

          {/* Escalation fields */}
          {type === 'escalation' && (
            <div className="space-y-3">
              <div>
                <label className="label">{t('escalateTo', lang)}</label>
                <select className="input-field" value={escalateTo} onChange={e => setEscalateTo(e.target.value)}>
                  <option value="Chief Engineer">{t('chiefEngineer', lang)}</option>
                  <option value="Additional Chief Engineer">{t('additionalChiefEngineer', lang)}</option>
                  <option value="Superintending Engineer">{t('superEngineer', lang)}</option>
                </select>
              </div>
              <div>
                <label className="label">{t('negligenceDetails', lang)}</label>
                <textarea
                  className="input-field min-h-[80px]"
                  value={negligence}
                  onChange={e => setNegligence(e.target.value)}
                  placeholder="Describe specific acts of negligence, non-payment, non-communication..."
                />
              </div>
            </div>
          )}

          {/* Additional context */}
          <div>
            <label className="label">{t('additionalContext', lang)}</label>
            <textarea
              className="input-field min-h-[70px]"
              value={context}
              onChange={e => setContext(e.target.value)}
              placeholder="Any specific points to include..."
            />
          </div>

          {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

          {/* Generated draft */}
          {draft && (
            <div className="border border-gray-200 rounded-xl">
              <div className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded-t-xl border-b">
                <span className="text-sm font-medium text-gray-600">{t('generatedDraft', lang)}</span>
                <div className="flex gap-2">
                  <button onClick={handleCopy} className="flex items-center gap-1 text-xs px-3 py-1 bg-white border rounded-md hover:bg-gray-50">
                    {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                    {copied ? t('copied', lang) : t('copy', lang)}
                  </button>
                </div>
              </div>
              <pre className="p-4 text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed max-h-80 overflow-y-auto">
                {draft}
              </pre>
            </div>
          )}
        </div>

        <div className="p-5 border-t flex gap-3 justify-end">
          <button onClick={onClose} className="btn-secondary">{t('close', lang)}</button>
          {draft && (
            <>
              <button onClick={handleGenerate} disabled={loading} className="btn-secondary flex items-center gap-2">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                {t('regenerate', lang)}
              </button>
              <button onClick={() => { onUseDraft(draft); onClose() }} className="btn-primary">
                {t('useThisDraft', lang)}
              </button>
            </>
          )}
          {!draft && (
            <button onClick={handleGenerate} disabled={loading} className="btn-primary flex items-center gap-2">
              <Wand2 className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? t('generating', lang) : t('generate', lang)}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

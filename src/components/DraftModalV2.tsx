import { useState } from 'react'
import { X, Wand2, Copy, Check, RefreshCw, Printer, ChevronDown, ChevronUp } from 'lucide-react'
import type { Correspondence, Case, Lang, DraftRequest } from '../types'
import { t } from '../i18n'
import { generateDraftV2 } from '../lib/aiDraftV2'

interface Props {
  type: DraftRequest['type']
  correspondence?: Correspondence
  letterChain?: Correspondence[]
  caseInfo?: Case
  lang: Lang
  apiKey: string
  onClose: () => void
  onUseDraft: (text: string) => void
}

const TYPE_LABELS: Record<DraftRequest['type'], { en: string; hi: string }> = {
  reminder:       { en: 'Draft Reminder',       hi: 'स्मरण पत्र ड्राफ्ट' },
  payment_demand: { en: 'Payment Demand',        hi: 'भुगतान मांग पत्र' },
  escalation:     { en: 'Escalation Letter',     hi: 'उच्च अधिकारी को पत्र' },
  fresh_notice:   { en: 'Fresh Legal Notice',    hi: 'नया कानूनी नोटिस' },
}

export default function DraftModalV2({ type, correspondence, letterChain, caseInfo, lang, apiKey, onClose, onUseDraft }: Props) {
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
  const [showChain, setShowChain] = useState(false)

  // Auto-fill negligence from opposing parties
  const eeParty = caseInfo?.opposingParties?.find(p => p.designation.toLowerCase().includes('executive'))
  const defaultNegligence = eeParty
    ? `${eeParty.name} (${eeParty.designation}, ${eeParty.department}) has intentionally failed to process running bills, respond to correspondence, and take any action despite multiple written reminders.`
    : ''

  const handleGenerate = async () => {
    if (!apiKey) { setError('Please set your API key in Settings first.'); return }
    setLoading(true)
    setError('')
    try {
      const req: DraftRequest = {
        type,
        originalCorrespondence: correspondence,
        letterChain: letterChain?.length ? letterChain : undefined,
        caseInfo,
        lang: draftLang,
        additionalContext: context || undefined,
        amount: amount ? parseFloat(amount) : undefined,
        interestRate: interestRate ? parseFloat(interestRate) : undefined,
        daysOverdue: daysOverdue ? parseInt(daysOverdue) : undefined,
        escalateTo: type === 'escalation' ? escalateTo : undefined,
        negligenceDetails: type === 'escalation' ? (negligence || defaultNegligence) : undefined,
      }
      const result = await generateDraftV2(req, apiKey)
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

  const handlePrint = () => {
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Legal Letter</title>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari&display=swap" rel="stylesheet">
    <style>body{font-family:'Times New Roman',serif;max-width:700px;margin:40px auto;padding:20px;line-height:1.8;font-size:14px}
    pre{font-family:inherit;white-space:pre-wrap}.hi{font-family:'Noto Sans Devanagari',sans-serif}</style>
    </head><body><pre class="${draftLang === 'hi' ? 'hi' : ''}">${draft.replace(/</g, '&lt;')}</pre></body></html>`)
    win.document.close()
    setTimeout(() => win.print(), 400)
  }

  const label = TYPE_LABELS[type][lang === 'hi' ? 'hi' : 'en']

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-legal-700" />
            <h2 className="font-semibold text-gray-800">{label}</h2>
            {caseInfo && <span className="text-xs text-gray-400 hidden sm:block">— {caseInfo.title}</span>}
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Language */}
          <div className="flex gap-2 items-center">
            <span className="text-xs font-medium text-gray-500">{t('language', lang)}:</span>
            {(['en', 'hi'] as Lang[]).map(l => (
              <button key={l} onClick={() => setDraftLang(l)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${draftLang === l ? 'bg-legal-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {l === 'en' ? 'English' : 'हिंदी'}
              </button>
            ))}
          </div>

          {/* Letter chain context */}
          {letterChain && letterChain.length > 0 && (
            <div className="border border-blue-100 rounded-lg overflow-hidden">
              <button onClick={() => setShowChain(!showChain)}
                className="w-full flex items-center justify-between px-3 py-2 bg-blue-50 text-xs font-medium text-blue-700 hover:bg-blue-100">
                <span>📎 {letterChain.length} letter{letterChain.length > 1 ? 's' : ''} in thread (used as AI context)</span>
                {showChain ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
              {showChain && (
                <div className="p-2 space-y-1 max-h-32 overflow-y-auto">
                  {letterChain.map((l, i) => (
                    <div key={l.id} className="text-xs text-gray-600 flex gap-2">
                      <span className="text-gray-400">[{i + 1}]</span>
                      <span>{l.date} — {l.subject}</span>
                      {l.referenceNumber && <span className="text-legal-700 font-mono">#{l.referenceNumber}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Opposing parties info */}
          {caseInfo?.opposingParties && caseInfo.opposingParties.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600">
              <p className="font-medium text-gray-700 mb-1">
                {lang === 'hi' ? 'विपक्षी अधिकारी (AI संदर्भ में शामिल)' : 'Opposing officers (included in AI context)'}
              </p>
              {caseInfo.opposingParties.map((p, i) => (
                <p key={i}>{p.designation}: {p.name} — {p.department}</p>
              ))}
            </div>
          )}

          {/* Payment fields */}
          {(type === 'payment_demand' || type === 'reminder') && (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="label">{t('amount', lang)} (₹)</label>
                <input type="number" className="input-field" value={amount} onChange={e => setAmount(e.target.value)} placeholder="21996292" />
              </div>
              <div>
                <label className="label">{t('interestRate', lang)}</label>
                <input type="number" step="0.1" className="input-field" value={interestRate} onChange={e => setInterestRate(e.target.value)} />
              </div>
              <div>
                <label className="label">{t('daysOverdue', lang)}</label>
                <input type="number" className="input-field" value={daysOverdue} onChange={e => setDaysOverdue(e.target.value)} />
              </div>
              {amount && daysOverdue && (
                <div className="col-span-3 bg-red-50 rounded-lg px-3 py-2 text-xs text-red-700">
                  Interest @{interestRate}% = ₹{Math.round(parseFloat(amount) * parseFloat(interestRate) * parseInt(daysOverdue) / 36500).toLocaleString('en-IN')}
                  {' '}| Total = ₹{(parseFloat(amount) + Math.round(parseFloat(amount) * parseFloat(interestRate) * parseInt(daysOverdue) / 36500)).toLocaleString('en-IN')}
                </div>
              )}
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
                <textarea className="input-field min-h-[80px]" value={negligence || defaultNegligence}
                  onChange={e => setNegligence(e.target.value)}
                  placeholder="Describe specific acts of negligence..." />
              </div>
            </div>
          )}

          {/* Additional context */}
          <div>
            <label className="label">{t('additionalContext', lang)}</label>
            <textarea className="input-field min-h-[60px]" value={context}
              onChange={e => setContext(e.target.value)}
              placeholder={lang === 'hi' ? 'कोई विशेष निर्देश...' : 'Any specific points to include...'} />
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
                  <button onClick={handlePrint} className="flex items-center gap-1 text-xs px-3 py-1 bg-legal-700 text-white rounded-md hover:bg-legal-600">
                    <Printer className="w-3 h-3" /> Print
                  </button>
                </div>
              </div>
              <pre className={`p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto ${draftLang === 'hi' ? 'font-devanagari text-base' : 'font-sans'}`}>
                {draft}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex gap-3 justify-end flex-wrap">
          <button onClick={onClose} className="btn-secondary">{t('close', lang)}</button>
          {draft && (
            <button onClick={handleGenerate} disabled={loading} className="btn-secondary flex items-center gap-2">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {t('regenerate', lang)}
            </button>
          )}
          {draft && (
            <button onClick={() => { onUseDraft(draft); onClose() }} className="btn-primary">
              {t('useThisDraft', lang)}
            </button>
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

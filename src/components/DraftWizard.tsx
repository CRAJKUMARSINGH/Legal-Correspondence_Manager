import { useState, useRef } from 'react'
import { Upload, Wand2, Download, ArrowLeft, ArrowRight, Check, FileText, Image, Type, Printer, RefreshCw, Save } from 'lucide-react'
import type { Case, Correspondence, Lang, DraftRequest } from '../types'
import { generateDraftV2 } from '../lib/aiDraftV2'
import { t } from '../i18n'

interface Props {
  cases: Case[]
  lang: Lang
  apiKey: string
  onBack: () => void
  onSaveCorrespondence: (item: Omit<Correspondence, 'id' | 'createdAt' | 'updatedAt'>) => void
}

type Step = 'input' | 'instruct' | 'result'
type InputMode = 'text' | 'file'

const DRAFT_TYPES: { value: DraftRequest['type']; labelEn: string; labelHi: string }[] = [
  { value: 'reminder',       labelEn: 'Reminder Letter',     labelHi: 'स्मरण पत्र' },
  { value: 'payment_demand', labelEn: 'Payment Demand',      labelHi: 'भुगतान मांग पत्र' },
  { value: 'escalation',     labelEn: 'Escalation Letter',   labelHi: 'उच्चस्तरीय शिकायत' },
  { value: 'fresh_notice',   labelEn: 'Fresh Legal Notice',  labelHi: 'नया कानूनी नोटिस' },
  { value: 'improve',        labelEn: 'Improve This Letter', labelHi: 'पत्र में सुधार' },
]

export default function DraftWizard({ cases, lang, apiKey, onBack, onSaveCorrespondence }: Props) {
  const hi = lang === 'hi'
  const fileRef = useRef<HTMLInputElement>(null)

  // Step
  const [step, setStep] = useState<Step>('input')

  // Step 1 — Input
  const [inputMode, setInputMode] = useState<InputMode>('text')
  const [inputText, setInputText] = useState('')
  const [fileName, setFileName] = useState('')
  const [selectedCase, setSelectedCase] = useState(cases[0]?.id ?? '')

  // Step 2 — Instructions
  const [draftType, setDraftType] = useState<DraftRequest['type']>('reminder')
  const [draftLang, setDraftLang] = useState<Lang>(lang)
  const [context, setContext] = useState('')
  const [amount, setAmount] = useState('')
  const [interestRate, setInterestRate] = useState('18')
  const [daysOverdue, setDaysOverdue] = useState('')

  // Step 3 — Result
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const caseInfo = cases.find(c => c.id === selectedCase)

  // ── File upload ────────────────────────────────────────────────────────────
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    if (file.type === 'text/plain') {
      const reader = new FileReader()
      reader.onload = ev => setInputText(ev.target?.result as string)
      reader.readAsText(file)
    } else {
      // For PDF/image — just store filename, user can add context in step 2
      setInputText(`[File uploaded: ${file.name}]\n\nPlease describe the content or paste key text below:`)
    }
  }

  // ── Generate ───────────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!apiKey) { setError(hi ? 'कृपया Settings में API Key सेट करें' : 'Please set your API key in Settings first.'); return }
    setLoading(true)
    setError('')
    try {
      const fakeCorr: Correspondence = {
        id: 'wizard-input',
        caseId: selectedCase,
        subject: hi ? 'अपलोड किया गया पत्र' : 'Uploaded Letter',
        type: 'notice',
        status: 'pending_reply',
        date: new Date().toISOString().split('T')[0],
        from: caseInfo?.opposingParties?.[0]?.name ?? 'Department',
        to: caseInfo?.clientName ?? 'Contractor',
        body: inputText,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        amount: amount ? parseFloat(amount) : undefined,
        interestRate: interestRate ? parseFloat(interestRate) : undefined,
        daysOverdue: daysOverdue ? parseInt(daysOverdue) : undefined,
      }
      const req: DraftRequest = {
        type: draftType,
        originalCorrespondence: fakeCorr,
        caseInfo,
        lang: draftLang,
        additionalContext: context || undefined,
        amount: amount ? parseFloat(amount) : undefined,
        interestRate: interestRate ? parseFloat(interestRate) : undefined,
        daysOverdue: daysOverdue ? parseInt(daysOverdue) : undefined,
      }
      const result = await generateDraftV2(req, apiKey)
      setDraft(result)
      setStep('result')
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  // ── Print ──────────────────────────────────────────────────────────────────
  const handlePrint = () => {
    const win = window.open('', '_blank')
    if (!win) return
    const typeLabel = DRAFT_TYPES.find(d => d.value === draftType)
    win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8">
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari&display=swap" rel="stylesheet">
    <style>
      @page { size: A4; margin: 20mm 20mm 20mm 25mm; }
      body { font-family: 'Times New Roman', serif; max-width: 700px; margin: 40px auto; padding: 20px; line-height: 1.8; font-size: 14px; }
      .header { border-top: 3px solid #1e3570; border-bottom: 1px solid #1e3570; padding: 10px 0; margin-bottom: 20px; text-align: center; }
      .firm { font-size: 16px; font-weight: bold; color: #1e3570; }
      .sub { font-size: 11px; color: #555; margin-top: 3px; }
      .meta { font-size: 12px; color: #444; margin: 4px 0; }
      h2 { text-align: center; text-decoration: underline; font-size: 14px; margin: 18px 0; }
      pre { font-family: inherit; white-space: pre-wrap; font-size: 13px; }
      .hi { font-family: 'Noto Sans Devanagari', sans-serif; font-size: 14px; }
    </style></head><body>
    <div class="header">
      <div class="firm">${caseInfo?.clientName ?? 'M/s Shri Bajrang Construction'}</div>
      <div class="sub">${caseInfo?.clientDesignation ?? ''} | ${caseInfo?.department ?? ''}</div>
    </div>
    <p class="meta"><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
    <h2>${draftLang === 'hi' ? (typeLabel?.labelHi ?? '') : (typeLabel?.labelEn ?? '')}</h2>
    <pre class="${draftLang === 'hi' ? 'hi' : ''}">${draft.replace(/</g, '&lt;')}</pre>
    </body></html>`)
    win.document.close()
    setTimeout(() => win.print(), 400)
  }

  // ── Save to correspondence ─────────────────────────────────────────────────
  const handleSave = () => {
    if (!selectedCase || !draft) return
    const typeLabel = DRAFT_TYPES.find(d => d.value === draftType)
    onSaveCorrespondence({
      caseId: selectedCase,
      subject: draftLang === 'hi' ? (typeLabel?.labelHi ?? draftType) : (typeLabel?.labelEn ?? draftType),
      type: draftType === 'fresh_notice' ? 'notice' : draftType === 'improve' ? 'notice' : draftType as any,
      status: 'draft',
      date: new Date().toISOString().split('T')[0],
      from: caseInfo?.clientName ?? '',
      to: caseInfo?.opposingParties?.[0]?.name ?? '',
      body: draftLang === 'en' ? draft : '',
      body_hi: draftLang === 'hi' ? draft : '',
      language: draftLang,
      amount: amount ? parseFloat(amount) : undefined,
    })
    setSaved(true)
  }

  // ── Step indicators ────────────────────────────────────────────────────────
  const steps = [
    { key: 'input',   label: hi ? 'पत्र इनपुट' : 'Input Letter' },
    { key: 'instruct',label: hi ? 'निर्देश' : 'Instructions' },
    { key: 'result',  label: hi ? 'परिणाम' : 'Result' },
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">

      {/* Back */}
      <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-legal-700 text-sm mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> {hi ? 'वापस जाएं' : 'Back'}
      </button>

      {/* Step bar */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center gap-2 flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors
              ${step === s.key ? 'bg-legal-700 text-white' : steps.findIndex(x => x.key === step) > i ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
              {steps.findIndex(x => x.key === step) > i ? <Check className="w-3.5 h-3.5" /> : i + 1}
            </div>
            <span className={`text-xs font-medium hidden sm:block ${step === s.key ? 'text-legal-700' : 'text-gray-400'}`}>{s.label}</span>
            {i < steps.length - 1 && <div className="flex-1 h-px bg-gray-200 mx-1" />}
          </div>
        ))}
      </div>

      {/* ── STEP 1: Input ── */}
      {step === 'input' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
          <h2 className="font-bold text-gray-800 text-lg">{hi ? 'पत्र इनपुट करें' : 'Input the Letter'}</h2>

          {/* Case selector */}
          {cases.length > 0 && (
            <div>
              <label className="label">{hi ? 'केस चुनें (वैकल्पिक)' : 'Select Case (optional)'}</label>
              <select className="input-field" value={selectedCase} onChange={e => setSelectedCase(e.target.value)}>
                <option value="">{hi ? '— केस चुनें —' : '— Select a case —'}</option>
                {cases.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
          )}

          {/* Input mode toggle */}
          <div className="flex gap-2">
            {[
              { mode: 'text' as InputMode, icon: Type, label: hi ? 'टेक्स्ट पेस्ट करें' : 'Paste Text' },
              { mode: 'file' as InputMode, icon: Image, label: hi ? 'फ़ाइल अपलोड करें' : 'Upload File' },
            ].map(opt => (
              <button key={opt.mode} onClick={() => setInputMode(opt.mode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors
                  ${inputMode === opt.mode ? 'bg-legal-700 text-white border-legal-700' : 'bg-white text-gray-600 border-gray-200 hover:border-legal-700'}`}>
                <opt.icon className="w-4 h-4" />
                {opt.label}
              </button>
            ))}
          </div>

          {inputMode === 'text' ? (
            <div>
              <label className="label">{hi ? 'पत्र की सामग्री यहाँ पेस्ट करें' : 'Paste letter content here'}</label>
              <textarea className="input-field min-h-[200px] font-mono text-sm"
                placeholder={hi ? 'प्राप्त पत्र का पूरा टेक्स्ट यहाँ पेस्ट करें...' : 'Paste the full text of the received letter here...'}
                value={inputText} onChange={e => setInputText(e.target.value)} />
            </div>
          ) : (
            <div>
              <input ref={fileRef} type="file" accept=".txt,.pdf,.png,.jpg,.jpeg,.doc,.docx" className="hidden" onChange={handleFile} />
              <button onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-300 hover:border-legal-700 rounded-xl p-8 text-center transition-colors group">
                <Upload className="w-8 h-8 text-gray-400 group-hover:text-legal-700 mx-auto mb-2 transition-colors" />
                <p className="text-sm font-medium text-gray-600 group-hover:text-legal-700">
                  {fileName || (hi ? 'PDF, छवि या टेक्स्ट फ़ाइल चुनें' : 'Choose PDF, image or text file')}
                </p>
                <p className="text-xs text-gray-400 mt-1">.txt, .pdf, .png, .jpg, .doc</p>
              </button>
              {fileName && (
                <div>
                  <label className="label mt-3">{hi ? 'अतिरिक्त विवरण / मुख्य बिंदु' : 'Additional details / key points'}</label>
                  <textarea className="input-field min-h-[120px] text-sm"
                    placeholder={hi ? 'पत्र के मुख्य बिंदु यहाँ लिखें...' : 'Describe key points from the letter...'}
                    value={inputText} onChange={e => setInputText(e.target.value)} />
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end">
            <button onClick={() => setStep('instruct')} disabled={!inputText.trim()}
              className="btn-primary flex items-center gap-2 disabled:opacity-50">
              {hi ? 'आगे बढ़ें' : 'Next'} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2: Instructions ── */}
      {step === 'instruct' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
          <h2 className="font-bold text-gray-800 text-lg">{hi ? 'निर्देश दें' : 'Give Instructions'}</h2>

          {/* Draft type */}
          <div>
            <label className="label">{hi ? 'क्या चाहिए?' : 'What do you need?'}</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DRAFT_TYPES.map(dt => (
                <button key={dt.value} onClick={() => setDraftType(dt.value)}
                  className={`text-left px-4 py-3 rounded-xl border text-sm font-medium transition-colors
                    ${draftType === dt.value ? 'bg-legal-700 text-white border-legal-700' : 'bg-white text-gray-700 border-gray-200 hover:border-legal-700'}`}>
                  {hi ? dt.labelHi : dt.labelEn}
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div>
            <label className="label">{hi ? 'भाषा' : 'Language'}</label>
            <div className="flex gap-2">
              {(['en', 'hi'] as Lang[]).map(l => (
                <button key={l} onClick={() => setDraftLang(l)}
                  className={`px-5 py-2 rounded-lg text-sm font-medium border transition-colors
                    ${draftLang === l ? 'bg-legal-700 text-white border-legal-700' : 'bg-white text-gray-600 border-gray-200 hover:border-legal-700'}`}>
                  {l === 'en' ? 'English' : 'हिंदी'}
                </button>
              ))}
            </div>
          </div>

          {/* Payment fields */}
          {(draftType === 'payment_demand' || draftType === 'reminder') && (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="label">{hi ? 'राशि (₹)' : 'Amount (₹)'}</label>
                <input type="number" className="input-field" value={amount} onChange={e => setAmount(e.target.value)} placeholder="21996292" />
              </div>
              <div>
                <label className="label">{hi ? 'ब्याज दर %' : 'Interest %'}</label>
                <input type="number" className="input-field" value={interestRate} onChange={e => setInterestRate(e.target.value)} />
              </div>
              <div>
                <label className="label">{hi ? 'विलंब दिन' : 'Days Overdue'}</label>
                <input type="number" className="input-field" value={daysOverdue} onChange={e => setDaysOverdue(e.target.value)} />
              </div>
            </div>
          )}

          {/* Additional context */}
          <div>
            <label className="label">{hi ? 'विशेष निर्देश (वैकल्पिक)' : 'Special instructions (optional)'}</label>
            <textarea className="input-field min-h-[80px]" value={context} onChange={e => setContext(e.target.value)}
              placeholder={hi ? 'कोई विशेष बिंदु जो पत्र में शामिल करना हो...' : 'Any specific points to include in the letter...'} />
          </div>

          {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

          <div className="flex justify-between">
            <button onClick={() => setStep('input')} className="btn-secondary flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> {hi ? 'वापस' : 'Back'}
            </button>
            <button onClick={handleGenerate} disabled={loading} className="btn-primary flex items-center gap-2">
              <Wand2 className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? (hi ? 'तैयार हो रहा है...' : 'Generating...') : (hi ? 'ड्राफ्ट बनाएं' : 'Generate Draft')}
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: Result ── */}
      {step === 'result' && draft && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b flex-wrap gap-2">
              <span className="text-sm font-semibold text-gray-700">
                {hi ? 'तैयार ड्राफ्ट' : 'Generated Draft'}
              </span>
              <div className="flex gap-2 flex-wrap">
                <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-legal-700 text-white rounded-lg hover:bg-legal-600">
                  <Printer className="w-3.5 h-3.5" /> {hi ? 'प्रिंट / PDF' : 'Print / PDF'}
                </button>
                <button onClick={() => { setStep('instruct'); setDraft('') }} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
                  <RefreshCw className="w-3.5 h-3.5" /> {hi ? 'पुनः बनाएं' : 'Regenerate'}
                </button>
                <button onClick={handleSave} disabled={saved} className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors
                  ${saved ? 'bg-green-100 text-green-700' : 'bg-amber-500 text-white hover:bg-amber-400'}`}>
                  {saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                  {saved ? (hi ? 'सहेजा गया' : 'Saved') : (hi ? 'रिकॉर्ड में सहेजें' : 'Save to Records')}
                </button>
              </div>
            </div>
            <pre className={`p-5 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed max-h-[60vh] overflow-y-auto
              ${draftLang === 'hi' ? 'font-devanagari text-base' : ''}`}>
              {draft}
            </pre>
          </div>

          {saved && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
              <Check className="w-5 h-5 text-green-600 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-green-800">
                  {hi ? 'पत्र रिकॉर्ड में सहेजा गया' : 'Letter saved to your records'}
                </p>
                <p className="text-xs text-green-600">
                  {hi ? 'पत्राचार टैब में देखें' : 'View it in the Correspondence tab'}
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={onBack} className="btn-secondary flex items-center gap-2">
              <FileText className="w-4 h-4" />
              {hi ? 'नया ड्राफ्ट' : 'New Draft'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

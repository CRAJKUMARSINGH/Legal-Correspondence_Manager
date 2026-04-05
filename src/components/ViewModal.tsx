import { X, Copy, Check, Printer, Link } from 'lucide-react'
import { useState } from 'react'
import type { Correspondence, Case, Lang } from '../types'
import { t } from '../i18n'
import { format } from 'date-fns'

interface Props {
  item: Correspondence
  caseInfo?: Case
  parentItem?: Correspondence
  lang: Lang
  onClose: () => void
}

export default function ViewModal({ item, caseInfo, parentItem, lang, onClose }: Props) {
  const [copied, setCopied] = useState(false)
  const [viewLang, setViewLang] = useState<Lang>(item.language ?? lang)

  const body = viewLang === 'hi' && item.body_hi ? item.body_hi : item.body
  const subject = viewLang === 'hi' && item.subject_hi ? item.subject_hi : item.subject

  const handleCopy = () => {
    const refLine = item.referenceNumber ? `Ref. No.: ${item.referenceNumber}\n` : ''
    const text = `${refLine}${subject}\n\nFrom: ${item.from}\nTo: ${item.to}${item.cc?.length ? `\nCC: ${item.cc.join(', ')}` : ''}\nDate: ${format(new Date(item.date), 'dd MMMM yyyy')}\n\n${body}`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePrint = () => {
    const refLine = item.referenceNumber ? `<p style="font-size:12px;color:#666">Ref. No.: ${item.referenceNumber}</p>` : ''
    const caseRef = caseInfo ? `<p style="font-size:11px;color:#888">${caseInfo.title}${caseInfo.contractNo ? ` | ${caseInfo.contractNo}` : ''}</p>` : ''
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`
      <!DOCTYPE html><html><head>
      <meta charset="UTF-8">
      <title>${subject}</title>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari&family=Times+New+Roman&display=swap" rel="stylesheet">
      <style>
        body { font-family: 'Times New Roman', serif; max-width: 700px; margin: 40px auto; padding: 20px; color: #111; line-height: 1.7; }
        .header { border-bottom: 2px solid #1e3570; padding-bottom: 12px; margin-bottom: 20px; }
        .meta { font-size: 13px; color: #444; margin: 4px 0; }
        h2 { text-align: center; text-decoration: underline; font-size: 15px; margin: 20px 0; }
        pre { font-family: inherit; white-space: pre-wrap; font-size: 14px; }
        .devanagari { font-family: 'Noto Sans Devanagari', sans-serif; }
        @media print { body { margin: 20px; } }
      </style>
      </head><body>
      <div class="header">
        ${caseRef}
        ${refLine}
        <p class="meta"><strong>Date:</strong> ${format(new Date(item.date), 'dd MMMM yyyy')}</p>
        <p class="meta"><strong>From:</strong> ${item.from}</p>
        <p class="meta"><strong>To:</strong> ${item.to}</p>
        ${item.cc?.length ? `<p class="meta"><strong>CC:</strong> ${item.cc.join(', ')}</p>` : ''}
        ${item.amount ? `<p class="meta" style="color:red"><strong>Amount:</strong> ₹${item.amount.toLocaleString('en-IN')}</p>` : ''}
      </div>
      <h2>${subject}</h2>
      <pre class="${viewLang === 'hi' ? 'devanagari' : ''}">${body}</pre>
      </body></html>
    `)
    win.document.close()
    win.focus()
    setTimeout(() => win.print(), 500)
  }

  const hasHindi = !!(item.body_hi || item.subject_hi)
  const hasEnglish = !!item.body

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b gap-2 flex-wrap">
          <h2 className="font-semibold text-gray-800 text-sm">{t('letterPreview', lang)}</h2>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Language toggle — only show if both exist */}
            {hasHindi && hasEnglish && (
              <button
                onClick={() => setViewLang(viewLang === 'en' ? 'hi' : 'en')}
                className="text-xs px-3 py-1 bg-gray-100 rounded-full hover:bg-gray-200 font-medium"
              >
                {viewLang === 'en' ? 'हिंदी में देखें' : 'View in English'}
              </button>
            )}
            <button onClick={handleCopy} className="flex items-center gap-1 text-xs px-3 py-1 bg-gray-100 rounded-full hover:bg-gray-200">
              {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
              {copied ? t('copied', lang) : t('copy', lang)}
            </button>
            <button onClick={handlePrint} className="flex items-center gap-1 text-xs px-3 py-1 bg-legal-700 text-white rounded-full hover:bg-legal-600">
              <Printer className="w-3 h-3" />
              Print
            </button>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg ml-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Thread indicator */}
          {parentItem && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-2">
              <Link className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
              <div className="text-xs text-blue-700">
                <span className="font-medium">In reply to:</span> {parentItem.subject}
                <span className="text-blue-500 ml-2">({format(new Date(parentItem.date), 'dd MMM yyyy')})</span>
              </div>
            </div>
          )}

          {/* Letter metadata */}
          <div className="border border-gray-200 rounded-xl p-4 mb-5 space-y-1.5 bg-gray-50">
            {caseInfo && (
              <p className="text-xs text-gray-400">{t('caseRef', lang)}: {caseInfo.title}{caseInfo.contractNo ? ` | ${caseInfo.contractNo}` : ''}</p>
            )}
            {item.referenceNumber && (
              <p className="text-xs font-semibold text-legal-700">{t('referenceNo', lang)}: {item.referenceNumber}</p>
            )}
            <p className="text-sm text-gray-600"><span className="font-medium">{t('date', lang)}:</span> {format(new Date(item.date), 'dd MMMM yyyy')}</p>
            <p className="text-sm text-gray-600"><span className="font-medium">{t('from', lang)}:</span> {item.from}</p>
            <p className="text-sm text-gray-600"><span className="font-medium">{t('to', lang)}:</span> {item.to}</p>
            {item.cc && item.cc.length > 0 && (
              <p className="text-sm text-gray-600"><span className="font-medium">{t('cc', lang)}:</span> {item.cc.join(', ')}</p>
            )}
            {item.amount && (
              <p className="text-sm text-red-600 font-semibold">₹{item.amount.toLocaleString('en-IN')}</p>
            )}
          </div>

          {/* Subject */}
          <h3 className={`font-bold text-gray-800 mb-5 text-center text-base underline underline-offset-4 ${viewLang === 'hi' ? 'font-devanagari' : ''}`}>
            {subject}
          </h3>

          {/* Body */}
          <div className={`text-sm text-gray-700 leading-relaxed whitespace-pre-wrap ${viewLang === 'hi' ? 'font-devanagari text-base' : ''}`}>
            {body || <span className="text-gray-400 italic">No content</span>}
          </div>

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {item.tags.map(tag => (
                <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

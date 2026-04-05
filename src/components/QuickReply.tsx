import { useState } from 'react'
import { X, Send } from 'lucide-react'
import type { Correspondence, Case, Lang, CorrespondenceType, Status } from '../types'
import { t } from '../i18n'

interface Props {
  parent: Correspondence
  caseInfo?: Case
  lang: Lang
  onSave: (item: Omit<Correspondence, 'id' | 'createdAt' | 'updatedAt'>) => void
  onClose: () => void
}

export default function QuickReply({ parent, caseInfo, lang, onSave, onClose }: Props) {
  const [type, setType] = useState<CorrespondenceType>('reply')
  const [subject, setSubject] = useState(`Re: ${parent.subject}`)
  const [body, setBody] = useState('')
  const [body_hi, setBodyHi] = useState('')
  const [refNo, setRefNo] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  // Swap from/to for reply
  const replyFrom = parent.to.split(';')[0].trim()
  const replyTo = parent.from

  const handleSave = () => {
    if (!subject || (!body && !body_hi)) return
    onSave({
      caseId: parent.caseId,
      subject,
      type,
      status: 'sent' as Status,
      date,
      from: replyFrom,
      to: replyTo,
      body,
      body_hi: body_hi || undefined,
      referenceNumber: refNo || undefined,
      parentId: parent.id,
      language: body_hi && !body ? 'hi' : 'en',
    })
    onClose()
  }

  const hi = lang === 'hi'

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="font-semibold text-gray-800 text-sm">{hi ? 'उत्तर पत्र' : 'Quick Reply'}</h2>
            <p className="text-xs text-gray-400 truncate">Re: {parent.subject}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Thread context */}
          <div className="bg-gray-50 rounded-lg p-3 border-l-4 border-legal-600">
            <p className="text-xs text-gray-500 font-medium mb-1">{hi ? 'मूल पत्र' : 'Original letter'} — {parent.date}</p>
            <p className="text-xs text-gray-600 line-clamp-3 whitespace-pre-wrap">{parent.body || parent.body_hi}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">{hi ? 'प्रेषक' : 'From'}</label>
              <input className="input-field bg-gray-50" value={replyFrom} readOnly />
            </div>
            <div>
              <label className="label">{hi ? 'प्राप्तकर्ता' : 'To'}</label>
              <input className="input-field bg-gray-50" value={replyTo} readOnly />
            </div>
            <div>
              <label className="label">{hi ? 'प्रकार' : 'Type'}</label>
              <select className="input-field" value={type} onChange={e => setType(e.target.value as CorrespondenceType)}>
                {(['reply', 'response', 'reminder', 'escalation', 'complaint'] as CorrespondenceType[]).map(tp => (
                  <option key={tp} value={tp}>{t(tp, lang)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">{hi ? 'दिनांक' : 'Date'}</label>
              <input type="date" className="input-field" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className="label">{hi ? 'विषय' : 'Subject'}</label>
              <input className="input-field" value={subject} onChange={e => setSubject(e.target.value)} />
            </div>
            <div>
              <label className="label">{hi ? 'संदर्भ संख्या' : 'Ref. No.'}</label>
              <input className="input-field" value={refNo} onChange={e => setRefNo(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="label">{hi ? 'पत्र (English)' : 'Body (English)'}</label>
            <textarea className="input-field min-h-[100px]" value={body} onChange={e => setBody(e.target.value)} />
          </div>
          <div>
            <label className="label">{hi ? 'पत्र (हिंदी)' : 'Body (हिंदी)'}</label>
            <textarea className="input-field min-h-[100px] font-devanagari" value={body_hi} onChange={e => setBodyHi(e.target.value)} />
          </div>
        </div>

        <div className="p-4 border-t flex gap-3 justify-end">
          <button onClick={onClose} className="btn-secondary">{t('cancel', lang)}</button>
          <button onClick={handleSave} disabled={!subject || (!body && !body_hi)}
            className="btn-primary flex items-center gap-2">
            <Send className="w-4 h-4" />
            {hi ? 'उत्तर भेजें' : 'Send Reply'}
          </button>
        </div>
      </div>
    </div>
  )
}

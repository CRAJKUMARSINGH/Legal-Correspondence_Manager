import { useState } from 'react'
import type { Correspondence, Case, Lang, CorrespondenceType, Status } from '../types'
import { t } from '../i18n'

interface Props {
  cases: Case[]
  onSave: (item: Omit<Correspondence, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
  lang: Lang
  initial?: Partial<Correspondence>
}

const TYPES: CorrespondenceType[] = ['notice', 'reminder', 'payment_demand', 'escalation', 'reply', 'response', 'order', 'complaint', 'other']
const STATUSES: Status[] = ['sent', 'pending_reply', 'replied', 'escalated', 'resolved', 'overdue', 'draft']

export default function CorrespondenceForm({ cases, onSave, onCancel, lang, initial }: Props) {
  const [form, setForm] = useState({
    caseId: initial?.caseId ?? (cases[0]?.id ?? ''),
    subject: initial?.subject ?? '',
    subject_hi: initial?.subject_hi ?? '',
    type: (initial?.type ?? 'notice') as CorrespondenceType,
    status: (initial?.status ?? 'sent') as Status,
    date: initial?.date ?? new Date().toISOString().split('T')[0],
    dueDate: initial?.dueDate ?? '',
    from: initial?.from ?? '',
    to: initial?.to ?? '',
    cc: initial?.cc?.join(', ') ?? '',
    body: initial?.body ?? '',
    body_hi: initial?.body_hi ?? '',
    referenceNumber: initial?.referenceNumber ?? '',
    amount: initial?.amount?.toString() ?? '',
    interestRate: initial?.interestRate?.toString() ?? '',
    daysOverdue: initial?.daysOverdue?.toString() ?? '',
    tags: initial?.tags?.join(', ') ?? '',
  })

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      caseId: form.caseId,
      subject: form.subject,
      subject_hi: form.subject_hi || undefined,
      type: form.type,
      status: form.status,
      date: form.date,
      dueDate: form.dueDate || undefined,
      from: form.from,
      to: form.to,
      cc: form.cc ? form.cc.split(',').map(s => s.trim()).filter(Boolean) : undefined,
      body: form.body,
      body_hi: form.body_hi || undefined,
      referenceNumber: form.referenceNumber || undefined,
      amount: form.amount ? parseFloat(form.amount) : undefined,
      interestRate: form.interestRate ? parseFloat(form.interestRate) : undefined,
      daysOverdue: form.daysOverdue ? parseInt(form.daysOverdue) : undefined,
      tags: form.tags ? form.tags.split(',').map(s => s.trim()).filter(Boolean) : undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
      <h3 className="font-semibold text-gray-700">{t('newLetter', lang)}</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">{t('selectCase', lang)} *</label>
          <select className="input-field" value={form.caseId} onChange={e => set('caseId', e.target.value)} required>
            {cases.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>
        <div>
          <label className="label">{t('type', lang)} *</label>
          <select className="input-field" value={form.type} onChange={e => set('type', e.target.value)}>
            {TYPES.map(tp => <option key={tp} value={tp}>{t(tp, lang)}</option>)}
          </select>
        </div>
        <div>
          <label className="label">{t('subject', lang)} *</label>
          <input className="input-field" value={form.subject} onChange={e => set('subject', e.target.value)} required />
        </div>
        <div>
          <label className="label">{t('subject', lang)} (हिंदी)</label>
          <input className="input-field" value={form.subject_hi} onChange={e => set('subject_hi', e.target.value)} />
        </div>
        <div>
          <label className="label">{t('date', lang)} *</label>
          <input type="date" className="input-field" value={form.date} onChange={e => set('date', e.target.value)} required />
        </div>
        <div>
          <label className="label">{t('dueDate', lang)}</label>
          <input type="date" className="input-field" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} />
        </div>
        <div>
          <label className="label">{t('from', lang)} *</label>
          <input className="input-field" value={form.from} onChange={e => set('from', e.target.value)} required />
        </div>
        <div>
          <label className="label">{t('to', lang)} *</label>
          <input className="input-field" value={form.to} onChange={e => set('to', e.target.value)} required />
        </div>
        <div className="md:col-span-2">
          <label className="label">{t('cc', lang)} (comma separated)</label>
          <input className="input-field" value={form.cc} onChange={e => set('cc', e.target.value)} placeholder="SE, ACE, CE..." />
        </div>
        <div>
          <label className="label">{t('status', lang)}</label>
          <select className="input-field" value={form.status} onChange={e => set('status', e.target.value)}>
            {STATUSES.map(s => <option key={s} value={s}>{t(s, lang)}</option>)}
          </select>
        </div>
        <div>
          <label className="label">{t('referenceNo', lang)}</label>
          <input className="input-field" value={form.referenceNumber} onChange={e => set('referenceNumber', e.target.value)} placeholder="e.g. AR/2023-24/1-D" />
        </div>
        <div>
          <label className="label">{t('tags', lang)}</label>
          <input className="input-field" value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="payment, forest, delay..." />
        </div>
        {(form.type === 'payment_demand' || form.type === 'reminder') && (
          <>
            <div>
              <label className="label">{t('amount', lang)}</label>
              <input type="number" className="input-field" value={form.amount} onChange={e => set('amount', e.target.value)} />
            </div>
            <div>
              <label className="label">{t('interestRate', lang)}</label>
              <input type="number" step="0.1" className="input-field" value={form.interestRate} onChange={e => set('interestRate', e.target.value)} placeholder="18" />
            </div>
            <div>
              <label className="label">{t('daysOverdue', lang)}</label>
              <input type="number" className="input-field" value={form.daysOverdue} onChange={e => set('daysOverdue', e.target.value)} />
            </div>
          </>
        )}
        <div className="md:col-span-2">
          <label className="label">{t('body', lang)} (English)</label>
          <textarea className="input-field min-h-[120px]" value={form.body} onChange={e => set('body', e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label className="label">{t('body', lang)} (हिंदी)</label>
          <textarea className="input-field min-h-[120px] font-devanagari" value={form.body_hi} onChange={e => set('body_hi', e.target.value)} />
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary">{t('cancel', lang)}</button>
        <button type="submit" className="btn-primary">{t('save', lang)}</button>
      </div>
    </form>
  )
}

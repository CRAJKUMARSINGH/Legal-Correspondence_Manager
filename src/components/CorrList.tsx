import { useState } from 'react'
import { Plus, Search, Eye, Edit2, Trash2, ArrowUpCircle, IndianRupee, Bell, Wand2, Link, Reply, Sparkles } from 'lucide-react'
import type { Correspondence, Case, Lang, Status } from '../types'
import { t } from '../i18n'
import { format } from 'date-fns'
import CorrespondenceForm from './CorrespondenceForm'
import DraftModalV2 from './DraftModalV2'
import ViewModal from './ViewModal'
import QuickReply from './QuickReply'
import type { DraftRequest } from '../types'

interface Props {
  items: Correspondence[]
  cases: Case[]
  lang: Lang
  apiKey: string
  onAdd: (item: Omit<Correspondence, 'id' | 'createdAt' | 'updatedAt'>) => void
  onUpdate: (id: string, updates: Partial<Correspondence>) => void
  onDelete: (id: string) => void
}

const SC: Record<string, string> = {
  sent: 'bg-blue-100 text-blue-700',
  pending_reply: 'bg-yellow-100 text-yellow-700',
  replied: 'bg-green-100 text-green-700',
  escalated: 'bg-purple-100 text-purple-700',
  resolved: 'bg-gray-100 text-gray-600',
  overdue: 'bg-red-100 text-red-700',
  draft: 'bg-slate-100 text-slate-600',
}

const TC: Record<string, string> = {
  notice: 'bg-orange-50 text-orange-700 border-orange-200',
  reminder: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  payment_demand: 'bg-red-50 text-red-700 border-red-200',
  escalation: 'bg-purple-50 text-purple-700 border-purple-200',
  reply: 'bg-green-50 text-green-700 border-green-200',
  response: 'bg-teal-50 text-teal-700 border-teal-200',
  order: 'bg-blue-50 text-blue-700 border-blue-200',
  complaint: 'bg-pink-50 text-pink-700 border-pink-200',
  other: 'bg-gray-50 text-gray-600 border-gray-200',
}

const ALL: Status[] = ['sent', 'pending_reply', 'replied', 'escalated', 'resolved', 'overdue', 'draft']

export default function CorrList({ items, cases, lang, apiKey, onAdd, onUpdate, onDelete }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<Correspondence | null>(null)
  const [viewItem, setViewItem] = useState<Correspondence | null>(null)
  const [draftItem, setDraftItem] = useState<Correspondence | null>(null)
  const [draftType, setDraftType] = useState<DraftRequest['type']>('reminder')
  const [replyItem, setReplyItem] = useState<Correspondence | null>(null)
  const [search, setSearch] = useState('')
  const [fCase, setFCase] = useState('')
  const [fStatus, setFStatus] = useState('')
  const [fType, setFType] = useState('')
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [spop, setSpop] = useState<string | null>(null)

  const filtered = items.filter(i =>
    (!search || i.subject.toLowerCase().includes(search.toLowerCase()) || (i.referenceNumber ?? '').toLowerCase().includes(search.toLowerCase()))
    && (!fCase || i.caseId === fCase)
    && (!fStatus || i.status === fStatus)
    && (!fType || i.type === fType)
  )

  const gc = (id: string) => cases.find(c => c.id === id)
  const gp = (pid?: string) => pid ? items.find(i => i.id === pid) : undefined

  // Build full thread chain for a letter (all letters in same case, sorted by date)
  const getChain = (item: Correspondence) =>
    items.filter(i => i.caseId === item.caseId).sort((a, b) => a.date.localeCompare(b.date))

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-700">{t('correspondence', lang)}</h2>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-legal-700 text-white rounded-lg hover:bg-legal-600 text-sm font-medium">
          <Plus className="w-4 h-4" /> {t('newLetter', lang)}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-44">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input-field pl-9" placeholder={t('search', lang)} value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input-field w-auto" value={fCase} onChange={e => setFCase(e.target.value)}>
          <option value="">{t('allCases', lang)}</option>
          {cases.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
        <select className="input-field w-auto" value={fStatus} onChange={e => setFStatus(e.target.value)}>
          <option value="">{t('allStatuses', lang)}</option>
          {ALL.map(s => <option key={s} value={s}>{t(s, lang)}</option>)}
        </select>
        <select className="input-field w-auto" value={fType} onChange={e => setFType(e.target.value)}>
          <option value="">{t('allTypes', lang)}</option>
          {['notice', 'reminder', 'payment_demand', 'escalation', 'reply', 'response', 'order', 'complaint', 'other'].map(tp => (
            <option key={tp} value={tp}>{t(tp, lang)}</option>
          ))}
        </select>
      </div>

      {showForm && <CorrespondenceForm cases={cases} lang={lang} onSave={item => { onAdd(item); setShowForm(false) }} onCancel={() => setShowForm(false)} />}
      {editItem && <CorrespondenceForm cases={cases} lang={lang} initial={editItem} onSave={item => { onUpdate(editItem.id, item); setEditItem(null) }} onCancel={() => setEditItem(null)} />}

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400"><p>{t('noCorrespondence', lang)}</p></div>
      ) : (
        <div className="space-y-2">
          {filtered.map(item => {
            const ci = gc(item.caseId)
            const par = gp(item.parentId)
            return (
              <div key={item.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow">
                {par && (
                  <div className="flex items-center gap-1.5 mb-2 text-xs text-blue-600">
                    <Link className="w-3 h-3" /><span className="truncate">Re: {par.subject}</span>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${TC[item.type] ?? TC.other}`}>{t(item.type, lang)}</span>
                      <div className="relative">
                        <button onClick={() => setSpop(spop === item.id ? null : item.id)}
                          className={`text-xs px-2 py-0.5 rounded-full font-medium hover:opacity-80 ${SC[item.status] ?? SC.draft}`}>
                          {t(item.status, lang)} ▾
                        </button>
                        {spop === item.id && (
                          <div className="absolute top-6 left-0 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-36">
                            {ALL.map(s => (
                              <button key={s} onClick={() => { onUpdate(item.id, { status: s }); setSpop(null) }}
                                className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 ${item.status === s ? 'font-semibold text-legal-700' : 'text-gray-700'}`}>
                                {t(s, lang)}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      {ci && <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full truncate max-w-32">{ci.title}</span>}
                      {item.referenceNumber && <span className="text-xs text-legal-700 font-mono bg-blue-50 px-2 py-0.5 rounded border border-blue-100">#{item.referenceNumber}</span>}
                    </div>
                    <h3 className="font-semibold text-gray-800 truncate text-sm">{lang === 'hi' && item.subject_hi ? item.subject_hi : item.subject}</h3>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{item.from} → {item.to}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-xs text-gray-400">{format(new Date(item.date), 'dd MMM yyyy')}</p>
                      {item.amount && <p className="text-xs text-red-600 font-semibold">₹{item.amount.toLocaleString('en-IN')}</p>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <button onClick={() => setViewItem(item)} className="action-btn"><Eye className="w-4 h-4" /></button>
                    <button onClick={() => setEditItem(item)} className="action-btn"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => setReplyItem(item)} className="action-btn text-green-600" title="Quick Reply"><Reply className="w-4 h-4" /></button>
                    <button onClick={() => { setDraftItem(item); setDraftType('reminder') }} className="action-btn text-amber-600"><Bell className="w-4 h-4" /></button>
                    <button onClick={() => { setDraftItem(item); setDraftType('payment_demand') }} className="action-btn text-red-600"><IndianRupee className="w-4 h-4" /></button>
                    <button onClick={() => { setDraftItem(item); setDraftType('escalation') }} className="action-btn text-purple-600" title={t('escalate', lang)}><ArrowUpCircle className="w-4 h-4" /></button>
                    <button onClick={() => { setDraftItem(item); setDraftType('improve') }} className="action-btn text-blue-600" title={t('improveLetter', lang)}><Sparkles className="w-4 h-4" /></button>
                    <button onClick={() => { setDraftItem(item); setDraftType('fresh_notice') }} className="action-btn text-legal-700" title={t('newLetter', lang)}><Wand2 className="w-4 h-4" /></button>
                    <button onClick={() => setConfirmId(item.id)} className="action-btn text-red-400"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {viewItem && <ViewModal item={viewItem} caseInfo={gc(viewItem.caseId)} parentItem={gp(viewItem.parentId)} lang={lang} onClose={() => setViewItem(null)} />}
      {draftItem && (
        <DraftModalV2
          type={draftType}
          correspondence={draftItem}
          letterChain={getChain(draftItem)}
          caseInfo={gc(draftItem.caseId)}
          lang={lang}
          apiKey={apiKey}
          onClose={() => setDraftItem(null)}
          onUseDraft={text => {
            if (!draftItem) return
            if (draftType === 'improve') {
              onUpdate(draftItem.id, { body: text })
            } else {
              // Create a brand new letter based on the draft
              onAdd({
                caseId: draftItem.caseId,
                subject: (draftType === 'escalation' ? 'ESCALATION: ' : '') + draftItem.subject,
                type: (draftType === 'fresh_notice' ? 'notice' : draftType) as any,
                status: 'draft',
                date: new Date().toISOString().split('T')[0],
                from: draftItem.from,
                to: draftItem.to,
                body: text,
                parentId: draftItem.id,
              })
            }
          }}
        />
      )}
      {replyItem && <QuickReply parent={replyItem} caseInfo={gc(replyItem.caseId)} lang={lang} onSave={item => { onAdd(item); setReplyItem(null) }} onClose={() => setReplyItem(null)} />}

      {confirmId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-xl max-w-sm w-full mx-4">
            <p className="text-gray-700 mb-4">{t('confirmDelete', lang)}</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmId(null)} className="btn-secondary">{t('no', lang)}</button>
              <button onClick={() => { onDelete(confirmId); setConfirmId(null) }} className="btn-danger">{t('yes', lang)}</button>
            </div>
          </div>
        </div>
      )}
      {spop && <div className="fixed inset-0 z-10" onClick={() => setSpop(null)} />}
    </div>
  )
}

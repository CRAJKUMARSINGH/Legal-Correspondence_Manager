import { useState } from 'react'
import { Plus, Briefcase, Trash2, ChevronDown, ChevronUp, Users, FileText, Building2 } from 'lucide-react'
import type { Case, OpposingParty, Lang } from '../types'
import { t } from '../i18n'
import { format } from 'date-fns'

interface Props {
  cases: Case[]
  onAdd: (c: Omit<Case, 'id' | 'createdAt'>) => void
  onDelete: (id: string) => void
  lang: Lang
}

const emptyParty: OpposingParty = { name: '', designation: '', department: '', email: '', phone: '' }

const emptyForm = {
  title: '', title_hi: '', contractNo: '', workName: '', workName_hi: '',
  clientName: '', clientDesignation: '', department: '',
  email: '', phone: '', address: '', description: '',
}

export default function CaseManager({ cases, onAdd, onDelete, lang }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [parties, setParties] = useState<OpposingParty[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(cases[0]?.id ?? null)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const addParty = () => setParties(p => [...p, { ...emptyParty }])
  const setParty = (i: number, k: keyof OpposingParty, v: string) =>
    setParties(p => p.map((party, idx) => idx === i ? { ...party, [k]: v } : party))
  const removeParty = (i: number) => setParties(p => p.filter((_, idx) => idx !== i))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.clientName) return
    onAdd({ ...form, opposingParties: parties.filter(p => p.name) })
    setForm(emptyForm)
    setParties([])
    setShowForm(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-700">{t('cases', lang)}</h2>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-legal-700 text-white rounded-lg hover:bg-legal-600 text-sm font-medium">
          <Plus className="w-4 h-4" /> {t('newCase', lang)}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="font-semibold text-gray-700 mb-4">{t('addCase', lang)}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">{t('caseTitle', lang)} *</label>
                <input className="input-field" value={form.title} onChange={e => set('title', e.target.value)} required />
              </div>
              <div>
                <label className="label">{t('caseTitle', lang)} (हिंदी)</label>
                <input className="input-field" value={form.title_hi} onChange={e => set('title_hi', e.target.value)} />
              </div>
              <div>
                <label className="label">{t('contractNo', lang)}</label>
                <input className="input-field" value={form.contractNo} onChange={e => set('contractNo', e.target.value)} />
              </div>
              <div>
                <label className="label">{t('clientName', lang)} *</label>
                <input className="input-field" value={form.clientName} onChange={e => set('clientName', e.target.value)} required />
              </div>
              <div>
                <label className="label">{lang === 'hi' ? 'पदनाम' : 'Designation'}</label>
                <input className="input-field" value={form.clientDesignation} onChange={e => set('clientDesignation', e.target.value)} placeholder="AA Class PWD Contractor" />
              </div>
              <div>
                <label className="label">{t('department', lang)}</label>
                <input className="input-field" value={form.department} onChange={e => set('department', e.target.value)} />
              </div>
              <div>
                <label className="label">{t('workName', lang)}</label>
                <input className="input-field" value={form.workName} onChange={e => set('workName', e.target.value)} />
              </div>
              <div>
                <label className="label">{t('workName', lang)} (हिंदी)</label>
                <input className="input-field" value={form.workName_hi} onChange={e => set('workName_hi', e.target.value)} />
              </div>
              <div>
                <label className="label">Email</label>
                <input className="input-field" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="contact@example.com" />
              </div>
              <div>
                <label className="label">{t('phone', lang)}</label>
                <input className="input-field" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 ..." />
              </div>
              <div className="md:col-span-2">
                <label className="label">{t('address', lang)}</label>
                <input className="input-field" value={form.address} onChange={e => set('address', e.target.value)} placeholder="Full office address..." />
              </div>
              <div className="md:col-span-2">
                <label className="label">{lang === 'hi' ? 'विवरण' : 'Description'}</label>
                <textarea className="input-field min-h-[70px]" value={form.description} onChange={e => set('description', e.target.value)} />
              </div>
            </div>

            {/* Opposing parties */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label mb-0">{lang === 'hi' ? 'विपक्षी पक्ष (अधिकारी)' : 'Opposing Parties / Officers'}</label>
                <button type="button" onClick={addParty}
                  className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 flex items-center gap-1">
                  <Plus className="w-3 h-3" /> {lang === 'hi' ? 'जोड़ें' : 'Add'}
                </button>
              </div>
              {parties.map((p, i) => (
                <div key={i} className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-2 p-3 bg-gray-50 rounded-lg">
                  <input className="input-field" placeholder={lang === 'hi' ? 'नाम' : 'Name'} value={p.name} onChange={e => setParty(i, 'name', e.target.value)} />
                  <input className="input-field" placeholder={lang === 'hi' ? 'पदनाम' : 'Designation'} value={p.designation} onChange={e => setParty(i, 'designation', e.target.value)} />
                  <input className="input-field" placeholder={lang === 'hi' ? 'विभाग' : 'Department'} value={p.department} onChange={e => setParty(i, 'department', e.target.value)} />
                  <input className="input-field" placeholder="Email" value={p.email} onChange={e => setParty(i, 'email', e.target.value)} />
                  <button type="button" onClick={() => removeParty(i)} className="text-red-400 hover:text-red-600 text-xs">✕ Remove</button>
                </div>
              ))}
            </div>

            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">{t('cancel', lang)}</button>
              <button type="submit" className="btn-primary">{t('save', lang)}</button>
            </div>
          </form>
        </div>
      )}

      {cases.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>{t('noCases', lang)}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {cases.map(c => {
            const expanded = expandedId === c.id
            return (
              <div key={c.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Case header */}
                <div
                  className="flex items-start gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedId(expanded ? null : c.id)}
                >
                  <div className="p-2 bg-legal-100 rounded-lg shrink-0">
                    <Briefcase className="w-4 h-4 text-legal-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 text-sm">
                      {lang === 'hi' && c.title_hi ? c.title_hi : c.title}
                    </h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
                      {c.contractNo && <p className="text-xs text-gray-500">{t('contractNo', lang)}: <span className="font-mono">{c.contractNo}</span></p>}
                      <p className="text-xs text-gray-500">{c.clientName}</p>
                      {c.department && <p className="text-xs text-gray-400">{c.department}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={e => { e.stopPropagation(); setConfirmId(c.id) }}
                      className="p-1.5 text-gray-300 hover:text-red-500 transition-colors rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                </div>

                {/* Expanded detail */}
                {expanded && (
                  <div className="border-t border-gray-100 p-4 space-y-4 bg-gray-50">
                    {/* Work details */}
                    {(c.workName || c.description) && (
                      <div className="flex gap-2">
                        <FileText className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                        <div>
                          {c.workName && (
                            <p className="text-sm text-gray-700 font-medium">
                              {lang === 'hi' && c.workName_hi ? c.workName_hi : c.workName}
                            </p>
                          )}
                          {c.description && <p className="text-xs text-gray-500 mt-1">{c.description}</p>}
                        </div>
                      </div>
                    )}

                    {/* Client info */}
                    <div className="flex gap-2">
                      <Building2 className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-gray-600">{lang === 'hi' ? 'ठेकेदार / ग्राहक' : 'Contractor / Client'}</p>
                        <p className="text-sm text-gray-700">{c.clientName}</p>
                        {c.clientDesignation && <p className="text-xs text-gray-500">{c.clientDesignation}</p>}
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-gray-400">
                          {c.email && <span>{c.email}</span>}
                          {c.phone && <span>{c.phone}</span>}
                          {c.address && <span className="w-full">{c.address}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Opposing parties */}
                    {c.opposingParties && c.opposingParties.length > 0 && (
                      <div className="flex gap-2">
                        <Users className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-600 mb-2">
                            {lang === 'hi' ? 'विपक्षी अधिकारी' : 'Opposing Officers / Parties'}
                          </p>
                          <div className="space-y-2">
                            {c.opposingParties.map((p, i) => (
                              <div key={i} className="bg-white rounded-lg p-2.5 border border-gray-200 text-xs">
                                <p className="font-semibold text-gray-800">{p.name}</p>
                                <p className="text-gray-500">{p.designation} — {p.department}</p>
                                {p.email && <p className="text-blue-600">{p.email}</p>}
                                {p.phone && <p className="text-gray-500">{p.phone}</p>}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-gray-400">{lang === 'hi' ? 'बनाया गया' : 'Created'}: {format(new Date(c.createdAt), 'dd MMM yyyy')}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

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
    </div>
  )
}

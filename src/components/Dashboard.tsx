import { FileText, Briefcase, Clock, AlertTriangle, RefreshCw, IndianRupee, TrendingUp } from 'lucide-react'
import type { Correspondence, Case, Lang } from '../types'
import { t } from '../i18n'
import { format, differenceInDays } from 'date-fns'
import InterestCalc from './InterestCalc'

interface Props {
  cases: Case[]
  items: Correspondence[]
  lang: Lang
  onSync: () => void
  syncing: boolean
  onTabChange: (tab: string) => void
}

const statusColors: Record<string, string> = {
  sent: 'bg-blue-100 text-blue-800',
  pending_reply: 'bg-yellow-100 text-yellow-800',
  replied: 'bg-green-100 text-green-800',
  escalated: 'bg-purple-100 text-purple-800',
  resolved: 'bg-gray-100 text-gray-700',
  overdue: 'bg-red-100 text-red-800',
  draft: 'bg-slate-100 text-slate-700',
}

export default function Dashboard({ cases, items, lang, onSync, syncing, onTabChange }: Props) {
  const pending = items.filter(i => i.status === 'pending_reply').length
  const overdue = items.filter(i => i.status === 'overdue').length
  const recent = [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5)

  // Payment summary
  const paymentItems = items.filter(i => i.amount && i.amount > 0)
  const totalPending = paymentItems
    .filter(i => !['resolved', 'replied'].includes(i.status))
    .reduce((sum, i) => sum + (i.amount ?? 0), 0)
  const totalInterest = paymentItems
    .filter(i => i.interestRate && i.daysOverdue)
    .reduce((sum, i) => sum + Math.round((i.amount ?? 0) * (i.interestRate ?? 18) * (i.daysOverdue ?? 0) / 36500), 0)

  // Days since oldest pending
  const oldestPending = paymentItems
    .filter(i => !['resolved', 'replied'].includes(i.status))
    .sort((a, b) => a.date.localeCompare(b.date))[0]
  const daysSinceOldest = oldestPending
    ? differenceInDays(new Date(), new Date(oldestPending.date))
    : 0

  const stats = [
    { label: t('totalCases', lang), value: cases.length, icon: Briefcase, color: 'bg-blue-500' },
    { label: t('totalLetters', lang), value: items.length, icon: FileText, color: 'bg-indigo-500' },
    { label: t('pendingReplies', lang), value: pending, icon: Clock, color: 'bg-amber-500' },
    { label: t('overdueItems', lang), value: overdue, icon: AlertTriangle, color: 'bg-red-500' },
  ]

  return (
    <div className="space-y-6">
      {/* Luminaire sync banner when empty */}
      {cases.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-amber-800 text-sm">{t('connectLuminaire', lang)}</p>
            <p className="text-xs text-amber-700 mt-0.5">{t('connectLuminaireDesc', lang)}</p>
          </div>
          <button onClick={onSync} disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500 text-sm font-medium whitespace-nowrap disabled:opacity-60">
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing…' : t('syncNow', lang)}
          </button>
        </div>
      )}

      {/* Stats and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(s => (
            <div key={s.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
              <div className={`${s.color} p-3 rounded-lg shrink-0`}>
                <s.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Quick Actions Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <button onClick={() => onTabChange('cases')} className="w-full flex items-center gap-2 px-3 py-2 bg-legal-50 text-legal-700 rounded-lg hover:bg-legal-100 text-xs font-semibold transition-colors">
              <RefreshCw className="w-3.5 h-3.5" /> {t('newCase', lang)}
            </button>
            <button onClick={() => onTabChange('correspondence')} className="w-full flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-xs font-semibold transition-colors">
              <FileText className="w-3.5 h-3.5" /> {t('newLetter', lang)}
            </button>
          </div>
        </div>
      </div>

      {/* Payment summary — only show if there are payment items */}
      {paymentItems.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-red-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <IndianRupee className="w-5 h-5 text-red-500" />
            <h2 className="font-semibold text-gray-700">
              {lang === 'hi' ? 'भुगतान सारांश' : 'Payment Summary'}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-xs text-red-600 font-medium mb-1">
                {lang === 'hi' ? 'कुल लंबित राशि' : 'Total Pending'}
              </p>
              <p className="text-xl font-bold text-red-700">₹{totalPending.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <p className="text-xs text-orange-600 font-medium mb-1">
                {lang === 'hi' ? 'अनुमानित ब्याज' : 'Est. Interest'}
              </p>
              <p className="text-xl font-bold text-orange-700">₹{totalInterest.toLocaleString('en-IN')}</p>
              <p className="text-xs text-orange-500">@18% p.a.</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-4">
              <div className="flex items-center gap-1 mb-1">
                <TrendingUp className="w-3 h-3 text-amber-600" />
                <p className="text-xs text-amber-600 font-medium">
                  {lang === 'hi' ? 'सबसे पुराना लंबित' : 'Oldest Pending'}
                </p>
              </div>
              <p className="text-xl font-bold text-amber-700">{daysSinceOldest} days</p>
              {oldestPending && (
                <p className="text-xs text-amber-500">{format(new Date(oldestPending.date), 'dd MMM yyyy')}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Interest Calculator */}
      <InterestCalc lang={lang} />

      {/* Case Summary and Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Case List Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-700 mb-4">{t('cases', lang)} Summary</h2>
          {cases.length === 0 ? (
            <p className="text-gray-400 text-sm">{t('noCases', lang)}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-gray-500">
                <thead className="text-gray-400 uppercase bg-gray-50">
                  <tr>
                    <th className="px-3 py-2">Title</th>
                    <th className="px-3 py-2">Department</th>
                    <th className="px-3 py-2">Stats</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {cases.slice(0, 5).map(c => {
                    const caseItems = items.filter(i => i.caseId === c.id)
                    const pendingCount = caseItems.filter(i => i.status === 'pending_reply' || i.status === 'overdue').length
                    return (
                      <tr key={c.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => onTabChange('cases')}>
                        <td className="px-3 py-3 font-medium text-gray-900">{c.title}</td>
                        <td className="px-3 py-3">{c.department || '—'}</td>
                        <td className="px-3 py-3">
                          <span className={`${pendingCount > 0 ? 'text-amber-600' : 'text-green-600'} font-semibold`}>
                            {caseItems.length} letters ({pendingCount} pending)
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-700 mb-4">{t('recentActivity', lang)}</h2>
          {recent.length === 0 ? (
            <p className="text-gray-400 text-sm">{t('noCorrespondence', lang)}</p>
          ) : (
            <div className="space-y-2">
              {recent.map(item => (
                <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => onTabChange('correspondence')}>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-800 truncate">{item.subject}</p>
                    <p className="text-xs text-gray-500 truncate">{item.from} → {item.to}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-gray-400">{format(new Date(item.date), 'dd MMM yyyy')}</p>
                      {item.referenceNumber && (
                        <span className="text-xs text-legal-700 font-mono">#{item.referenceNumber}</span>
                      )}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${statusColors[item.status] ?? statusColors.draft}`}>
                    {t(item.status, lang)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

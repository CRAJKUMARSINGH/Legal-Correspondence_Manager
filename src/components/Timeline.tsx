import type { Correspondence, Case, Lang } from '../types'
import { t } from '../i18n'
import { format } from 'date-fns'

interface Props {
  items: Correspondence[]
  cases: Case[]
  lang: Lang
}

const typeIcons: Record<string, string> = {
  notice: '📋',
  reminder: '🔔',
  payment_demand: '💰',
  escalation: '⬆️',
  reply: '↩️',
  response: '↩️',
  order: '📜',
  complaint: '⚠️',
  other: '📄',
}

const statusDot: Record<string, string> = {
  sent: 'bg-blue-400',
  pending_reply: 'bg-yellow-400',
  replied: 'bg-green-400',
  escalated: 'bg-purple-400',
  resolved: 'bg-gray-400',
  overdue: 'bg-red-500',
  draft: 'bg-slate-300',
}

export default function Timeline({ items, cases, lang }: Props) {
  const sorted = [...items].sort((a, b) => b.date.localeCompare(a.date))

  const grouped: Record<string, Correspondence[]> = {}
  sorted.forEach(item => {
    const caseId = item.caseId
    if (!grouped[caseId]) grouped[caseId] = []
    grouped[caseId].push(item)
  })

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>{t('noCorrespondence', lang)}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([caseId, caseItems]) => {
        const caseInfo = cases.find(c => c.id === caseId)
        return (
          <div key={caseId} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-semibold text-legal-700 mb-4 pb-2 border-b">
              {caseInfo ? (lang === 'hi' && caseInfo.title_hi ? caseInfo.title_hi : caseInfo.title) : 'Unknown Case'}
              {caseInfo?.contractNo && <span className="text-xs text-gray-400 ml-2">({caseInfo.contractNo})</span>}
            </h3>
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
              <div className="space-y-4">
                {caseItems.map((item, idx) => (
                  <div key={item.id} className="relative flex gap-4 pl-10">
                    {/* Dot */}
                    <div className={`absolute left-3 top-2 w-3 h-3 rounded-full border-2 border-white ${statusDot[item.status]} z-10`} />
                    <div className="flex-1 bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-base">{typeIcons[item.type]}</span>
                            <span className="font-medium text-sm text-gray-800 truncate">
                              {lang === 'hi' && item.subject_hi ? item.subject_hi : item.subject}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{item.from} → {item.to}</p>
                          {item.amount && <p className="text-xs text-red-600 font-medium">₹{item.amount.toLocaleString('en-IN')}</p>}
                          {item.referenceNumber && <p className="text-xs text-legal-700 font-mono">#{item.referenceNumber}</p>}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs text-gray-400">{format(new Date(item.date), 'dd MMM yy')}</p>
                          <span className="text-xs text-gray-500">{t(item.status, lang)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

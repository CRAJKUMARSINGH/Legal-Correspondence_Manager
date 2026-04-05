import { useState } from 'react'
import { Calculator, IndianRupee } from 'lucide-react'
import type { Lang } from '../types'

interface Props { lang: Lang }

export default function InterestCalc({ lang }: Props) {
  const [principal, setPrincipal] = useState('')
  const [rate, setRate] = useState('18')
  const [days, setDays] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState(new Date().toISOString().split('T')[0])

  const calcDays = () => {
    if (from && to) {
      const d = Math.max(0, Math.floor((new Date(to).getTime() - new Date(from).getTime()) / 86400000))
      setDays(String(d))
    }
  }

  const p = parseFloat(principal) || 0
  const r = parseFloat(rate) || 18
  const d = parseInt(days) || 0
  const interest = Math.round(p * r * d / 36500)
  const total = p + interest

  const hi = lang === 'hi'

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="w-5 h-5 text-legal-700" />
        <h2 className="font-semibold text-gray-700">{hi ? 'ब्याज कैलकुलेटर' : 'Interest Calculator'}</h2>
        <span className="text-xs text-gray-400 ml-1">{hi ? '(धारा 73/74 भारतीय संविदा अधिनियम)' : '(Sec. 73/74 Contract Act)'}</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div>
          <label className="label">{hi ? 'मूल राशि (₹)' : 'Principal (₹)'}</label>
          <input type="number" className="input-field" value={principal} onChange={e => setPrincipal(e.target.value)} placeholder="21996292" />
        </div>
        <div>
          <label className="label">{hi ? 'ब्याज दर (% प्रति वर्ष)' : 'Rate (% p.a.)'}</label>
          <input type="number" step="0.1" className="input-field" value={rate} onChange={e => setRate(e.target.value)} />
        </div>
        <div>
          <label className="label">{hi ? 'प्रारंभ तिथि' : 'From Date'}</label>
          <input type="date" className="input-field" value={from} onChange={e => { setFrom(e.target.value); }} onBlur={calcDays} />
        </div>
        <div>
          <label className="label">{hi ? 'अंत तिथि' : 'To Date'}</label>
          <input type="date" className="input-field" value={to} onChange={e => { setTo(e.target.value); }} onBlur={calcDays} />
        </div>
      </div>
      <div className="flex items-center gap-2 mb-4">
        <button onClick={calcDays} className="btn-secondary text-xs px-3 py-1.5">
          {hi ? 'दिन गणना करें' : 'Calculate Days'}
        </button>
        {d > 0 && <span className="text-xs text-gray-500">{d} {hi ? 'दिन' : 'days'}</span>}
      </div>
      {p > 0 && d > 0 && (
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100">
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-xs text-blue-600 font-medium mb-1">{hi ? 'मूल राशि' : 'Principal'}</p>
            <p className="text-lg font-bold text-blue-700">₹{p.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-3">
            <p className="text-xs text-orange-600 font-medium mb-1">{hi ? 'ब्याज' : 'Interest'}</p>
            <p className="text-lg font-bold text-orange-700">₹{interest.toLocaleString('en-IN')}</p>
            <p className="text-xs text-orange-400">@{r}% × {d}d</p>
          </div>
          <div className="bg-red-50 rounded-lg p-3">
            <div className="flex items-center gap-1 mb-1">
              <IndianRupee className="w-3 h-3 text-red-600" />
              <p className="text-xs text-red-600 font-medium">{hi ? 'कुल देय' : 'Total Due'}</p>
            </div>
            <p className="text-lg font-bold text-red-700">₹{total.toLocaleString('en-IN')}</p>
          </div>
        </div>
      )}
    </div>
  )
}

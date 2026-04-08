import { Scale, Upload, Wand2, Download, ArrowRight, FileText, Clock, Shield, Globe } from 'lucide-react'
import type { Lang } from '../types'

interface Props {
  lang: Lang
  onGetStarted: () => void
  onViewWork: () => void
  hasExistingWork: boolean
}

export default function Landing({ lang, onGetStarted, onViewWork, hasExistingWork }: Props) {
  const hi = lang === 'hi'

  const steps = [
    {
      icon: Upload,
      title: hi ? 'पत्र अपलोड करें' : 'Upload Your Letter',
      desc: hi ? 'प्राप्त पत्र की छवि, PDF या टेक्स्ट अपलोड करें' : 'Upload the received letter as image, PDF or paste text',
      color: 'bg-blue-500',
    },
    {
      icon: Wand2,
      title: hi ? 'निर्देश दें' : 'Give Instructions',
      desc: hi ? 'बताएं क्या चाहिए — स्मरण पत्र, भुगतान मांग, उच्चस्तरीय शिकायत' : 'Tell us what you need — reminder, payment demand, escalation',
      color: 'bg-amber-500',
    },
    {
      icon: Download,
      title: hi ? 'ड्राफ्ट प्राप्त करें' : 'Get Your Draft',
      desc: hi ? 'हिंदी या अंग्रेजी में तैयार पत्र — PDF डाउनलोड करें' : 'Ready letter in Hindi or English — download as PDF',
      color: 'bg-green-500',
    },
  ]

  const features = [
    { icon: FileText, title: hi ? 'PWD/CPWD विशेषज्ञ' : 'PWD/CPWD Expert', desc: hi ? 'सरकारी अनुबंध कानून में विशेषज्ञता' : 'Specialized in govt contract law' },
    { icon: Clock, title: hi ? 'तत्काल ड्राफ्ट' : 'Instant Drafts', desc: hi ? 'सेकंडों में कानूनी पत्र तैयार' : 'Legal letters ready in seconds' },
    { icon: Shield, title: hi ? 'कानूनी सटीकता' : 'Legal Accuracy', desc: hi ? 'ICA धारा 73/74, मध्यस्थता अधिनियम' : 'ICA Sec 73/74, Arbitration Act' },
    { icon: Globe, title: hi ? 'द्विभाषी' : 'Bilingual', desc: hi ? 'हिंदी एवं अंग्रेजी दोनों में' : 'Hindi and English both' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-legal-900 via-legal-800 to-legal-700">

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-4 pt-16 pb-12 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-amber-400/20 p-4 rounded-2xl border border-amber-400/30">
            <Scale className="w-12 h-12 text-amber-400" />
          </div>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
          {hi ? 'कानूनी पत्राचार प्रबंधक' : 'Legal Correspondence Manager'}
        </h1>
        <p className="text-xl text-blue-200 mb-3 max-w-2xl mx-auto">
          {hi
            ? 'PWD/CPWD ठेकेदारों के लिए AI-संचालित कानूनी पत्र ड्राफ्टिंग'
            : 'AI-powered legal letter drafting for PWD/CPWD contractors'}
        </p>
        <p className="text-blue-300 text-sm mb-10 max-w-xl mx-auto">
          {hi
            ? 'भुगतान मांग, स्मरण पत्र, उच्चस्तरीय शिकायत — हिंदी एवं अंग्रेजी में तत्काल'
            : 'Payment demands, reminders, escalations — instantly in Hindi & English'}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onGetStarted}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-xl text-lg shadow-xl transition-all hover:-translate-y-0.5"
          >
            <Wand2 className="w-5 h-5" />
            {hi ? 'ड्राफ्ट बनाएं' : 'Draft a Letter'}
            <ArrowRight className="w-5 h-5" />
          </button>
          {hasExistingWork && (
            <button
              onClick={onViewWork}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-lg border border-white/20 transition-all"
            >
              <FileText className="w-5 h-5" />
              {hi ? 'मेरा कार्य देखें' : 'View My Work'}
            </button>
          )}
        </div>
      </div>

      {/* Steps */}
      <div className="max-w-5xl mx-auto px-4 pb-12">
        <h2 className="text-center text-white/70 text-sm font-semibold uppercase tracking-widest mb-8">
          {hi ? 'यह कैसे काम करता है' : 'How it works'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <div key={i} className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/10 text-center hover:bg-white/15 transition-all">
              <div className={`${s.color} w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4`}>
                <s.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-white/40 text-xs font-bold mb-1">STEP {i + 1}</div>
              <h3 className="text-white font-bold text-base mb-2">{s.title}</h3>
              <p className="text-blue-200 text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-4 pb-16">
        <div className="bg-white/5 rounded-2xl border border-white/10 p-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div key={i} className="text-center">
                <div className="bg-legal-700 w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <f.icon className="w-5 h-5 text-amber-400" />
                </div>
                <h4 className="text-white font-semibold text-sm mb-1">{f.title}</h4>
                <p className="text-blue-300 text-xs">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}

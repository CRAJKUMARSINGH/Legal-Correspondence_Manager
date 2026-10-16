/**
 * OutputToast.tsx
 * ───────────────
 * Fixed bottom-right toast that appears after any document is generated.
 * Shows filename + a clickable URL when the file is available on Netlify (/docs/*).
 *
 * Usage:
 *   <OutputToast notifications={notifications} onDismiss={dismiss} />
 */

import { useEffect, useState } from 'react'
import { CheckCircle, X, ExternalLink, Download, Copy, Check } from 'lucide-react'
import type { OutputNotification } from '../hooks/useOutputNotification'

interface Props {
  notifications: OutputNotification[]
  onDismiss: (id: string) => void
}

function ToastItem({ n, onDismiss }: { n: OutputNotification; onDismiss: () => void }) {
  const [copied, setCopied] = useState(false)
  const [visible, setVisible] = useState(false)

  // Slide-in on mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 30)
    return () => clearTimeout(t)
  }, [])

  // Auto-dismiss after 12 s
  useEffect(() => {
    const t = setTimeout(() => onDismiss(), 12000)
    return () => clearTimeout(t)
  }, [onDismiss])

  const handleCopy = () => {
    if (n.url) {
      navigator.clipboard.writeText(n.url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div
      className={`
        flex items-start gap-3 bg-white border border-green-200 rounded-xl shadow-lg
        px-4 py-3 w-80 transition-all duration-300
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
    >
      {/* Icon */}
      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />

      {/* Body */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800">
          Output Generated
        </p>

        {/* Filename */}
        <p className="text-xs text-gray-500 truncate mt-0.5" title={n.filename}>
          <Download className="inline w-3 h-3 mr-1 text-gray-400" />
          {n.filename}
        </p>

        {/* URL row */}
        {n.url && (
          <div className="flex items-center gap-1 mt-1.5">
            <a
              href={n.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline truncate flex items-center gap-1"
              title={n.url}
            >
              <ExternalLink className="w-3 h-3 shrink-0" />
              <span className="truncate">{n.url}</span>
            </a>
            <button
              onClick={handleCopy}
              title="Copy URL"
              className="shrink-0 p-0.5 rounded hover:bg-gray-100"
            >
              {copied
                ? <Check className="w-3 h-3 text-green-500" />
                : <Copy className="w-3 h-3 text-gray-400" />
              }
            </button>
          </div>
        )}

        {/* Blob-only message (no Netlify URL) */}
        {!n.url && (
          <p className="text-xs text-gray-400 mt-1">
            Saved to Downloads folder
          </p>
        )}
      </div>

      {/* Close */}
      <button
        onClick={onDismiss}
        className="shrink-0 p-0.5 rounded hover:bg-gray-100 mt-0.5"
      >
        <X className="w-4 h-4 text-gray-400" />
      </button>
    </div>
  )
}

export default function OutputToast({ notifications, onDismiss }: Props) {
  if (notifications.length === 0) return null

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 items-end">
      {notifications.map(n => (
        <ToastItem key={n.id} n={n} onDismiss={() => onDismiss(n.id)} />
      ))}
    </div>
  )
}

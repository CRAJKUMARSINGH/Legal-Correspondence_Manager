/**
 * useOutputNotification.ts
 * ────────────────────────
 * Global hook that manages output-generated toast notifications.
 *
 * NETLIFY STATIC URL RESOLUTION
 * ──────────────────────────────
 * Files placed in public/docs/ are served by Netlify at:
 *   https://<your-site>.netlify.app/docs/<filename>
 *
 * When notify() is called with a filename that matches a known
 * public/docs/ file, the hook builds the full public URL automatically.
 *
 * Usage:
 *   const { notifications, notify, dismiss } = useOutputNotification()
 *
 *   // Browser-generated blob download (no static URL):
 *   notify({ filename: 'letter.doc' })
 *
 *   // File known to exist in public/docs/ (Netlify-served URL):
 *   notify({ filename: 'neel_kanth_deposit_refund_application.html',
 *             staticPath: '/docs/neel_kanth_deposit_refund_application.html' })
 *
 *   // Python script wrote to public/docs/ — URL resolved automatically:
 *   notify({ filename: 'SNA_SPARSH_SSO_Mapping_DN2_Udaipur.html',
 *             staticPath: '/docs/SNA_SPARSH_SSO_Mapping_DN2_Udaipur.html' })
 */

import { useState, useCallback } from 'react'

export interface OutputNotification {
  id: string
  filename: string
  /** Full public URL (Netlify) or blob URL. Undefined = Downloads folder only. */
  url?: string
  /** ISO timestamp */
  createdAt: string
}

export interface NotifyOptions {
  filename: string
  /** Relative path under public/, e.g. '/docs/letter.html' */
  staticPath?: string
  /** Pass a blob URL directly (ephemeral, session-only) */
  blobUrl?: string
}

/**
 * Resolves the display URL for a notification.
 * On Netlify (or any server), staticPath becomes an absolute URL.
 * Falls back to blobUrl, then undefined.
 */
function resolveUrl(opts: NotifyOptions): string | undefined {
  if (opts.staticPath) {
    // Works in both local dev (relative) and Netlify (absolute)
    return `${window.location.origin}${opts.staticPath}`
  }
  if (opts.blobUrl) return opts.blobUrl
  return undefined
}

let _counter = 0
function uniqueId() {
  return `out_${Date.now()}_${++_counter}`
}

export function useOutputNotification() {
  const [notifications, setNotifications] = useState<OutputNotification[]>([])

  const notify = useCallback((opts: NotifyOptions) => {
    const notification: OutputNotification = {
      id:        uniqueId(),
      filename:  opts.filename,
      url:       resolveUrl(opts),
      createdAt: new Date().toISOString(),
    }
    setNotifications(prev => [...prev, notification])
  }, [])

  const dismiss = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const dismissAll = useCallback(() => {
    setNotifications([])
  }, [])

  return { notifications, notify, dismiss, dismissAll }
}

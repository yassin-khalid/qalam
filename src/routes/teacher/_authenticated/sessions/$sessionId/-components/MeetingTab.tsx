import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Copy, ExternalLink, MapPin, Check, Video } from 'lucide-react'
import type { SessionDetail } from '../../-types/types'

export const MeetingTab: React.FC<{ session: SessionDetail }> = ({ session }) => {
    const { t } = useTranslation('teacher')
    const [copied, setCopied] = useState(false)

    if (session.teachingMode === 'InPerson') {
        return (
            <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-8 text-center">
                <MapPin size={32} className="text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    {t('sessions.detail.meeting.inPersonNotice')}
                </p>
            </section>
        )
    }

    const handleCopy = async () => {
        if (!session.zoomLink) return
        try {
            await navigator.clipboard.writeText(session.zoomLink)
            setCopied(true)
            setTimeout(() => setCopied(false), 1800)
        } catch {
            // ignore
        }
    }

    return (
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 space-y-4">
            <header className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary dark:bg-secondary text-white flex items-center justify-center">
                    <Video size={18} />
                </div>
                <div>
                    <h2 className="text-base font-bold text-slate-800 dark:text-white">
                        {t('sessions.detail.meeting.title')}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {t('sessions.detail.meeting.zoomDescription')}
                    </p>
                </div>
            </header>

            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/40 rounded-lg px-3.5 py-2.5 border border-slate-100 dark:border-slate-800">
                <code className="flex-1 text-xs text-slate-700 dark:text-slate-200 truncate font-mono">
                    {session.zoomLink ?? '—'}
                </code>
                <button
                    type="button"
                    onClick={handleCopy}
                    disabled={!session.zoomLink}
                    className="px-3 py-1.5 rounded-md text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1.5 disabled:opacity-40"
                >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    {copied ? t('sessions.detail.meeting.copied') : t('sessions.detail.meeting.copy')}
                </button>
                <a
                    href={session.zoomLink ?? '#'}
                    target="_blank"
                    rel="noreferrer"
                    aria-disabled={!session.zoomLink}
                    className="px-3 py-1.5 rounded-md text-xs font-bold bg-secondary text-white hover:bg-primary transition flex items-center gap-1.5"
                >
                    <ExternalLink size={12} />
                    {t('sessions.detail.meeting.launch')}
                </a>
            </div>
        </section>
    )
}

import React, { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
    Bell,
    CheckCheck,
    CheckCircle2,
    Eye,
    Inbox,
    Loader2,
    LucideIcon,
    MessageSquare,
    SaudiRiyal,
    Sparkles,
    Star,
    UserPlus,
    XCircle,
} from 'lucide-react'

import { useLocale } from '@/lib/hooks/useLocale'
import type { AppNotification, NotificationType } from '../notifications/-types/types'
import {
    markAllNotificationsAsRead,
    markNotificationAsRead,
    notificationsListQueryOptions,
} from '../notifications/-queries/notificationsQueries'

const ICON_BY_TYPE: Record<NotificationType, LucideIcon> = {
    NewQualifiedRequest: Inbox,
    OfferViewed: Eye,
    OfferAccepted: CheckCircle2,
    OfferRejected: XCircle,
    OfferAutoRejected: XCircle,
    NewMessage: MessageSquare,
    NewEnrollmentRequest: UserPlus,
    EnrollmentApproved: CheckCircle2,
    PaymentSucceeded: SaudiRiyal,
    SessionReminder: Bell,
    SessionStartingSoon: Sparkles,
    FeedbackReceived: Star,
}

const TONE_BY_TYPE: Record<NotificationType, string> = {
    NewQualifiedRequest: 'bg-primary/10 text-primary dark:bg-secondary/15 dark:text-secondary',
    OfferViewed: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    OfferAccepted: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300',
    OfferRejected: 'bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300',
    OfferAutoRejected: 'bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300',
    NewMessage: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300',
    NewEnrollmentRequest: 'bg-primary/10 text-primary dark:bg-secondary/15 dark:text-secondary',
    EnrollmentApproved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300',
    PaymentSucceeded: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300',
    SessionReminder: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300',
    SessionStartingSoon: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300',
    FeedbackReceived: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300',
}

const PREVIEW_LIMIT = 5

const formatRelative = (iso: string, t: (k: string, opts?: any) => string): string => {
    const ms = Date.now() - new Date(iso).getTime()
    if (ms < 60_000) return t('requests.relative.now')
    const minutes = Math.floor(ms / 60_000)
    if (minutes < 60) return t('requests.relative.hoursAgo', { count: 1 })
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return t('requests.relative.hoursAgo', { count: hours })
    const days = Math.floor(hours / 24)
    return t('requests.relative.daysAgo', { count: days })
}

interface PreviewItemProps {
    notification: AppNotification
    onActivate: (id: number) => void
    onClose: () => void
}

const PreviewItem: React.FC<PreviewItemProps> = ({ notification, onActivate, onClose }) => {
    const { t } = useTranslation('teacher')
    const locale = useLocale()
    const isAr = locale === 'ar'
    const Icon = ICON_BY_TYPE[notification.type]
    const tone = TONE_BY_TYPE[notification.type]
    const isUnread = notification.readAt === null

    const handleClick = () => {
        if (isUnread) onActivate(notification.id)
        onClose()
    }

    const inner = (
        <>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${tone}`}>
                <Icon size={16} />
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                    <h4 className={`text-xs leading-snug ${isUnread ? 'font-black text-slate-800 dark:text-white' : 'font-bold text-slate-600 dark:text-slate-300'}`}>
                        {isAr ? notification.titleAr : notification.titleEn}
                    </h4>
                    {isUnread && <span className="mt-1 w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                    {isAr ? notification.bodyAr : notification.bodyEn}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                    {formatRelative(notification.createdAt, t)}
                </p>
            </div>
        </>
    )

    const baseClass = `flex items-start gap-3 px-4 py-3 text-start transition-colors ${isUnread
        ? 'bg-primary/5 dark:bg-secondary/10 hover:bg-primary/10 dark:hover:bg-secondary/15'
        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
        }`

    if (notification.link) {
        return (
            <Link {...(notification.link as any)} onClick={handleClick} className={baseClass}>
                {inner}
            </Link>
        )
    }
    return (
        <button type="button" onClick={handleClick} className={`${baseClass} w-full`}>
            {inner}
        </button>
    )
}

export const NotificationsDropdown: React.FC = () => {
    const { t } = useTranslation('teacher')
    const queryClient = useQueryClient()
    const [open, setOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement | null>(null)

    const listQuery = useQuery(notificationsListQueryOptions('all'))

    const readMutation = useMutation({
        mutationFn: (id: number) => markNotificationAsRead(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
    })

    const readAllMutation = useMutation({
        mutationFn: () => markAllNotificationsAsRead(),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
    })

    const unread = listQuery.data?.counts.unread ?? 0
    const items = listQuery.data?.items ?? []
    const preview = items.slice(0, PREVIEW_LIMIT)

    // Close on Escape and on outside click.
    useEffect(() => {
        if (!open) return
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false)
        }
        const onClick = (e: MouseEvent) => {
            if (!containerRef.current) return
            if (!containerRef.current.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener('keydown', onKey)
        document.addEventListener('mousedown', onClick)
        return () => {
            document.removeEventListener('keydown', onKey)
            document.removeEventListener('mousedown', onClick)
        }
    }, [open])

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={open}
                aria-label={t('notifications.heading')}
                className="relative p-2 text-slate-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 dark:focus-visible:ring-secondary/40"
            >
                <Bell size={20} strokeWidth={2} />
                {unread > 0 && (
                    <span className="absolute -top-0.5 -end-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-black text-white bg-rose-500 rounded-full border-2 border-white dark:border-slate-900">
                        {unread > 9 ? '9+' : unread}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        role="menu"
                        className="absolute top-full mt-2 end-0 w-80 sm:w-96 max-w-[calc(100vw-1rem)] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden"
                    >
                        <header className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="text-sm font-black text-slate-800 dark:text-white">
                                {t('notifications.heading')}
                            </h3>
                            <button
                                type="button"
                                onClick={() => readAllMutation.mutate()}
                                disabled={unread === 0 || readAllMutation.isPending}
                                className="flex items-center gap-1.5 text-[11px] font-bold text-primary dark:text-secondary hover:underline disabled:opacity-40 disabled:no-underline disabled:cursor-not-allowed"
                            >
                                {readAllMutation.isPending ? (
                                    <Loader2 size={12} className="animate-spin" />
                                ) : (
                                    <CheckCheck size={12} />
                                )}
                                {t('notifications.markAllRead')}
                            </button>
                        </header>

                        <div className="max-h-96 overflow-y-auto custom-scrollbar">
                            {listQuery.isLoading ? (
                                <div className="flex items-center justify-center py-10">
                                    <Loader2 size={20} className="animate-spin text-slate-400" />
                                </div>
                            ) : listQuery.isError ? (
                                <div className="px-4 py-8 text-center text-xs font-bold text-rose-600 dark:text-rose-400">
                                    {t('notifications.error')}
                                </div>
                            ) : preview.length === 0 ? (
                                <div className="px-4 py-10 text-center">
                                    <Bell size={32} className="text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                        {t('notifications.empty.all')}
                                    </p>
                                </div>
                            ) : (
                                <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {preview.map((n) => (
                                        <li key={n.id}>
                                            <PreviewItem
                                                notification={n}
                                                onActivate={(id) => readMutation.mutate(id)}
                                                onClose={() => setOpen(false)}
                                            />
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <footer className="border-t border-slate-100 dark:border-slate-800">
                            <Link
                                to="/teacher/notifications"
                                onClick={() => setOpen(false)}
                                className="block px-4 py-3 text-center text-xs font-bold text-primary dark:text-secondary hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                            >
                                {t('notifications.dropdown.viewAll')}
                            </Link>
                        </footer>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

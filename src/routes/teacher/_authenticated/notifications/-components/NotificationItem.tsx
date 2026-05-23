import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import {
    Inbox,
    Eye,
    CheckCircle2,
    XCircle,
    MessageSquare,
    SaudiRiyal,
    Bell,
    Star,
    UserPlus,
    Sparkles,
    LucideIcon,
} from 'lucide-react'

import { useLocale } from '@/lib/hooks/useLocale'
import type { AppNotification, NotificationType } from '../-types/types'

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

const formatRelative = (iso: string, locale: string, t: (k: string, opts?: any) => string): string => {
    const ms = Date.now() - new Date(iso).getTime()
    if (ms < 60_000) return t('requests.relative.now')
    const minutes = Math.floor(ms / 60_000)
    if (minutes < 60) return t('requests.relative.hoursAgo', { count: 1 })
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return t('requests.relative.hoursAgo', { count: hours })
    const days = Math.floor(hours / 24)
    return t('requests.relative.daysAgo', { count: days })
    void locale
}

interface NotificationItemProps {
    notification: AppNotification
    index: number
    onActivate: (id: number) => void
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ notification, index, onActivate }) => {
    const { t } = useTranslation('teacher')
    const locale = useLocale()
    const isAr = locale === 'ar'
    const Icon = ICON_BY_TYPE[notification.type]
    const tone = TONE_BY_TYPE[notification.type]
    const isUnread = notification.readAt === null

    const innerContent = (
        <>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${tone}`}>
                <Icon size={18} />
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                    <h3 className={`text-sm leading-snug ${isUnread ? 'font-black text-slate-800 dark:text-white' : 'font-bold text-slate-600 dark:text-slate-300'}`}>
                        {isAr ? notification.titleAr : notification.titleEn}
                    </h3>
                    {isUnread && <span className="mt-1.5 w-2 h-2 rounded-full bg-rose-500 shrink-0" />}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                    {isAr ? notification.bodyAr : notification.bodyEn}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                    {formatRelative(notification.createdAt, locale, t)}
                </p>
            </div>
        </>
    )

    const baseClass = `flex items-start gap-3 p-4 rounded-2xl border transition-all ${isUnread
        ? 'bg-white dark:bg-slate-900 border-primary/30 dark:border-secondary/30 hover:border-primary dark:hover:border-secondary shadow-sm'
        : 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/80'
        }`

    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
        >
            {notification.link ? (
                <Link
                    {...(notification.link as any)}
                    onClick={() => onActivate(notification.id)}
                    className={baseClass}
                >
                    {innerContent}
                </Link>
            ) : (
                <button
                    type="button"
                    onClick={() => onActivate(notification.id)}
                    className={`${baseClass} text-start w-full`}
                >
                    {innerContent}
                </button>
            )}
        </motion.div>
    )
}

import React from 'react'
import { useTranslation } from 'react-i18next'
import { BookOpen, Users, CalendarClock, CheckCircle2, XCircle, TrendingUp, Wallet } from 'lucide-react'
import { useLocale } from '@/lib/hooks/useLocale'
import type { Statistics } from '../-types/types'

export const StatsGrid: React.FC<{ stats: Statistics }> = ({ stats }) => {
    const { t } = useTranslation('teacher')
    const locale = useLocale()
    const nf = new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US')

    const items: { icon: React.ReactNode; label: string; value: string }[] = [
        { icon: <BookOpen size={18} />, label: t('profile.stats.courses'), value: nf.format(stats.coursesCount) },
        { icon: <Users size={18} />, label: t('profile.stats.students'), value: nf.format(stats.studentsCount) },
        { icon: <CalendarClock size={18} />, label: t('profile.stats.sessions'), value: nf.format(stats.sessionsCount) },
        { icon: <CheckCircle2 size={18} />, label: t('profile.stats.acceptedRequests'), value: nf.format(stats.acceptedRequests) },
        { icon: <XCircle size={18} />, label: t('profile.stats.rejectedRequests'), value: nf.format(stats.rejectedRequests) },
        { icon: <TrendingUp size={18} />, label: t('profile.stats.completionRate'), value: `${Math.round(stats.completionRate * 100)}%` },
        {
            icon: <Wallet size={18} />,
            label: t('profile.stats.totalEarnings'),
            value: `${nf.format(stats.totalEarnings)} ${t('profile.stats.currency')}`,
        },
    ]

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            {items.map((it) => (
                <div
                    key={it.label}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4"
                >
                    <div className="w-9 h-9 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center mb-2">
                        {it.icon}
                    </div>
                    <p className="text-xl font-black text-slate-800 dark:text-white">{it.value}</p>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{it.label}</p>
                </div>
            ))}
        </div>
    )
}

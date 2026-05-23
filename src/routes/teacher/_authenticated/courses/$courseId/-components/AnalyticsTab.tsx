import React from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Loader2, Users, CheckCircle2, PlayCircle, SaudiRiyal, Star, TrendingUp } from 'lucide-react'

import { useLocale } from '@/lib/hooks/useLocale'
import { courseAnalyticsQueryOptions } from '../-queries/courseDetailExtrasQueries'

export const AnalyticsTab: React.FC<{ courseId: number }> = ({ courseId }) => {
    const { t } = useTranslation('teacher')
    const locale = useLocale()
    const query = useQuery(courseAnalyticsQueryOptions(courseId))

    if (query.isLoading) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-12 flex justify-center text-slate-400">
                <Loader2 size={28} className="animate-spin" />
            </div>
        )
    }
    if (query.isError || !query.data) {
        return (
            <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 rounded-2xl p-6 text-center text-sm font-bold">
                {t('courseDetail.active.error')}
            </div>
        )
    }
    const a = query.data
    const maxTrend = Math.max(1, ...a.enrollmentTrend.map((p) => p.count))

    return (
        <section className="space-y-5">
            <header>
                <h2 className="text-base font-bold text-slate-800 dark:text-white">
                    {t('courseDetail.analytics.title')}
                </h2>
            </header>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                <KpiCard icon={<Users size={18} />} label={t('courseDetail.analytics.totalEnrollments')} value={a.totalEnrollments} tone="primary" />
                <KpiCard icon={<PlayCircle size={18} />} label={t('courseDetail.analytics.activeEnrollments')} value={a.activeEnrollments} tone="blue" />
                <KpiCard icon={<CheckCircle2 size={18} />} label={t('courseDetail.analytics.completedEnrollments')} value={a.completedEnrollments} tone="emerald" />
                <KpiCard
                    icon={<SaudiRiyal size={18} />}
                    label={t('courseDetail.analytics.totalRevenue')}
                    value={
                        <span className="inline-flex items-center gap-1">
                            {a.totalRevenue.toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-US')}
                            <SaudiRiyal size={14} />
                        </span>
                    }
                    tone="primary"
                />
                <KpiCard
                    icon={<Star size={18} />}
                    label={t('courseDetail.analytics.averageRating')}
                    value={a.averageRating ? `${a.averageRating} / 5` : t('courseDetail.analytics.noRating')}
                    tone="amber"
                />
                <KpiCard
                    icon={<CheckCircle2 size={18} />}
                    label={t('courseDetail.analytics.completionRate')}
                    value={`${Math.round(a.completionRate * 100)}%`}
                    tone="emerald"
                />
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp size={16} className="text-primary dark:text-secondary" />
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                        {t('courseDetail.analytics.trendTitle')}
                    </h3>
                </div>
                <div className="flex items-end gap-3 h-32">
                    {a.enrollmentTrend.map((p, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                            <div
                                className="w-full bg-gradient-to-t from-primary to-secondary rounded-t-md"
                                style={{ height: `${(p.count / maxTrend) * 100}%` }}
                            />
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                                {new Date(p.date).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short' })}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

const TONES: Record<string, string> = {
    primary: 'bg-primary/10 dark:bg-secondary/15 text-primary dark:text-secondary',
    blue: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-300',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-300',
    amber: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-300',
}

const KpiCard: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode; tone: keyof typeof TONES }> = ({ icon, label, value, tone }) => (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 flex items-center gap-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${TONES[tone]}`}>
            {icon}
        </div>
        <div>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</p>
            <p className="text-lg font-black text-slate-800 dark:text-white mt-0.5">{value}</p>
        </div>
    </div>
)

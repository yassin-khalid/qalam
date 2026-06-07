import React from 'react'
import { useTranslation } from 'react-i18next'
import { Star } from 'lucide-react'
import { useLocale } from '@/lib/hooks/useLocale'
import type { Ratings } from '../-types/types'
import { SectionCard, StarRating, pickLocalized } from './shared'

const formatDate = (iso: string, locale: string) =>
    new Date(iso).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-GB', { dateStyle: 'medium' })

export const RatingsCard: React.FC<{ ratings: Ratings }> = ({ ratings }) => {
    const { t } = useTranslation('teacher')
    const locale = useLocale()

    return (
        <SectionCard icon={<Star size={18} />} title={t('profile.sections.ratings')}>
            <div className="space-y-4">
                {/* Summary */}
                <div className="flex flex-wrap items-center gap-6 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4">
                    <div className="text-center">
                        <p className="text-3xl font-black text-slate-800 dark:text-white">
                            {ratings.average.toFixed(1)}
                        </p>
                        <StarRating value={ratings.average} />
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-300 space-y-0.5">
                        <p>{t('profile.ratings.count', { count: ratings.count })}</p>
                        <p>{t('profile.ratings.students', { count: ratings.studentsCount })}</p>
                    </div>
                </div>

                {/* Reviews */}
                {ratings.reviews.length === 0 ? (
                    <p className="text-sm text-slate-400">{t('profile.ratings.empty')}</p>
                ) : (
                    <ul className="space-y-3">
                        {ratings.reviews.map((r) => (
                            <li key={r.id} className="rounded-xl border border-slate-100 dark:border-slate-800 p-4">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="text-sm font-bold text-slate-800 dark:text-white">
                                        {pickLocalized(r.studentName, locale)}
                                    </p>
                                    <StarRating value={r.rating} size={14} />
                                </div>
                                {r.comment && (
                                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1.5">
                                        {pickLocalized(r.comment, locale)}
                                    </p>
                                )}
                                <p className="text-xs text-slate-400 mt-2">{formatDate(r.date, locale)}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </SectionCard>
    )
}

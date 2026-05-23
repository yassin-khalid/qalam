import React from 'react'
import { useTranslation } from 'react-i18next'
import { Star, User as UserIcon } from 'lucide-react'
import { useLocale } from '@/lib/hooks/useLocale'
import type { SessionDetail } from '../../-types/types'

export const FeedbackTab: React.FC<{ session: SessionDetail }> = ({ session }) => {
    const { t } = useTranslation('teacher')
    const locale = useLocale()

    if (session.feedback.length === 0) {
        return (
            <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-8 text-center">
                <Star size={32} className="text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {t('sessions.detail.feedback.empty')}
                </p>
            </section>
        )
    }

    return (
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 space-y-4">
            <header>
                <h2 className="text-base font-bold text-slate-800 dark:text-white">
                    {t('sessions.detail.feedback.title')}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {t('sessions.detail.feedback.subtitle')}
                </p>
            </header>

            <ul className="space-y-3">
                {session.feedback.map((fb) => (
                    <li
                        key={fb.studentId}
                        className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800"
                    >
                        <div className="flex items-center justify-between gap-3 mb-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500">
                                    <UserIcon size={15} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                                        {fb.studentName}
                                    </p>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                        {t('sessions.detail.feedback.submittedAt', {
                                            when: new Date(fb.submittedAt).toLocaleDateString(
                                                locale === 'ar' ? 'ar-EG' : 'en-US',
                                                { day: 'numeric', month: 'short', year: 'numeric' },
                                            ),
                                        })}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 text-amber-500 font-bold">
                                {Array.from({ length: 5 }, (_, i) => (
                                    <Star
                                        key={i}
                                        size={14}
                                        className={i < fb.rating ? 'fill-amber-500' : 'text-slate-300 dark:text-slate-700'}
                                    />
                                ))}
                                <span className="text-xs text-slate-600 dark:text-slate-300 ms-1">
                                    {t('sessions.detail.feedback.rating', { rating: fb.rating })}
                                </span>
                            </div>
                        </div>
                        {fb.comment && (
                            <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap">
                                {fb.comment}
                            </p>
                        )}
                    </li>
                ))}
            </ul>
        </section>
    )
}

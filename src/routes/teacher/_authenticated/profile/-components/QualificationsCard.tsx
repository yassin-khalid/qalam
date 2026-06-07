import React from 'react'
import { useTranslation } from 'react-i18next'
import { GraduationCap, Award } from 'lucide-react'
import { useLocale } from '@/lib/hooks/useLocale'
import type { Qualifications } from '../-types/types'
import { SectionCard, pickLocalized } from './shared'

export const QualificationsCard: React.FC<{ qualifications: Qualifications }> = ({ qualifications }) => {
    const { t } = useTranslation('teacher')
    const locale = useLocale()
    const { certificates, trainingCourses } = qualifications

    return (
        <SectionCard icon={<GraduationCap size={18} />} title={t('profile.sections.qualifications')}>
            <div className="space-y-5">
                {/* Degrees */}
                <div>
                    <h3 className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">
                        {t('profile.qualifications.degreesTitle')}
                    </h3>
                    {certificates.length === 0 ? (
                        <p className="text-sm text-slate-400">{t('profile.qualifications.empty')}</p>
                    ) : (
                        <ul className="space-y-2">
                            {certificates.map((c) => (
                                <li
                                    key={c.id}
                                    className="flex items-start gap-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3"
                                >
                                    <GraduationCap size={18} className="text-secondary mt-0.5 shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-slate-800 dark:text-white">
                                            {pickLocalized(c.qualification, locale)} — {pickLocalized(c.specialization, locale)}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {pickLocalized(c.institution, locale)} · {c.graduationYear}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Training courses */}
                {trainingCourses.length > 0 && (
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">
                            {t('profile.qualifications.coursesTitle')}
                        </h3>
                        <ul className="space-y-2">
                            {trainingCourses.map((c) => (
                                <li
                                    key={c.id}
                                    className="flex items-start gap-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3"
                                >
                                    <Award size={18} className="text-secondary mt-0.5 shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-slate-800 dark:text-white">
                                            {pickLocalized(c.name, locale)}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {pickLocalized(c.provider, locale)} · {c.year}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </SectionCard>
    )
}

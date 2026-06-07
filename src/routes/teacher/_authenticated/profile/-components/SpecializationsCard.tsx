import React from 'react'
import { useTranslation } from 'react-i18next'
import { Layers, BookMarked } from 'lucide-react'
import { useLocale } from '@/lib/hooks/useLocale'
import type { Specialization } from '../-types/types'
import { Pill, SectionCard, pickLocalized } from './shared'

export const SpecializationsCard: React.FC<{ specializations: Specialization[] }> = ({ specializations }) => {
    const { t } = useTranslation('teacher')
    const locale = useLocale()

    return (
        <SectionCard icon={<Layers size={18} />} title={t('profile.sections.specializations')}>
            {specializations.length === 0 ? (
                <p className="text-sm text-slate-400">{t('profile.specializations.empty')}</p>
            ) : (
                <ul className="space-y-3">
                    {specializations.map((s) => (
                        <li key={s.id} className="rounded-xl border border-slate-100 dark:border-slate-800 p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <BookMarked size={18} className="text-secondary shrink-0" />
                                <p className="text-sm font-bold text-slate-800 dark:text-white">
                                    {pickLocalized(s.subject, locale)}
                                </p>
                                <Pill tone="primary">{t(`profile.specializations.domains.${s.domain}`)}</Pill>
                            </div>

                            <div className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                                {s.curriculum && (
                                    <span>
                                        {t('profile.specializations.curriculum')}: {pickLocalized(s.curriculum, locale)}
                                    </span>
                                )}
                                {s.stage && (
                                    <span>· {t('profile.specializations.stage')}: {pickLocalized(s.stage, locale)}</span>
                                )}
                                {s.grade && (
                                    <span>· {t('profile.specializations.grade')}: {pickLocalized(s.grade, locale)}</span>
                                )}
                            </div>

                            <div className="mt-3 flex flex-wrap gap-1.5">
                                {s.units.length === 0 ? (
                                    <Pill>{t('profile.specializations.fullSubject')}</Pill>
                                ) : (
                                    s.units.map((u, i) => <Pill key={i}>{pickLocalized(u, locale)}</Pill>)
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </SectionCard>
    )
}

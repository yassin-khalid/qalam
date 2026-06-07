import React from 'react'
import { useTranslation } from 'react-i18next'
import { MonitorPlay, MapPin, Users, User } from 'lucide-react'
import { useLocale } from '@/lib/hooks/useLocale'
import type { ServiceArea, TeachingPatterns } from '../-types/types'
import { Pill, SectionCard, pickLocalized } from './shared'

export const TeachingCard: React.FC<{ teaching: TeachingPatterns; serviceAreas: ServiceArea[] }> = ({
    teaching,
    serviceAreas,
}) => {
    const { t } = useTranslation('teacher')
    const locale = useLocale()
    const supportsInPerson = teaching.modes.includes('InPerson')

    return (
        <SectionCard icon={<MonitorPlay size={18} />} title={t('profile.sections.teaching')}>
            <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs font-semibold text-slate-400 mb-2">{t('profile.teaching.mode')}</p>
                        <div className="flex flex-wrap gap-1.5">
                            {teaching.modes.map((m) => (
                                <Pill key={m} tone="primary">
                                    {m === 'Online' ? <MonitorPlay size={13} className="me-1" /> : <MapPin size={13} className="me-1" />}
                                    {t(`profile.teaching.${m === 'Online' ? 'online' : 'inPerson'}`)}
                                </Pill>
                            ))}
                        </div>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-400 mb-2">{t('profile.teaching.sessionType')}</p>
                        <div className="flex flex-wrap gap-1.5">
                            {teaching.sessionTypes.map((s) => (
                                <Pill key={s} tone="primary">
                                    {s === 'Individual' ? <User size={13} className="me-1" /> : <Users size={13} className="me-1" />}
                                    {t(`profile.teaching.${s === 'Individual' ? 'individual' : 'group'}`)}
                                </Pill>
                            ))}
                        </div>
                    </div>
                </div>

                {/* §7 — only when in-person teaching is supported (BR-005) */}
                {supportsInPerson && (
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                        <p className="text-xs font-semibold text-slate-400 mb-2">{t('profile.serviceAreas.title')}</p>
                        {serviceAreas.length === 0 ? (
                            <p className="text-sm text-slate-400">{t('profile.serviceAreas.empty')}</p>
                        ) : (
                            <ul className="space-y-2">
                                {serviceAreas.map((a) => (
                                    <li
                                        key={a.id}
                                        className="flex items-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3 text-sm"
                                    >
                                        <MapPin size={16} className="text-secondary shrink-0" />
                                        <span className="font-bold text-slate-800 dark:text-white">
                                            {pickLocalized(a.district, locale)}
                                        </span>
                                        <span className="text-slate-500 dark:text-slate-400">
                                            · {pickLocalized(a.region, locale)} · {pickLocalized(a.city, locale)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </div>
        </SectionCard>
    )
}

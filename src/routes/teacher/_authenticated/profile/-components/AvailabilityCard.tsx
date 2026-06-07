import React from 'react'
import { useTranslation } from 'react-i18next'
import { CalendarClock, CalendarX } from 'lucide-react'
import { useLocale } from '@/lib/hooks/useLocale'
import type { Availability, Weekday } from '../-types/types'
import { Pill, SectionCard, pickLocalized } from './shared'

const formatDate = (iso: string, locale: string) =>
    new Date(iso).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-GB', { day: 'numeric', month: 'short' })

export const AvailabilityCard: React.FC<{ availability: Availability }> = ({ availability }) => {
    const { t } = useTranslation('teacher')
    const locale = useLocale()
    const weekDays = t('common.weekDaysShort', { returnObjects: true }) as string[]

    // Order Sun..Sat; keep only days that have slots configured.
    const byWeekday = new Map<Weekday, Availability['week'][number]>()
    for (const d of availability.week) byWeekday.set(d.weekday, d)
    const orderedDays = ([0, 1, 2, 3, 4, 5, 6] as Weekday[])
        .map((wd) => byWeekday.get(wd))
        .filter((d): d is Availability['week'][number] => !!d && d.slots.length > 0)

    const statusTone =
        availability.status === 'Available'
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
            : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'

    return (
        <SectionCard
            icon={<CalendarClock size={18} />}
            title={t('profile.sections.availability')}
            action={
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${statusTone}`}>
                    {t(`profile.availability.status.${availability.status}`)}
                </span>
            }
        >
            <div className="space-y-5">
                {/* Weekly schedule */}
                <div>
                    <h3 className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">
                        {t('profile.availability.weeklyTitle')}
                    </h3>
                    {orderedDays.length === 0 ? (
                        <p className="text-sm text-slate-400">{t('profile.availability.noSlots')}</p>
                    ) : (
                        <ul className="space-y-2">
                            {orderedDays.map((d) => (
                                <li
                                    key={d.weekday}
                                    className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3"
                                >
                                    <span className="w-16 text-sm font-bold text-slate-800 dark:text-white shrink-0">
                                        {weekDays[d.weekday]}
                                    </span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {d.slots.map((s) => (
                                            <Pill key={s.id}>
                                                <span dir="ltr">
                                                    {s.start} – {s.end}
                                                </span>
                                            </Pill>
                                        ))}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Exceptions / leaves */}
                {availability.exceptions.length > 0 && (
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">
                            {t('profile.availability.exceptionsTitle')}
                        </h3>
                        <ul className="space-y-2">
                            {availability.exceptions.map((ex) => (
                                <li
                                    key={ex.id}
                                    className="flex items-start gap-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 p-3"
                                >
                                    <CalendarX size={18} className="text-amber-500 mt-0.5 shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-slate-800 dark:text-white">
                                            {formatDate(ex.fromDate, locale)} – {formatDate(ex.toDate, locale)}
                                        </p>
                                        {ex.reason && (
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {pickLocalized(ex.reason, locale)}
                                            </p>
                                        )}
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

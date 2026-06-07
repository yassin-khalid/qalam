import React from 'react'
import { useTranslation } from 'react-i18next'
import { Mail, MapPin, Phone, CalendarDays, Pencil } from 'lucide-react'
import { useLocale } from '@/lib/hooks/useLocale'
import type { TeacherProfile } from '../-types/types'
import { Pill, StatusBadge, pickLocalized } from './shared'

const formatDate = (iso: string, locale: string) =>
    new Date(iso).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-GB', {
        year: 'numeric',
        month: 'long',
    })

export const ProfileHeader: React.FC<{ profile: TeacherProfile }> = ({ profile }) => {
    const { t } = useTranslation('teacher')
    const locale = useLocale()
    const { basic, professional, status } = profile

    const fullName = `${pickLocalized(basic.firstName, locale)} ${pickLocalized(basic.lastName, locale)}`.trim()
    const initials = pickLocalized(basic.firstName, locale).charAt(0) || '؟'

    return (
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-primary to-secondary dark:from-secondary dark:to-primary" />
            <div className="px-5 pb-5 -mt-12">
                <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                    {/* Avatar */}
                    <div className="w-24 h-24 rounded-2xl bg-white dark:bg-slate-800 border-4 border-white dark:border-slate-900 shadow-lg flex items-center justify-center overflow-hidden shrink-0">
                        {basic.avatarUrl ? (
                            <img src={basic.avatarUrl} alt={fullName} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-3xl font-black text-primary dark:text-secondary">{initials}</span>
                        )}
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-2xl font-black text-slate-800 dark:text-white truncate">{fullName}</h1>
                            <StatusBadge status={status} label={t(`profile.status.${status}`)} />
                        </div>
                        <p className="text-sm font-bold text-secondary mt-0.5">
                            {pickLocalized(professional.jobTitle, locale)}
                        </p>
                    </div>

                    <button
                        type="button"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary dark:bg-secondary text-white px-4 py-2.5 text-sm font-bold hover:opacity-90 transition-opacity shrink-0"
                    >
                        <Pencil size={16} />
                        {t('profile.edit')}
                    </button>
                </div>

                {/* Meta row */}
                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600 dark:text-slate-300">
                    <span className="inline-flex items-center gap-1.5">
                        <MapPin size={15} className="text-slate-400" />
                        {pickLocalized(basic.city, locale)}، {pickLocalized(basic.country, locale)}
                    </span>
                    <span className="inline-flex items-center gap-1.5" dir="ltr">
                        <Phone size={15} className="text-slate-400" />
                        {basic.mobile}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <Mail size={15} className="text-slate-400" />
                        {basic.email}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <CalendarDays size={15} className="text-slate-400" />
                        {t('profile.header.memberSince', { date: formatDate(profile.joinedAt, locale) })}
                    </span>
                </div>

                {/* Languages */}
                {professional.languages.length > 0 && (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-slate-400">{t('profile.about.languagesLabel')}:</span>
                        {professional.languages.map((lng) => (
                            <Pill key={lng} tone="primary">
                                {t(`profile.languages.${lng}`)}
                            </Pill>
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}

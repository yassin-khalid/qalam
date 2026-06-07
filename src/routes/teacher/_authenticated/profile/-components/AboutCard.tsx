import React from 'react'
import { useTranslation } from 'react-i18next'
import { UserRound } from 'lucide-react'
import { useLocale } from '@/lib/hooks/useLocale'
import type { BasicInfo, ProfessionalInfo } from '../-types/types'
import { Field, SectionCard, pickLocalized } from './shared'

const formatDate = (iso: string, locale: string) =>
    new Date(iso).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-GB', { dateStyle: 'medium' })

export const AboutCard: React.FC<{ basic: BasicInfo; professional: ProfessionalInfo }> = ({
    basic,
    professional,
}) => {
    const { t } = useTranslation('teacher')
    const locale = useLocale()

    return (
        <SectionCard icon={<UserRound size={18} />} title={t('profile.sections.about')}>
            <div className="space-y-4">
                <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200 whitespace-pre-line">
                    {pickLocalized(professional.bio, locale)}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <Field
                        label={t('profile.about.yearsOfExperience')}
                        value={t('profile.about.yearsValue', { count: professional.yearsOfExperience })}
                    />
                    <Field label={t('profile.basic.gender')} value={t(`profile.basic.${basic.gender === 'Male' ? 'male' : 'female'}`)} />
                    <Field label={t('profile.basic.birthDate')} value={formatDate(basic.birthDate, locale)} />
                    <Field label={t('profile.basic.nationality')} value={pickLocalized(basic.nationality, locale)} />
                    <Field label={t('profile.basic.country')} value={pickLocalized(basic.country, locale)} />
                    <Field label={t('profile.basic.city')} value={pickLocalized(basic.city, locale)} />
                </div>
            </div>
        </SectionCard>
    )
}

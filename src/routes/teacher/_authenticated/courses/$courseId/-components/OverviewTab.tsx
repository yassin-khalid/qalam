import React from 'react'
import { useTranslation } from 'react-i18next'
import { SaudiRiyal, Clock, BookOpen, Video, MapPin, Users, Layers } from 'lucide-react'
import { useLocale } from '@/lib/hooks/useLocale'
import type { CourseDetail } from '../../-queries/courseDetailQueryOptions'

interface OverviewTabProps {
    detail: CourseDetail
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ detail }) => {
    const { t } = useTranslation('teacher')
    const locale = useLocale()
    const isAr = locale === 'ar'

    const statusLabel = (() => {
        const s = typeof detail.status === 'string' ? detail.status.toLowerCase() : detail.status
        if (s === 2 || s === 'published') return t('courseDetail.overview.statusPublished')
        if (s === 1 || s === 'draft') return t('courseDetail.overview.statusDraft')
        if (s === 3 || s === 'archived' || s === 'inactive') return t('courseDetail.overview.statusArchived')
        return ''
    })()

    return (
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 space-y-5">
            <header className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-base font-bold text-slate-800 dark:text-white">
                    {t('courseDetail.overview.title')}
                </h2>
                {statusLabel && (
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300">
                        {statusLabel}
                    </span>
                )}
            </header>

            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Row icon={<BookOpen size={14} />} label={t('courseDetail.overview.subject')}>
                    {isAr ? detail.subjectNameAr ?? detail.subjectNameEn ?? '—' : detail.subjectNameEn ?? '—'}
                </Row>
                <Row icon={<Layers size={14} />} label={t('courseDetail.overview.domain')}>
                    {isAr ? detail.domainNameAr ?? detail.domainNameEn ?? '—' : detail.domainNameEn ?? '—'}
                </Row>
                <Row icon={<Clock size={14} />} label={t('courseDetail.overview.sessionsCount')}>
                    {detail.sessionsCount ?? detail.sessions?.length ?? 0}
                </Row>
                <Row icon={<Clock size={14} />} label={t('courseDetail.overview.durationLabel')}>
                    {detail.sessionDurationMinutes != null
                        ? `${detail.sessionDurationMinutes} ${t('sessions.list.durationMinutes', { count: detail.sessionDurationMinutes }).replace(/\d+\s*/, '')}`
                        : '—'}
                </Row>
                <Row icon={detail.teachingModeNameEn?.toLowerCase() === 'online' ? <Video size={14} /> : <MapPin size={14} />} label={t('requests.detail.sessions.sessionLabel', { number: '' }).split(' ')[0]}>
                    {(isAr ? detail.teachingModeNameAr : detail.teachingModeNameEn) ?? '—'}
                </Row>
                <Row icon={<Users size={14} />} label={t('courseDetail.overview.sessionTypeIndividual').split(' ')[0]}>
                    {(isAr ? detail.sessionTypeNameAr : detail.sessionTypeNameEn) ?? '—'}
                </Row>
                <Row icon={<SaudiRiyal size={14} />} label={t('courseDetail.overview.priceLabel')}>
                    <span className="text-base font-black text-primary dark:text-secondary inline-flex items-center gap-1">
                        {detail.price}
                        <SaudiRiyal size={14} />
                    </span>
                </Row>
                <Row icon={<Layers size={14} />} label={t('courseDetail.overview.statusBadge')}>
                    {detail.isFlexible
                        ? t('courseDetail.overview.typeFlexible')
                        : t('courseDetail.overview.typeFixed')}
                </Row>
            </dl>

            <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                    {t('courseDetail.overview.descriptionLabel')}
                </p>
                <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap bg-slate-50 dark:bg-slate-800/40 rounded-lg p-3">
                    {detail.description ?? t('courseDetail.overview.noDescription')}
                </p>
            </div>
        </section>
    )
}

const Row: React.FC<{ icon: React.ReactNode; label: string; children: React.ReactNode }> = ({ icon, label, children }) => (
    <div>
        <dt className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <span className="text-primary dark:text-secondary">{icon}</span>
            {label}
        </dt>
        <dd className="text-sm text-slate-700 dark:text-slate-200 mt-1">{children}</dd>
    </div>
)

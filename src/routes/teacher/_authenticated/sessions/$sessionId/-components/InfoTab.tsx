import React from 'react'
import { useTranslation } from 'react-i18next'
import { Calendar, Clock, Video, MapPin, Users, BookOpen, FileText } from 'lucide-react'
import { useLocale } from '@/lib/hooks/useLocale'
import type { SessionDetail } from '../../-types/types'

export const InfoTab: React.FC<{ session: SessionDetail }> = ({ session }) => {
    const { t } = useTranslation('teacher')
    const locale = useLocale()
    const isAr = locale === 'ar'

    const start = new Date(session.startsAt)

    return (
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 space-y-5">
            <header>
                <h2 className="text-base font-bold text-slate-800 dark:text-white">
                    {t('sessions.detail.info.title')}
                </h2>
            </header>

            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Row icon={<FileText size={14} />} label={t('sessions.detail.info.courseTitle')}>
                    <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-white">{session.courseTitle}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{session.sourceLabel}</p>
                    </div>
                </Row>

                <Row icon={<Calendar size={14} />} label={t('sessions.detail.info.startsAt')}>
                    {start.toLocaleString(isAr ? 'ar-EG' : 'en-US', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </Row>

                <Row icon={<Clock size={14} />} label={t('sessions.detail.info.duration')}>
                    {t('sessions.list.durationMinutes', { count: session.durationMinutes })}
                </Row>

                <Row
                    icon={session.teachingMode === 'Online' ? <Video size={14} /> : <MapPin size={14} />}
                    label={t('sessions.detail.info.mode')}
                >
                    {session.teachingMode === 'Online'
                        ? t('sessions.card.teachingOnline')
                        : t('sessions.card.teachingInPerson')}
                </Row>

                <Row icon={<Users size={14} />} label={t('sessions.detail.info.type')}>
                    {session.sessionType === 'Individual'
                        ? t('sessions.card.individual')
                        : t('sessions.card.group', { count: session.studentsCount })}
                </Row>

                <Row icon={<Users size={14} />} label={t('sessions.detail.info.students')}>
                    {session.studentsCount}
                </Row>
            </dl>

            {session.unitNames.length > 0 && (
                <div>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                        <BookOpen size={13} className="text-primary dark:text-secondary" />
                        {t('sessions.detail.info.units')}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {session.unitNames.map((u) => (
                            <span key={u} className="bg-primary/10 dark:bg-secondary/15 text-primary dark:text-secondary px-2.5 py-1 rounded-md text-xs font-bold">
                                {u}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                    {t('sessions.detail.info.description')}
                </p>
                <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap bg-slate-50 dark:bg-slate-800/40 rounded-lg p-3">
                    {session.description ?? t('sessions.detail.info.noDescription')}
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

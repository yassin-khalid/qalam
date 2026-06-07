import React from 'react'
import { useTranslation } from 'react-i18next'
import { FileText, ShieldCheck, Clock, XCircle } from 'lucide-react'
import { useLocale } from '@/lib/hooks/useLocale'
import { DocumentStatus, type TeacherDocument } from '../-types/types'
import { SectionCard, pickLocalized } from './shared'

const STATUS_TONE: Record<DocumentStatus, string> = {
    Approved: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300',
    PendingReview: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300',
    Rejected: 'text-rose-600 bg-rose-100 dark:bg-rose-900/30 dark:text-rose-300',
}

const STATUS_ICON: Record<DocumentStatus, React.ReactNode> = {
    Approved: <ShieldCheck size={14} />,
    PendingReview: <Clock size={14} />,
    Rejected: <XCircle size={14} />,
}

export const DocumentsCard: React.FC<{ documents: TeacherDocument[] }> = ({ documents }) => {
    const { t } = useTranslation('teacher')
    const locale = useLocale()

    return (
        <SectionCard icon={<FileText size={18} />} title={t('profile.sections.documents')}>
            {documents.length === 0 ? (
                <p className="text-sm text-slate-400">{t('profile.documents.empty')}</p>
            ) : (
                <ul className="space-y-2">
                    {documents.map((d) => (
                        <li
                            key={d.id}
                            className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3"
                        >
                            <FileText size={18} className="text-slate-400 shrink-0" />
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-bold text-slate-800 dark:text-white">
                                    {t(`profile.documents.kind.${d.kind}`)}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate" dir="ltr">
                                    {d.fileName}
                                </p>
                                {d.status === 'Rejected' && d.rejectionReason && (
                                    <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">
                                        {t('profile.documents.reasonLabel')}: {pickLocalized(d.rejectionReason, locale)}
                                    </p>
                                )}
                            </div>
                            <span
                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold shrink-0 ${STATUS_TONE[d.status]}`}
                            >
                                {STATUS_ICON[d.status]}
                                {t(`profile.documents.status.${d.status}`)}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </SectionCard>
    )
}

import React from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import {
    Loader2,
    FileText,
    Video as VideoIcon,
    Image as ImageIcon,
    BookOpenCheck,
} from 'lucide-react'

import { useLocale } from '@/lib/hooks/useLocale'
import { courseContentLibraryQueryOptions } from '../-queries/courseDetailExtrasQueries'
import type { ContentLibraryItem } from '../-types/types'

const iconForType: Record<ContentLibraryItem['type'], React.ReactNode> = {
    pdf: <FileText size={18} />,
    video: <VideoIcon size={18} />,
    image: <ImageIcon size={18} />,
    doc: <FileText size={18} />,
    homework: <BookOpenCheck size={18} />,
}

export const ContentLibraryTab: React.FC<{ courseId: number }> = ({ courseId }) => {
    const { t } = useTranslation('teacher')
    const locale = useLocale()
    const query = useQuery(courseContentLibraryQueryOptions(courseId))

    if (query.isLoading) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-12 flex justify-center text-slate-400">
                <Loader2 size={28} className="animate-spin" />
            </div>
        )
    }
    if (query.isError) {
        return (
            <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 rounded-2xl p-6 text-center text-sm font-bold">
                {t('courseDetail.content.error')}
            </div>
        )
    }
    const items = query.data ?? []
    if (items.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
                {t('courseDetail.content.empty')}
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((item) => (
                <div
                    key={item.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 flex items-start gap-3"
                >
                    <div className="w-11 h-11 rounded-xl bg-primary/10 dark:bg-secondary/15 text-primary dark:text-secondary flex items-center justify-center shrink-0">
                        {iconForType[item.type]}
                    </div>
                    <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-800 dark:text-white truncate">
                            {item.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {item.type === 'homework'
                                ? t('courseDetail.content.homework')
                                : item.sizeBytes
                                    ? t('courseDetail.content.size', { kb: Math.round(item.sizeBytes / 1024) })
                                    : ''}
                            {' • '}
                            {t('courseDetail.content.linkedSessions', { count: item.linkedSessionsCount })}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                            {new Date(item.uploadedAt).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                            })}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    )
}

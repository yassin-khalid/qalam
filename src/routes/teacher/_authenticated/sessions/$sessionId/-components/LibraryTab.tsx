import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
    Search,
    FileText,
    Image as ImageIcon,
    Video as VideoIcon,
    BookOpenCheck,
    Plus,
    Check,
    Loader2,
} from 'lucide-react'

import { showToast } from '@/lib/utils/toast'

import { addSessionHomework, linkLibraryFile } from '../../-queries/sessionsQueries'
import type { SessionDetail } from '../../-types/types'
import { contentListQueryOptions } from '../../../content/-queries/contentQueries'
import type { ContentFilter, ContentLibraryEntry } from '../../../content/-types/types'

const iconForEntry = (entry: ContentLibraryEntry): React.ReactNode => {
    if (entry.kind === 'homework') return <BookOpenCheck size={18} />
    switch (entry.fileType) {
        case 'image':
            return <ImageIcon size={18} />
        case 'video':
            return <VideoIcon size={18} />
        default:
            return <FileText size={18} />
    }
}

const FILTERS: ContentFilter[] = ['all', 'file', 'homework']

export const LibraryTab: React.FC<{ session: SessionDetail }> = ({ session }) => {
    const { t } = useTranslation('teacher')
    const queryClient = useQueryClient()
    const [filter, setFilter] = useState<ContentFilter>('all')
    const [search, setSearch] = useState('')
    const [pendingId, setPendingId] = useState<string | null>(null)

    const libraryQuery = useQuery(contentListQueryOptions(filter, search))

    const linkedLibraryIds = new Set(
        session.files.map((f) => f.sourceLibraryId).filter((id): id is string => !!id),
    )

    const invalidate = () =>
        queryClient.invalidateQueries({ queryKey: ['sessions', 'detail', session.id] })

    const fileMutation = useMutation({
        mutationFn: (entry: ContentLibraryEntry) =>
            linkLibraryFile(session.id, {
                libraryId: entry.id,
                fileName: entry.title,
                fileType: entry.fileType ?? 'other',
                sizeBytes: entry.sizeBytes ?? 0,
            }),
        onSuccess: () => {
            showToast({ type: 'success', message: t('sessions.detail.library.attachedFile') })
            invalidate()
        },
        onError: (err: Error) => showToast({ type: 'server', message: t(err.message, { defaultValue: err.message }) }),
        onSettled: () => setPendingId(null),
    })

    const homeworkMutation = useMutation({
        mutationFn: (entry: ContentLibraryEntry) =>
            addSessionHomework(session.id, {
                title: entry.title,
                description: entry.description,
                dueAt: null,
            }),
        onSuccess: () => {
            showToast({ type: 'success', message: t('sessions.detail.library.attachedHomework') })
            invalidate()
        },
        onError: (err: Error) => showToast({ type: 'server', message: t(err.message, { defaultValue: err.message }) }),
        onSettled: () => setPendingId(null),
    })

    const attach = (entry: ContentLibraryEntry) => {
        setPendingId(entry.id)
        if (entry.kind === 'homework') homeworkMutation.mutate(entry)
        else fileMutation.mutate(entry)
    }

    return (
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 space-y-4">
            <header>
                <h2 className="text-base font-bold text-slate-800 dark:text-white">
                    {t('sessions.detail.library.title')}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {t('sessions.detail.library.subtitle')}
                </p>
            </header>

            {/* Search + filter */}
            <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                    <Search size={16} className="absolute top-1/2 -translate-y-1/2 start-3 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t('sessions.detail.library.searchPlaceholder')}
                        className="w-full ps-9 pe-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm"
                    />
                </div>
                <div className="flex gap-1.5">
                    {FILTERS.map((f) => (
                        <button
                            key={f}
                            type="button"
                            onClick={() => setFilter(f)}
                            className={`px-3 py-2 rounded-lg text-xs font-bold border transition ${filter === f
                                ? 'bg-primary dark:bg-secondary text-white border-transparent'
                                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                                }`}
                        >
                            {t(`sessions.detail.library.filter.${f}`)}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            {libraryQuery.isLoading ? (
                <div className="flex justify-center py-8 text-slate-400">
                    <Loader2 size={24} className="animate-spin" />
                </div>
            ) : !libraryQuery.data || libraryQuery.data.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium text-center py-8 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                    {t('sessions.detail.library.empty')}
                </p>
            ) : (
                <ul className="space-y-2">
                    {libraryQuery.data.map((entry) => {
                        const isLinked = entry.kind === 'file' && linkedLibraryIds.has(entry.id)
                        const isPending = pendingId === entry.id
                        return (
                            <li
                                key={entry.id}
                                className="flex items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-800"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 dark:bg-secondary/15 text-primary dark:text-secondary flex items-center justify-center shrink-0">
                                        {iconForEntry(entry)}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                                            {entry.title}
                                        </p>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 flex-wrap">
                                            <span className="font-bold uppercase">
                                                {t(`sessions.detail.library.kind.${entry.kind}`)}
                                            </span>
                                            {entry.sizeBytes != null && <span>• {(entry.sizeBytes / 1024).toFixed(0)} KB</span>}
                                            <span>• {t('sessions.detail.library.usedIn', { count: entry.usedInSessionsCount })}</span>
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    disabled={isLinked || isPending}
                                    onClick={() => attach(entry)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shrink-0 transition ${isLinked
                                        ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 cursor-default'
                                        : 'bg-primary dark:bg-secondary text-white hover:opacity-85 disabled:opacity-60'
                                        }`}
                                >
                                    {isPending ? (
                                        <Loader2 size={13} className="animate-spin" />
                                    ) : isLinked ? (
                                        <Check size={13} />
                                    ) : (
                                        <Plus size={13} />
                                    )}
                                    {t(isLinked ? 'sessions.detail.library.linked' : 'sessions.detail.library.attach')}
                                </button>
                            </li>
                        )
                    })}
                </ul>
            )}
        </section>
    )
}

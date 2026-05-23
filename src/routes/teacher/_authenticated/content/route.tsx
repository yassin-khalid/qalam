import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { createStandardSchemaV1, parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs'
import {
    Upload,
    Plus,
    Search,
    FileText,
    Image as ImageIcon,
    Video as VideoIcon,
    BookOpenCheck,
    Trash2,
    Loader2,
    Tag as TagIcon,
} from 'lucide-react'

import { useLocale } from '@/lib/hooks/useLocale'
import { LOCALE_DIRECTION } from '@/lib/i18n'
import { Skeleton } from '@/lib/components/Skeleton'
import { showToast } from '@/lib/utils/toast'

import {
    addHomeworkTemplate,
    contentListQueryOptions,
    deleteContentEntry,
    uploadContentFile,
} from './-queries/contentQueries'
import type { ContentFilter, ContentFileType, ContentLibraryEntry } from './-types/types'

const searchParams = {
    filter: parseAsStringLiteral(['all', 'file', 'homework'] as const).withDefault('all'),
    q: parseAsString.withDefault(''),
}

export const Route = createFileRoute('/teacher/_authenticated/content')({
    component: RouteComponent,
    validateSearch: createStandardSchemaV1(searchParams, { partialOutput: true }),
})

const FILE_ICON: Record<ContentFileType, React.ComponentType<{ size?: number }>> = {
    pdf: FileText,
    image: ImageIcon,
    video: VideoIcon,
    doc: FileText,
    other: FileText,
}

function RouteComponent() {
    const { t } = useTranslation('teacher')
    const locale = useLocale()
    const queryClient = useQueryClient()
    const [params, setParams] = useQueryStates(searchParams)
    const filter = (params.filter ?? 'all') as ContentFilter
    const search = params.q ?? ''

    const listQuery = useQuery(contentListQueryOptions(filter, search))
    const inputRef = useRef<HTMLInputElement>(null)
    const [hwOpen, setHwOpen] = useState(false)
    const [hwTitle, setHwTitle] = useState('')
    const [hwDesc, setHwDesc] = useState('')

    const uploadMutation = useMutation({
        mutationFn: (file: File) =>
            uploadContentFile({
                fileName: file.name,
                sizeBytes: file.size,
                description: null,
                tags: [],
            }),
        onSuccess: () => {
            showToast({ type: 'success', message: t('content.toasts.uploaded') })
            queryClient.invalidateQueries({ queryKey: ['content-library'] })
        },
        onError: (err: Error) => showToast({ type: 'server', message: t(err.message, { defaultValue: err.message }) }),
    })

    const homeworkMutation = useMutation({
        mutationFn: () =>
            addHomeworkTemplate({
                title: hwTitle,
                description: hwDesc.trim() || null,
                tags: [],
            }),
        onSuccess: () => {
            showToast({ type: 'success', message: t('content.toasts.homeworkAdded') })
            queryClient.invalidateQueries({ queryKey: ['content-library'] })
            setHwOpen(false)
            setHwTitle('')
            setHwDesc('')
        },
        onError: (err: Error) => showToast({ type: 'server', message: t(err.message, { defaultValue: err.message }) }),
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteContentEntry(id),
        onSuccess: () => {
            showToast({ type: 'success', message: t('content.toasts.deleted') })
            queryClient.invalidateQueries({ queryKey: ['content-library'] })
        },
        onError: (err: Error) => showToast({ type: 'server', message: t(err.message, { defaultValue: err.message }) }),
    })

    return (
        <div dir={LOCALE_DIRECTION[locale]} className="min-h-screen">
            <header className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
                <div>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        {t('content.breadcrumbDashboard')} / {t('content.breadcrumbCurrent')}
                    </p>
                    <h1 className="text-3xl font-black text-primary dark:text-secondary mt-1">
                        {t('content.heading')}
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {t('content.subtitle')}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        disabled={uploadMutation.isPending}
                        className="px-4 py-2.5 rounded-lg bg-primary dark:bg-secondary text-white text-sm font-bold flex items-center gap-2 hover:opacity-85 transition disabled:opacity-60"
                    >
                        {uploadMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                        {t('content.uploadFile')}
                    </button>
                    <input
                        ref={inputRef}
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.mp4,.mov,.avi,.doc,.docx"
                        className="hidden"
                        onChange={(e) => {
                            const f = e.target.files?.[0]
                            if (f) uploadMutation.mutate(f)
                            if (inputRef.current) inputRef.current.value = ''
                        }}
                    />
                    <button
                        type="button"
                        onClick={() => setHwOpen(true)}
                        className="px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-sm font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center gap-2"
                    >
                        <Plus size={14} />
                        {t('content.addHomework')}
                    </button>
                </div>
            </header>

            {/* Filters */}
            <div className="mb-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
                <div className="relative flex-1">
                    <Search size={16} className="absolute top-1/2 -translate-y-1/2 start-3 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setParams({ q: e.target.value })}
                        placeholder={t('content.searchPlaceholder')}
                        className="w-full ps-9 pe-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm"
                    />
                </div>
                <div className="flex gap-2">
                    {(['all', 'file', 'homework'] as const).map((id) => {
                        const active = filter === id
                        return (
                            <button
                                key={id}
                                type="button"
                                onClick={() => setParams({ filter: id })}
                                className={`px-3.5 py-2 rounded-lg text-sm font-bold border transition ${active
                                    ? 'bg-primary dark:bg-secondary text-white border-transparent'
                                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                                    }`}
                            >
                                {t(`content.filters.${id}`)}
                            </button>
                        )
                    })}
                </div>
            </div>

            {listQuery.isLoading ? (
                <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }, (_, i) => (
                        <li key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 space-y-3 h-full">
                            <div className="flex items-start gap-3">
                                <Skeleton className="w-11 h-11" rounded="xl" />
                                <div className="flex-1 space-y-2 pt-1">
                                    <Skeleton className="h-2.5 w-20" />
                                    <Skeleton className="h-3.5 w-4/5" />
                                </div>
                            </div>
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-3 w-3/5" />
                            <div className="flex gap-1.5 pt-1">
                                <Skeleton className="h-4 w-12" />
                                <Skeleton className="h-4 w-16" />
                            </div>
                        </li>
                    ))}
                </ul>
            ) : !listQuery.data || listQuery.data.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
                    {t('content.empty')}
                </div>
            ) : (
                <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {listQuery.data.map((entry) => (
                        <li key={entry.id}>
                            <EntryCard entry={entry} onDelete={(id) => deleteMutation.mutate(id)} />
                        </li>
                    ))}
                </ul>
            )}

            {/* Homework dialog */}
            <AnimatePresence>
                {hwOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => !homeworkMutation.isPending && setHwOpen(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            dir={LOCALE_DIRECTION[locale]}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4"
                        >
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                {t('content.addHomework')}
                            </h3>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                    {t('content.dialog.titleLabel')}
                                </label>
                                <input
                                    type="text"
                                    value={hwTitle}
                                    onChange={(e) => setHwTitle(e.target.value)}
                                    maxLength={150}
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                    {t('content.dialog.descriptionLabel')}
                                </label>
                                <textarea
                                    value={hwDesc}
                                    onChange={(e) => setHwDesc(e.target.value)}
                                    rows={4}
                                    maxLength={1000}
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm resize-none"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    disabled={!hwTitle.trim() || homeworkMutation.isPending}
                                    onClick={() => homeworkMutation.mutate()}
                                    className="flex-1 bg-secondary text-white hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition"
                                >
                                    {homeworkMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                                    {t('content.dialog.submit')}
                                </button>
                                <button
                                    type="button"
                                    disabled={homeworkMutation.isPending}
                                    onClick={() => setHwOpen(false)}
                                    className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-2.5 rounded-xl font-bold text-sm transition"
                                >
                                    {t('content.dialog.cancel')}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

interface EntryCardProps {
    entry: ContentLibraryEntry
    onDelete: (id: string) => void
}

const EntryCard: React.FC<EntryCardProps> = ({ entry, onDelete }) => {
    const { t } = useTranslation('teacher')
    const locale = useLocale()
    const isHomework = entry.kind === 'homework'
    const Icon = isHomework
        ? BookOpenCheck
        : FILE_ICON[(entry.fileType ?? 'other') as ContentFileType]

    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 hover:shadow-md transition-shadow flex flex-col gap-3 h-full"
        >
            <header className="flex items-start gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${isHomework
                    ? 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300'
                    : 'bg-primary/10 dark:bg-secondary/15 text-primary dark:text-secondary'
                    }`}>
                    <Icon size={18} />
                </div>
                <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        {isHomework ? t('content.kindHomework') : t('content.kindFile')}
                    </span>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white truncate mt-0.5">{entry.title}</h3>
                </div>
                <button
                    type="button"
                    aria-label={t('content.delete')}
                    onClick={() => onDelete(entry.id)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition shrink-0"
                >
                    <Trash2 size={14} />
                </button>
            </header>
            {entry.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{entry.description}</p>
            )}
            {entry.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {entry.tags.map((tag) => (
                        <span key={tag} className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md text-[10px] font-bold">
                            <TagIcon size={10} />
                            {tag}
                        </span>
                    ))}
                </div>
            )}
            <footer className="mt-auto flex items-center justify-between pt-2 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
                <span>
                    {t('content.usedInSessions', { count: entry.usedInSessionsCount })}
                </span>
                <span>
                    {entry.sizeBytes != null
                        ? `${Math.round(entry.sizeBytes / 1024)} KB`
                        : new Date(entry.uploadedAt).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
                            day: 'numeric',
                            month: 'short',
                        })}
                </span>
            </footer>
        </motion.div>
    )
}

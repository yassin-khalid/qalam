import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import {
    Upload,
    FileText,
    Image as ImageIcon,
    Video as VideoIcon,
    Trash2,
    Loader2,
} from 'lucide-react'

import { LOCALE_DIRECTION } from '@/lib/i18n'
import { useLocale } from '@/lib/hooks/useLocale'
import { showToast } from '@/lib/utils/toast'

import {
    deleteSessionFile,
    uploadSessionFile,
} from '../../-queries/sessionsQueries'
import type { SessionDetail, SessionFile } from '../../-types/types'

const inferType = (name: string): SessionFile['fileType'] => {
    const ext = name.split('.').pop()?.toLowerCase() ?? ''
    if (['pdf'].includes(ext)) return 'pdf'
    if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) return 'image'
    if (['mp4', 'mov', 'avi', 'webm'].includes(ext)) return 'video'
    if (['doc', 'docx'].includes(ext)) return 'doc'
    return 'other'
}

const iconForType: Record<SessionFile['fileType'], React.ReactNode> = {
    pdf: <FileText size={18} />,
    image: <ImageIcon size={18} />,
    video: <VideoIcon size={18} />,
    doc: <FileText size={18} />,
    other: <FileText size={18} />,
}

export const FilesTab: React.FC<{ session: SessionDetail }> = ({ session }) => {
    const { t } = useTranslation('teacher')
    const locale = useLocale()
    const queryClient = useQueryClient()
    const inputRef = useRef<HTMLInputElement>(null)
    const [deleteTarget, setDeleteTarget] = useState<SessionFile | null>(null)

    const uploadMutation = useMutation({
        mutationFn: (input: { fileName: string; fileType: SessionFile['fileType']; sizeBytes: number }) =>
            uploadSessionFile(session.id, input),
        onSuccess: () => {
            showToast({ type: 'success', message: t('sessions.detail.toasts.fileUploaded') })
            queryClient.invalidateQueries({ queryKey: ['sessions', 'detail', session.id] })
        },
        onError: (err: Error) => showToast({ type: 'server', message: t(err.message, { defaultValue: err.message }) }),
    })

    const deleteMutation = useMutation({
        mutationFn: (fileId: string) => deleteSessionFile(session.id, fileId),
        onSuccess: () => {
            showToast({ type: 'success', message: t('sessions.detail.toasts.fileDeleted') })
            queryClient.invalidateQueries({ queryKey: ['sessions', 'detail', session.id] })
            setDeleteTarget(null)
        },
        onError: (err: Error) => showToast({ type: 'server', message: t(err.message, { defaultValue: err.message }) }),
    })

    const handlePicked = (file: File) => {
        uploadMutation.mutate({
            fileName: file.name,
            fileType: inferType(file.name),
            sizeBytes: file.size,
        })
        if (inputRef.current) inputRef.current.value = ''
    }

    return (
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 space-y-4">
            <header className="flex items-start justify-between gap-3">
                <div>
                    <h2 className="text-base font-bold text-slate-800 dark:text-white">
                        {t('sessions.detail.files.title')}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {t('sessions.detail.files.subtitle')}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={uploadMutation.isPending}
                    className="px-4 py-2 rounded-lg bg-primary dark:bg-secondary text-white text-sm font-bold flex items-center gap-2 hover:opacity-85 transition disabled:opacity-60"
                >
                    {uploadMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                    {t('sessions.detail.files.uploadCta')}
                </button>
                <input
                    ref={inputRef}
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.mp4,.mov,.avi,.doc,.docx"
                    className="hidden"
                    onChange={(e) => {
                        const f = e.target.files?.[0]
                        if (f) handlePicked(f)
                    }}
                />
            </header>

            {session.files.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium text-center py-8 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                    {t('sessions.detail.files.empty')}
                </p>
            ) : (
                <ul className="space-y-2">
                    {session.files.map((f) => (
                        <li
                            key={f.id}
                            className="flex items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-800"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 dark:bg-secondary/15 text-primary dark:text-secondary flex items-center justify-center">
                                    {iconForType[f.fileType]}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                                        {f.fileName}
                                    </p>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                        {(f.sizeBytes / 1024).toFixed(0)} KB •{' '}
                                        {t('sessions.detail.files.uploadedAt', {
                                            when: new Date(f.uploadedAt).toLocaleDateString(
                                                locale === 'ar' ? 'ar-EG' : 'en-US',
                                                { day: 'numeric', month: 'short' },
                                            ),
                                        })}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                aria-label={t('sessions.detail.files.delete')}
                                onClick={() => setDeleteTarget(f)}
                                className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition"
                            >
                                <Trash2 size={15} />
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            <AnimatePresence>
                {deleteTarget && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => !deleteMutation.isPending && setDeleteTarget(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            dir={LOCALE_DIRECTION[locale]}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6"
                        >
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                                {t('sessions.detail.files.deleteConfirmTitle')}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                                {t('sessions.detail.files.deleteConfirmMessage', { name: deleteTarget.fileName })}
                            </p>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    disabled={deleteMutation.isPending}
                                    onClick={() => deleteMutation.mutate(deleteTarget.id)}
                                    className="flex-1 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition"
                                >
                                    {deleteMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                                    {t('sessions.detail.files.delete')}
                                </button>
                                <button
                                    type="button"
                                    disabled={deleteMutation.isPending}
                                    onClick={() => setDeleteTarget(null)}
                                    className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-2.5 rounded-xl font-bold text-sm transition"
                                >
                                    {t('requests.submitOffer.cancel')}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    )
}

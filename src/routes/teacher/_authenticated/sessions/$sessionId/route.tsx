import { createFileRoute, Link } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
    ChevronLeft,
    Loader2,
    StopCircle,
    Video,
    MapPin,
    Calendar,
    Clock,
} from 'lucide-react'
import { createStandardSchemaV1, parseAsStringLiteral, useQueryStates } from 'nuqs'

import { LOCALE_DIRECTION } from '@/lib/i18n'
import { useLocale } from '@/lib/hooks/useLocale'
import { showToast } from '@/lib/utils/toast'

import { TabsBar } from './-components/TabsBar'
import { InfoTab } from './-components/InfoTab'
import { MeetingTab } from './-components/MeetingTab'
import { FilesTab } from './-components/FilesTab'
import { HomeworkTab } from './-components/HomeworkTab'
import { NotesTab } from './-components/NotesTab'
import { AttendanceTab } from './-components/AttendanceTab'
import { FeedbackTab } from './-components/FeedbackTab'

import { endSession, sessionDetailQueryOptions } from '../-queries/sessionsQueries'
import type { SessionDetailTab } from '../-types/types'

const searchParams = {
    tab: parseAsStringLiteral([
        'info',
        'meeting',
        'files',
        'homework',
        'notes',
        'attendance',
        'feedback',
    ] as const).withDefault('info'),
}

export const Route = createFileRoute('/teacher/_authenticated/sessions/$sessionId')({
    component: RouteComponent,
    parseParams: ({ sessionId }) => ({ sessionId: Number(sessionId) }),
    stringifyParams: ({ sessionId }) => ({ sessionId: String(sessionId) }),
    validateSearch: createStandardSchemaV1(searchParams, { partialOutput: true }),
})

function RouteComponent() {
    const { sessionId } = Route.useParams()
    const { t } = useTranslation('teacher')
    const locale = useLocale()
    const isAr = locale === 'ar'
    const queryClient = useQueryClient()
    const [params, setParams] = useQueryStates(searchParams)
    const [endOpen, setEndOpen] = useState(false)

    const tab = (params.tab ?? 'info') as SessionDetailTab

    const sessionQuery = useQuery(sessionDetailQueryOptions(sessionId))

    const endMutation = useMutation({
        mutationFn: () => endSession(sessionId),
        onSuccess: () => {
            showToast({ type: 'success', message: t('sessions.detail.toasts.ended') })
            queryClient.invalidateQueries({ queryKey: ['sessions'] })
            setEndOpen(false)
        },
        onError: (err: Error) => showToast({ type: 'server', message: t(err.message, { defaultValue: err.message }) }),
    })

    if (sessionQuery.isLoading) {
        return (
            <div dir={LOCALE_DIRECTION[locale]} className="min-h-[60vh] flex items-center justify-center text-slate-400">
                <Loader2 size={32} className="animate-spin" />
            </div>
        )
    }

    if (sessionQuery.isError || !sessionQuery.data) {
        return (
            <div dir={LOCALE_DIRECTION[locale]} className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 rounded-2xl p-6 text-center text-sm font-bold">
                {t('sessions.detail.errorTitle')}
            </div>
        )
    }

    const session = sessionQuery.data
    const isEndable = session.status === 'Scheduled' || session.status === 'InProgress'
    const startsAt = new Date(session.startsAt)

    return (
        <div dir={LOCALE_DIRECTION[locale]} className="min-h-screen">
            {/* Header */}
            <div className="mb-5">
                <Link
                    to="/teacher/sessions"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-secondary transition mb-3"
                >
                    {isAr ? <ChevronLeft size={14} /> : <ChevronLeft size={14} className="rotate-180" />}
                    {t('sessions.detail.back')}
                </Link>

                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                            {t('sessions.card.sessionLabel', { number: session.sessionNumber })} • {session.sourceLabel}
                        </p>
                        <h1 className="text-2xl md:text-3xl font-black text-primary dark:text-secondary mt-1">
                            {session.sessionTitle}
                        </h1>
                        <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                            <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md flex items-center gap-1">
                                <Calendar size={11} />
                                {startsAt.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
                                    weekday: 'short',
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                })}
                            </span>
                            <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md flex items-center gap-1">
                                <Clock size={11} />
                                {startsAt.toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                                {' • '}
                                {t('sessions.list.durationMinutes', { count: session.durationMinutes })}
                            </span>
                            <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md flex items-center gap-1">
                                {session.teachingMode === 'Online' ? <Video size={11} /> : <MapPin size={11} />}
                                {session.teachingMode === 'Online'
                                    ? t('sessions.card.teachingOnline')
                                    : t('sessions.card.teachingInPerson')}
                            </span>
                            <span className={`px-2.5 py-1 rounded-md font-bold ${session.status === 'Completed'
                                ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300'
                                : session.status === 'InProgress'
                                    ? 'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300'
                                    : session.status === 'Scheduled'
                                        ? 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300'
                                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                }`}>
                                {t(`sessions.status.${session.status}`)}
                            </span>
                        </div>
                    </div>

                    {isEndable && (
                        <button
                            type="button"
                            onClick={() => setEndOpen(true)}
                            className="px-4 py-2.5 rounded-lg bg-rose-600 text-white text-sm font-bold flex items-center gap-2 hover:bg-rose-700 transition shadow-md shadow-rose-500/20 self-start"
                        >
                            <StopCircle size={14} />
                            {t('sessions.detail.endSession')}
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="mb-5">
                <TabsBar value={tab} onChange={(next) => setParams({ tab: next })} />
            </div>

            {/* Tab body */}
            <div>
                {tab === 'info' && <InfoTab session={session} />}
                {tab === 'meeting' && <MeetingTab session={session} />}
                {tab === 'files' && <FilesTab session={session} />}
                {tab === 'homework' && <HomeworkTab session={session} />}
                {tab === 'notes' && <NotesTab session={session} />}
                {tab === 'attendance' && <AttendanceTab session={session} />}
                {tab === 'feedback' && <FeedbackTab session={session} />}
            </div>

            {/* End session confirmation */}
            <AnimatePresence>
                {endOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => !endMutation.isPending && setEndOpen(false)}
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
                                {t('sessions.detail.endSessionConfirm.title')}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                                {t('sessions.detail.endSessionConfirm.message')}
                            </p>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    disabled={endMutation.isPending}
                                    onClick={() => endMutation.mutate()}
                                    className="flex-1 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition"
                                >
                                    {endMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                                    {t('sessions.detail.endSessionConfirm.confirm')}
                                </button>
                                <button
                                    type="button"
                                    disabled={endMutation.isPending}
                                    onClick={() => setEndOpen(false)}
                                    className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-2.5 rounded-xl font-bold text-sm transition"
                                >
                                    {t('sessions.detail.endSessionConfirm.cancel')}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

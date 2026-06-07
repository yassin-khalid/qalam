import React, { useEffect, useMemo, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
    X,
    Send,
    Paperclip,
    Loader2,
    Sparkles,
    Bell,
    User as UserIcon,
} from 'lucide-react'

import { LOCALE_DIRECTION } from '@/lib/i18n'
import { useLocale } from '@/lib/hooks/useLocale'
import { showToast } from '@/lib/utils/toast'

import {
    conversationQueryOptions,
    markConversationRead,
    messagesQueryOptions,
    sendChatMessage,
} from '../../-queries/sessionRequestsQueries'
import type { ChatMessage, SessionOffer } from '../../-types/types'

// v1 has no SignalR — the panel polls for new messages on an interval.
const POLL_INTERVAL_MS = 4000

interface ChatPanelProps {
    open: boolean
    onClose: () => void
    requestId: number
    studentDisplayName: string
    offer: SessionOffer | null
}

const formatDayLabel = (
    iso: string,
    locale: string,
    t: (k: string, opts?: any) => string,
): string => {
    const d = new Date(iso)
    const today = new Date()
    const yesterday = new Date(today.getTime() - 86_400_000)
    const sameDay = (a: Date, b: Date) =>
        a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
    if (sameDay(d, today)) return t('requests.chat.dateToday')
    if (sameDay(d, yesterday)) return t('requests.chat.dateYesterday')
    return d.toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
        day: 'numeric',
        month: 'long',
        year: d.getFullYear() === today.getFullYear() ? undefined : 'numeric',
    })
}

const formatTime = (iso: string, locale: string) =>
    new Date(iso).toLocaleTimeString(locale === 'ar' ? 'ar-EG' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
    })

interface DaySection {
    dayKey: string
    label: string
    messages: ChatMessage[]
}

const groupByDay = (
    msgs: ChatMessage[],
    locale: string,
    t: (k: string, opts?: any) => string,
): DaySection[] => {
    const sections: Map<string, DaySection> = new Map()
    for (const m of msgs) {
        const d = new Date(m.sentAt)
        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
        let section = sections.get(key)
        if (!section) {
            section = { dayKey: key, label: formatDayLabel(m.sentAt, locale, t), messages: [] }
            sections.set(key, section)
        }
        section.messages.push(m)
    }
    return Array.from(sections.values())
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
    open,
    onClose,
    requestId,
    studentDisplayName,
    offer,
}) => {
    const { t } = useTranslation('teacher')
    const locale = useLocale()
    const queryClient = useQueryClient()
    const [draft, setDraft] = React.useState('')
    const scrollRef = useRef<HTMLDivElement>(null)

    // GET /Conversations/by-request/{requestId}/teacher/{teacherId}
    const conversationQuery = useQuery({ ...conversationQueryOptions(requestId), enabled: open })
    const conversationId = conversationQuery.data?.conversationId
    // offerId === 0 => preliminary chat (no offer yet).
    const hasOffer = !!offer || (conversationQuery.data?.offerId ?? 0) > 0

    // GET /Conversations/{id}/messages — polled while the panel is open.
    const messagesQuery = useQuery({
        ...messagesQueryOptions(conversationId ?? 0, { direction: 'older', take: 200 }),
        enabled: open && !!conversationId,
        refetchInterval: open ? POLL_INTERVAL_MS : false,
    })
    const messages = messagesQuery.data?.messages ?? []

    // Mark the conversation read whenever it opens / new messages arrive.
    useEffect(() => {
        if (!open || !conversationId) return
        markConversationRead(conversationId)
            .then(() => queryClient.invalidateQueries({ queryKey: ['session-offers'] }))
            .catch(() => { })
    }, [open, conversationId, messages.length, queryClient])

    // Auto-scroll to bottom when messages change.
    useEffect(() => {
        if (!scrollRef.current) return
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }, [messages.length, open])

    const sendMutation = useMutation({
        mutationFn: (body: string) => {
            if (!conversationId) throw new Error('requests.chat.sendError')
            return sendChatMessage(conversationId, body)
        },
        onSuccess: () => {
            setDraft('')
            messagesQuery.refetch()
        },
        onError: (err: Error) => {
            showToast({
                type: 'server',
                message: t(err.message, { defaultValue: t('requests.chat.sendError') }),
            })
        },
    })

    const handleSend = () => {
        const body = draft.trim()
        if (!body || sendMutation.isPending) return
        sendMutation.mutate(body)
    }

    const grouped = useMemo(() => groupByDay(messages, locale, t), [messages, locale, t])

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.aside
                        key="panel"
                        initial={{ x: locale === 'ar' ? '-100%' : '100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: locale === 'ar' ? '-100%' : '100%', opacity: 0 }}
                        transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
                        dir={LOCALE_DIRECTION[locale]}
                        className={`fixed top-0 bottom-0 z-50 w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col ${locale === 'ar' ? 'start-0' : 'end-0'
                            }`}
                    >
                        {/* Header */}
                        <header className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-secondary/15 flex items-center justify-center text-primary dark:text-secondary">
                                    <UserIcon size={18} />
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-sm font-black text-slate-800 dark:text-white truncate">
                                        {studentDisplayName}
                                    </h2>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                        {hasOffer && offer ? offer.offerNumber : t('requests.chat.panelTitle')}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                aria-label={t('requests.chat.closeAria')}
                                onClick={onClose}
                                className="p-2 rounded-lg text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 transition"
                            >
                                <X size={20} />
                            </button>
                        </header>

                        {/* Offer status strip */}
                        {offer ? (
                            <OfferStatusStrip offer={offer} />
                        ) : (
                            <div className="px-5 py-3 bg-amber-50 dark:bg-amber-950/20 border-b border-amber-200/60 dark:border-amber-900/40 text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-2">
                                <Bell size={13} />
                                {t('requests.chat.noOfferYet')}
                            </div>
                        )}

                        {/* Messages */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-slate-50/40 dark:bg-slate-950/40"
                        >
                            {(conversationQuery.isLoading || messagesQuery.isLoading) ? (
                                <div className="flex items-center justify-center py-10 text-slate-400">
                                    <Loader2 size={24} className="animate-spin" />
                                </div>
                            ) : (conversationQuery.isError || messagesQuery.isError) ? (
                                <p className="text-center text-sm text-rose-600 dark:text-rose-400 py-10">
                                    {t('requests.chat.loadError')}
                                </p>
                            ) : grouped.length === 0 ? (
                                <p className="text-center text-sm text-slate-500 dark:text-slate-400 py-10">
                                    {t('requests.chat.empty')}
                                </p>
                            ) : (
                                grouped.map((section) => (
                                    <div key={section.dayKey} className="space-y-3">
                                        <div className="flex items-center justify-center">
                                            <span className="px-3 py-1 bg-slate-200/60 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-[10px] font-bold rounded-full">
                                                {section.label}
                                            </span>
                                        </div>
                                        {section.messages.map((m) => (
                                            <MessageRow key={m.id} message={m} locale={locale} />
                                        ))}
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Composer */}
                        <footer className="border-t border-slate-100 dark:border-slate-800 px-4 py-3 bg-white dark:bg-slate-900">
                            <div className="flex items-end gap-2">
                                <button
                                    type="button"
                                    aria-label={t('requests.chat.attachBtn')}
                                    className="p-2.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition shrink-0"
                                >
                                    <Paperclip size={16} />
                                </button>
                                <textarea
                                    value={draft}
                                    onChange={(e) => setDraft(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault()
                                            handleSend()
                                        }
                                    }}
                                    rows={1}
                                    maxLength={4000}
                                    placeholder={t('requests.chat.messagePlaceholder')}
                                    className="flex-1 resize-none px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm max-h-32"
                                    style={{ minHeight: 40 }}
                                />
                                <button
                                    type="button"
                                    onClick={handleSend}
                                    disabled={!draft.trim() || sendMutation.isPending || !conversationId}
                                    className="px-3.5 py-2.5 rounded-lg bg-secondary hover:bg-primary disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold transition flex items-center gap-1.5 shrink-0"
                                >
                                    {sendMutation.isPending ? (
                                        <Loader2 size={14} className="animate-spin" />
                                    ) : (
                                        <Send size={14} />
                                    )}
                                    <span className="hidden sm:inline">{t('requests.chat.sendBtn')}</span>
                                </button>
                            </div>
                        </footer>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    )
}

const OfferStatusStrip: React.FC<{ offer: SessionOffer }> = ({ offer }) => {
    const { t } = useTranslation('teacher')
    const tone = (() => {
        switch (offer.status) {
            case 'Accepted':
                return 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/40'
            case 'Rejected':
            case 'AutoRejected':
            case 'Withdrawn':
            case 'Expired':
                return 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/40'
            default:
                return 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
        }
    })()
    return (
        <div className={`px-5 py-2.5 border-b text-xs font-bold flex items-center justify-between gap-2 ${tone}`}>
            <span className="flex items-center gap-1.5 truncate">
                <Sparkles size={12} />
                {t(`requests.chat.offerStatus.${offer.status}`)}
            </span>
            <span className="text-[10px] font-bold bg-white/60 dark:bg-black/20 px-2 py-0.5 rounded-md whitespace-nowrap">
                {t('requests.chat.versionPill', { version: offer.version })}
            </span>
        </div>
    )
}

const MessageRow: React.FC<{
    message: ChatMessage
    locale: string
}> = ({ message, locale }) => {
    if (message.type === 'System') {
        return (
            <div className="flex items-center justify-center">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1 rounded-full inline-flex items-center gap-1.5 text-center max-w-[90%]">
                    {message.content}
                </span>
            </div>
        )
    }
    const isMine = message.senderRole === 'Teacher'
    return (
        <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
            <div
                className={`max-w-[78%] rounded-2xl px-3.5 py-2 shadow-sm ${isMine
                    ? 'bg-primary dark:bg-secondary text-white rounded-ee-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-700 rounded-es-sm'
                    }`}
            >
                <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                <p className={`text-[10px] mt-1 ${isMine ? 'text-white/70' : 'text-slate-500 dark:text-slate-400'}`}>
                    {formatTime(message.sentAt, locale)}
                </p>
            </div>
        </div>
    )
}

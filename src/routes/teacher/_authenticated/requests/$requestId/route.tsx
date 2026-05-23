import { createFileRoute, Link } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import {
    ChevronLeft,
    User as UserIcon,
    BookOpen,
    ListOrdered,
    CalendarDays,
    Paperclip,
    Users as UsersIcon,
    Loader2,
    Send,
    Pencil,
    MessageSquare,
    XCircle,
    Star,
    Video,
    MapPin,
    Clock,
    FileText,
    Image as ImageIcon,
    SaudiRiyal,
} from 'lucide-react'

import { LOCALE_DIRECTION } from '@/lib/i18n'
import { useLocale } from '@/lib/hooks/useLocale'
import { showToast } from '@/lib/utils/toast'

import { ChatPanel } from './-components/ChatPanel'
import { DetailSection } from './-components/DetailSection'
import { SubmitOfferModal } from './-components/SubmitOfferModal'
import {
    myOfferForRequestQueryOptions,
    requestDetailQueryOptions,
    withdrawOffer,
} from '../-queries/sessionRequestsQueries'

export const Route = createFileRoute('/teacher/_authenticated/requests/$requestId')({
    component: RouteComponent,
    parseParams: ({ requestId }) => ({ requestId: Number(requestId) }),
    stringifyParams: ({ requestId }) => ({ requestId: String(requestId) }),
})

function RouteComponent() {
    const { requestId } = Route.useParams()
    const { t } = useTranslation('teacher')
    const locale = useLocale()
    const isAr = locale === 'ar'
    const queryClient = useQueryClient()
    const [offerOpen, setOfferOpen] = useState(false)
    const [withdrawOpen, setWithdrawOpen] = useState(false)
    const [chatOpen, setChatOpen] = useState(false)

    const detailQuery = useQuery(requestDetailQueryOptions(requestId))
    const offerQuery = useQuery(myOfferForRequestQueryOptions(requestId))

    const withdrawMutation = useMutation({
        mutationFn: (id: number) => withdrawOffer(id),
        onSuccess: () => {
            showToast({ type: 'success', message: t('requests.submitOffer.toasts.withdrawn') })
            queryClient.invalidateQueries({ queryKey: ['session-requests'] })
            queryClient.invalidateQueries({ queryKey: ['session-offers'] })
            setWithdrawOpen(false)
        },
        onError: (err: Error) => {
            showToast({ type: 'server', message: t(err.message, { defaultValue: err.message }) })
        },
    })

    if (detailQuery.isLoading || offerQuery.isLoading) {
        return (
            <div dir={LOCALE_DIRECTION[locale]} className="min-h-[60vh] flex items-center justify-center text-slate-400">
                <Loader2 size={32} className="animate-spin" />
            </div>
        )
    }

    if (detailQuery.isError || !detailQuery.data) {
        return (
            <div dir={LOCALE_DIRECTION[locale]} className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 rounded-2xl p-6 text-center text-sm font-bold">
                {t('requests.inbox.error')}
            </div>
        )
    }

    const request = detailQuery.data
    const offer = offerQuery.data ?? null

    return (
        <div dir={LOCALE_DIRECTION[locale]} className="min-h-screen">
            {/* Breadcrumb + Header */}
            <div className="mb-6">
                <Link
                    to="/teacher/requests"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-secondary transition mb-3"
                >
                    {isAr ? <ChevronLeft size={14} /> : <ChevronLeft size={14} className="rotate-180" />}
                    {t('requests.detail.back')}
                </Link>

                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-primary dark:text-secondary">
                            {isAr ? request.subjectNameAr : request.subjectNameEn}
                        </h1>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className="bg-primary/10 dark:bg-secondary/15 text-primary dark:text-secondary px-2.5 py-1 rounded-md text-xs font-bold">
                                {t(`requests.detail.domainCodes.${request.domainCode}`)}
                            </span>
                            <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1">
                                <ListOrdered size={11} />
                                {request.sessionsCount} {t('requests.card.sessionsLabel')}
                            </span>
                            <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1">
                                {request.teachingMode === 'Online' ? <Video size={11} /> : <MapPin size={11} />}
                                {request.teachingMode === 'Online' ? t('requests.card.teachingOnline') : t('requests.card.teachingInPerson')}
                            </span>
                            <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1">
                                <UsersIcon size={11} />
                                {request.sessionType === 'Individual'
                                    ? t('requests.card.participantsSingle')
                                    : t('requests.card.participantsGroup', { count: request.participantsCount })}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {offer ? (
                            <>
                                <button
                                    type="button"
                                    onClick={() => setOfferOpen(true)}
                                    className="px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-bold flex items-center gap-2 hover:bg-primary/90 transition shadow-md shadow-primary/20"
                                >
                                    <Pencil size={14} />
                                    {t('requests.detail.updateOffer')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setChatOpen(true)}
                                    className="relative px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-sm font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center gap-2"
                                >
                                    <MessageSquare size={14} />
                                    {t('requests.detail.openChat')}
                                    {offer.hasUnreadStudentMessages && (
                                        <span className="absolute -top-1 -end-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setWithdrawOpen(true)}
                                    disabled={offer.status === 'Accepted'}
                                    className="px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 text-sm font-bold border border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <XCircle size={14} />
                                    {t('requests.detail.withdrawOffer')}
                                </button>
                            </>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setOfferOpen(true)}
                                className="px-5 py-2.5 rounded-lg bg-secondary text-white text-sm font-bold flex items-center gap-2 hover:bg-primary transition shadow-md shadow-secondary/20"
                            >
                                <Send size={14} />
                                {t('requests.detail.submitOffer')}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-8 space-y-5">
                    {/* 1. Student */}
                    <DetailSection
                        icon={<UserIcon size={18} />}
                        title={t('requests.detail.sections.student')}
                    >
                        {request.isStudentAnonymised && !offer && (
                            <div className="mb-3 text-xs bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-amber-700 dark:text-amber-300 px-3 py-2 rounded-lg font-medium">
                                {t('requests.detail.student.anonymisedNotice')}
                            </div>
                        )}
                        <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                <UserIcon size={24} />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-800 dark:text-white">
                                    {request.studentDisplayName}
                                </h3>
                                {request.studentGradeLabel && (
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {t('requests.detail.student.gradeLabel')}: {request.studentGradeLabel}
                                    </p>
                                )}
                                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                                    <Star size={11} className={request.studentRating ? 'text-amber-500 fill-amber-500' : 'text-slate-300'} />
                                    {request.studentRating ?? t('requests.detail.student.noRating')}
                                </p>
                            </div>
                        </div>
                    </DetailSection>

                    {/* 2. Academic */}
                    <DetailSection
                        icon={<BookOpen size={18} />}
                        title={t('requests.detail.sections.academic')}
                    >
                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <DLRow label={t('requests.detail.academic.domain')}>
                                {t(`requests.detail.domainCodes.${request.domainCode}`)}
                            </DLRow>
                            <DLRow label={t('requests.detail.academic.subject')}>
                                {isAr ? request.subjectNameAr : request.subjectNameEn}
                            </DLRow>
                            {request.domainCode === 'quran' && request.quranContentTypeLabel && (
                                <DLRow label={t('requests.detail.academic.quranContentType')}>
                                    {request.quranContentTypeLabel}
                                </DLRow>
                            )}
                            {request.domainCode === 'quran' && request.quranLevelLabel && (
                                <DLRow label={t('requests.detail.academic.quranLevel')}>
                                    {request.quranLevelLabel}
                                </DLRow>
                            )}
                            <div className="md:col-span-2">
                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                                    {t('requests.detail.academic.units')}
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {request.unitNames.map((u) => (
                                        <span key={u} className="bg-primary/10 dark:bg-secondary/15 text-primary dark:text-secondary px-2.5 py-1 rounded-md text-xs font-bold">
                                            {u}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            {request.descriptionForTeacher && (
                                <div className="md:col-span-2 mt-1 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                                        {t('requests.detail.academic.notesFromStudent')}
                                    </p>
                                    <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap">
                                        {request.descriptionForTeacher}
                                    </p>
                                </div>
                            )}
                        </dl>
                    </DetailSection>

                    {/* 3. Sessions */}
                    <DetailSection
                        icon={<ListOrdered size={18} />}
                        title={t('requests.detail.sections.sessions')}
                        subtitle={`${request.sessionsCount} ${t('requests.card.sessionsLabel')}`}
                    >
                        <ul className="space-y-2.5">
                            {request.sessions.map((s) => (
                                <li
                                    key={s.sessionNumber}
                                    className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0 flex-1">
                                            <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                                                {t('requests.detail.sessions.sessionLabel', { number: s.sessionNumber })} — {s.title}
                                            </h4>
                                            {s.description && (
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{s.description}</p>
                                            )}
                                        </div>
                                        <span className="text-[11px] font-bold text-primary dark:text-secondary bg-primary/10 dark:bg-secondary/15 px-2 py-1 rounded-md whitespace-nowrap">
                                            {t('requests.detail.sessions.duration', { count: s.durationMinutes })}
                                        </span>
                                    </div>
                                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                                        <span className="inline-flex items-center gap-1">
                                            <CalendarDays size={11} />
                                            {new Date(s.preferredDate).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </span>
                                        <span className="inline-flex items-center gap-1">
                                            <Clock size={11} />
                                            {s.preferredTimeSlotLabel}
                                        </span>
                                        {s.unitNames.length > 0 && (
                                            <span className="inline-flex items-center gap-1">
                                                <BookOpen size={11} />
                                                {s.unitNames.join(' • ')}
                                            </span>
                                        )}
                                    </div>
                                    {s.notes && (
                                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 italic">
                                            {s.notes}
                                        </p>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </DetailSection>

                    {/* 4. Dates summary */}
                    <DetailSection
                        icon={<CalendarDays size={18} />}
                        title={t('requests.detail.sections.dates')}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {request.sessions.map((s) => (
                                <div
                                    key={s.sessionNumber}
                                    className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/40 rounded-lg px-3 py-2 border border-slate-100 dark:border-slate-800"
                                >
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
                                            {t('requests.detail.sessions.sessionLabel', { number: s.sessionNumber })}
                                        </p>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                            {new Date(s.preferredDate).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
                                        </p>
                                    </div>
                                    <span className="text-[11px] font-bold text-primary dark:text-secondary whitespace-nowrap">
                                        {s.preferredTimeSlotLabel}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </DetailSection>

                    {/* 5. Attachments */}
                    <DetailSection
                        icon={<Paperclip size={18} />}
                        title={t('requests.detail.sections.attachments')}
                    >
                        {request.attachments.length === 0 ? (
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                {t('requests.detail.attachments.empty')}
                            </p>
                        ) : (
                            <ul className="space-y-2">
                                {request.attachments.map((att) => (
                                    <li
                                        key={att.id}
                                        className="flex items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-800"
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className="w-9 h-9 rounded-lg bg-primary/10 dark:bg-secondary/15 text-primary dark:text-secondary flex items-center justify-center">
                                                {att.fileType === 'image' ? <ImageIcon size={16} /> : <FileText size={16} />}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                                                    {att.fileName}
                                                </p>
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                                    {(att.sizeBytes / 1024).toFixed(0)} KB •{' '}
                                                    {att.sessionNumber
                                                        ? t('requests.detail.attachments.sessionScoped', { number: att.sessionNumber })
                                                        : t('requests.detail.attachments.generic')}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            className="text-xs font-bold text-primary dark:text-secondary hover:underline"
                                        >
                                            {t('requests.detail.attachments.download')}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </DetailSection>

                    {/* 6. Participants */}
                    <DetailSection
                        icon={<UsersIcon size={18} />}
                        title={t('requests.detail.sections.participants')}
                    >
                        {request.participants.length === 0 ? (
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                {t('requests.detail.participants.empty')}
                            </p>
                        ) : (
                            <ul className="space-y-2">
                                {request.participants.map((p) => (
                                    <li
                                        key={p.studentId}
                                        className="flex items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500">
                                                <UserIcon size={16} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800 dark:text-white">{p.studentName}</p>
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                                    {p.isOwner ? t('requests.detail.participants.owner') : t('requests.detail.participants.invited')}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 rounded-md text-[11px] font-bold ${p.confirmationStatus === 'Confirmed'
                                            ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300'
                                            : p.confirmationStatus === 'Pending'
                                                ? 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300'
                                                : 'bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300'
                                            }`}>
                                            {t(`requests.detail.participants.status.${p.confirmationStatus}`)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </DetailSection>
                </div>

                {/* Right rail — my offer summary */}
                <aside className="lg:col-span-4">
                    <div className="lg:sticky lg:top-4 space-y-3">
                        {offer ? (
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-emerald-200 dark:border-emerald-900/40 p-5 space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-black text-slate-800 dark:text-white">
                                        {t('requests.detail.myOfferSummary.title')}
                                    </h3>
                                    <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-md">
                                        {t('requests.detail.myOfferSummary.version', { version: offer.version })}
                                    </span>
                                </div>
                                <SummaryRow
                                    label={t('requests.detail.myOfferSummary.totalPrice')}
                                    value={
                                        <span className="font-black text-primary dark:text-secondary inline-flex items-center gap-1">
                                            {offer.totalPrice}
                                            <SaudiRiyal size={14} />
                                        </span>
                                    }
                                />
                                {offer.pricePerSession != null && (
                                    <SummaryRow
                                        label={t('requests.detail.myOfferSummary.pricePerSession')}
                                        value={`${offer.pricePerSession}`}
                                    />
                                )}
                                <SummaryRow
                                    label=""
                                    value={
                                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                            {t('requests.detail.myOfferSummary.validity', {
                                                when: new Date(offer.expiresAt).toLocaleString(isAr ? 'ar-EG' : 'en-US', {
                                                    dateStyle: 'medium',
                                                    timeStyle: 'short',
                                                }),
                                            })}
                                        </span>
                                    }
                                />
                                {offer.generalNotes && (
                                    <div>
                                        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                                            {t('requests.detail.myOfferSummary.notes')}
                                        </p>
                                        <p className="text-xs text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/40 rounded-lg p-2.5 whitespace-pre-wrap">
                                            {offer.generalNotes}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-5 text-center">
                                <Send size={28} className="mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">
                                    {t('requests.detail.submitOffer')}
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setOfferOpen(true)}
                                    className="w-full px-4 py-2.5 rounded-lg bg-secondary text-white text-sm font-bold hover:bg-primary transition"
                                >
                                    {t('requests.detail.submitOffer')}
                                </button>
                            </div>
                        )}
                    </div>
                </aside>
            </div>

            <SubmitOfferModal
                open={offerOpen}
                onClose={() => setOfferOpen(false)}
                request={request}
                existingOffer={offer}
            />

            <ChatPanel
                open={chatOpen}
                onClose={() => setChatOpen(false)}
                requestId={request.id}
                studentDisplayName={request.studentDisplayName}
                offer={offer}
            />

            <AnimatePresence>
                {withdrawOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => !withdrawMutation.isPending && setWithdrawOpen(false)}
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
                                {t('requests.submitOffer.withdrawConfirm.title')}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                                {t('requests.submitOffer.withdrawConfirm.message')}
                            </p>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    disabled={withdrawMutation.isPending}
                                    onClick={() => offer && withdrawMutation.mutate(offer.id)}
                                    className="flex-1 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition"
                                >
                                    {withdrawMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                                    {t('requests.submitOffer.withdrawConfirm.confirm')}
                                </button>
                                <button
                                    type="button"
                                    disabled={withdrawMutation.isPending}
                                    onClick={() => setWithdrawOpen(false)}
                                    className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-2.5 rounded-xl font-bold text-sm transition"
                                >
                                    {t('requests.submitOffer.withdrawConfirm.cancel')}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

const DLRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div>
        <dt className="text-xs font-bold text-slate-500 dark:text-slate-400">{label}</dt>
        <dd className="text-sm text-slate-700 dark:text-slate-200 mt-0.5">{children}</dd>
    </div>
)

const SummaryRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="flex items-center justify-between text-sm">
        {label ? <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{label}</span> : <span />}
        <span className="text-slate-700 dark:text-slate-200">{value}</span>
    </div>
)

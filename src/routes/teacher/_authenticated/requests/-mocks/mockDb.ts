// =============================================================================
//  MOCK STORE for Scenario 2 (Open Session Request — Teachers Offer Workflow).
//  Lives entirely in-memory. Replace with real fetch() calls inside the
//  *QueryOptions files in ../-queries and delete this file when the backend
//  ships the endpoints listed in COURSE_ENROLLMENT_TEACHER_PLAN.md §6.
// =============================================================================

import type {
    ChatMessage,
    ChatThreadMeta,
    InboxCounts,
    InboxResult,
    PerSessionOfferResponse,
    RequestInboxTab,
    RequestedSession,
    ScheduleConflict,
    SessionOffer,
    SessionOfferStatus,
    SessionRequestDetail,
    SessionRequestListItem,
    SubjectFacet,
} from '../-types/types'

// The "currently logged-in teacher" we pretend to be.
const CURRENT_TEACHER_ID = 1
const CURRENT_TEACHER_NAME = 'الأستاذ عبدالفتاح'

// ----- helpers ---------------------------------------------------------------

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

const NOW = new Date('2026-05-21T10:00:00Z').getTime()
const hoursAgo = (h: number) => new Date(NOW - h * 3_600_000).toISOString()
const hoursAhead = (h: number) => new Date(NOW + h * 3_600_000).toISOString()
const daysAhead = (d: number, hourOfDay = 18) => {
    const date = new Date(NOW + d * 86_400_000)
    date.setUTCHours(hourOfDay, 0, 0, 0)
    return date.toISOString()
}

const TIME_SLOTS = [
    '04:00 - 05:00 م',
    '05:00 - 06:00 م',
    '06:00 - 07:00 م',
    '07:00 - 08:00 م',
    '08:00 - 09:00 م',
] as const

const pickSlot = (i: number) => TIME_SLOTS[i % TIME_SLOTS.length]

const buildSessions = (
    count: number,
    units: string[],
    durations: number[],
    startDayOffset: number,
): RequestedSession[] => {
    return Array.from({ length: count }, (_, i) => {
        const unit = units[i % units.length]
        return {
            sessionNumber: i + 1,
            title: `${unit} — جلسة ${i + 1}`,
            description: i % 2 === 0 ? `شرح مفصّل لـ ${unit} مع تمارين تطبيقية.` : null,
            durationMinutes: durations[i % durations.length],
            unitNames: [unit],
            notes: i === 0 ? 'الطالب ضعيف في الأساسيات، يرجى البدء من الصفر.' : null,
            preferredDate: daysAhead(startDayOffset + i * 2, 17 + (i % 4)),
            preferredTimeSlotLabel: pickSlot(i),
            attachmentIds: i === 0 ? ['att-1'] : [],
        }
    })
}

// ----- requests --------------------------------------------------------------

interface RawRequest extends SessionRequestDetail {
    // No extra fields — the detail type is already authoritative.
}

const REQUESTS: RawRequest[] = [
    {
        id: 1001,
        studentDisplayName: 'طالب #1001',
        studentAvatarUrl: null,
        isStudentAnonymised: true,
        studentGradeLabel: 'الصف الثالث الثانوي',
        studentRating: 4.6,
        domainCode: 'school',
        subjectNameAr: 'الرياضيات',
        subjectNameEn: 'Mathematics',
        unitNames: ['الجبر', 'الهندسة', 'المثلثات'],
        sessionsCount: 6,
        totalMinutes: 6 * 60,
        teachingMode: 'Online',
        sessionType: 'Individual',
        participantsCount: 1,
        preferredDatesSummary: '6 جلسات بين 25 مايو و 11 يونيو',
        createdAt: hoursAgo(3),
        expiresAt: hoursAhead(24 * 7 - 3),
        attachmentsCount: 1,
        offersCount: 2,
        priceRange: { min: 600, max: 1200 },
        descriptionForTeacher:
            'أريد تأسيس قوي للرياضيات قبل اختبار التحصيلي. تركيز على حل المسائل وليس فقط النظري.',
        sessions: buildSessions(6, ['الجبر', 'الجبر', 'الهندسة', 'المثلثات', 'مراجعة', 'اختبار تجريبي'], [60, 60, 90, 60, 60, 90], 4),
        attachments: [
            { id: 'att-1', fileName: 'نتائج_الاختبار_السابق.pdf', fileType: 'pdf', sizeBytes: 245_000, sessionNumber: 1 },
            { id: 'att-2', fileName: 'الكتاب_المدرسي.pdf', fileType: 'pdf', sizeBytes: 1_200_000, sessionNumber: null },
        ],
        participants: [
            { studentId: 1001, studentName: 'طالب #1001', confirmationStatus: 'Confirmed', isOwner: true },
        ],
    },
    {
        id: 1002,
        studentDisplayName: 'طالبة #1002',
        studentAvatarUrl: null,
        isStudentAnonymised: true,
        studentGradeLabel: 'الصف الأول الثانوي',
        studentRating: null,
        domainCode: 'school',
        subjectNameAr: 'الفيزياء',
        subjectNameEn: 'Physics',
        unitNames: ['الحركة', 'القوى'],
        sessionsCount: 4,
        totalMinutes: 4 * 60,
        teachingMode: 'Online',
        sessionType: 'Individual',
        participantsCount: 1,
        preferredDatesSummary: '4 جلسات في الأسبوع القادم',
        createdAt: hoursAgo(8),
        expiresAt: hoursAhead(24 * 7 - 8),
        attachmentsCount: 0,
        offersCount: 0,
        descriptionForTeacher: null,
        sessions: buildSessions(4, ['الحركة', 'الحركة', 'القوى', 'القوى'], [60, 60, 60, 60], 3),
        attachments: [],
        participants: [
            { studentId: 1002, studentName: 'طالبة #1002', confirmationStatus: 'Confirmed', isOwner: true },
        ],
    },
    {
        id: 1003,
        studentDisplayName: 'مجموعة 3 طلاب',
        studentAvatarUrl: null,
        isStudentAnonymised: true,
        studentGradeLabel: 'الصف الثاني المتوسط',
        studentRating: 4.9,
        domainCode: 'language',
        subjectNameAr: 'اللغة الإنجليزية',
        subjectNameEn: 'English',
        unitNames: ['Grammar - Tenses', 'Speaking practice'],
        sessionsCount: 8,
        totalMinutes: 8 * 90,
        teachingMode: 'Online',
        sessionType: 'Group',
        participantsCount: 3,
        preferredDatesSummary: '8 جلسات على مدى 4 أسابيع',
        createdAt: hoursAgo(20),
        expiresAt: hoursAhead(24 * 6),
        attachmentsCount: 2,
        offersCount: 5,
        priceRange: { min: 900, max: 1600 },
        descriptionForTeacher: 'نريد التركيز على التحدث ونطق صحيح وتجنّب التدريس النظري.',
        sessions: buildSessions(8, ['Tenses', 'Speaking', 'Tenses', 'Speaking', 'Vocabulary', 'Speaking', 'Mock test', 'Review'], [90, 90, 90, 90, 90, 90, 90, 90], 7),
        attachments: [
            { id: 'att-3', fileName: 'curriculum_overview.pdf', fileType: 'pdf', sizeBytes: 410_000, sessionNumber: null },
            { id: 'att-4', fileName: 'previous_quiz.png', fileType: 'image', sizeBytes: 88_000, sessionNumber: 2 },
        ],
        participants: [
            { studentId: 1003, studentName: 'مالك الطلب', confirmationStatus: 'Confirmed', isOwner: true },
            { studentId: 1010, studentName: 'طالب مدعو 1', confirmationStatus: 'Confirmed', isOwner: false },
            { studentId: 1011, studentName: 'طالب مدعو 2', confirmationStatus: 'Confirmed', isOwner: false },
        ],
    },
    {
        id: 1004,
        studentDisplayName: 'طالب #1004',
        studentAvatarUrl: null,
        isStudentAnonymised: true,
        studentGradeLabel: 'تحفيظ — مبتدئ',
        studentRating: null,
        domainCode: 'quran',
        subjectNameAr: 'القرآن الكريم',
        subjectNameEn: 'Quran',
        unitNames: ['سورة البقرة', 'سورة آل عمران'],
        sessionsCount: 12,
        totalMinutes: 12 * 45,
        teachingMode: 'Online',
        sessionType: 'Individual',
        participantsCount: 1,
        preferredDatesSummary: '3 جلسات أسبوعياً',
        createdAt: hoursAgo(36),
        expiresAt: hoursAhead(24 * 5),
        attachmentsCount: 0,
        offersCount: 1,
        descriptionForTeacher: 'الحفظ بالأرباع، مع مراجعة كل أسبوع.',
        sessions: buildSessions(12, ['البقرة - الربع 1', 'البقرة - الربع 2', 'البقرة - الربع 3', 'البقرة - الربع 4', 'مراجعة', 'آل عمران - الربع 1', 'آل عمران - الربع 2', 'آل عمران - الربع 3', 'آل عمران - الربع 4', 'مراجعة', 'تثبيت', 'اختبار'], [45, 45, 45, 45, 60, 45, 45, 45, 45, 60, 45, 60], 2),
        attachments: [],
        participants: [
            { studentId: 1004, studentName: 'طالب #1004', confirmationStatus: 'Confirmed', isOwner: true },
        ],
        quranContentTypeLabel: 'حفظ',
        quranLevelLabel: 'مبتدئ',
    },
    {
        id: 1005,
        studentDisplayName: 'طالبة #1005',
        studentAvatarUrl: null,
        isStudentAnonymised: true,
        studentGradeLabel: 'الصف السادس الابتدائي',
        studentRating: 4.2,
        domainCode: 'school',
        subjectNameAr: 'الرياضيات',
        subjectNameEn: 'Mathematics',
        unitNames: ['الكسور', 'النسب المئوية'],
        sessionsCount: 3,
        totalMinutes: 3 * 60,
        teachingMode: 'InPerson',
        sessionType: 'Individual',
        participantsCount: 1,
        preferredDatesSummary: '3 جلسات نهاية الأسبوع',
        createdAt: hoursAgo(48),
        expiresAt: hoursAhead(24 * 5),
        attachmentsCount: 0,
        offersCount: 0,
        descriptionForTeacher: null,
        sessions: buildSessions(3, ['الكسور', 'النسب', 'مراجعة'], [60, 60, 60], 5),
        attachments: [],
        participants: [
            { studentId: 1005, studentName: 'طالبة #1005', confirmationStatus: 'Confirmed', isOwner: true },
        ],
    },
]

// ----- offers (this teacher's own offers) ------------------------------------

let offerSeq = 9000

const OFFERS: SessionOffer[] = [
    // An active offer (Pending) on request 1003
    {
        id: ++offerSeq,
        requestId: 1003,
        teacherId: CURRENT_TEACHER_ID,
        teacherDisplayName: CURRENT_TEACHER_NAME,
        status: 'Pending',
        version: 1,
        totalPrice: 1200,
        pricePerSession: 150,
        generalNotes: 'مرحباً، يسرني تدريس مجموعتكم. أقترح البدء بجلسة تجريبية مجانية.',
        perSessionResponses: [],
        validityHours: 48,
        createdAt: hoursAgo(2),
        expiresAt: hoursAhead(46),
        studentLastViewedAt: null,
        hasUnreadStudentMessages: false,
    },
    // A negotiating offer on a request that's not in our visible inbox list (synthetic)
    {
        id: ++offerSeq,
        requestId: 1001,
        teacherId: CURRENT_TEACHER_ID,
        teacherDisplayName: CURRENT_TEACHER_NAME,
        status: 'InDiscussion',
        version: 2,
        totalPrice: 900,
        pricePerSession: 150,
        generalNotes: 'تم تحديث السعر بناءً على المناقشة في الشات.',
        perSessionResponses: [],
        validityHours: 48,
        createdAt: hoursAgo(1),
        expiresAt: hoursAhead(47),
        studentLastViewedAt: hoursAgo(0.5),
        hasUnreadStudentMessages: true,
    },
    // An accepted offer
    {
        id: ++offerSeq,
        requestId: 1002,
        teacherId: CURRENT_TEACHER_ID,
        teacherDisplayName: CURRENT_TEACHER_NAME,
        status: 'Accepted',
        version: 1,
        totalPrice: 600,
        pricePerSession: 150,
        generalNotes: null,
        perSessionResponses: [],
        validityHours: 48,
        createdAt: hoursAgo(96),
        expiresAt: hoursAgo(48),
        studentLastViewedAt: hoursAgo(72),
        hasUnreadStudentMessages: false,
    },
    // A rejected (AutoRejected) offer
    {
        id: ++offerSeq,
        requestId: 1005,
        teacherId: CURRENT_TEACHER_ID,
        teacherDisplayName: CURRENT_TEACHER_NAME,
        status: 'AutoRejected',
        version: 1,
        totalPrice: 450,
        pricePerSession: 150,
        generalNotes: null,
        perSessionResponses: [],
        validityHours: 48,
        createdAt: hoursAgo(72),
        expiresAt: hoursAgo(24),
        studentLastViewedAt: hoursAgo(36),
        hasUnreadStudentMessages: false,
    },
]

// ----- chat ------------------------------------------------------------------
// Per (requestId, teacherId) thread. The teacher's id is fixed in this mock,
// so threadId === `${requestId}:${CURRENT_TEACHER_ID}`.

const threadIdFor = (requestId: number, teacherId = CURRENT_TEACHER_ID) =>
    `${requestId}:${teacherId}`

interface InternalThreadState {
    meta: ChatThreadMeta
    messages: ChatMessage[]
}

const THREADS: Map<string, InternalThreadState> = new Map()

const studentNameFor = (requestId: number): string => {
    const r = REQUESTS.find((x) => x.id === requestId)
    return r?.studentDisplayName ?? `طالب #${requestId}`
}

// Subscriber registry — components register a callback per thread to receive
// pushed messages. Mirrors a SignalR group subscription.
type Subscriber = (message: ChatMessage, threadMeta: ChatThreadMeta) => void
const SUBSCRIBERS: Map<string, Set<Subscriber>> = new Map()

const emit = (threadId: string, message: ChatMessage, meta: ChatThreadMeta) => {
    const subs = SUBSCRIBERS.get(threadId)
    if (!subs) return
    for (const fn of subs) fn(message, meta)
}

let msgSeq = 1
const newMessageId = () => `m-${++msgSeq}-${Date.now()}`

const ensureThread = (requestId: number): InternalThreadState => {
    const id = threadIdFor(requestId)
    let thread = THREADS.get(id)
    if (thread) return thread

    thread = {
        meta: {
            threadId: id,
            requestId,
            teacherId: CURRENT_TEACHER_ID,
            studentDisplayName: studentNameFor(requestId),
            studentIsTyping: false,
            lastReadByStudentAt: null,
        },
        messages: [],
    }

    // Seed an opening "system" line for the offer if one exists.
    const offer = offerForTeacherOnRequest(requestId, CURRENT_TEACHER_ID)
    if (offer) {
        thread.messages.push({
            id: newMessageId(),
            threadId: id,
            author: 'system',
            authorDisplayName: 'النظام',
            body: '',
            createdAt: offer.createdAt,
            systemEvent: 'OfferSubmitted',
            relatedOfferVersion: 1,
        })
        if (offer.version > 1) {
            thread.messages.push({
                id: newMessageId(),
                threadId: id,
                author: 'system',
                authorDisplayName: 'النظام',
                body: '',
                createdAt: offer.createdAt,
                systemEvent: 'OfferUpdated',
                relatedOfferVersion: offer.version,
            })
        }
    }

    // Seed one realistic student message on the "negotiating" request.
    if (requestId === 1001) {
        thread.messages.push({
            id: newMessageId(),
            threadId: id,
            author: 'student',
            authorDisplayName: thread.meta.studentDisplayName,
            body: 'السلام عليكم أستاذ، هل يمكن خفض السعر قليلاً؟ ميزانيتي محدودة.',
            createdAt: hoursAgo(1),
        })
    }

    THREADS.set(id, thread)
    return thread
}

// Auto-reply machinery: when the teacher posts a message, schedule a short
// "typing…" indicator followed by a canned student reply. Demo only.
const STUDENT_REPLIES = [
    'تمام، أوافق على هذا.',
    'هل يمكن أن نبدأ الأسبوع القادم بدلاً من هذا الأسبوع؟',
    'شكراً لردك السريع. سأناقش الأمر مع والدي وأعود لك.',
    'ممتاز، أرى أن المواعيد المقترحة تناسبني.',
    'هل تستطيع تخصيص جلسة إضافية للمراجعة؟',
]
let replyCursor = 0

const scheduleStudentReply = (requestId: number) => {
    const id = threadIdFor(requestId)
    const thread = THREADS.get(id)
    if (!thread) return

    // Typing indicator on
    thread.meta = { ...thread.meta, studentIsTyping: true }
    emitTyping(id, thread.meta)

    const typingMs = 900 + Math.floor(Math.random() * 600)
    const totalMs = typingMs + 1800 + Math.floor(Math.random() * 1500)

    setTimeout(() => {
        const t = THREADS.get(id)
        if (!t) return
        t.meta = { ...t.meta, studentIsTyping: false }
        emitTyping(id, t.meta)
    }, totalMs - 100)

    setTimeout(() => {
        const t = THREADS.get(id)
        if (!t) return
        const reply: ChatMessage = {
            id: newMessageId(),
            threadId: id,
            author: 'student',
            authorDisplayName: t.meta.studentDisplayName,
            body: STUDENT_REPLIES[replyCursor % STUDENT_REPLIES.length],
            createdAt: new Date().toISOString(),
        }
        replyCursor += 1
        t.messages.push(reply)
        // Bump the offer to InDiscussion if a Pending offer exists.
        const offer = offerForTeacherOnRequest(requestId, CURRENT_TEACHER_ID)
        if (offer && (offer.status === 'Pending' || offer.status === 'Updated' || offer.status === 'Viewed')) {
            offer.status = 'InDiscussion' as SessionOfferStatus
            offer.hasUnreadStudentMessages = true
        }
        emit(id, reply, t.meta)
    }, totalMs)
}

// Typing-only events are delivered through the same channel; subscribers branch
// on `message.body === ''` + no `systemEvent` to distinguish — but cleaner is
// to expose a separate typing channel:
type TypingSubscriber = (meta: ChatThreadMeta) => void
const TYPING_SUBS: Map<string, Set<TypingSubscriber>> = new Map()
const emitTyping = (threadId: string, meta: ChatThreadMeta) => {
    const subs = TYPING_SUBS.get(threadId)
    if (!subs) return
    for (const fn of subs) fn(meta)
}

// ----- teacher's existing schedule (for conflict detection) ------------------
// Slots the current teacher has already committed to (mirrors the sessions
// module's upcoming sessions). On the real backend this comes from the
// teacher's ScheduledSessions / availability. Datetimes are aligned with a few
// requests' preferred sessions so the conflict check produces a realistic hit.

interface BusySlot {
    startsAt: string // ISO
    durationMinutes: number
    label: string
}

const TEACHER_BUSY: BusySlot[] = [
    { startsAt: daysAhead(4, 17), durationMinutes: 60, label: 'جلسة مجدولة سابقاً' },
    { startsAt: daysAhead(7, 17), durationMinutes: 90, label: 'جلسة مجدولة سابقاً' },
]

const overlaps = (startA: number, durA: number, startB: number, durB: number) =>
    startA < startB + durB * 60_000 && startB < startA + durA * 60_000

// Returns the conflicts between a request's preferred session times and the
// teacher's already-committed slots. If `onlySessionNumbers` is given, only
// those sessions are checked (used to validate accepted slots on submit).
const conflictsForRequest = (
    requestId: number,
    onlySessionNumbers?: number[],
): ScheduleConflict[] => {
    const r = REQUESTS.find((x) => x.id === requestId)
    if (!r) return []
    const out: ScheduleConflict[] = []
    for (const s of r.sessions) {
        if (onlySessionNumbers && !onlySessionNumbers.includes(s.sessionNumber)) continue
        const start = new Date(s.preferredDate).getTime()
        const hit = TEACHER_BUSY.find((b) =>
            overlaps(start, s.durationMinutes, new Date(b.startsAt).getTime(), b.durationMinutes),
        )
        if (hit) out.push({ sessionNumber: s.sessionNumber, conflictsWith: hit.label })
    }
    return out
}

// ----- read helpers ----------------------------------------------------------

const offerForTeacherOnRequest = (requestId: number, teacherId: number) =>
    OFFERS.find((o) => o.requestId === requestId && o.teacherId === teacherId)

const requestBelongsInTab = (
    request: SessionRequestDetail,
    tab: RequestInboxTab,
    teacherId: number,
): boolean => {
    const offer = offerForTeacherOnRequest(request.id, teacherId)
    switch (tab) {
        case 'new':
            return !offer
        case 'active':
            return !!offer && (offer.status === 'Pending' || offer.status === 'Viewed' || offer.status === 'Updated')
        case 'negotiating':
            return !!offer && offer.status === 'InDiscussion'
        case 'accepted':
            return !!offer && offer.status === 'Accepted'
        case 'rejected':
            return !!offer && (
                offer.status === 'Rejected' ||
                offer.status === 'AutoRejected' ||
                offer.status === 'Withdrawn' ||
                offer.status === 'Expired'
            )
    }
}

const toListItem = (r: SessionRequestDetail): SessionRequestListItem => ({
    id: r.id,
    studentDisplayName: r.studentDisplayName,
    studentAvatarUrl: r.studentAvatarUrl,
    isStudentAnonymised: r.isStudentAnonymised,
    studentGradeLabel: r.studentGradeLabel,
    studentRating: r.studentRating,
    domainCode: r.domainCode,
    subjectNameAr: r.subjectNameAr,
    subjectNameEn: r.subjectNameEn,
    unitNames: r.unitNames,
    sessionsCount: r.sessionsCount,
    totalMinutes: r.totalMinutes,
    teachingMode: r.teachingMode,
    sessionType: r.sessionType,
    participantsCount: r.participantsCount,
    preferredDatesSummary: r.preferredDatesSummary,
    createdAt: r.createdAt,
    expiresAt: r.expiresAt,
    attachmentsCount: r.attachmentsCount,
    offersCount: r.offersCount,
})

// ----- public mock API -------------------------------------------------------

export const mockApi = {
    currentTeacherId: CURRENT_TEACHER_ID,
    currentTeacherName: CURRENT_TEACHER_NAME,

    async listInbox(
        tab: RequestInboxTab,
        filters: {
            search: string
            teachingMode: 'Online' | 'InPerson' | 'all'
            sessionType: 'Individual' | 'Group' | 'all'
            subject: string
            dateWindow: 'all' | 'next7' | 'next30'
            sort: 'newest' | 'urgent' | 'fewest-offers'
        },
    ): Promise<InboxResult> {
        await sleep(220)
        const inTab = REQUESTS.filter((r) => requestBelongsInTab(r, tab, CURRENT_TEACHER_ID))

        // Date window: a request matches if any preferred session date falls
        // within `days` from now. NOW is the fixed mock clock.
        const windowDays = filters.dateWindow === 'next7' ? 7 : filters.dateWindow === 'next30' ? 30 : null
        const windowEnd = windowDays === null ? null : NOW + windowDays * 86_400_000
        const matchesDateWindow = (r: SessionRequestDetail) => {
            if (windowEnd === null) return true
            return r.sessions.some((s) => {
                const t = new Date(s.preferredDate).getTime()
                return t >= NOW && t <= windowEnd
            })
        }

        const filtered = inTab.filter((r) => {
            const q = filters.search.trim().toLowerCase()
            const matchesSearch =
                !q ||
                r.subjectNameAr.toLowerCase().includes(q) ||
                r.subjectNameEn.toLowerCase().includes(q) ||
                r.unitNames.some((u) => u.toLowerCase().includes(q))
            const matchesMode = filters.teachingMode === 'all' || r.teachingMode === filters.teachingMode
            const matchesType = filters.sessionType === 'all' || r.sessionType === filters.sessionType
            const matchesSubject = filters.subject === 'all' || r.subjectNameEn === filters.subject
            return matchesSearch && matchesMode && matchesType && matchesSubject && matchesDateWindow(r)
        })

        const sorted = [...filtered].sort((a, b) => {
            switch (filters.sort) {
                case 'newest':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                case 'urgent':
                    return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime()
                case 'fewest-offers':
                    return a.offersCount - b.offersCount
            }
        })

        const counts: InboxCounts = {
            new: REQUESTS.filter((r) => requestBelongsInTab(r, 'new', CURRENT_TEACHER_ID)).length,
            active: REQUESTS.filter((r) => requestBelongsInTab(r, 'active', CURRENT_TEACHER_ID)).length,
            negotiating: REQUESTS.filter((r) => requestBelongsInTab(r, 'negotiating', CURRENT_TEACHER_ID)).length,
            accepted: REQUESTS.filter((r) => requestBelongsInTab(r, 'accepted', CURRENT_TEACHER_ID)).length,
            rejected: REQUESTS.filter((r) => requestBelongsInTab(r, 'rejected', CURRENT_TEACHER_ID)).length,
        }

        // Distinct subjects across ALL of the teacher's requests (tab-independent)
        // so the subject filter stays stable as tabs/filters change.
        const subjectMap = new Map<string, SubjectFacet>()
        for (const r of REQUESTS) {
            if (!subjectMap.has(r.subjectNameEn)) {
                subjectMap.set(r.subjectNameEn, {
                    key: r.subjectNameEn,
                    labelAr: r.subjectNameAr,
                    labelEn: r.subjectNameEn,
                })
            }
        }
        const subjects = [...subjectMap.values()].sort((a, b) => a.labelEn.localeCompare(b.labelEn))

        return { items: sorted.map(toListItem), counts, subjects }
    },

    async getRequest(requestId: number): Promise<SessionRequestDetail> {
        await sleep(180)
        const r = REQUESTS.find((x) => x.id === requestId)
        if (!r) throw new Error('mockErrors.requestNotFound')
        return JSON.parse(JSON.stringify(r))
    },

    async getMyOfferForRequest(requestId: number): Promise<SessionOffer | null> {
        await sleep(120)
        const o = offerForTeacherOnRequest(requestId, CURRENT_TEACHER_ID)
        return o ? JSON.parse(JSON.stringify(o)) : null
    },

    // Preferred sessions that clash with the teacher's already-committed slots.
    async getScheduleConflicts(requestId: number): Promise<ScheduleConflict[]> {
        await sleep(120)
        return conflictsForRequest(requestId)
    },

    async submitOffer(input: {
        requestId: number
        totalPrice: number
        pricePerSession: number | null
        generalNotes: string | null
        perSessionResponses: PerSessionOfferResponse[]
        validityHours: number
    }): Promise<SessionOffer> {
        await sleep(450)
        // Throw translation keys; the UI translates them via t().
        if (input.totalPrice <= 0) throw new Error('mockErrors.priceMustBePositive')

        // BRD §7 Screen 4 — server-side checks before accepting the offer.
        const request = REQUESTS.find((x) => x.id === input.requestId)
        if (request?.priceRange) {
            const { min, max } = request.priceRange
            if (input.totalPrice < min || input.totalPrice > max) {
                throw new Error('mockErrors.priceOutOfRange')
            }
        }
        const acceptedSessionNumbers = input.perSessionResponses
            .filter((r) => r.accept)
            .map((r) => r.sessionNumber)
        if (conflictsForRequest(input.requestId, acceptedSessionNumbers).length > 0) {
            throw new Error('mockErrors.offerScheduleConflict')
        }

        const existing = offerForTeacherOnRequest(input.requestId, CURRENT_TEACHER_ID)
        if (existing) {
            existing.totalPrice = input.totalPrice
            existing.pricePerSession = input.pricePerSession
            existing.generalNotes = input.generalNotes
            existing.perSessionResponses = input.perSessionResponses
            existing.validityHours = input.validityHours
            existing.version += 1
            existing.status = 'Updated'
            existing.createdAt = new Date().toISOString()
            existing.expiresAt = new Date(Date.now() + input.validityHours * 3_600_000).toISOString()
            return JSON.parse(JSON.stringify(existing))
        }

        const created: SessionOffer = {
            id: ++offerSeq,
            requestId: input.requestId,
            teacherId: CURRENT_TEACHER_ID,
            teacherDisplayName: CURRENT_TEACHER_NAME,
            status: 'Pending',
            version: 1,
            totalPrice: input.totalPrice,
            pricePerSession: input.pricePerSession,
            generalNotes: input.generalNotes,
            perSessionResponses: input.perSessionResponses,
            validityHours: input.validityHours,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + input.validityHours * 3_600_000).toISOString(),
            studentLastViewedAt: null,
            hasUnreadStudentMessages: false,
        }
        OFFERS.push(created)
        // Bump the request's offer counter
        const r = REQUESTS.find((x) => x.id === input.requestId)
        if (r) r.offersCount += 1
        return JSON.parse(JSON.stringify(created))
    },

    async withdrawOffer(offerId: number): Promise<SessionOffer> {
        await sleep(250)
        const offer = OFFERS.find((o) => o.id === offerId)
        if (!offer) throw new Error('mockErrors.offerNotFound')
        if (offer.status === 'Accepted') throw new Error('mockErrors.cannotWithdrawAccepted')
        offer.status = 'Withdrawn' as SessionOfferStatus
        return JSON.parse(JSON.stringify(offer))
    },

    // ---- chat ----

    async getThread(requestId: number): Promise<{ meta: ChatThreadMeta; messages: ChatMessage[] }> {
        await sleep(160)
        const thread = ensureThread(requestId)
        return JSON.parse(JSON.stringify({ meta: thread.meta, messages: thread.messages }))
    },

    async sendMessage(requestId: number, body: string): Promise<ChatMessage> {
        await sleep(160)
        const trimmed = body.trim()
        if (!trimmed) throw new Error('mockErrors.emptyMessage')
        const thread = ensureThread(requestId)
        const msg: ChatMessage = {
            id: newMessageId(),
            threadId: thread.meta.threadId,
            author: 'teacher',
            authorDisplayName: CURRENT_TEACHER_NAME,
            body: trimmed,
            createdAt: new Date().toISOString(),
        }
        thread.messages.push(msg)
        emit(thread.meta.threadId, msg, thread.meta)
        scheduleStudentReply(requestId)
        return JSON.parse(JSON.stringify(msg))
    },

    subscribeToThread(
        requestId: number,
        onMessage: (m: ChatMessage, meta: ChatThreadMeta) => void,
        onTyping?: (meta: ChatThreadMeta) => void,
    ): () => void {
        const id = threadIdFor(requestId)
        ensureThread(requestId)

        let msgSet = SUBSCRIBERS.get(id)
        if (!msgSet) {
            msgSet = new Set()
            SUBSCRIBERS.set(id, msgSet)
        }
        msgSet.add(onMessage)

        let typingSet: Set<TypingSubscriber> | undefined
        if (onTyping) {
            typingSet = TYPING_SUBS.get(id)
            if (!typingSet) {
                typingSet = new Set()
                TYPING_SUBS.set(id, typingSet)
            }
            typingSet.add(onTyping)
        }

        return () => {
            msgSet?.delete(onMessage)
            if (onTyping && typingSet) typingSet.delete(onTyping)
        }
    },
}

export type MockApi = typeof mockApi

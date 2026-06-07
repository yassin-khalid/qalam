// =============================================================================
//  MOCK STORE for Scenario 2 (Open Session Request — Teacher Offer Workflow).
//  Lives entirely in-memory. Mirrors the shipped backend v1 contract
//  (TEACHER-ROLE-Scenario2.md). Replace with real fetch() calls inside the
//  *QueryOptions files in ../-queries and delete this file when the backend is
//  wired. Endpoint shapes (base /Api/V1/Teacher and /Api/V1/Conversations):
//    GET  /AvailableRequests                          -> listInbox
//    GET  /AvailableRequests/{id}                     -> getRequest (Notified->Viewed)
//    PUT  /AvailableRequests/{id}/mark-viewed         -> markViewed
//    GET  /AvailableRequests/{id}/availability-match  -> getAvailabilityMatch
//    POST /AvailableRequests/{id}/dismiss             -> dismissRequest
//    POST /Offers                                     -> submitOffer
//    PUT  /Offers/{id}                                -> updateOffer
//    POST /Offers/{id}/withdraw                       -> withdrawOffer
//    GET  /Offers/my                                  -> listMyOffers
//    GET  /Offers/{id}                                -> getOffer
//    GET  /Conversations/by-request/{rid}/teacher/{tid} -> getConversation
//    GET  /Conversations/{cid}/messages               -> getMessages
//    POST /Conversations/{cid}/messages               -> postMessage
//    POST /Conversations/{cid}/read                   -> markConversationRead
// =============================================================================

import {
    MAX_OFFER_ATTEMPTS,
    type AvailabilityMatch,
    type ChatMessage,
    type Conversation,
    type InboxCounts,
    type InboxResult,
    type MessagePage,
    type RequestedSession,
    type SessionOffer,
    type SessionRequestDetail,
    type SessionRequestListItem,
    type SubjectFacet,
    type TargetStatus,
} from '../-types/types'

// The "currently logged-in teacher" we pretend to be.
const CURRENT_TEACHER_ID = 17
const CURRENT_TEACHER_USER_ID = 17
const CURRENT_TEACHER_NAME = 'د. أحمد العلي'

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

const offerNumberOf = (id: number, createdAtIso: string) =>
    `OF-${new Date(createdAtIso).getUTCFullYear()}-${String(id).padStart(4, '0')}`

const TIME_SLOTS = [
    { id: 5, label: '04:00 - 05:00 م' },
    { id: 6, label: '05:00 - 06:00 م' },
    { id: 7, label: '06:00 - 07:00 م' },
    { id: 8, label: '07:00 - 08:00 م' },
    { id: 9, label: '08:00 - 09:00 م' },
] as const

const pickSlot = (i: number) => TIME_SLOTS[i % TIME_SLOTS.length]

let sessionSeq = 5000
let unitSeq = 6000

const buildSessions = (
    count: number,
    units: string[],
    durations: number[],
    startDayOffset: number,
): RequestedSession[] => {
    return Array.from({ length: count }, (_, i) => {
        const unit = units[i % units.length]
        const slot = pickSlot(i)
        return {
            id: ++sessionSeq,
            sequenceNumber: i + 1,
            title: `${unit} — جلسة ${i + 1}`,
            description: i % 2 === 0 ? `شرح مفصّل لـ ${unit} مع تمارين تطبيقية.` : null,
            durationMinutes: durations[i % durations.length],
            unitNames: [unit],
            units: [
                {
                    id: ++unitSeq,
                    contentUnitId: ++unitSeq,
                    contentUnitName: unit,
                    lessonId: null,
                    lessonName: null,
                },
            ],
            notes: i === 0 ? 'الطالب ضعيف في الأساسيات، يرجى البدء من الصفر.' : null,
            preferredDate: daysAhead(startDayOffset + i * 2, 17 + (i % 4)),
            timeSlotId: slot.id,
            preferredTimeSlotLabel: slot.label,
        }
    })
}

// ----- requests --------------------------------------------------------------
// `targetStatus` represents the CURRENT teacher's OpenSessionRequestTarget row.

const REQUESTS: SessionRequestDetail[] = [
    {
        id: 1001,
        requestKind: 'Published',
        studentId: 1001,
        studentDisplayName: 'سارة محمد',
        studentAvatarUrl: null,
        studentGradeLabel: 'الصف الثالث الثانوي',
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
        attachmentsCount: 2,
        offersCount: 2,
        targetStatus: 'Notified',
        viewedAt: null,
        descriptionForTeacher:
            'أريد تأسيس قوي للرياضيات قبل اختبار التحصيلي. تركيز على حل المسائل وليس فقط النظري.',
        sessions: buildSessions(6, ['الجبر', 'الجبر', 'الهندسة', 'المثلثات', 'مراجعة', 'اختبار تجريبي'], [60, 60, 90, 60, 60, 90], 4),
        attachments: [
            { id: 1, fileName: 'نتائج_الاختبار_السابق.pdf', fileType: 'pdf', sizeBytes: 245_000, sessionNumber: null },
            { id: 2, fileName: 'الكتاب_المدرسي.pdf', fileType: 'pdf', sizeBytes: 1_200_000, sessionNumber: null },
        ],
        participants: [
            { studentId: 1001, studentName: 'سارة محمد', confirmationStatus: 'Confirmed', isOwner: true },
        ],
        myOfferId: null,
        myOfferStatus: null,
        myOfferAttempts: 0,
    },
    {
        id: 1002,
        // Directed to this teacher specifically (private request).
        requestKind: 'Directed',
        studentId: 1002,
        studentDisplayName: 'طالبة #1002',
        studentAvatarUrl: null,
        studentGradeLabel: 'الصف الأول الثانوي',
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
        targetStatus: 'Notified',
        viewedAt: null,
        descriptionForTeacher: null,
        sessions: buildSessions(4, ['الحركة', 'الحركة', 'القوى', 'القوى'], [60, 60, 60, 60], 3),
        attachments: [],
        participants: [
            { studentId: 1002, studentName: 'طالبة #1002', confirmationStatus: 'Confirmed', isOwner: true },
        ],
        myOfferId: null,
        myOfferStatus: null,
        myOfferAttempts: 0,
    },
    {
        id: 1003,
        // Directed group request — the teacher already submitted an offer.
        requestKind: 'Directed',
        studentId: 1003,
        studentDisplayName: 'مجموعة 3 طلاب',
        studentAvatarUrl: null,
        studentGradeLabel: 'الصف الثاني المتوسط',
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
        // The teacher already submitted an offer on this one.
        targetStatus: 'OfferSubmitted',
        viewedAt: hoursAgo(18),
        descriptionForTeacher: 'نريد التركيز على التحدث ونطق صحيح وتجنّب التدريس النظري.',
        sessions: buildSessions(8, ['Tenses', 'Speaking', 'Tenses', 'Speaking', 'Vocabulary', 'Speaking', 'Mock test', 'Review'], [90, 90, 90, 90, 90, 90, 90, 90], 7),
        attachments: [
            { id: 3, fileName: 'curriculum_overview.pdf', fileType: 'pdf', sizeBytes: 410_000, sessionNumber: null },
            { id: 4, fileName: 'previous_quiz.png', fileType: 'image', sizeBytes: 88_000, sessionNumber: null },
        ],
        participants: [
            { studentId: 1003, studentName: 'مالك الطلب', confirmationStatus: 'Confirmed', isOwner: true },
            { studentId: 1010, studentName: 'طالب مدعو 1', confirmationStatus: 'Confirmed', isOwner: false },
            { studentId: 1011, studentName: 'طالب مدعو 2', confirmationStatus: 'Confirmed', isOwner: false },
        ],
        myOfferId: null,
        myOfferStatus: null,
        myOfferAttempts: 0,
    },
    {
        id: 1004,
        requestKind: 'Published',
        studentId: 1004,
        studentDisplayName: 'طالب #1004',
        studentAvatarUrl: null,
        studentGradeLabel: 'تحفيظ — مبتدئ',
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
        // Viewed but no offer yet.
        targetStatus: 'Viewed',
        viewedAt: hoursAgo(30),
        descriptionForTeacher: 'الحفظ بالأرباع، مع مراجعة كل أسبوع.',
        sessions: buildSessions(12, ['البقرة - الربع 1', 'البقرة - الربع 2', 'البقرة - الربع 3', 'البقرة - الربع 4', 'مراجعة', 'آل عمران - الربع 1', 'آل عمران - الربع 2', 'آل عمران - الربع 3', 'آل عمران - الربع 4', 'مراجعة', 'تثبيت', 'اختبار'], [45, 45, 45, 45, 60, 45, 45, 45, 45, 60, 45, 60], 2),
        attachments: [],
        participants: [
            { studentId: 1004, studentName: 'طالب #1004', confirmationStatus: 'Confirmed', isOwner: true },
        ],
        quranContentTypeLabel: 'حفظ',
        quranLevelLabel: 'مبتدئ',
        myOfferId: null,
        myOfferStatus: null,
        myOfferAttempts: 0,
    },
    {
        id: 1005,
        requestKind: 'Published',
        studentId: 1005,
        studentDisplayName: 'طالبة #1005',
        studentAvatarUrl: null,
        studentGradeLabel: 'الصف السادس الابتدائي',
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
        targetStatus: 'Notified',
        viewedAt: null,
        descriptionForTeacher: null,
        sessions: buildSessions(3, ['الكسور', 'النسب', 'مراجعة'], [60, 60, 60], 5),
        attachments: [],
        participants: [
            { studentId: 1005, studentName: 'طالبة #1005', confirmationStatus: 'Confirmed', isOwner: true },
        ],
        myOfferId: null,
        myOfferStatus: null,
        myOfferAttempts: 0,
    },
    // --- demo requests for the negative offer states (Design-Notes §4 matrix) ---
    {
        id: 1006,
        requestKind: 'Published',
        studentId: 1006,
        studentDisplayName: 'طالب #1006',
        studentAvatarUrl: null,
        studentGradeLabel: 'الصف الثاني الثانوي',
        domainCode: 'school',
        subjectNameAr: 'الكيمياء',
        subjectNameEn: 'Chemistry',
        unitNames: ['الجدول الدوري', 'التفاعلات'],
        sessionsCount: 4,
        totalMinutes: 4 * 60,
        teachingMode: 'Online',
        sessionType: 'Individual',
        participantsCount: 1,
        preferredDatesSummary: '4 جلسات الأسبوع القادم',
        createdAt: hoursAgo(60),
        expiresAt: hoursAhead(24 * 4),
        attachmentsCount: 0,
        offersCount: 3,
        // Offer was explicitly rejected by the student.
        targetStatus: 'OfferSubmitted',
        viewedAt: hoursAgo(58),
        descriptionForTeacher: 'أحتاج مدرّساً متفرغاً مساءً فقط.',
        sessions: buildSessions(4, ['الجدول الدوري', 'الجدول الدوري', 'التفاعلات', 'مراجعة'], [60, 60, 60, 60], 4),
        attachments: [],
        participants: [
            { studentId: 1006, studentName: 'طالب #1006', confirmationStatus: 'Confirmed', isOwner: true },
        ],
        myOfferId: null,
        myOfferStatus: null,
        myOfferAttempts: 0,
    },
    {
        id: 1007,
        requestKind: 'Directed',
        studentId: 1007,
        studentDisplayName: 'طالبة #1007',
        studentAvatarUrl: null,
        studentGradeLabel: 'الصف الأول الثانوي',
        domainCode: 'school',
        subjectNameAr: 'الأحياء',
        subjectNameEn: 'Biology',
        unitNames: ['الخلية', 'الوراثة'],
        sessionsCount: 5,
        totalMinutes: 5 * 60,
        teachingMode: 'Online',
        sessionType: 'Individual',
        participantsCount: 1,
        preferredDatesSummary: '5 جلسات على مدى أسبوعين',
        createdAt: hoursAgo(72),
        expiresAt: hoursAhead(24 * 3),
        attachmentsCount: 0,
        offersCount: 4,
        // Auto-rejected: the student accepted another teacher's offer.
        targetStatus: 'OfferSubmitted',
        viewedAt: hoursAgo(70),
        descriptionForTeacher: null,
        sessions: buildSessions(5, ['الخلية', 'الخلية', 'الوراثة', 'الوراثة', 'مراجعة'], [60, 60, 60, 60, 60], 3),
        attachments: [],
        participants: [
            { studentId: 1007, studentName: 'طالبة #1007', confirmationStatus: 'Confirmed', isOwner: true },
        ],
        myOfferId: null,
        myOfferStatus: null,
        myOfferAttempts: 0,
    },
    {
        id: 1008,
        requestKind: 'Published',
        studentId: 1008,
        studentDisplayName: 'طالب #1008',
        studentAvatarUrl: null,
        studentGradeLabel: 'الصف الثالث المتوسط',
        domainCode: 'school',
        subjectNameAr: 'الرياضيات',
        subjectNameEn: 'Mathematics',
        unitNames: ['المعادلات', 'الدوال'],
        sessionsCount: 4,
        totalMinutes: 4 * 60,
        teachingMode: 'InPerson',
        sessionType: 'Individual',
        participantsCount: 1,
        preferredDatesSummary: '4 جلسات نهاية الأسبوع',
        createdAt: hoursAgo(96),
        expiresAt: hoursAhead(24 * 6),
        attachmentsCount: 0,
        offersCount: 1,
        // Offer expired without a student reply — the teacher may re-offer.
        targetStatus: 'OfferSubmitted',
        viewedAt: hoursAgo(94),
        descriptionForTeacher: null,
        sessions: buildSessions(4, ['المعادلات', 'المعادلات', 'الدوال', 'مراجعة'], [60, 60, 60, 60], 6),
        attachments: [],
        participants: [
            { studentId: 1008, studentName: 'طالب #1008', confirmationStatus: 'Confirmed', isOwner: true },
        ],
        myOfferId: null,
        myOfferStatus: null,
        myOfferAttempts: 0,
    },
]

// ----- offers (this teacher's own offers) ------------------------------------

let offerSeq = 890

const makeOffer = (
    partial: Pick<SessionOffer, 'sessionRequestId' | 'price' | 'teacherNotes' | 'status' | 'version'> &
        Partial<SessionOffer> & { createdAt: string; expiresAt: string },
): SessionOffer => {
    const id = ++offerSeq
    return {
        id,
        offerNumber: offerNumberOf(id, partial.createdAt),
        sessionRequestId: partial.sessionRequestId,
        teacherId: CURRENT_TEACHER_ID,
        teacherDisplayName: CURRENT_TEACHER_NAME,
        price: partial.price,
        teacherNotes: partial.teacherNotes,
        status: partial.status,
        version: partial.version,
        createdAt: partial.createdAt,
        expiresAt: partial.expiresAt,
        acceptedAt: partial.acceptedAt ?? null,
        rejectedAt: partial.rejectedAt ?? null,
        withdrawnAt: partial.withdrawnAt ?? null,
        expiredAt: partial.expiredAt ?? null,
        rejectionReason: partial.rejectionReason ?? null,
        competitorAcceptedPrice: partial.competitorAcceptedPrice ?? null,
        conversationId: partial.conversationId ?? null,
        unreadMessagesCount: partial.unreadMessagesCount ?? 0,
    }
}

const OFFERS: SessionOffer[] = [
    // Pending offer on request 1003 (the request the teacher has acted on).
    makeOffer({
        sessionRequestId: 1003,
        price: 1200,
        teacherNotes: 'مرحباً، يسرني تدريس مجموعتكم. أقترح البدء بجلسة تجريبية مجانية.',
        status: 'Pending',
        version: 1,
        createdAt: hoursAgo(2),
        expiresAt: hoursAhead(46),
        unreadMessagesCount: 1,
    }),
    // Explicitly rejected offer on request 1006 (shows the rejection reason).
    makeOffer({
        sessionRequestId: 1006,
        price: 800,
        teacherNotes: 'أستطيع تدريسك مساءً بعد التاسعة.',
        status: 'Rejected',
        version: 1,
        createdAt: hoursAgo(50),
        expiresAt: hoursAhead(24 * 2),
        rejectedAt: hoursAgo(40),
        rejectionReason: 'المواعيد المتاحة لديك متأخرة جداً بالنسبة لي.',
    }),
    // Auto-rejected offer on request 1007 (student accepted another teacher;
    // we show the accepted price WITHOUT the competitor's identity).
    makeOffer({
        sessionRequestId: 1007,
        price: 1000,
        teacherNotes: 'خطة مركّزة على الفهم لا الحفظ.',
        status: 'AutoRejected',
        version: 2,
        createdAt: hoursAgo(66),
        expiresAt: hoursAhead(24 * 2),
        rejectedAt: hoursAgo(30),
        competitorAcceptedPrice: 850,
    }),
    // Expired offer on request 1008 (the teacher is allowed to re-offer).
    makeOffer({
        sessionRequestId: 1008,
        price: 600,
        teacherNotes: null,
        status: 'Expired',
        version: 1,
        createdAt: hoursAgo(90),
        expiresAt: hoursAgo(6),
        expiredAt: hoursAgo(6),
    }),
]

// Wire myOffer* fields onto the requests that have an offer. myOfferAttempts
// counts every submission ever made on the request (the seed offers each
// represent one attempt); version bumps do not add to it.
for (const r of REQUESTS) {
    const offersForRequest = OFFERS.filter((o) => o.sessionRequestId === r.id)
    r.myOfferAttempts = offersForRequest.length
    const latest = latestOfferOf(offersForRequest)
    if (latest) {
        r.myOfferId = latest.id
        r.myOfferStatus = latest.status
    }
}

// The "current" offer the teacher sees: the most-recent non-withdrawn one.
// (Withdrawn offers are hidden so the teacher can submit a fresh offer.)
function latestOfferOf(offers: SessionOffer[]): SessionOffer | undefined {
    return offers
        .filter((o) => o.status !== 'Withdrawn')
        .sort((a, b) => b.id - a.id)[0]
}

const offerForTeacherOnRequest = (requestId: number) =>
    latestOfferOf(OFFERS.filter((o) => o.sessionRequestId === requestId))

// A request is open to a NEW offer only when there is no live offer — i.e. none
// at all, or the latest is Withdrawn/Expired (Design-Notes §4 matrix). Pending,
// Accepted, Rejected and AutoRejected all block a fresh submission.
const canSubmitNewOffer = (requestId: number): boolean => {
    const latest = latestOfferOf(OFFERS.filter((o) => o.sessionRequestId === requestId))
    return !latest || latest.status === 'Expired'
}

// ----- availability match ----------------------------------------------------
// Slots the current teacher has already committed to. Datetimes are aligned
// with a few requests' preferred sessions so the match produces realistic hits.

interface BusySlot {
    startsAt: string // ISO
    durationMinutes: number
    label: string
}

const TEACHER_BUSY: BusySlot[] = [
    { startsAt: daysAhead(7, 17), durationMinutes: 90, label: 'Booked 2026-05-28 17:00-18:30' },
]

// Sessions the teacher's weekly availability does NOT cover (OutsideAvailability).
const OUTSIDE_AVAILABILITY_DATES = new Set<string>([daysAhead(5, 18)])

const overlaps = (startA: number, durA: number, startB: number, durB: number) =>
    startA < startB + durB * 60_000 && startB < startA + durA * 60_000

const computeAvailabilityMatch = (requestId: number): AvailabilityMatch[] => {
    const r = REQUESTS.find((x) => x.id === requestId)
    if (!r) return []
    return r.sessions.map((s) => {
        const start = new Date(s.preferredDate).getTime()
        const conflict = TEACHER_BUSY.find((b) =>
            overlaps(start, s.durationMinutes, new Date(b.startsAt).getTime(), b.durationMinutes),
        )
        if (conflict) {
            return {
                sessionId: s.id,
                sequenceNumber: s.sequenceNumber,
                preferredDate: s.preferredDate,
                timeSlotId: s.timeSlotId,
                status: 'Conflict' as const,
                conflictWith: conflict.label,
            }
        }
        if (OUTSIDE_AVAILABILITY_DATES.has(s.preferredDate)) {
            return {
                sessionId: s.id,
                sequenceNumber: s.sequenceNumber,
                preferredDate: s.preferredDate,
                timeSlotId: s.timeSlotId,
                status: 'OutsideAvailability' as const,
                conflictWith: null,
            }
        }
        return {
            sessionId: s.id,
            sequenceNumber: s.sequenceNumber,
            preferredDate: s.preferredDate,
            timeSlotId: s.timeSlotId,
            status: 'Available' as const,
            conflictWith: null,
        }
    })
}

// ----- conversations / chat --------------------------------------------------
// Keyed by (requestId, teacherId). The teacher is fixed in this mock.

let conversationSeq = 411
let messageSeq = 7000

interface InternalConversation {
    conversation: Conversation
    messages: ChatMessage[]
    requestId: number
    teacherLastReadAt: string | null
}

const CONVERSATIONS: Map<number, InternalConversation> = new Map() // requestId -> state

const studentForRequest = (requestId: number) => {
    const r = REQUESTS.find((x) => x.id === requestId)
    return {
        id: r?.studentId ?? requestId,
        name: r?.studentDisplayName ?? `طالب #${requestId}`,
    }
}

const ensureConversation = (requestId: number): InternalConversation => {
    const existing = CONVERSATIONS.get(requestId)
    if (existing) return existing

    const student = studentForRequest(requestId)
    const offer = offerForTeacherOnRequest(requestId)
    const conversationId = ++conversationSeq

    const messages: ChatMessage[] = []
    if (offer) {
        messages.push({
            id: ++messageSeq,
            type: 'System',
            senderUserId: null,
            senderDisplayName: null,
            senderRole: null,
            content: 'تم تقديم العرض.',
            sentAt: offer.createdAt,
        })
        messages.push({
            id: ++messageSeq,
            type: 'Text',
            senderUserId: student.id,
            senderDisplayName: student.name,
            senderRole: 'Student',
            content: 'السلام عليكم أستاذ، هل يمكن خفض السعر قليلاً؟ ميزانيتي محدودة.',
            sentAt: hoursAgo(1),
        })
    }

    const state: InternalConversation = {
        requestId,
        teacherLastReadAt: null,
        messages,
        conversation: {
            conversationId,
            offerId: offer?.id ?? 0,
            participants: [
                { userId: student.id, displayName: student.name, role: 'Student' },
                { userId: CURRENT_TEACHER_USER_ID, displayName: CURRENT_TEACHER_NAME, role: 'Teacher' },
            ],
            lastMessageAt: messages.length ? messages[messages.length - 1].sentAt : null,
            unreadCount: messages.filter((m) => m.senderRole === 'Student').length,
        },
    }
    if (offer) offer.conversationId = conversationId
    CONVERSATIONS.set(requestId, state)
    return state
}

const conversationById = (conversationId: number): InternalConversation | undefined => {
    for (const state of CONVERSATIONS.values()) {
        if (state.conversation.conversationId === conversationId) return state
    }
    return undefined
}

// Canned student auto-reply, scheduled shortly after the teacher posts. Demo
// only — mirrors the polling flow where a new student message appears later.
const STUDENT_REPLIES = [
    'تمام، أوافق على هذا.',
    'هل يمكن أن نبدأ الأسبوع القادم بدلاً من هذا الأسبوع؟',
    'شكراً لردك السريع. سأناقش الأمر مع والدي وأعود لك.',
    'ممتاز، أرى أن المواعيد المقترحة تناسبني.',
]
let replyCursor = 0

const scheduleStudentReply = (state: InternalConversation) => {
    const delay = 2200 + Math.floor(Math.random() * 1500)
    setTimeout(() => {
        const student = studentForRequest(state.requestId)
        const reply: ChatMessage = {
            id: ++messageSeq,
            type: 'Text',
            senderUserId: student.id,
            senderDisplayName: student.name,
            senderRole: 'Student',
            content: STUDENT_REPLIES[replyCursor % STUDENT_REPLIES.length],
            sentAt: new Date().toISOString(),
        }
        replyCursor += 1
        state.messages.push(reply)
        state.conversation.lastMessageAt = reply.sentAt
        state.conversation.unreadCount += 1
        const offer = offerForTeacherOnRequest(state.requestId)
        if (offer) offer.unreadMessagesCount += 1
    }, delay)
}

// ----- read helpers ----------------------------------------------------------

const toListItem = (r: SessionRequestDetail): SessionRequestListItem => ({
    id: r.id,
    studentId: r.studentId,
    studentDisplayName: r.studentDisplayName,
    studentAvatarUrl: r.studentAvatarUrl,
    studentGradeLabel: r.studentGradeLabel,
    requestKind: r.requestKind,
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
    targetStatus: r.targetStatus,
    viewedAt: r.viewedAt,
})

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v))

// ----- public mock API -------------------------------------------------------

export const mockApi = {
    currentTeacherId: CURRENT_TEACHER_ID,
    currentTeacherUserId: CURRENT_TEACHER_USER_ID,
    currentTeacherName: CURRENT_TEACHER_NAME,

    // GET /AvailableRequests?status=&subjectId=&dateFrom=&dateTo=&sortBy=
    async listInbox(
        tab: TargetStatus | 'all',
        filters: {
            search: string
            teachingMode: 'Online' | 'InPerson' | 'all'
            sessionType: 'Individual' | 'Group' | 'all'
            subject: string
            requestKind: 'Published' | 'Directed' | 'all'
            dateWindow: 'all' | 'next7' | 'next30'
            sort: 'Newest' | 'ExpiringSoon' | 'MostOffers'
        },
    ): Promise<InboxResult> {
        await sleep(220)

        // 'all' excludes Skipped (dismissed) requests.
        const visible = REQUESTS.filter((r) => r.targetStatus !== 'Skipped')
        const inTab = tab === 'all' ? visible : visible.filter((r) => r.targetStatus === tab)

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
            const matchesKind = filters.requestKind === 'all' || r.requestKind === filters.requestKind
            return matchesSearch && matchesMode && matchesType && matchesSubject && matchesKind && matchesDateWindow(r)
        })

        const bySort = (a: SessionRequestDetail, b: SessionRequestDetail) => {
            switch (filters.sort) {
                case 'Newest':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                case 'ExpiringSoon':
                    return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime()
                case 'MostOffers':
                    return b.offersCount - a.offersCount
            }
        }
        // Directed requests carry the student's trust and always rank above
        // published ones (Design-Notes §4), then the chosen sort breaks ties.
        const kindRank = (r: SessionRequestDetail) => (r.requestKind === 'Directed' ? 0 : 1)
        const sorted = [...filtered].sort((a, b) => kindRank(a) - kindRank(b) || bySort(a, b))

        const counts: InboxCounts = {
            all: visible.length,
            Notified: visible.filter((r) => r.targetStatus === 'Notified').length,
            Viewed: visible.filter((r) => r.targetStatus === 'Viewed').length,
            OfferSubmitted: visible.filter((r) => r.targetStatus === 'OfferSubmitted').length,
        }

        const subjectMap = new Map<string, SubjectFacet>()
        for (const r of visible) {
            if (!subjectMap.has(r.subjectNameEn)) {
                subjectMap.set(r.subjectNameEn, {
                    key: r.subjectNameEn,
                    labelAr: r.subjectNameAr,
                    labelEn: r.subjectNameEn,
                })
            }
        }
        const subjects = [...subjectMap.values()].sort((a, b) => a.labelEn.localeCompare(b.labelEn))

        const items = sorted.map(toListItem)
        return {
            items,
            counts,
            subjects,
            totalCount: items.length,
            pageNumber: 1,
            pageSize: 20,
            totalPages: 1,
        }
    },

    // GET /AvailableRequests/{id} — side effect: Notified -> Viewed.
    async getRequest(requestId: number): Promise<SessionRequestDetail> {
        await sleep(180)
        const r = REQUESTS.find((x) => x.id === requestId)
        if (!r) throw new Error('mockErrors.requestNotFound')
        if (r.targetStatus === 'Notified') {
            r.targetStatus = 'Viewed'
            r.viewedAt = new Date().toISOString()
        }
        return clone(r)
    },

    // PUT /AvailableRequests/{id}/mark-viewed — idempotent.
    async markViewed(requestId: number): Promise<void> {
        await sleep(100)
        const r = REQUESTS.find((x) => x.id === requestId)
        if (!r) throw new Error('mockErrors.requestNotFound')
        if (r.targetStatus === 'Notified') {
            r.targetStatus = 'Viewed'
            r.viewedAt = new Date().toISOString()
        }
    },

    // GET /AvailableRequests/{id}/availability-match
    async getAvailabilityMatch(requestId: number): Promise<AvailabilityMatch[]> {
        await sleep(120)
        return computeAvailabilityMatch(requestId)
    },

    // POST /AvailableRequests/{id}/dismiss
    async dismissRequest(requestId: number): Promise<void> {
        await sleep(200)
        const r = REQUESTS.find((x) => x.id === requestId)
        if (!r) throw new Error('mockErrors.requestNotFound')
        if (r.targetStatus === 'OfferSubmitted') throw new Error('mockErrors.offerAlreadySubmitted')
        r.targetStatus = 'Skipped'
    },

    // GET /Offers/my (the current request's offer, if any).
    async getMyOfferForRequest(requestId: number): Promise<SessionOffer | null> {
        await sleep(120)
        const o = offerForTeacherOnRequest(requestId)
        return o ? clone(o) : null
    },

    // POST /Offers
    async submitOffer(input: {
        sessionRequestId: number
        price: number
        teacherNotes: string | null
        validityHours: number
        commitmentConfirmed: boolean
    }): Promise<SessionOffer> {
        await sleep(450)
        // FluentValidation-style checks (translation keys; UI translates via t()).
        if (!(input.price > 0)) throw new Error('mockErrors.mustBePositive')
        if (input.validityHours < 24 || input.validityHours > 168) throw new Error('mockErrors.invalidValidityHours')
        if (input.commitmentConfirmed !== true) throw new Error('mockErrors.commitmentNotConfirmed')

        const request = REQUESTS.find((x) => x.id === input.sessionRequestId)
        if (!request) throw new Error('mockErrors.requestNotFound')

        // A fresh offer is only allowed when there is no live offer (none, or the
        // latest is Withdrawn/Expired). Pending/Accepted/Rejected/AutoRejected block.
        if (!canSubmitNewOffer(input.sessionRequestId)) throw new Error('mockErrors.duplicateOffer')
        // Cap the number of submissions per request (Design-Notes §4).
        if (request.myOfferAttempts >= MAX_OFFER_ATTEMPTS) throw new Error('mockErrors.resubmitLimit')

        const createdAt = new Date().toISOString()
        const created = makeOffer({
            sessionRequestId: input.sessionRequestId,
            price: input.price,
            teacherNotes: input.teacherNotes,
            status: 'Pending',
            version: 1,
            createdAt,
            expiresAt: new Date(Date.now() + input.validityHours * 3_600_000).toISOString(),
        })
        OFFERS.push(created)
        request.offersCount += 1
        request.targetStatus = 'OfferSubmitted'
        request.myOfferId = created.id
        request.myOfferStatus = created.status
        request.myOfferAttempts += 1
        return clone(created)
    },

    // PUT /Offers/{id} — only price/teacherNotes/validityHours; version++.
    async updateOffer(input: {
        id: number
        price?: number
        teacherNotes?: string | null
        validityHours?: number
    }): Promise<SessionOffer> {
        await sleep(350)
        const offer = OFFERS.find((o) => o.id === input.id)
        if (!offer) throw new Error('mockErrors.offerNotFound')
        if (offer.status !== 'Pending') throw new Error('mockErrors.offerNotPending')

        if (input.price !== undefined) {
            if (!(input.price > 0)) throw new Error('mockErrors.mustBePositive')
            offer.price = input.price
        }
        if (input.teacherNotes !== undefined) offer.teacherNotes = input.teacherNotes
        if (input.validityHours !== undefined) {
            if (input.validityHours < 24 || input.validityHours > 168) throw new Error('mockErrors.invalidValidityHours')
            offer.expiresAt = new Date(Date.now() + input.validityHours * 3_600_000).toISOString()
        }
        offer.version += 1

        // Append a System message to the conversation (OfferUpdate).
        const state = CONVERSATIONS.get(offer.sessionRequestId)
        if (state) {
            const msg: ChatMessage = {
                id: ++messageSeq,
                type: 'System',
                senderUserId: null,
                senderDisplayName: null,
                senderRole: null,
                content: `تم تحديث العرض - السعر الجديد: ${offer.price} ر.س`,
                sentAt: new Date().toISOString(),
            }
            state.messages.push(msg)
            state.conversation.lastMessageAt = msg.sentAt
        }
        return clone(offer)
    },

    // POST /Offers/{id}/withdraw — an optional reason is shown to the student.
    async withdrawOffer(offerId: number, reason?: string | null): Promise<void> {
        await sleep(250)
        const offer = OFFERS.find((o) => o.id === offerId)
        if (!offer) throw new Error('mockErrors.offerNotFound')
        if (offer.status !== 'Pending') throw new Error('mockErrors.offerNotPending')
        offer.status = 'Withdrawn'
        offer.withdrawnAt = new Date().toISOString()
        // Record the withdrawal (and the reason, if any) in the conversation so it
        // stays as a reference for the student.
        const state = CONVERSATIONS.get(offer.sessionRequestId)
        if (state) {
            const trimmed = reason?.trim()
            const msg: ChatMessage = {
                id: ++messageSeq,
                type: 'System',
                senderUserId: null,
                senderDisplayName: null,
                senderRole: null,
                content: trimmed ? `تم سحب العرض. السبب: ${trimmed}` : 'تم سحب العرض.',
                sentAt: new Date().toISOString(),
            }
            state.messages.push(msg)
            state.conversation.lastMessageAt = msg.sentAt
        }
        // After withdraw the teacher may offer again; the target returns to Viewed.
        const r = REQUESTS.find((x) => x.id === offer.sessionRequestId)
        if (r) {
            r.targetStatus = 'Viewed'
            r.myOfferId = null
            r.myOfferStatus = null
        }
    },

    // ---- conversations ----

    // GET /Conversations/by-request/{requestId}/teacher/{teacherId}
    async getConversation(requestId: number): Promise<Conversation> {
        await sleep(160)
        const state = ensureConversation(requestId)
        return clone(state.conversation)
    },

    // GET /Conversations/{conversationId}/messages?cursor=&take=&direction=
    async getMessages(
        conversationId: number,
        opts?: { cursor?: string | null; take?: number; direction?: 'older' | 'newer' },
    ): Promise<MessagePage> {
        await sleep(140)
        const state = conversationById(conversationId)
        if (!state) throw new Error('mockErrors.conversationNotFound')
        const take = Math.min(opts?.take ?? 50, 200)
        const direction = opts?.direction ?? 'older'
        const all = [...state.messages].sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime())

        if (direction === 'newer') {
            const after = opts?.cursor ? new Date(opts.cursor).getTime() : 0
            const newer = all.filter((m) => new Date(m.sentAt).getTime() > after)
            return { messages: clone(newer), nextCursor: newer.length ? newer[newer.length - 1].sentAt : opts?.cursor ?? null, hasMore: false }
        }

        // 'older' — newest page first when no cursor; walk backwards.
        const before = opts?.cursor ? new Date(opts.cursor).getTime() : Infinity
        const older = all.filter((m) => new Date(m.sentAt).getTime() < before)
        const page = older.slice(Math.max(0, older.length - take))
        return {
            messages: clone(page),
            nextCursor: page.length ? page[0].sentAt : null,
            hasMore: page.length < older.length,
        }
    },

    // POST /Conversations/{conversationId}/messages
    async postMessage(conversationId: number, content: string): Promise<ChatMessage> {
        await sleep(150)
        const trimmed = content.trim()
        if (!trimmed) throw new Error('mockErrors.emptyMessage')
        if (trimmed.length > 4000) throw new Error('mockErrors.messageTooLong')
        const state = conversationById(conversationId)
        if (!state) throw new Error('mockErrors.conversationNotFound')
        const msg: ChatMessage = {
            id: ++messageSeq,
            type: 'Text',
            senderUserId: CURRENT_TEACHER_USER_ID,
            senderDisplayName: CURRENT_TEACHER_NAME,
            senderRole: 'Teacher',
            content: trimmed,
            sentAt: new Date().toISOString(),
        }
        state.messages.push(msg)
        state.conversation.lastMessageAt = msg.sentAt
        scheduleStudentReply(state)
        return clone(msg)
    },

    // POST /Conversations/{conversationId}/read
    async markConversationRead(conversationId: number): Promise<void> {
        await sleep(80)
        const state = conversationById(conversationId)
        if (!state) throw new Error('mockErrors.conversationNotFound')
        state.teacherLastReadAt = new Date().toISOString()
        state.conversation.unreadCount = 0
        const offer = offerForTeacherOnRequest(state.requestId)
        if (offer) offer.unreadMessagesCount = 0
    },
}

export type MockApi = typeof mockApi

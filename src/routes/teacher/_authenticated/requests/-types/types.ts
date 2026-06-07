// Domain types for Scenario 2 — Open Session Request / Teacher Offer Workflow.
// Aligned with the shipped backend v1 contract (TEACHER-ROLE-Scenario2.md,
// 2026-06-03). Swapping mocks for the real API is a no-op for components.
//
// Key v1 facts encoded here:
//  - The teacher does NOT propose schedules. An offer is just
//    { price, teacherNotes, validityHours, commitmentConfirmed }. The student's
//    timing on OpenSessionRequestSession is accepted implicitly.
//  - The inbox is driven by the teacher's *target status* on each request
//    (Notified / Viewed / OfferSubmitted / Skipped), not by offer status.
//  - Conversations are keyed by (requestId, teacherId) and can exist before any
//    offer. v1 transport is POLLING (cursor pagination); SignalR is v1.5.
//  - IDs are int everywhere. Currency is SAR by convention (no currency field).

// ----- enums ----------------------------------------------------------------

// The teacher's relationship to a request (OpenSessionRequestTarget.Status).
// Drives the inbox tabs. Maps 1:1 to the UI labels new / viewed / offered.
export const TargetStatus = {
    Notified: 'Notified',
    Viewed: 'Viewed',
    OfferSubmitted: 'OfferSubmitted',
    Skipped: 'Skipped',
} as const
export type TargetStatus = typeof TargetStatus[keyof typeof TargetStatus]

// Offer lifecycle (OpenSessionOffer.Status). v1 set — note there is no
// Viewed/InDiscussion/Updated; negotiation does not change the offer status.
export const SessionOfferStatus = {
    Pending: 'Pending',
    Accepted: 'Accepted',
    Rejected: 'Rejected',
    AutoRejected: 'AutoRejected',
    Withdrawn: 'Withdrawn',
    Expired: 'Expired',
} as const
export type SessionOfferStatus = typeof SessionOfferStatus[keyof typeof SessionOfferStatus]

// Per-session availability against the teacher's own schedule (GET
// /AvailableRequests/{id}/availability-match). Informational only — it never
// blocks submitting an offer.
export const AvailabilityStatus = {
    Available: 'Available',
    Conflict: 'Conflict',
    OutsideAvailability: 'OutsideAvailability',
} as const
export type AvailabilityStatus = typeof AvailabilityStatus[keyof typeof AvailabilityStatus]

export type TeachingMode = 'Online' | 'InPerson'
export type SessionType = 'Individual' | 'Group'
export type DomainCode = 'school' | 'quran' | 'language' | 'skills' | 'university'

// How the request reached this teacher (Design-Notes §4, point 1):
//  - Published: broadcast to every qualified teacher in the subject (competitive).
//  - Directed : sent privately to this teacher; carries the student's trust and
//    deserves higher priority. May arrive even if the subject is not activated
//    on the teacher's profile. NOTE: needs a backend field on
//    OpenSessionRequestTarget (e.g. `targetingKind`) — modelled on the frontend
//    here until the API exposes it.
export type RequestKind = 'Published' | 'Directed'

// Max number of offer SUBMISSIONS the teacher may make on a single request
// (Design-Notes §4: re-offering is capped). Version bumps via updateOffer do NOT
// count against this — only fresh submissions after a withdraw/expiry do.
export const MAX_OFFER_ATTEMPTS = 3

// ----- requests --------------------------------------------------------------

export interface RequestAttachment {
    id: number
    fileName: string
    fileType: 'pdf' | 'image' | 'doc'
    sizeBytes: number
    // Attachments are request-scoped in v1 (not per-session).
    sessionNumber: number | null
}

export interface RequestedSessionUnit {
    id: number
    // Exactly one of contentUnit* / lesson* is populated (mirrors the API).
    contentUnitId: number | null
    contentUnitName: string | null
    lessonId: number | null
    lessonName: string | null
}

export interface RequestedSession {
    id: number
    sequenceNumber: number
    title: string
    description: string | null
    durationMinutes: number
    unitNames: string[]
    units: RequestedSessionUnit[]
    notes: string | null
    // Student's preferred date/time for this session.
    preferredDate: string // ISO (date)
    timeSlotId: number
    preferredTimeSlotLabel: string
}

export interface RequestParticipant {
    studentId: number
    studentName: string
    confirmationStatus: 'Pending' | 'Confirmed' | 'Rejected'
    isOwner: boolean
}

export interface SessionRequestListItem {
    id: number
    studentId: number
    studentDisplayName: string
    studentAvatarUrl: string | null
    studentGradeLabel: string | null
    // Published (broadcast) vs Directed (sent privately to this teacher).
    requestKind: RequestKind
    domainCode: DomainCode
    subjectNameAr: string
    subjectNameEn: string
    unitNames: string[]
    sessionsCount: number
    totalMinutes: number
    teachingMode: TeachingMode
    sessionType: SessionType
    participantsCount: number
    preferredDatesSummary: string // e.g. "5 dates between 2026-05-25 and 2026-06-12"
    createdAt: string // ISO (matchedAt)
    expiresAt: string // ISO
    attachmentsCount: number
    offersCount: number // how many teachers have already offered (currentOffersCount)
    // The current teacher's relationship to this request — drives inbox tabs.
    targetStatus: TargetStatus
    viewedAt: string | null
}

export interface SessionRequestDetail extends SessionRequestListItem {
    descriptionForTeacher: string | null
    sessions: RequestedSession[]
    attachments: RequestAttachment[]
    participants: RequestParticipant[]
    quranContentTypeLabel?: string
    quranLevelLabel?: string
    // The current teacher's own offer on this request, if any (myOfferId/status
    // on the API; we expose the resolved offer summary for convenience).
    myOfferId: number | null
    myOfferStatus: SessionOfferStatus | null
    // How many offer submissions this teacher has already made on the request
    // (drives the MAX_OFFER_ATTEMPTS cap). 0 when none yet.
    myOfferAttempts: number
}

// One per-session availability verdict (GET .../availability-match).
export interface AvailabilityMatch {
    sessionId: number
    sequenceNumber: number
    preferredDate: string // ISO
    timeSlotId: number
    status: AvailabilityStatus
    conflictWith: string | null
}

// ----- offers ----------------------------------------------------------------

export interface SessionOffer {
    id: number
    offerNumber: string // computed OF-{year}-{id:D4}
    sessionRequestId: number
    teacherId: number
    teacherDisplayName: string
    price: number // total, SAR
    teacherNotes: string | null
    status: SessionOfferStatus
    version: number
    createdAt: string // ISO
    expiresAt: string // ISO
    acceptedAt: string | null
    rejectedAt: string | null
    withdrawnAt: string | null
    expiredAt: string | null
    // Free-text reason shown to the teacher when the student explicitly rejects.
    rejectionReason: string | null
    // For AutoRejected offers only: the price the student accepted from another
    // teacher. Shown WITHOUT revealing the competitor's identity (Design-Notes
    // §4 — competitor privacy). null otherwise.
    competitorAcceptedPrice: number | null
    conversationId: number | null
    unreadMessagesCount: number
}

// Inbox tabs map to the `?status=` query value on GET /AvailableRequests.
// 'all' omits the parameter (and excludes Skipped).
export type RequestInboxTab = 'all' | 'Notified' | 'Viewed' | 'OfferSubmitted'

// Preferred-date window the teacher can filter by.
export type DateWindow = 'all' | 'next7' | 'next30'

export interface InboxFilters {
    search: string
    teachingMode: TeachingMode | 'all'
    sessionType: SessionType | 'all'
    // 'all' or a subject key (we use subjectNameEn as the stable key).
    subject: string
    // Filter by how the request reached the teacher.
    requestKind: RequestKind | 'all'
    dateWindow: DateWindow
    sort: 'Newest' | 'ExpiringSoon' | 'MostOffers'
}

export interface InboxCounts {
    all: number
    Notified: number
    Viewed: number
    OfferSubmitted: number
}

// Distinct subjects the teacher receives requests for — used to populate the
// "filter by subject" dropdown.
export interface SubjectFacet {
    key: string // subjectNameEn
    labelAr: string
    labelEn: string
}

export interface InboxResult {
    items: SessionRequestListItem[]
    counts: InboxCounts
    subjects: SubjectFacet[]
    totalCount: number
    pageNumber: number
    pageSize: number
    totalPages: number
}

// ----- conversations / chat --------------------------------------------------

export type ChatParticipantRole = 'Student' | 'Teacher'

export interface ConversationParticipant {
    userId: number
    displayName: string
    role: ChatParticipantRole
}

// Resolved by GET /Conversations/by-request/{requestId}/teacher/{teacherId}.
// offerId === 0 means no offer exists yet (preliminary "طلب توضيح" chat).
export interface Conversation {
    conversationId: number
    offerId: number
    participants: ConversationParticipant[]
    lastMessageAt: string | null
    unreadCount: number
}

export type ChatMessageType = 'Text' | 'System'

export interface ChatMessage {
    id: number
    type: ChatMessageType
    senderUserId: number | null // null => System message
    senderDisplayName: string | null
    senderRole: ChatParticipantRole | null
    content: string
    sentAt: string // ISO
}

// Cursor-paginated page of messages (GET /{conversationId}/messages).
export interface MessagePage {
    messages: ChatMessage[]
    nextCursor: string | null
    hasMore: boolean
}

// Domain types for Scenario 2 — Open Session Request / Teachers Offer Workflow.
// Mirrors the BRD lifecycles so swapping mocks for the real API is a no-op for components.

export const SessionRequestStatus = {
    Draft: 'Draft',
    PendingInvites: 'PendingInvites',
    Active: 'Active',
    OfferAccepted: 'OfferAccepted',
    PaymentPending: 'PaymentPending',
    Paid: 'Paid',
    Scheduled: 'Scheduled',
    InProgress: 'InProgress',
    Completed: 'Completed',
    Cancelled: 'Cancelled',
    Expired: 'Expired',
} as const
export type SessionRequestStatus = typeof SessionRequestStatus[keyof typeof SessionRequestStatus]

export const SessionOfferStatus = {
    Pending: 'Pending',
    Viewed: 'Viewed',
    InDiscussion: 'InDiscussion',
    Updated: 'Updated',
    Accepted: 'Accepted',
    Rejected: 'Rejected',
    AutoRejected: 'AutoRejected',
    Withdrawn: 'Withdrawn',
    Expired: 'Expired',
} as const
export type SessionOfferStatus = typeof SessionOfferStatus[keyof typeof SessionOfferStatus]

export type TeachingMode = 'Online' | 'InPerson'
export type SessionType = 'Individual' | 'Group'
export type DomainCode = 'school' | 'quran' | 'language' | 'skills' | 'university'

export interface RequestAttachment {
    id: string
    fileName: string
    fileType: 'pdf' | 'image' | 'doc'
    sizeBytes: number
    // Optional — when null the attachment belongs to the request itself, not a specific session.
    sessionNumber: number | null
}

export interface RequestedSession {
    sessionNumber: number
    title: string
    description: string | null
    durationMinutes: number
    unitNames: string[]
    notes: string | null
    // Student's preferred date/time for this session.
    preferredDate: string // ISO
    preferredTimeSlotLabel: string
    attachmentIds: string[]
}

export interface RequestParticipant {
    studentId: number
    studentName: string
    confirmationStatus: 'Pending' | 'Confirmed' | 'Rejected'
    isOwner: boolean
}

export interface SessionRequestListItem {
    id: number
    studentDisplayName: string // anonymised until teacher submits an offer
    studentAvatarUrl: string | null
    isStudentAnonymised: boolean
    studentGradeLabel: string | null
    studentRating: number | null
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
    createdAt: string // ISO
    expiresAt: string // ISO
    attachmentsCount: number
    offersCount: number // how many other teachers have already offered
}

export interface SessionRequestDetail extends SessionRequestListItem {
    descriptionForTeacher: string | null
    sessions: RequestedSession[]
    attachments: RequestAttachment[]
    participants: RequestParticipant[]
    quranContentTypeLabel?: string
    quranLevelLabel?: string
}

export interface PerSessionOfferResponse {
    sessionNumber: number
    accept: boolean
    alternativeDate?: string // ISO, only if !accept
    alternativeTimeSlotLabel?: string
    teacherNotes?: string
}

export interface SessionOffer {
    id: number
    requestId: number
    teacherId: number
    teacherDisplayName: string
    status: SessionOfferStatus
    version: number
    totalPrice: number
    pricePerSession: number | null // null means flat total
    generalNotes: string | null
    perSessionResponses: PerSessionOfferResponse[]
    validityHours: number
    createdAt: string // ISO
    expiresAt: string // ISO
    studentLastViewedAt: string | null
    hasUnreadStudentMessages: boolean
}

export type RequestInboxTab =
    | 'new'
    | 'active'
    | 'negotiating'
    | 'accepted'
    | 'rejected'

export interface InboxFilters {
    search: string
    teachingMode: TeachingMode | 'all'
    sessionType: SessionType | 'all'
    sort: 'newest' | 'urgent' | 'fewest-offers'
}

export interface InboxCounts {
    new: number
    active: number
    negotiating: number
    accepted: number
    rejected: number
}

// ----- Chat ------------------------------------------------------------------

export type ChatMessageAuthor = 'teacher' | 'student' | 'system'

export interface ChatMessage {
    id: string
    threadId: string // `${requestId}:${teacherId}`
    author: ChatMessageAuthor
    authorDisplayName: string
    body: string
    createdAt: string // ISO
    // System messages embed an event reference so the UI can render them differently.
    systemEvent?: 'OfferSubmitted' | 'OfferUpdated' | 'OfferViewed' | 'OfferAccepted' | 'OfferWithdrawn'
    relatedOfferVersion?: number
}

export interface ChatThreadMeta {
    threadId: string
    requestId: number
    teacherId: number
    studentDisplayName: string
    studentIsTyping: boolean
    lastReadByStudentAt: string | null
}

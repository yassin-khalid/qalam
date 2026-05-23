// Notifications domain — based on BRD §13 (the event types the teacher cares
// about). All notifications belong to the current teacher in this scenario.

export const NotificationType = {
    // Scenario 2 (Open Session Request)
    NewQualifiedRequest: 'NewQualifiedRequest',
    OfferViewed: 'OfferViewed',
    OfferAccepted: 'OfferAccepted',
    OfferRejected: 'OfferRejected',
    OfferAutoRejected: 'OfferAutoRejected',
    NewMessage: 'NewMessage',
    // Scenario 1 (Course Enrollment)
    NewEnrollmentRequest: 'NewEnrollmentRequest',
    EnrollmentApproved: 'EnrollmentApproved',
    // Shared
    PaymentSucceeded: 'PaymentSucceeded',
    SessionReminder: 'SessionReminder',
    SessionStartingSoon: 'SessionStartingSoon',
    FeedbackReceived: 'FeedbackReceived',
} as const
export type NotificationType = typeof NotificationType[keyof typeof NotificationType]

export interface AppNotification {
    id: number
    type: NotificationType
    titleAr: string
    titleEn: string
    bodyAr: string
    bodyEn: string
    createdAt: string // ISO
    readAt: string | null
    // Deep-link target — the UI uses these to navigate when the user clicks.
    link?:
        | { to: '/teacher/requests'; params?: undefined }
        | { to: '/teacher/requests/$requestId'; params: { requestId: number } }
        | { to: '/teacher/sessions/$sessionId'; params: { sessionId: number } }
        | { to: '/teacher/courses' }
        | { to: '/teacher/courses/$courseId'; params: { courseId: number } }
}

export type NotificationFilter = 'all' | 'unread'

export interface NotificationCounts {
    all: number
    unread: number
}

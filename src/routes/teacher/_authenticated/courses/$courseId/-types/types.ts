// Types for the Course Details page extras (active enrollments, per-enrollment
// sessions, content library, analytics). Reuses RequestStatus from the parent
// courses/-queries/enrollmentRequestsQueries.ts for the enrollment-requests tab.

export const CourseDetailTab = {
    Overview: 'overview',
    Requests: 'requests',
    Active: 'active',
    Sessions: 'sessions',
    Content: 'content',
    Analytics: 'analytics',
} as const
export type CourseDetailTab = typeof CourseDetailTab[keyof typeof CourseDetailTab]

export type EnrollmentLifecycleStatus =
    | 'Paid'
    | 'Scheduled'
    | 'InProgress'
    | 'Completed'
    | 'Cancelled'

export interface ActiveEnrollment {
    id: number
    studentName: string
    studentAvatarUrl: string | null
    studentsCount: number
    startDate: string // ISO
    endDate: string // ISO
    paidAmount: number
    sessionsTotal: number
    sessionsCompleted: number
    status: EnrollmentLifecycleStatus
}

export interface EnrollmentSessionLink {
    enrollmentId: number
    sessionId: number
    sessionNumber: number
    sessionTitle: string
    startsAt: string
    durationMinutes: number
    status: 'Scheduled' | 'InProgress' | 'Completed' | 'Missed' | 'Cancelled'
}

export interface ContentLibraryItem {
    id: string
    title: string
    type: 'pdf' | 'video' | 'image' | 'doc' | 'homework'
    sizeBytes: number | null
    linkedSessionsCount: number
    uploadedAt: string
}

export interface CourseAnalytics {
    totalEnrollments: number
    activeEnrollments: number
    completedEnrollments: number
    totalRevenue: number
    averageRating: number | null
    completionRate: number // 0..1
    enrollmentTrend: { date: string; count: number }[]
}

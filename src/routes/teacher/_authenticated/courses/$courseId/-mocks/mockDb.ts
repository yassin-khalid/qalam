// =============================================================================
//  MOCK STORE for Course Details extras. Delete when the backend ships the
//  endpoints listed in COURSE_ENROLLMENT_TEACHER_PLAN.md §6 (Active enrollments,
//  per-enrollment sessions, Content Library, Course analytics).
// =============================================================================

import type {
    ActiveEnrollment,
    ContentLibraryItem,
    CourseAnalytics,
    EnrollmentSessionLink,
} from '../-types/types'

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

const NOW = new Date('2026-05-22T10:00:00Z').getTime()
const at = (offsetHours: number) => new Date(NOW + offsetHours * 3_600_000).toISOString()

// We don't have a real per-course store — for the demo we return the same
// curated data regardless of courseId, so any course the teacher clicks
// renders a populated detail page.

const ENROLLMENTS: ActiveEnrollment[] = [
    {
        id: 7001,
        studentName: 'طالب #2001',
        studentAvatarUrl: null,
        studentsCount: 1,
        startDate: at(-48),
        endDate: at(24 * 21),
        paidAmount: 900,
        sessionsTotal: 6,
        sessionsCompleted: 2,
        status: 'InProgress',
    },
    {
        id: 7002,
        studentName: 'مجموعة 3 طلاب',
        studentAvatarUrl: null,
        studentsCount: 3,
        startDate: at(48),
        endDate: at(24 * 28),
        paidAmount: 2400,
        sessionsTotal: 8,
        sessionsCompleted: 0,
        status: 'Scheduled',
    },
    {
        id: 7003,
        studentName: 'طالبة #2003',
        studentAvatarUrl: null,
        studentsCount: 1,
        startDate: at(-24 * 30),
        endDate: at(-24 * 10),
        paidAmount: 720,
        sessionsTotal: 4,
        sessionsCompleted: 4,
        status: 'Completed',
    },
]

const SESSIONS_BY_ENROLLMENT: Record<number, EnrollmentSessionLink[]> = {
    7001: [
        { enrollmentId: 7001, sessionId: 5004, sessionNumber: 1, sessionTitle: 'البقرة - الربع الأول', startsAt: at(-48), durationMinutes: 45, status: 'Completed' },
        { enrollmentId: 7001, sessionId: 5005, sessionNumber: 2, sessionTitle: 'الكسور المتشابهة', startsAt: at(-72), durationMinutes: 60, status: 'Completed' },
        { enrollmentId: 7001, sessionId: 5001, sessionNumber: 3, sessionTitle: 'مقدمة الجبر', startsAt: at(28), durationMinutes: 60, status: 'Scheduled' },
        { enrollmentId: 7001, sessionId: 5003, sessionNumber: 4, sessionTitle: 'معادلات الدرجة الأولى', startsAt: at(52), durationMinutes: 60, status: 'Scheduled' },
    ],
    7002: [
        { enrollmentId: 7002, sessionId: 5002, sessionNumber: 1, sessionTitle: 'Conversation practice — restaurants', startsAt: at(2), durationMinutes: 90, status: 'Scheduled' },
    ],
    7003: [
        { enrollmentId: 7003, sessionId: 5004, sessionNumber: 1, sessionTitle: 'البقرة - الربع الأول', startsAt: at(-24 * 28), durationMinutes: 45, status: 'Completed' },
    ],
}

const CONTENT_LIBRARY: ContentLibraryItem[] = [
    { id: 'cl-1', title: 'البقرة_الربع_1_تسميع.mp4', type: 'video', sizeBytes: 24_000_000, linkedSessionsCount: 1, uploadedAt: at(-47) },
    { id: 'cl-2', title: 'مصحف_التجويد.pdf', type: 'pdf', sizeBytes: 8_400_000, linkedSessionsCount: 3, uploadedAt: at(-50) },
    { id: 'cl-3', title: 'restaurant_vocab.pdf', type: 'pdf', sizeBytes: 145_000, linkedSessionsCount: 1, uploadedAt: at(-12) },
    { id: 'cl-4', title: 'Record a 60-second introduction', type: 'homework', sizeBytes: null, linkedSessionsCount: 1, uploadedAt: at(-12) },
]

const ANALYTICS: CourseAnalytics = {
    totalEnrollments: 14,
    activeEnrollments: 2,
    completedEnrollments: 9,
    totalRevenue: 9_840,
    averageRating: 4.6,
    completionRate: 0.92,
    enrollmentTrend: [
        { date: at(-24 * 28), count: 1 },
        { date: at(-24 * 21), count: 3 },
        { date: at(-24 * 14), count: 4 },
        { date: at(-24 * 7), count: 4 },
        { date: at(0), count: 2 },
    ],
}

export const courseDetailExtrasMockApi = {
    async listActiveEnrollments(_courseId: number): Promise<ActiveEnrollment[]> {
        await sleep(180)
        return JSON.parse(JSON.stringify(ENROLLMENTS))
    },

    async listEnrollmentSessions(enrollmentId: number): Promise<EnrollmentSessionLink[]> {
        await sleep(160)
        return JSON.parse(JSON.stringify(SESSIONS_BY_ENROLLMENT[enrollmentId] ?? []))
    },

    async listContentLibrary(_courseId: number): Promise<ContentLibraryItem[]> {
        await sleep(160)
        return JSON.parse(JSON.stringify(CONTENT_LIBRARY))
    },

    async getAnalytics(_courseId: number): Promise<CourseAnalytics> {
        await sleep(180)
        return JSON.parse(JSON.stringify(ANALYTICS))
    },
}

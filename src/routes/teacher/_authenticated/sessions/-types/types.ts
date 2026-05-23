// Session domain types — shared by Scenario 1 (Course Enrollment) and
// Scenario 2 (Open Session Request) post-acceptance teacher workflow.

export const SessionStatus = {
    Scheduled: 'Scheduled',
    InProgress: 'InProgress',
    Completed: 'Completed',
    Missed: 'Missed',
    Cancelled: 'Cancelled',
} as const
export type SessionStatus = typeof SessionStatus[keyof typeof SessionStatus]

export type AttendanceMark = 'Present' | 'Late' | 'Absent' | 'Pending'

export interface SessionStudent {
    studentId: number
    studentName: string
    studentAvatarUrl: string | null
    attendance: AttendanceMark
}

export interface SessionFile {
    id: string
    fileName: string
    fileType: 'pdf' | 'image' | 'video' | 'doc' | 'other'
    sizeBytes: number
    uploadedAt: string // ISO
    uploadedByTeacher: boolean
}

export interface SessionHomework {
    id: string
    title: string
    description: string | null
    dueAt: string | null // ISO
    attachmentIds: string[]
    submittedCount: number
    totalStudents: number
}

export interface SessionFeedback {
    studentId: number
    studentName: string
    rating: number // 1-5
    comment: string | null
    submittedAt: string
}

export interface SessionListItem {
    id: number
    courseTitle: string
    sourceLabel: string // e.g. "دورة (Fixed)" or "طلب جلسات #1003"
    sessionNumber: number
    sessionTitle: string
    startsAt: string // ISO
    durationMinutes: number
    teachingMode: 'Online' | 'InPerson'
    sessionType: 'Individual' | 'Group'
    studentsCount: number
    status: SessionStatus
}

export interface SessionDetail extends SessionListItem {
    description: string | null
    unitNames: string[]
    notes: string | null
    zoomLink: string | null
    students: SessionStudent[]
    files: SessionFile[]
    homework: SessionHomework[]
    feedback: SessionFeedback[]
    endedAt: string | null
}

export type SessionsListFilter = 'upcoming' | 'past' | 'all'
export type SessionDetailTab =
    | 'info'
    | 'meeting'
    | 'files'
    | 'homework'
    | 'notes'
    | 'attendance'
    | 'feedback'

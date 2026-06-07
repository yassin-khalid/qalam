// =============================================================================
//  MOCK STORE for Sessions (shared by Scenario 1 + Scenario 2 teacher views).
//  Replace with real fetch() calls inside ../-queries/sessionsQueries.ts and
//  delete this file when the backend ships /Api/V1/Teacher/Sessions.
// =============================================================================

import type {
    AttendanceMark,
    SessionDetail,
    SessionFile,
    SessionHomework,
    SessionListItem,
    SessionsListFilter,
    SessionStatus,
} from '../-types/types'

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

// Anchor offsets to the real current time so positive-offset sessions are
// genuinely "upcoming" relative to the Date.now() used in `list()` below.
const NOW = Date.now()
const at = (offsetHours: number) => new Date(NOW + offsetHours * 3_600_000).toISOString()

const SESSIONS: SessionDetail[] = [
    // ---- upcoming ----
    {
        id: 5001,
        courseTitle: 'الرياضيات — تأسيس ثانوي',
        sourceLabel: 'طلب جلسات #1002',
        sessionNumber: 1,
        sessionTitle: 'مقدمة الجبر',
        description: 'استعراض المفاهيم الأساسية وتقييم مستوى الطالب.',
        unitNames: ['الجبر'],
        notes: null,
        zoomLink: 'https://zoom.us/j/0000000001',
        startsAt: at(28),
        durationMinutes: 60,
        teachingMode: 'Online',
        sessionType: 'Individual',
        studentsCount: 1,
        status: 'Scheduled',
        endedAt: null,
        students: [
            { studentId: 1002, studentName: 'طالبة #1002', studentAvatarUrl: null, attendance: 'Pending' },
        ],
        files: [],
        homework: [],
        feedback: [],
    },
    {
        id: 5002,
        courseTitle: 'اللغة الإنجليزية — التحدث',
        sourceLabel: 'طلب جلسات #1003',
        sessionNumber: 3,
        sessionTitle: 'Conversation practice — restaurants',
        description: 'تدريب جماعي على محادثات المطاعم.',
        unitNames: ['Speaking practice'],
        notes: 'جهز قائمة أسئلة اطلب من الطلاب الإجابة عليها بدون توقف.',
        zoomLink: 'https://zoom.us/j/0000000002',
        startsAt: at(2),
        durationMinutes: 90,
        teachingMode: 'Online',
        sessionType: 'Group',
        studentsCount: 3,
        status: 'Scheduled',
        endedAt: null,
        students: [
            { studentId: 1003, studentName: 'مالك الطلب', studentAvatarUrl: null, attendance: 'Pending' },
            { studentId: 1010, studentName: 'طالب مدعو 1', studentAvatarUrl: null, attendance: 'Pending' },
            { studentId: 1011, studentName: 'طالب مدعو 2', studentAvatarUrl: null, attendance: 'Pending' },
        ],
        files: [
            { id: 'sf-1', fileName: 'restaurant_vocab.pdf', fileType: 'pdf', sizeBytes: 145_000, uploadedAt: at(-12), uploadedByTeacher: true },
        ],
        homework: [
            {
                id: 'sh-1',
                title: 'Record a 60-second introduction',
                description: 'Submit a voice note introducing yourself in English.',
                dueAt: at(72),
                attachmentIds: [],
                submittedCount: 0,
                totalStudents: 3,
            },
        ],
        feedback: [],
    },
    {
        id: 5003,
        courseTitle: 'الرياضيات — تأسيس ثانوي',
        sourceLabel: 'طلب جلسات #1001',
        sessionNumber: 2,
        sessionTitle: 'معادلات الدرجة الأولى',
        description: 'حل المعادلات الخطية وتمارين تطبيقية.',
        unitNames: ['الجبر'],
        notes: null,
        zoomLink: 'https://zoom.us/j/0000000003',
        startsAt: at(52),
        durationMinutes: 60,
        teachingMode: 'Online',
        sessionType: 'Individual',
        studentsCount: 1,
        status: 'Scheduled',
        endedAt: null,
        students: [
            { studentId: 1001, studentName: 'طالب #1001', studentAvatarUrl: null, attendance: 'Pending' },
        ],
        files: [],
        homework: [],
        feedback: [],
    },

    // ---- past (completed) ----
    {
        id: 5004,
        courseTitle: 'القرآن الكريم — حفظ',
        sourceLabel: 'دورة Fixed',
        sessionNumber: 1,
        sessionTitle: 'البقرة - الربع الأول',
        description: 'حفظ الربع الأول من سورة البقرة.',
        unitNames: ['سورة البقرة'],
        notes: 'الطالب يحفظ بسرعة، نقطة قوة في النطق.',
        zoomLink: 'https://zoom.us/j/0000000004',
        startsAt: at(-48),
        durationMinutes: 45,
        teachingMode: 'Online',
        sessionType: 'Individual',
        studentsCount: 1,
        status: 'Completed',
        endedAt: at(-47),
        students: [
            { studentId: 1004, studentName: 'طالب #1004', studentAvatarUrl: null, attendance: 'Present' },
        ],
        files: [
            { id: 'sf-2', fileName: 'البقرة_الربع_1_تسميع.mp4', fileType: 'video', sizeBytes: 24_000_000, uploadedAt: at(-47), uploadedByTeacher: true },
            { id: 'sf-3', fileName: 'مصحف_التجويد.pdf', fileType: 'pdf', sizeBytes: 8_400_000, uploadedAt: at(-50), uploadedByTeacher: true },
        ],
        homework: [
            {
                id: 'sh-2',
                title: 'مراجعة الربع الأول',
                description: 'مراجعة ما تم حفظه قبل الجلسة القادمة.',
                dueAt: at(48),
                attachmentIds: [],
                submittedCount: 1,
                totalStudents: 1,
            },
        ],
        feedback: [
            {
                studentId: 1004,
                studentName: 'طالب #1004',
                rating: 5,
                comment: 'شرح ممتاز جداً وأسلوب مريح.',
                submittedAt: at(-46),
            },
        ],
    },
    {
        id: 5005,
        courseTitle: 'الرياضيات — تأسيس متوسط',
        sourceLabel: 'دورة Flexible',
        sessionNumber: 2,
        sessionTitle: 'الكسور المتشابهة',
        description: 'العمليات الأربع على الكسور.',
        unitNames: ['الكسور'],
        notes: null,
        zoomLink: 'https://zoom.us/j/0000000005',
        startsAt: at(-72),
        durationMinutes: 60,
        teachingMode: 'InPerson',
        sessionType: 'Individual',
        studentsCount: 1,
        status: 'Completed',
        endedAt: at(-71),
        students: [
            { studentId: 1005, studentName: 'طالبة #1005', studentAvatarUrl: null, attendance: 'Late' },
        ],
        files: [],
        homework: [],
        feedback: [
            {
                studentId: 1005,
                studentName: 'طالبة #1005',
                rating: 4,
                comment: null,
                submittedAt: at(-70),
            },
        ],
    },
]

let fileSeq = 100
let homeworkSeq = 100

const newId = (prefix: string, counter: { current: number }) => {
    counter.current += 1
    return `${prefix}-${counter.current}-${Date.now()}`
}

const sessionToListItem = (s: SessionDetail): SessionListItem => ({
    id: s.id,
    courseTitle: s.courseTitle,
    sourceLabel: s.sourceLabel,
    sessionNumber: s.sessionNumber,
    sessionTitle: s.sessionTitle,
    startsAt: s.startsAt,
    durationMinutes: s.durationMinutes,
    teachingMode: s.teachingMode,
    sessionType: s.sessionType,
    studentsCount: s.studentsCount,
    status: s.status,
})

export const sessionsMockApi = {
    async list(filter: SessionsListFilter): Promise<SessionListItem[]> {
        await sleep(180)
        const now = Date.now()
        const items = SESSIONS.filter((s) => {
            const startsAtMs = new Date(s.startsAt).getTime()
            if (filter === 'upcoming') return startsAtMs >= now && s.status !== 'Completed' && s.status !== 'Cancelled'
            if (filter === 'past') return startsAtMs < now || s.status === 'Completed' || s.status === 'Cancelled'
            return true
        }).sort((a, b) => {
            if (filter === 'past') return new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime()
            return new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
        })
        return items.map(sessionToListItem)
    },

    async get(sessionId: number): Promise<SessionDetail> {
        await sleep(160)
        const s = SESSIONS.find((x) => x.id === sessionId)
        if (!s) throw new Error('mockErrors.sessionNotFound')
        return JSON.parse(JSON.stringify(s))
    },

    async setAttendance(
        sessionId: number,
        marks: { studentId: number; attendance: AttendanceMark }[],
    ): Promise<SessionDetail> {
        await sleep(220)
        const s = SESSIONS.find((x) => x.id === sessionId)
        if (!s) throw new Error('mockErrors.sessionNotFound')
        for (const m of marks) {
            const stu = s.students.find((x) => x.studentId === m.studentId)
            if (stu) stu.attendance = m.attendance
        }
        return JSON.parse(JSON.stringify(s))
    },

    async updateNotes(sessionId: number, notes: string | null): Promise<SessionDetail> {
        await sleep(200)
        const s = SESSIONS.find((x) => x.id === sessionId)
        if (!s) throw new Error('mockErrors.sessionNotFound')
        s.notes = notes && notes.trim() ? notes : null
        return JSON.parse(JSON.stringify(s))
    },

    async uploadFile(
        sessionId: number,
        file: { fileName: string; fileType: SessionFile['fileType']; sizeBytes: number },
    ): Promise<SessionDetail> {
        await sleep(400)
        const s = SESSIONS.find((x) => x.id === sessionId)
        if (!s) throw new Error('mockErrors.sessionNotFound')
        s.files = [
            ...s.files,
            {
                id: newId('sf', { current: fileSeq++ }),
                fileName: file.fileName,
                fileType: file.fileType,
                sizeBytes: file.sizeBytes,
                uploadedAt: new Date().toISOString(),
                uploadedByTeacher: true,
            },
        ]
        return JSON.parse(JSON.stringify(s))
    },

    // Link an existing Content Library file into this session (BRD §7 Screen 7).
    // The library entry is copied as a session file tagged with its source id so
    // we can show a "Linked" state and avoid duplicates.
    async linkLibraryFile(
        sessionId: number,
        input: { libraryId: string; fileName: string; fileType: SessionFile['fileType']; sizeBytes: number },
    ): Promise<SessionDetail> {
        await sleep(280)
        const s = SESSIONS.find((x) => x.id === sessionId)
        if (!s) throw new Error('mockErrors.sessionNotFound')
        if (s.files.some((f) => f.sourceLibraryId === input.libraryId)) {
            throw new Error('mockErrors.alreadyLinked')
        }
        s.files = [
            ...s.files,
            {
                id: newId('sf', { current: fileSeq++ }),
                fileName: input.fileName,
                fileType: input.fileType,
                sizeBytes: input.sizeBytes,
                uploadedAt: new Date().toISOString(),
                uploadedByTeacher: true,
                sourceLibraryId: input.libraryId,
            },
        ]
        return JSON.parse(JSON.stringify(s))
    },

    async deleteFile(sessionId: number, fileId: string): Promise<SessionDetail> {
        await sleep(180)
        const s = SESSIONS.find((x) => x.id === sessionId)
        if (!s) throw new Error('mockErrors.sessionNotFound')
        s.files = s.files.filter((f) => f.id !== fileId)
        return JSON.parse(JSON.stringify(s))
    },

    async addHomework(
        sessionId: number,
        input: { title: string; description: string | null; dueAt: string | null },
    ): Promise<SessionDetail> {
        await sleep(320)
        const s = SESSIONS.find((x) => x.id === sessionId)
        if (!s) throw new Error('mockErrors.sessionNotFound')
        const hw: SessionHomework = {
            id: newId('sh', { current: homeworkSeq++ }),
            title: input.title.trim(),
            description: input.description?.trim() || null,
            dueAt: input.dueAt,
            attachmentIds: [],
            submittedCount: 0,
            totalStudents: s.studentsCount,
        }
        if (!hw.title) throw new Error('mockErrors.homeworkTitleRequired')
        s.homework = [...s.homework, hw]
        return JSON.parse(JSON.stringify(s))
    },

    async deleteHomework(sessionId: number, homeworkId: string): Promise<SessionDetail> {
        await sleep(180)
        const s = SESSIONS.find((x) => x.id === sessionId)
        if (!s) throw new Error('mockErrors.sessionNotFound')
        s.homework = s.homework.filter((h) => h.id !== homeworkId)
        return JSON.parse(JSON.stringify(s))
    },

    async endSession(sessionId: number): Promise<SessionDetail> {
        await sleep(280)
        const s = SESSIONS.find((x) => x.id === sessionId)
        if (!s) throw new Error('mockErrors.sessionNotFound')
        s.status = 'Completed' as SessionStatus
        s.endedAt = new Date().toISOString()
        for (const stu of s.students) {
            if (stu.attendance === 'Pending') stu.attendance = 'Present'
        }
        return JSON.parse(JSON.stringify(s))
    },
}

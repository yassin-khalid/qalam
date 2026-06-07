// =============================================================================
//  MOCK STORE for the Teacher Profile Module. Lives entirely in-memory.
//  Replace `getMyProfile` with a real fetch() inside ../-queries/profileQueries
//  and delete this file when the backend is wired. Expected endpoint:
//    GET /Api/V1/Teacher/Profile/me  -> getMyProfile
//  The route overlays the signed-in teacher's id/name/email/mobile (from the
//  local auth session) on top of this seed so the page reflects "me".
// =============================================================================

import type { TeacherProfile } from '../-types/types'

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

// A stable "now" so relative values (member-since, exceptions) stay deterministic.
const NOW = new Date('2026-06-06T10:00:00Z').getTime()
const daysAgo = (d: number) => new Date(NOW - d * 86_400_000).toISOString()
const daysAhead = (d: number) => new Date(NOW + d * 86_400_000).toISOString()

const PROFILE: TeacherProfile = {
    id: '17',
    status: 'Active',
    joinedAt: daysAgo(420),

    // ----- §1 basic information ----------------------------------------------
    basic: {
        firstName: { ar: 'أحمد', en: 'Ahmed' },
        lastName: { ar: 'العلي', en: 'Al-Ali' },
        avatarUrl: null,
        gender: 'Male',
        birthDate: '1989-03-14',
        nationality: { ar: 'سعودي', en: 'Saudi' },
        mobile: '+966500000017',
        email: 'ahmed.alali@example.com',
        country: { ar: 'السعودية', en: 'Saudi Arabia' },
        city: { ar: 'الرياض', en: 'Riyadh' },
    },

    // ----- §2 professional information ----------------------------------------
    professional: {
        jobTitle: { ar: 'معلم رياضيات', en: 'Mathematics Teacher' },
        bio: {
            ar: 'معلم رياضيات بخبرة تزيد عن 10 سنوات في تدريس المرحلتين المتوسطة والثانوية. أركّز على بناء أساس قوي وحل المسائل بأسلوب مبسّط، مع متابعة فردية لكل طالب.',
            en: 'Mathematics teacher with 10+ years of experience across intermediate and secondary stages. I focus on building strong foundations and problem-solving with a simplified approach and individual follow-up for every student.',
        },
        yearsOfExperience: 11,
        languages: ['ar', 'en'],
    },

    // ----- §3 qualifications --------------------------------------------------
    qualifications: {
        certificates: [
            {
                id: 1,
                qualification: { ar: 'بكالوريوس', en: 'Bachelor' },
                specialization: { ar: 'الرياضيات', en: 'Mathematics' },
                institution: { ar: 'جامعة الملك سعود', en: 'King Saud University' },
                graduationYear: 2012,
            },
            {
                id: 2,
                qualification: { ar: 'ماجستير', en: 'Master' },
                specialization: { ar: 'مناهج وطرق تدريس الرياضيات', en: 'Mathematics Curricula & Teaching Methods' },
                institution: { ar: 'جامعة الملك سعود', en: 'King Saud University' },
                graduationYear: 2016,
            },
        ],
        trainingCourses: [
            {
                id: 1,
                name: { ar: 'التدريس الفعّال عبر الإنترنت', en: 'Effective Online Teaching' },
                provider: { ar: 'منصة قلم', en: 'Qalam Platform' },
                year: 2023,
            },
            {
                id: 2,
                name: { ar: 'تصميم الاختبارات والتقويم', en: 'Assessment & Test Design' },
                provider: { ar: 'هيئة تقويم التعليم', en: 'Education Evaluation Commission' },
                year: 2021,
            },
        ],
    },

    // ----- §4 documents -------------------------------------------------------
    documents: [
        {
            id: 1,
            kind: 'Identity',
            fileName: 'national_id.pdf',
            status: 'Approved',
            rejectionReason: null,
            uploadedAt: daysAgo(420),
        },
        {
            id: 2,
            kind: 'Certificate',
            fileName: 'bachelor_certificate.pdf',
            status: 'Approved',
            rejectionReason: null,
            uploadedAt: daysAgo(420),
        },
        {
            id: 3,
            kind: 'Professional',
            fileName: 'online_teaching_cert.pdf',
            status: 'PendingReview',
            rejectionReason: null,
            uploadedAt: daysAgo(6),
        },
    ],

    // ----- §5 teaching specializations ----------------------------------------
    specializations: [
        {
            id: 1,
            domain: 'school',
            curriculum: { ar: 'سعودي', en: 'Saudi' },
            stage: { ar: 'ثانوي', en: 'Secondary' },
            grade: { ar: 'الصف الثالث الثانوي', en: 'Grade 12' },
            subject: { ar: 'الرياضيات', en: 'Mathematics' },
            units: [
                { ar: 'الجبر', en: 'Algebra' },
                { ar: 'الهندسة', en: 'Geometry' },
                { ar: 'المثلثات', en: 'Trigonometry' },
            ],
        },
        {
            id: 2,
            domain: 'school',
            curriculum: { ar: 'مصري', en: 'Egyptian' },
            stage: { ar: 'ثانوي', en: 'Secondary' },
            grade: { ar: 'الصف الثالث الثانوي', en: 'Grade 12' },
            subject: { ar: 'الرياضيات', en: 'Mathematics' },
            units: [], // whole subject (BR-009)
        },
        {
            id: 3,
            domain: 'school',
            curriculum: { ar: 'سعودي', en: 'Saudi' },
            stage: { ar: 'متوسط', en: 'Intermediate' },
            grade: { ar: 'الصف الثالث المتوسط', en: 'Grade 9' },
            subject: { ar: 'الفيزياء', en: 'Physics' },
            units: [
                { ar: 'الحركة', en: 'Motion' },
                { ar: 'القوى', en: 'Forces' },
            ],
        },
    ],

    // ----- §6 teaching patterns -----------------------------------------------
    teaching: {
        modes: ['Online', 'InPerson'],
        sessionTypes: ['Individual', 'Group'],
    },

    // ----- §7 in-person service areas -----------------------------------------
    serviceAreas: [
        {
            id: 1,
            city: { ar: 'الرياض', en: 'Riyadh' },
            region: { ar: 'منطقة الرياض', en: 'Riyadh Region' },
            district: { ar: 'حي النخيل', en: 'Al-Nakheel' },
        },
        {
            id: 2,
            city: { ar: 'الرياض', en: 'Riyadh' },
            region: { ar: 'منطقة الرياض', en: 'Riyadh Region' },
            district: { ar: 'حي العليا', en: 'Al-Olaya' },
        },
    ],

    // ----- §8 availability ----------------------------------------------------
    availability: {
        status: 'Available',
        week: [
            { weekday: 0, slots: [{ id: 1, start: '16:00', end: '17:00' }, { id: 2, start: '20:00', end: '21:00' }] },
            { weekday: 1, slots: [{ id: 3, start: '18:00', end: '20:00' }] },
            { weekday: 2, slots: [{ id: 4, start: '16:00', end: '18:00' }] },
            { weekday: 3, slots: [{ id: 5, start: '18:00', end: '21:00' }] },
            { weekday: 6, slots: [{ id: 6, start: '10:00', end: '12:00' }] },
        ],
        exceptions: [
            {
                id: 1,
                fromDate: daysAhead(12),
                toDate: daysAhead(21),
                reason: { ar: 'إجازة سفر', en: 'Travel leave' },
            },
        ],
    },

    // ----- §9 ratings ---------------------------------------------------------
    ratings: {
        average: 4.7,
        count: 38,
        studentsCount: 54,
        reviews: [
            {
                id: 1,
                studentName: { ar: 'سارة محمد', en: 'Sara Mohammed' },
                rating: 5,
                comment: { ar: 'شرح ممتاز وصبور جداً، تحسّن مستوى ابني بشكل كبير.', en: 'Excellent and very patient explanation — my son improved a lot.' },
                date: daysAgo(8),
            },
            {
                id: 2,
                studentName: { ar: 'خالد العتيبي', en: 'Khalid Al-Otaibi' },
                rating: 5,
                comment: { ar: 'مواعيد منضبطة وأسلوب رائع في حل المسائل.', en: 'Punctual and a great problem-solving style.' },
                date: daysAgo(20),
            },
            {
                id: 3,
                studentName: { ar: 'نورة', en: 'Noura' },
                rating: 4,
                comment: null,
                date: daysAgo(33),
            },
        ],
    },

    // ----- §10 statistics -----------------------------------------------------
    statistics: {
        coursesCount: 7,
        studentsCount: 54,
        sessionsCount: 312,
        acceptedRequests: 41,
        rejectedRequests: 9,
        completionRate: 0.94,
        totalEarnings: 86_400,
    },
}

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v))

/** Optional overlay sourced from the local auth session (the signed-in teacher). */
export interface CurrentTeacherOverlay {
    id?: string
    name?: string
    email?: string
    mobile?: string
}

export const mockApi = {
    // GET /Api/V1/Teacher/Profile/me
    async getMyProfile(overlay?: CurrentTeacherOverlay): Promise<TeacherProfile> {
        await sleep(220)
        const profile = clone(PROFILE)
        if (overlay?.id) profile.id = overlay.id
        if (overlay?.email) profile.basic.email = overlay.email
        if (overlay?.mobile) profile.basic.mobile = overlay.mobile
        // The session stores a single display name; split it onto first/last so
        // the header reflects the authenticated teacher in both locales.
        if (overlay?.name) {
            const trimmed = overlay.name.trim()
            const spaceAt = trimmed.indexOf(' ')
            const first = spaceAt === -1 ? trimmed : trimmed.slice(0, spaceAt)
            const last = spaceAt === -1 ? '' : trimmed.slice(spaceAt + 1)
            profile.basic.firstName = { ar: first, en: first }
            profile.basic.lastName = { ar: last, en: last }
        }
        return profile
    },
}

export type MockApi = typeof mockApi

// =============================================================================
//  Teacher Profile Module — types (mirrors the "Teacher Profile Module" spec).
//  Sections map 1:1 to the requirements doc:
//    §1 Basic info, §2 Professional info, §3 Qualifications, §4 Documents,
//    §5 Teaching specializations, §6 Teaching patterns, §7 In-person service
//    areas, §8 Availability, §9 Ratings, §10 Statistics.
//  Free-text fields that surface to the UI carry both Arabic and English so the
//  component layer can render by locale (same convention as subjectNameAr/En in
//  the requests feature).
// =============================================================================

/** A label available in both supported locales. Pick with `text[locale]`. */
export interface LocalizedText {
    ar: string
    en: string
}

// ----- lifecycle (doc §4) ----------------------------------------------------

export const ProfileStatus = {
    PendingReview: 'PendingReview',
    DocumentsRejected: 'DocumentsRejected',
    Approved: 'Approved',
    ProfileIncomplete: 'ProfileIncomplete',
    Active: 'Active',
    Suspended: 'Suspended',
    Inactive: 'Inactive',
} as const
export type ProfileStatus = (typeof ProfileStatus)[keyof typeof ProfileStatus]

export type Gender = 'Male' | 'Female'
export type Language = 'ar' | 'en' | 'fr' | 'ur'

// ----- §1 basic information --------------------------------------------------

export interface BasicInfo {
    firstName: LocalizedText
    lastName: LocalizedText
    avatarUrl: string | null
    gender: Gender
    birthDate: string // ISO date
    nationality: LocalizedText
    mobile: string
    email: string
    country: LocalizedText
    city: LocalizedText
}

// ----- §2 professional information -------------------------------------------

export interface ProfessionalInfo {
    jobTitle: LocalizedText
    bio: LocalizedText
    yearsOfExperience: number
    languages: Language[]
}

// ----- §3 qualifications -----------------------------------------------------

export interface Certificate {
    id: number
    qualification: LocalizedText // e.g. Bachelor / Master / PhD
    specialization: LocalizedText
    institution: LocalizedText
    graduationYear: number
}

export interface TrainingCourse {
    id: number
    name: LocalizedText
    provider: LocalizedText
    year: number
}

export interface Qualifications {
    certificates: Certificate[]
    trainingCourses: TrainingCourse[]
}

// ----- §4 documents ----------------------------------------------------------

export type DocumentKind = 'Identity' | 'Certificate' | 'Professional'
export const DocumentStatus = {
    PendingReview: 'PendingReview',
    Approved: 'Approved',
    Rejected: 'Rejected',
} as const
export type DocumentStatus = (typeof DocumentStatus)[keyof typeof DocumentStatus]

export interface TeacherDocument {
    id: number
    kind: DocumentKind
    fileName: string
    status: DocumentStatus
    rejectionReason: LocalizedText | null
    uploadedAt: string // ISO
}

// ----- §5 teaching specializations -------------------------------------------

export type DomainCode = 'school' | 'university' | 'language' | 'quran' | 'skills'

export interface Specialization {
    id: number
    domain: DomainCode
    curriculum: LocalizedText | null // e.g. Saudi / Egyptian
    stage: LocalizedText | null // e.g. Primary / Intermediate / Secondary / University
    grade: LocalizedText | null
    subject: LocalizedText
    /** Empty array means the whole subject is taught (doc §5/BR-009). */
    units: LocalizedText[]
}

// ----- §6 teaching patterns --------------------------------------------------

export type TeachingMode = 'Online' | 'InPerson'
export type SessionType = 'Individual' | 'Group'

export interface TeachingPatterns {
    modes: TeachingMode[]
    sessionTypes: SessionType[]
}

// ----- §7 in-person service areas (shown only when modes include InPerson) ---

export interface ServiceArea {
    id: number
    city: LocalizedText
    region: LocalizedText
    district: LocalizedText
}

// ----- §8 availability -------------------------------------------------------

/** 0 = Sunday … 6 = Saturday, aligned with common.weekDaysShort. */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6

export interface TimeSlot {
    id: number
    /** 24h "HH:mm". */
    start: string
    end: string
}

export interface DayAvailability {
    weekday: Weekday
    slots: TimeSlot[]
}

export interface AvailabilityException {
    id: number
    fromDate: string // ISO date
    toDate: string // ISO date
    reason: LocalizedText | null
}

export type AvailabilityStatus = 'Available' | 'Unavailable'

export interface Availability {
    status: AvailabilityStatus
    week: DayAvailability[]
    exceptions: AvailabilityException[]
}

// ----- §9 ratings ------------------------------------------------------------

export interface Review {
    id: number
    studentName: LocalizedText
    rating: number // 1..5
    comment: LocalizedText | null
    date: string // ISO
}

export interface Ratings {
    average: number
    count: number
    studentsCount: number
    reviews: Review[]
}

// ----- §10 statistics --------------------------------------------------------

export interface Statistics {
    coursesCount: number
    studentsCount: number
    sessionsCount: number
    acceptedRequests: number
    rejectedRequests: number
    /** 0..1 — completed / total sessions. */
    completionRate: number
    totalEarnings: number
}

// ----- aggregate -------------------------------------------------------------

export interface TeacherProfile {
    id: string
    status: ProfileStatus
    joinedAt: string // ISO
    basic: BasicInfo
    professional: ProfessionalInfo
    qualifications: Qualifications
    documents: TeacherDocument[]
    specializations: Specialization[]
    teaching: TeachingPatterns
    serviceAreas: ServiceArea[]
    availability: Availability
    ratings: Ratings
    statistics: Statistics
}

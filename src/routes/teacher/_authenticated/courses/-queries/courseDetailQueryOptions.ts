import { queryOptions } from "@tanstack/react-query"

export type CourseSessionDetail = {
    id: number
    sessionNumber: number
    durationMinutes: number
    title: string | null
    notes: string | null
}

export type CourseDetail = {
    id: number
    title: string
    description: string | null
    isActive: boolean
    teacherId: number
    teacherDisplayName: string | null
    domainId: number
    domainNameEn: string | null
    domainNameAr: string | null
    teacherSubjectId: number
    subjectNameEn: string | null
    subjectNameAr: string | null
    curriculumId: number | null
    curriculumNameEn: string | null
    curriculumNameAr: string | null
    levelId: number | null
    levelNameEn: string | null
    levelNameAr: string | null
    gradeId: number | null
    gradeNameEn: string | null
    gradeNameAr: string | null
    teachingModeId: number
    teachingModeNameEn: string | null
    teachingModeNameAr: string | null
    sessionTypeId: number
    sessionTypeNameEn: string | null
    sessionTypeNameAr: string | null
    isFlexible: boolean
    sessionsCount: number | null
    sessionDurationMinutes: number | null
    price: number
    maxStudents: number | null
    canIncludeInPackages: boolean
    status: string | number
    units: unknown
    sessions: CourseSessionDetail[] | null
}

type CourseDetailResponse = {
    statusCode: string | number
    succeeded: boolean
    message: string
    data: CourseDetail
    errors: unknown
    meta: unknown
}

export const courseDetailQueryOptions = (id: number, token: string) => queryOptions({
    queryKey: ['course-detail', id],
    queryFn: async () => {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/Api/V1/Teacher/TeacherCourse/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Accept-Language': 'ar-EG',
            },
        })
        if (!response.ok) {
            const error = await response.json().catch(() => ({})) as { message?: string }
            throw new Error(error?.message || 'Failed to fetch course detail')
        }
        const json = await response.json() as CourseDetailResponse
        return json.data
    },
})

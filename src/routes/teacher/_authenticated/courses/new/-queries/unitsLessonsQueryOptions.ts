import { queryOptions } from '@tanstack/react-query'

// =============================================================================
//  MOCK queries for academic units + lessons used by the Sessions Builder.
//  Replace with real fetch() calls when the backend ships:
//    GET /Api/V1/Teacher/TeacherSubjects/{id}/Units
//    GET /Api/V1/Teacher/Units/{id}/Lessons
//  (see COURSE_ENROLLMENT_TEACHER_PLAN.md §6 — "Units / Lessons").
// =============================================================================

export interface UnitOption {
    id: number
    nameAr: string
    nameEn: string
}

export interface LessonOption {
    id: number
    nameAr: string
    nameEn: string
    unitId: number
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

// Generic units used for any teacherSubjectId — the real backend will return
// subject-specific units, but this is enough for demo.
const buildUnitsForSubject = (teacherSubjectId: number): UnitOption[] => {
    const base = teacherSubjectId * 100
    return [
        { id: base + 1, nameAr: 'الوحدة الأولى — أساسيات', nameEn: 'Unit 1 — Foundations' },
        { id: base + 2, nameAr: 'الوحدة الثانية — تطبيقات', nameEn: 'Unit 2 — Applications' },
        { id: base + 3, nameAr: 'الوحدة الثالثة — متقدم', nameEn: 'Unit 3 — Advanced' },
        { id: base + 4, nameAr: 'الوحدة الرابعة — مراجعة', nameEn: 'Unit 4 — Review' },
    ]
}

const buildLessonsForUnit = (unitId: number): LessonOption[] => [
    { id: unitId * 10 + 1, unitId, nameAr: 'الدرس الأول — مقدمة', nameEn: 'Lesson 1 — Introduction' },
    { id: unitId * 10 + 2, unitId, nameAr: 'الدرس الثاني — شرح المفهوم', nameEn: 'Lesson 2 — Concept' },
    { id: unitId * 10 + 3, unitId, nameAr: 'الدرس الثالث — تطبيقات', nameEn: 'Lesson 3 — Practice' },
    { id: unitId * 10 + 4, unitId, nameAr: 'الدرس الرابع — تمارين', nameEn: 'Lesson 4 — Exercises' },
]

export const unitsQueryOptions = (teacherSubjectId: number | null) =>
    queryOptions({
        queryKey: ['teacher-subject-units', teacherSubjectId] as const,
        enabled: teacherSubjectId !== null,
        queryFn: async () => {
            await sleep(140)
            return buildUnitsForSubject(teacherSubjectId!)
        },
    })

export const lessonsQueryOptions = (unitId: number | null) =>
    queryOptions({
        queryKey: ['unit-lessons', unitId] as const,
        enabled: unitId !== null,
        queryFn: async () => {
            await sleep(140)
            return buildLessonsForUnit(unitId!)
        },
    })

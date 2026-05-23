import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';
import {
    ChevronLeft,
    Save,
    Send,
    Pencil,
    Info,
    BookOpen,
    Settings,
    Banknote,
    Clock,
    Users,
    Video,
    Star,
    SaudiRiyal,
    Plus,
    ListOrdered,
} from 'lucide-react';

import {
    DndContext,
    KeyboardSensor,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    arrayMove,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { SubjectSelector } from './-components/SubjectSelector';
import { PublishValidationDialog, type PublishIssue } from './-components/PublishValidationDialog';
import { SortableSessionRow } from './-components/SortableSessionRow';
import { teachingModeQueryOptions } from './-queries/teachingModeQueryOptions';
import { sessionTypesQueryOptions } from './-queries/sessionTypesQueryOptions';
import { subjectsQueryOptions } from './-queries/subjectsQueryOptions';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { showToast } from '@/lib/utils/toast';
import { createStandardSchemaV1, parseAsJson, useQueryStates } from 'nuqs';
import z from 'zod';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/lib/hooks/useLocale';
import { LOCALE_DIRECTION } from '@/lib/i18n';

const sessionAttachmentSchema = z.object({
    id: z.string(),
    fileName: z.string(),
    fileType: z.enum(['pdf', 'image', 'video', 'doc', 'other']),
    sizeBytes: z.number(),
})
export type SessionAttachment = z.infer<typeof sessionAttachmentSchema>

const sessionHomeworkSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().nullable(),
    // Relative offset because the absolute due date is unknown until the
    // course is scheduled per enrollment.
    dueOffsetDays: z.number().nullable(),
})
export type SessionHomeworkItem = z.infer<typeof sessionHomeworkSchema>

const sessionItemSchema = z.object({
    // Client-generated id used as the stable key for drag-and-drop reorder.
    // Persisted in URL state so the order survives reload.
    id: z.string(),
    durationMinutes: z.number(),
    title: z.string().nullable(),
    notes: z.string().nullable(),
    // BRD §4.1 — Fixed course sessions also carry academic scope. These are
    // optional today (backend doesn't accept them yet) but already persist in
    // the URL state so the wizard survives reload.
    description: z.string().nullable(),
    unitId: z.number().nullable(),
    unitName: z.string().nullable(),
    lessonId: z.number().nullable(),
    lessonName: z.string().nullable(),
    attachments: z.array(sessionAttachmentSchema),
    homework: z.array(sessionHomeworkSchema),
})

type SessionItem = z.infer<typeof sessionItemSchema>

const courseDataSchema = z.object({
    title: z.string(),
    description: z.string(),
    teacherSubjectId: z.number().nullable(),
    subjectName: z.string(),
    domainName: z.string(),
    teachingModeId: z.number(),
    sessionTypeId: z.number(),
    isFlexible: z.boolean(),
    sessionsCount: z.number(),
    sessionDurationMinutes: z.string(),
    sessions: z.array(sessionItemSchema),
    price: z.string(),
    maxStudents: z.number().nullable(),
    canIncludeInPackages: z.boolean(),
    mode: z.enum(['save', 'edit', 'show']),
    id: z.number().nullable()
})

const searchParams = {
    courseData: parseAsJson(courseDataSchema).withDefault({
        title: '',
        description: '',
        teacherSubjectId: null,
        subjectName: '',
        domainName: '',
        teachingModeId: 1,
        sessionTypeId: 1,
        isFlexible: false,
        sessionsCount: 0,
        sessionDurationMinutes: '',
        sessions: [] as SessionItem[],
        price: '0',
        maxStudents: 15,
        canIncludeInPackages: true,
        mode: "save",
        id: null
    })
}

export const Route = createFileRoute('/teacher/_authenticated/courses/new')({
    component: RouteComponent,
    validateSearch: createStandardSchemaV1(searchParams, { partialOutput: true }),
    loader: async ({ context: { queryClient, token } }) => {
        const [teachingModes, sessionTypes, subjects] = await Promise.all([
            queryClient.ensureQueryData(teachingModeQueryOptions(token)),
            queryClient.ensureQueryData(sessionTypesQueryOptions(token)),
            queryClient.ensureQueryData(subjectsQueryOptions(token)),
        ])
        return { teachingModes, sessionTypes, subjects }
    }
})

function RouteComponent() {
    const { teachingModes, sessionTypes, subjects } = Route.useLoaderData()
    const [{ courseData }, setCourseData] = useQueryStates(searchParams)
    const [editingIndex, setEditingIndex] = useState<number | null>(null)
    const [publishOpen, setPublishOpen] = useState(false)
    const { t } = useTranslation('teacher')
    const locale = useLocale()
    const isAr = locale === 'ar'

    const newSessionId = () =>
        `sess-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const currentSessionType = sessionTypes.find(t => t.id === courseData.sessionTypeId)
    const isIndividual =
        (currentSessionType?.code?.toLowerCase() === 'individual') ||
        (currentSessionType?.nameEn?.toLowerCase() === 'individual')

    const buildPayload = () => ({
        title: courseData.title,
        description: courseData.description || null,
        teacherSubjectId: courseData.teacherSubjectId,
        teachingModeId: courseData.teachingModeId,
        sessionTypeId: courseData.sessionTypeId,
        isFlexible: courseData.isFlexible,
        sessionDurationMinutes: courseData.isFlexible
            ? null
            : (Number(courseData.sessionDurationMinutes) || null),
        sessions: courseData.isFlexible ? null : courseData.sessions,
        price: Number(courseData.price) || 0,
        maxStudents: isIndividual ? null : courseData.maxStudents,
        canIncludeInPackages: courseData.canIncludeInPackages,
    })

    const parseErrorMessage = (error: any) => {
        const list = Array.isArray(error?.errors) ? error.errors : []
        const flat = list
            .map((e: any) => typeof e === 'string' ? e : (e?.message ?? e?.errorMessage ?? null))
            .filter(Boolean)
        if (flat.length) return flat.join(' • ')
        return error?.message || t('courses.new.toasts.unexpected')
    }

    const isSessionValid = (s: SessionItem) => Number(s.durationMinutes) > 0

    const addSession = () => {
        if (editingIndex !== null) {
            const current = courseData.sessions[editingIndex]
            if (!current || !isSessionValid(current)) {
                showToast({
                    type: 'validation',
                    message: t('courses.new.sections.sessions.validation.completeBeforeAdd'),
                })
                return
            }
        }
        setCourseData((prev) => {
            const defaultDuration = Number(prev.courseData.sessionDurationMinutes) || 60
            const next = [
                ...prev.courseData.sessions,
                {
                    id: newSessionId(),
                    durationMinutes: defaultDuration,
                    title: null,
                    notes: null,
                    description: null,
                    unitId: null,
                    unitName: null,
                    lessonId: null,
                    lessonName: null,
                    attachments: [],
                    homework: [],
                },
            ]
            return {
                ...prev,
                courseData: { ...prev.courseData, sessions: next, sessionsCount: next.length },
            }
        })
        setEditingIndex(courseData.sessions.length)
    }

    const removeSession = (index: number) => {
        setCourseData((prev) => {
            const next = prev.courseData.sessions.filter((_, i) => i !== index)
            return {
                ...prev,
                courseData: { ...prev.courseData, sessions: next, sessionsCount: next.length },
            }
        })
        setEditingIndex((prev) => {
            if (prev === null) return null
            if (prev === index) return null
            if (prev > index) return prev - 1
            return prev
        })
    }

    const dndSensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    )

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        if (!over || active.id === over.id) return
        setCourseData((prev) => {
            const current = prev.courseData.sessions
            const from = current.findIndex((s) => s.id === active.id)
            const to = current.findIndex((s) => s.id === over.id)
            if (from < 0 || to < 0) return prev
            const next = arrayMove(current, from, to)
            return { ...prev, courseData: { ...prev.courseData, sessions: next } }
        })
        setEditingIndex((prev) => {
            // Editing is disabled during drag, but in case the editor was open
            // on a different row, recompute the pointer relative to the swap.
            if (prev === null) return null
            return prev
        })
    }

    const moveSession = (index: number, direction: -1 | 1) => {
        setCourseData((prev) => {
            const current = prev.courseData.sessions
            const target = index + direction
            if (target < 0 || target >= current.length) return prev
            const next = current.slice()
            ;[next[index], next[target]] = [next[target], next[index]]
            return {
                ...prev,
                courseData: { ...prev.courseData, sessions: next },
            }
        })
        // Keep the editing focus on the moved row so the user keeps working on it.
        setEditingIndex((prev) => {
            if (prev === null) return null
            if (prev === index) return index + direction
            if (prev === index + direction) return index
            return prev
        })
    }

    const startEditSession = (index: number) => {
        if (editingIndex !== null && editingIndex !== index) {
            const current = courseData.sessions[editingIndex]
            if (current && !isSessionValid(current)) {
                showToast({
                    type: 'validation',
                    message: t('courses.new.sections.sessions.validation.completeBeforeEdit'),
                })
                return
            }
        }
        setEditingIndex(index)
    }

    const confirmSession = (index: number) => {
        const current = courseData.sessions[index]
        if (!current || !isSessionValid(current)) {
            showToast({
                type: 'validation',
                message: t('courses.new.sections.sessions.validation.durationGtZero'),
            })
            return
        }
        setEditingIndex((prev) => (prev === index ? null : prev))
    }

    const updateSession = (
        index: number,
        patch: Partial<SessionItem>,
    ) => {
        setCourseData((prev) => {
            const next = prev.courseData.sessions.map((s, i) => i === index ? { ...s, ...patch } : s)
            return { ...prev, courseData: { ...prev.courseData, sessions: next } }
        })
    }

    const syncSessionsCount = (rawCount: number) => {
        const newCount = Math.max(0, Number.isFinite(rawCount) ? rawCount : 0)
        setCourseData((prev) => {
            const defaultDuration = Number(prev.courseData.sessionDurationMinutes) || 60
            const current = prev.courseData.sessions
            let next: SessionItem[]
            if (newCount > current.length) {
                next = [
                    ...current,
                    ...Array.from({ length: newCount - current.length }, () => ({
                        id: newSessionId(),
                        durationMinutes: defaultDuration,
                        title: null as string | null,
                        notes: null as string | null,
                        description: null as string | null,
                        unitId: null as number | null,
                        unitName: null as string | null,
                        lessonId: null as number | null,
                        lessonName: null as string | null,
                        attachments: [] as SessionAttachment[],
                        homework: [] as SessionHomeworkItem[],
                    })),
                ]
            } else if (newCount < current.length) {
                next = current.slice(0, newCount)
            } else {
                next = current
            }
            return {
                ...prev,
                courseData: { ...prev.courseData, sessionsCount: newCount, sessions: next },
            }
        })
        setEditingIndex((prev) => (prev !== null && prev >= newCount ? null : prev))
    }

    const publishIssues = useMemo<PublishIssue[]>(() => {
        const out: PublishIssue[] = []
        if (!courseData.title.trim()) {
            out.push({ code: 'title', severity: 'error', message: t('courses.new.publish.issues.title') })
        }
        if (!courseData.description.trim()) {
            out.push({ code: 'description', severity: 'error', message: t('courses.new.publish.issues.description') })
        }
        if (!courseData.teacherSubjectId) {
            out.push({ code: 'subject', severity: 'error', message: t('courses.new.publish.issues.subject') })
        }
        if (Number(courseData.price) <= 0) {
            out.push({ code: 'price', severity: 'error', message: t('courses.new.publish.issues.price') })
        }
        if (!courseData.isFlexible) {
            if (!Number(courseData.sessionDurationMinutes) || Number(courseData.sessionDurationMinutes) <= 0) {
                out.push({ code: 'duration', severity: 'error', message: t('courses.new.publish.issues.duration') })
            }
            if (courseData.sessionsCount <= 0) {
                out.push({ code: 'sessionsCount', severity: 'error', message: t('courses.new.publish.issues.sessionsCount') })
            }
            if (courseData.sessions.length !== courseData.sessionsCount) {
                out.push({
                    code: 'sessions-mismatch',
                    severity: 'error',
                    message: t('courses.new.publish.issues.sessionsMismatch', {
                        expected: courseData.sessionsCount,
                        actual: courseData.sessions.length,
                    }),
                })
            }
            courseData.sessions.forEach((s, idx) => {
                if (!Number(s.durationMinutes) || Number(s.durationMinutes) <= 0) {
                    out.push({
                        code: `session-${idx}-duration`,
                        severity: 'error',
                        message: t('courses.new.publish.issues.sessionDuration', { number: idx + 1 }),
                    })
                }
                if (!s.title?.trim()) {
                    out.push({
                        code: `session-${idx}-title`,
                        severity: 'warning',
                        message: t('courses.new.publish.issues.sessionTitle', { number: idx + 1 }),
                    })
                }
                if (!s.unitId) {
                    out.push({
                        code: `session-${idx}-unit`,
                        severity: 'warning',
                        message: t('courses.new.publish.issues.sessionUnit', { number: idx + 1 }),
                    })
                }
            })
        }
        if (!isIndividual && (courseData.maxStudents === null || courseData.maxStudents < 2)) {
            out.push({ code: 'max-students', severity: 'error', message: t('courses.new.publish.issues.maxStudents') })
        }
        return out
    }, [courseData, isIndividual, t])

    const { mutateAsync: createCourse, isPending: isPublishPending } = useMutation({
        mutationFn: async () => {
            const token = localStorage.getItem('token')
            if (!token) {
                navigate({ to: '/teacher/register', search: { step: 0, authSubStep: 'phone' } })
            }
            const response = await fetch(`${import.meta.env.VITE_API_URL}/Api/V1/Teacher/TeacherCourse`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Accept-Language': 'ar-EG',
                },
                body: JSON.stringify(buildPayload()),
            })
            if (!response.ok) {
                const error = await response.json();
                throw new Error(parseErrorMessage(error));
            }
            const data = await response.json();
            return data;
        },
        onSuccess: () => {

            showToast({
                type: 'success',
                message: t('courses.new.toasts.created'),
            })
            navigate({ to: '/teacher/courses' })
            queryClient.invalidateQueries({ queryKey: ['courses'] })
        },
        onError: (error) => {
            showToast({
                type: 'server',
                message: error.message,
            })
        }
    })

    const { mutateAsync: updateCourse } = useMutation({
        mutationFn: async (id: number) => {
            const token = localStorage.getItem('token')
            if (!token) {
                navigate({ to: '/teacher/register', search: { step: 0, authSubStep: 'phone' } })
            }
            const response = await fetch(`${import.meta.env.VITE_API_URL}/Api/V1/Teacher/TeacherCourse/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Accept-Language': 'ar-EG',
                },
                body: JSON.stringify(buildPayload()),
            })
            if (!response.ok) {
                const error = await response.json();
                throw new Error(parseErrorMessage(error));
            }
            const data = await response.json();
            return data;
        },
        onSuccess: () => {
            showToast({
                type: 'success',
                message: t('courses.new.toasts.updated'),
            })
            navigate({ to: '/teacher/courses' })
            queryClient.invalidateQueries({ queryKey: ['courses'] })
        },
        onError: (error) => {
            showToast({
                type: 'server',
                message: error.message,
            })
        }
    })

    return (
        <div className={`min-h-screen px-3 md:px-5 lg:px-6 transition-colors duration-300 dark:bg-[#020617] bg-[#F8FAFC]`} dir={LOCALE_DIRECTION[locale]}>
            {/* Breadcrumbs & Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-3">
                <div className="flex items-center gap-4">

                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-sm font-medium">
                            <button onClick={() => { navigate({ to: '/teacher' }) }} className="hover:text-teal-600 transition-colors">{t('courses.new.breadcrumbs.dashboard')}</button>
                            {isAr ? <ChevronLeft size={16} /> : <ChevronLeft size={16} className="rotate-180" />}
                            <button onClick={() => { navigate({ to: '/teacher/courses' }) }} className="hover:text-teal-600 transition-colors">{t('courses.new.breadcrumbs.courses')}</button>
                            {isAr ? <ChevronLeft size={16} /> : <ChevronLeft size={16} className="rotate-180" />}
                            <span className="text-slate-600 dark:text-slate-300">{t('courses.new.breadcrumbs.create')}</span>
                        </div>
                        <h1 className="text-3xl font-black text-primary dark:text-secondary">{t('courses.new.heading')}</h1>
                    </div>
                </div>

                <div className="flex items-center gap-2.5">
                    {courseData.mode === 'edit' ? (
                        <button
                            onClick={async () => { if (courseData.id) await updateCourse(courseData.id) }}
                            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary dark:bg-secondary text-white text-sm font-semibold hover:bg-primary/85 dark:hover:bg-secondary/85 transition-all shadow-md shadow-primary/20 dark:shadow-secondary/20"
                        >
                            <Pencil size={16} />
                            {t('courses.new.actions.saveEdits')}
                        </button>
                    ) : (
                        <>
                            <button
                                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                                onClick={async () => { await createCourse() }}
                            >
                                <Save size={16} />
                                {t('courses.new.actions.saveDraft')}
                            </button>
                            <button
                                onClick={() => setPublishOpen(true)}
                                className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-secondary text-white text-sm font-semibold hover:bg-secondary/80 transition-all shadow-md shadow-teal-500/20"
                            >
                                <Send size={16} />
                                {t('courses.new.actions.publish')}
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Form Section */}
                <div className="lg:col-span-8 space-y-5">

                    {/* 1. Basic Information */}
                    <section className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2.5 mb-5">
                            <div className="w-9 h-9 rounded-lg bg-primary dark:bg-secondary flex items-center justify-center text-white">
                                <Info size={18} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-800 dark:text-white">{t('courses.new.sections.basic.title')}</h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('courses.new.sections.basic.subtitle')}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                    {t('courses.new.sections.basic.titleField')} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    maxLength={200}
                                    placeholder={t('courses.new.sections.basic.titlePlaceholder')}
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-start text-sm"
                                    value={courseData.title}
                                    onChange={(e) => {
                                        setCourseData((prev) => ({ ...prev, courseData: { ...prev.courseData, title: e.target.value } }))
                                    }}
                                />
                                <div className="text-end text-slate-500 dark:text-slate-400 text-sm">{courseData.title.length} / 200</div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                    {t('courses.new.sections.basic.descriptionField')} <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    placeholder={t('courses.new.sections.basic.descriptionPlaceholder')}
                                    rows={4}
                                    maxLength={2000}
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-start resize-none text-sm"
                                    value={courseData.description}
                                    onChange={(e) => {
                                        setCourseData((prev) => ({ ...prev, courseData: { ...prev.courseData, description: e.target.value } }))
                                    }}
                                />
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-500 dark:text-slate-400">{t('courses.new.sections.basic.descriptionHelp')}</span>
                                    <span className="text-slate-500 dark:text-slate-400">{courseData.description.length} / 2000</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 2. Subject Selection */}
                    <section className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2.5 mb-5">
                            <div className="w-9 h-9 rounded-lg bg-primary dark:bg-secondary flex items-center justify-center text-white">
                                <BookOpen size={18} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-800 dark:text-white">{t('courses.new.sections.subject.title')}</h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('courses.new.sections.subject.subtitle')}</p>
                            </div>
                        </div>

                        <SubjectSelector
                            subjects={subjects}
                            selectedSubjectId={courseData.teacherSubjectId}
                            onSelect={(subject) => {
                                const subjectName = isAr ? subject.subjectNameAr : subject.subjectNameEn
                                const domainName = subject.domainCode === 'school'
                                    ? t('courses.new.sections.subject.domainSchool')
                                    : subject.domainCode === 'language'
                                        ? t('courses.new.sections.subject.domainLanguage')
                                        : t('courses.new.sections.subject.domainSkills')
                                setCourseData((prev) => ({
                                    ...prev,
                                    courseData: { ...prev.courseData, teacherSubjectId: subject.id, subjectName, domainName }
                                }))
                            }}
                        />
                    </section>

                    {/* 3. Session Settings */}
                    <section className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2.5 mb-5">
                            <div className="w-9 h-9 rounded-lg bg-primary dark:bg-secondary flex items-center justify-center text-white">
                                <Settings size={18} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-800 dark:text-white">{t('courses.new.sections.sessions.title')}</h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('courses.new.sections.sessions.subtitle')}</p>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div className="space-y-2.5">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('courses.new.sections.sessions.teachingMode')}</label>
                                <div className="flex p-1 bg-slate-100 dark:bg-slate-950 rounded-xl w-full max-w-md">
                                    {teachingModes.map(teachingMode => (
                                        <button
                                            key={teachingMode.id}
                                            onClick={() => setCourseData((prev) => ({ ...prev, courseData: { ...prev.courseData, teachingModeId: teachingMode.id } }))}
                                            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${courseData.teachingModeId === teachingMode.id ? 'bg-white dark:bg-slate-800 text-teal-600 shadow-sm' : 'text-slate-500'}`}
                                        >
                                            {isAr ? teachingMode.nameAr : teachingMode.nameEn ?? teachingMode.nameAr}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('courses.new.sections.sessions.sessionType')}</label>
                                <div className="flex p-1 bg-slate-100 dark:bg-slate-950 rounded-xl w-full max-w-md">
                                    {sessionTypes.map(sessionType => (
                                        <button
                                            key={sessionType.id}
                                            onClick={() => setCourseData((prev) => ({ ...prev, courseData: { ...prev.courseData, sessionTypeId: sessionType.id } }))}
                                            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${courseData.sessionTypeId === sessionType.id ? 'bg-white dark:bg-slate-800 text-teal-600 shadow-sm' : 'text-slate-500'}`}
                                        >
                                            {isAr ? sessionType.nameAr : sessionType.nameEn ?? sessionType.nameAr}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 flex items-center justify-between">
                                <div>
                                    <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">{t('courses.new.sections.sessions.flexibleTitle')}</h4>
                                    <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">{t('courses.new.sections.sessions.flexibleSubtitle')}</p>
                                </div>
                                <button
                                    onClick={() => setCourseData((prev) => ({ ...prev, courseData: { ...prev.courseData, isFlexible: !prev.courseData.isFlexible } }))}
                                    className={`w-11 h-6 rounded-full relative transition-all ${courseData.isFlexible ? 'dark:bg-secondary bg-primary' : 'bg-slate-300 dark:bg-slate-700'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${courseData.isFlexible ? 'start-1' : 'start-6'}`} />
                                </button>
                            </div>

                            <AnimatePresence initial={false}>
                                {!courseData.isFlexible && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                                        className="overflow-hidden"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                                    {t('courses.new.sections.sessions.sessionsCount')} <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    placeholder={t('courses.new.sections.sessions.sessionsCountPlaceholder')}
                                                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all text-sm"
                                                    value={Number(courseData.sessionsCount)}
                                                    onChange={(e) => syncSessionsCount(Number(e.target.value))}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                                    {t('courses.new.sections.sessions.sessionDuration')} <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    min={1}
                                                    placeholder={t('courses.new.sections.sessions.sessionDurationPlaceholder')}
                                                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all text-sm"
                                                    value={Number(courseData.sessionDurationMinutes)}
                                                    onChange={(e) => setCourseData((prev) => ({ ...prev, courseData: { ...prev.courseData, sessionDurationMinutes: e.target.value } }))}
                                                />
                                            </div>
                                        </div>

                                        {/* Session details — per-session list (required by API for non-flexible courses) */}
                                        <div className="mt-4 space-y-2.5">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <ListOrdered size={16} className="text-primary dark:text-secondary" />
                                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('courses.new.sections.sessions.detailsTitle')}</label>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={addSession}
                                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary dark:bg-secondary text-white hover:opacity-85 transition-all shadow-sm shadow-primary/20 dark:shadow-secondary/20"
                                                >
                                                    <Plus size={14} /> {t('courses.new.sections.sessions.addSession')}
                                                </button>
                                            </div>

                                            {courseData.sessions.length === 0 ? (
                                                <div className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm font-medium rounded-lg border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40">
                                                    {t('courses.new.sections.sessions.emptyHint')}
                                                </div>
                                            ) : (
                                                <DndContext sensors={dndSensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                                    <SortableContext
                                                        items={courseData.sessions.map((s) => s.id)}
                                                        strategy={verticalListSortingStrategy}
                                                    >
                                                        <div className="space-y-2.5">
                                                            {courseData.sessions.map((session, idx) => (
                                                                <SortableSessionRow
                                                                    key={session.id}
                                                                    session={session}
                                                                    idx={idx}
                                                                    isEditing={editingIndex === idx}
                                                                    isLast={idx === courseData.sessions.length - 1}
                                                                    teacherSubjectId={courseData.teacherSubjectId}
                                                                    onConfirm={() => confirmSession(idx)}
                                                                    onRemove={() => removeSession(idx)}
                                                                    onStartEdit={() => startEditSession(idx)}
                                                                    onMoveUp={() => moveSession(idx, -1)}
                                                                    onMoveDown={() => moveSession(idx, 1)}
                                                                    onUpdate={(patch) => updateSession(idx, patch)}
                                                                />
                                                            ))}
                                                        </div>
                                                    </SortableContext>
                                                </DndContext>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                    {t('courses.new.sections.sessions.maxStudents')} {!isIndividual && <span className="text-red-500">*</span>}
                                </label>
                                <input
                                    type="number"
                                    min={2}
                                    placeholder={t('courses.new.sections.sessions.maxStudentsPlaceholder')}
                                    disabled={isIndividual}
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    value={courseData.maxStudents ?? ''}
                                    onChange={(e) => setCourseData((prev) => ({ ...prev, courseData: { ...prev.courseData, maxStudents: e.target.value === '' ? null : Number(e.target.value) } }))}
                                />
                                {isIndividual ? (
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('courses.new.sections.sessions.individualHint')}</p>
                                ) : (
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('courses.new.sections.sessions.groupHint')}</p>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* 4. Pricing */}
                    <section className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2.5 mb-5">
                            <div className="w-9 h-9 rounded-lg bg-primary dark:bg-secondary flex items-center justify-center text-white">
                                <Banknote size={18} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-800 dark:text-white">{t('courses.new.sections.pricing.title')}</h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('courses.new.sections.pricing.subtitle')}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                    {t('courses.new.sections.pricing.price')} <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        placeholder={t('courses.new.sections.pricing.pricePlaceholder')}
                                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all text-end text-sm"
                                        value={Number(courseData.price)}
                                        onChange={(e) => setCourseData((prev) => ({ ...prev, courseData: { ...prev.courseData, price: e.target.value } }))}
                                    />
                                    <span className="absolute end-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                                        <SaudiRiyal size={16} />
                                    </span>
                                </div>
                            </div>

                            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 text-sm font-medium text-center">
                                {t('courses.new.sections.pricing.fullCourseNote')}
                            </div>

                            <div className="flex items-center justify-between pt-3">
                                <div>
                                    <h4 className="text-sm font-bold text-slate-800 dark:text-white">{t('courses.new.sections.pricing.includeInPackages')}</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('courses.new.sections.pricing.includeInPackagesHint')}</p>
                                </div>
                                <button
                                    onClick={() => setCourseData((prev) => ({ ...prev, courseData: { ...prev.courseData, canIncludeInPackages: !prev.courseData.canIncludeInPackages } }))}
                                    className={`w-11 h-6 rounded-full relative transition-all ${courseData.canIncludeInPackages ? 'dark:bg-secondary bg-primary' : 'bg-slate-300 dark:bg-slate-700'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${courseData.canIncludeInPackages ? 'start-1' : 'start-6'}`} />
                                </button>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Preview Section */}
                <div className="lg:col-span-4">
                    <div className="sticky top-4 space-y-3">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">{t('courses.new.preview.title')}</h3>

                        <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-md border border-slate-100 dark:border-slate-800">
                            <div className="p-5 space-y-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                            <Video size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-base font-bold text-slate-800 dark:text-white leading-tight">
                                                {courseData.title || t('courses.new.preview.placeholderTitle')}
                                            </h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t('courses.new.preview.teacherName')}</span>
                                                <div className="flex items-center gap-1 text-amber-500 text-sm font-bold">
                                                    <Star size={12} fill="currentColor" />
                                                    <span className="leading-none">4.8</span>
                                                    <span className="text-slate-400 font-normal text-sm">(89)</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg text-slate-500 text-xs font-bold">
                                        {t('courses.new.preview.match')}
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-1.5">
                                    <span className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-1 rounded-lg text-xs font-bold">{courseData.domainName || t('courses.new.preview.domainFallback')}</span>
                                    <span className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-1 rounded-lg text-xs font-bold">{courseData.subjectName || t('courses.new.preview.subjectFallback')}</span>
                                    <span className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-1 rounded-lg text-xs font-bold">{(() => { const st = sessionTypes.find(type => type.id === courseData.sessionTypeId); return isAr ? st?.nameAr : st?.nameEn ?? st?.nameAr; })()}</span>
                                </div>

                                <div className="space-y-2.5 pt-2.5 border-t border-slate-50 dark:border-slate-800">
                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                        <Video size={14} className="text-teal-600" />
                                        <span className="text-sm font-medium">{(() => { const m = teachingModes.find(mode => mode.id === courseData.teachingModeId); return isAr ? m?.nameAr : m?.nameEn ?? m?.nameAr; })()}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                        <Clock size={14} className="text-teal-600" />
                                        <span className="text-sm font-medium">{t('courses.new.preview.startsIn')}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                        <Clock size={14} className="text-teal-600" />
                                        <span className="text-sm font-medium">{t('courses.new.preview.sessionsSummary', { sessions: courseData.sessionsCount || '16', duration: courseData.sessionDurationMinutes || '90' })}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-red-500">
                                        <Users size={14} />
                                        <span className="text-sm font-bold">{t('courses.new.preview.seatsOnly', { count: courseData.maxStudents ?? 0 })}</span>
                                    </div>
                                </div>

                                <div className="pt-3 flex items-baseline justify-end gap-1.5">
                                    <span className="text-2xl font-black text-[#003333] dark:text-teal-400">{courseData.price || '0'}</span>
                                    <span className="text-base font-bold text-slate-400">
                                        <SaudiRiyal size={16} />
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <PublishValidationDialog
                open={publishOpen}
                issues={publishIssues}
                isPending={isPublishPending}
                onClose={() => setPublishOpen(false)}
                onConfirm={async () => {
                    await createCourse()
                    setPublishOpen(false)
                }}
            />
        </div>
    );
};


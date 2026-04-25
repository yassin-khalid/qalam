import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion';
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
    Trash2,
    ListOrdered
} from 'lucide-react';

import { SubjectSelector } from './-components/SubjectSelector';
import { teachingModeQueryOptions } from './-queries/teachingModeQueryOptions';
import { sessionTypesQueryOptions } from './-queries/sessionTypesQueryOptions';
import { subjectsQueryOptions } from './-queries/subjectsQueryOptions';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { showToast } from '@/lib/utils/toast';
import { createStandardSchemaV1, parseAsJson, useQueryStates } from 'nuqs';
import z from 'zod';

const sessionItemSchema = z.object({
    durationMinutes: z.number(),
    title: z.string().nullable(),
    notes: z.string().nullable()
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

    console.log({ courseData })


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
        return error?.message || 'حدث خطأ غير متوقع'
    }

    const addSession = () => {
        setCourseData((prev) => {
            const defaultDuration = Number(prev.courseData.sessionDurationMinutes) || 60
            const next = [
                ...prev.courseData.sessions,
                { durationMinutes: defaultDuration, title: null, notes: null },
            ]
            return {
                ...prev,
                courseData: { ...prev.courseData, sessions: next, sessionsCount: next.length },
            }
        })
    }

    const removeSession = (index: number) => {
        setCourseData((prev) => {
            const next = prev.courseData.sessions.filter((_, i) => i !== index)
            return {
                ...prev,
                courseData: { ...prev.courseData, sessions: next, sessionsCount: next.length },
            }
        })
    }

    const updateSession = (
        index: number,
        patch: Partial<{ durationMinutes: number; title: string | null; notes: string | null }>,
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
                        durationMinutes: defaultDuration,
                        title: null as string | null,
                        notes: null as string | null,
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
    }

    const { mutateAsync: createCourse } = useMutation({
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
                message: 'تم إنشاء الدورة بنجاح',
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
                message: 'تم تحديث الدورة بنجاح',
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
        <div className={`min-h-screen px-3 md:px-5 lg:px-6 transition-colors duration-300 dark:bg-[#020617] bg-[#F8FAFC]`} dir="rtl">
            {/* Breadcrumbs & Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-3">
                <div className="flex items-center gap-4">

                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-sm font-medium">
                            <button onClick={() => { navigate({ to: '/teacher' }) }} className="hover:text-teal-600 transition-colors">لوحة التحكم</button>
                            <ChevronLeft size={16} />
                            <button onClick={() => { navigate({ to: '/teacher/courses' }) }} className="hover:text-teal-600 transition-colors">الدورات</button>
                            <ChevronLeft size={16} />
                            <span className="text-slate-600 dark:text-slate-300">إنشاء دورة</span>
                        </div>
                        <h1 className="text-3xl font-black text-primary dark:text-secondary">إنشاء دورة</h1>
                    </div>
                </div>

                <div className="flex items-center gap-2.5">
                    {courseData.mode === 'edit' ? (
                        <button
                            onClick={async () => { if (courseData.id) await updateCourse(courseData.id) }}
                            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary dark:bg-secondary text-white text-sm font-semibold hover:bg-primary/85 dark:hover:bg-secondary/85 transition-all shadow-md shadow-primary/20 dark:shadow-secondary/20"
                        >
                            <Pencil size={16} />
                            حفظ التعديلات
                        </button>
                    ) : (
                        <>
                            <button
                                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                                onClick={async () => { await createCourse() }}
                            >
                                <Save size={16} />
                                حفظ كمسودة
                            </button>
                            <button
                                onClick={async () => { await createCourse() }}
                                className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-secondary text-white text-sm font-semibold hover:bg-secondary/80 transition-all shadow-md shadow-teal-500/20"
                            >
                                <Send size={16} />
                                نشر
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
                                <h2 className="text-lg font-bold text-slate-800 dark:text-white">المعلومات الأساسية</h2>
                                <p className="text-xs text-slate-400 font-medium">أدخل المعلومات الأساسية للدورة</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                    عنوان الدورة <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    maxLength={200}
                                    placeholder="مثال: دورة الفيزياء المتقدمة للصف الثالث الثانوي"
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-right text-sm"
                                    value={courseData.title}
                                    onChange={(e) => {
                                        setCourseData((prev) => ({ ...prev, courseData: { ...prev.courseData, title: e.target.value } }))
                                    }}
                                />
                                <div className="text-left text-slate-400 dark:text-slate-500 text-sm">{courseData.title.length} / 200</div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                    وصف الدورة <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    placeholder="اكتب وصفاً يساعد الطالب على فهم ما سيتعلمه..."
                                    rows={4}
                                    maxLength={2000}
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-right resize-none text-sm"
                                    value={courseData.description}
                                    onChange={(e) => {
                                        setCourseData((prev) => ({ ...prev, courseData: { ...prev.courseData, description: e.target.value } }))
                                    }}
                                />
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-400 dark:text-slate-500">اكتب وصفاً يساعد الطالب على فهم ما سيتعلمه.</span>
                                    <span className="text-slate-400 dark:text-slate-500">{courseData.description.length} / 2000</span>
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
                                <h2 className="text-lg font-bold text-slate-800 dark:text-white">اختيار المادة</h2>
                                <p className="text-xs text-slate-400 font-medium">اختر المادة التعليمية لهذه الدورة</p>
                            </div>
                        </div>

                        <SubjectSelector
                            subjects={subjects}
                            selectedSubjectId={courseData.teacherSubjectId}
                            onSelect={(subject) => {
                                setCourseData((prev) => ({
                                    ...prev,
                                    courseData: { ...prev.courseData, teacherSubjectId: subject.id, subjectName: subject.subjectNameAr, domainName: subject.domainCode === 'school' ? 'مدرسي' : subject.domainCode === 'language' ? 'لغات' : 'مهارات' }
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
                                <h2 className="text-lg font-bold text-slate-800 dark:text-white">إعدادات الجلسات</h2>
                                <p className="text-xs text-slate-400 font-medium">حدد طريقة التدريس ونوع الجلسة</p>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div className="space-y-2.5">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">طريقة التدريس</label>
                                <div className="flex p-1 bg-slate-100 dark:bg-slate-950 rounded-xl w-full max-w-md">
                                    {teachingModes.map(teachingMode => (
                                        <button
                                            key={teachingMode.id}
                                            onClick={() => setCourseData((prev) => ({ ...prev, courseData: { ...prev.courseData, teachingModeId: teachingMode.id } }))}
                                            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${courseData.teachingModeId === teachingMode.id ? 'bg-white dark:bg-slate-800 text-teal-600 shadow-sm' : 'text-slate-500'}`}
                                        >
                                            {teachingMode.nameAr}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">نوع الجلسة</label>
                                <div className="flex p-1 bg-slate-100 dark:bg-slate-950 rounded-xl w-full max-w-md">
                                    {sessionTypes.map(sessionType => (
                                        <button
                                            key={sessionType.id}
                                            onClick={() => setCourseData((prev) => ({ ...prev, courseData: { ...prev.courseData, sessionTypeId: sessionType.id } }))}
                                            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${courseData.sessionTypeId === sessionType.id ? 'bg-white dark:bg-slate-800 text-teal-600 shadow-sm' : 'text-slate-500'}`}
                                        >
                                            {sessionType.nameAr}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 flex items-center justify-between">
                                <div>
                                    <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">الدورة مرنة؟</h4>
                                    <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">محددة: عدد الجلسات ومدة الجلسة ثابتة.</p>
                                </div>
                                <button
                                    onClick={() => setCourseData((prev) => ({ ...prev, courseData: { ...prev.courseData, isFlexible: !prev.courseData.isFlexible } }))}
                                    className={`w-11 h-6 rounded-full relative transition-all ${courseData.isFlexible ? 'dark:bg-secondary bg-primary' : 'bg-slate-300 dark:bg-slate-700'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${courseData.isFlexible ? 'left-1' : 'left-6'}`} />
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
                                                    عدد الجلسات <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    placeholder="مثال: 10"
                                                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all text-sm"
                                                    value={Number(courseData.sessionsCount)}
                                                    onChange={(e) => syncSessionsCount(Number(e.target.value))}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                                    مدة الجلسة (بالدقائق) <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    min={1}
                                                    placeholder="مثال: 60"
                                                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all text-sm"
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
                                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">تفاصيل الجلسات</label>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={addSession}
                                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary dark:bg-secondary text-white hover:opacity-85 transition-all shadow-sm shadow-primary/20 dark:shadow-secondary/20"
                                                >
                                                    <Plus size={14} /> إضافة جلسة
                                                </button>
                                            </div>

                                            {courseData.sessions.length === 0 ? (
                                                <div className="p-4 text-center text-slate-400 dark:text-slate-500 text-sm font-medium rounded-lg border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40">
                                                    لم تتم إضافة أي جلسة بعد. حدّد عدد الجلسات أعلاه أو اضغط "إضافة جلسة".
                                                </div>
                                            ) : (
                                                <div className="space-y-2.5">
                                                    {courseData.sessions.map((session, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-2.5"
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <h5 className="text-sm font-bold text-primary dark:text-secondary">
                                                                    الجلسة {idx + 1}
                                                                </h5>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeSession(idx)}
                                                                    className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 p-1.5 rounded-lg transition-all"
                                                                    title="حذف الجلسة"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>

                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                                                <div className="space-y-1.5">
                                                                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                                                                        مدة الجلسة (دقيقة) <span className="text-red-500">*</span>
                                                                    </label>
                                                                    <input
                                                                        type="number"
                                                                        min={1}
                                                                        value={session.durationMinutes}
                                                                        onChange={(e) => updateSession(idx, { durationMinutes: Number(e.target.value) })}
                                                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm"
                                                                    />
                                                                </div>
                                                                <div className="space-y-1.5">
                                                                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">عنوان الجلسة</label>
                                                                    <input
                                                                        type="text"
                                                                        maxLength={150}
                                                                        value={session.title ?? ''}
                                                                        onChange={(e) => updateSession(idx, { title: e.target.value || null })}
                                                                        placeholder="مثال: مقدمة"
                                                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-right text-sm"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="space-y-1.5">
                                                                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">ملاحظات</label>
                                                                <textarea
                                                                    rows={2}
                                                                    maxLength={500}
                                                                    value={session.notes ?? ''}
                                                                    onChange={(e) => updateSession(idx, { notes: e.target.value || null })}
                                                                    placeholder="ملاحظات اختيارية للطالب..."
                                                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-right resize-none text-sm"
                                                                />
                                                                <div className="text-left text-[11px] text-slate-400 dark:text-slate-500">{(session.notes ?? '').length} / 500</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                    أقصى عدد للطلاب {!isIndividual && <span className="text-red-500">*</span>}
                                </label>
                                <input
                                    type="number"
                                    min={2}
                                    placeholder="مثال: 15"
                                    disabled={isIndividual}
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    value={courseData.maxStudents ?? ''}
                                    onChange={(e) => setCourseData((prev) => ({ ...prev, courseData: { ...prev.courseData, maxStudents: e.target.value === '' ? null : Number(e.target.value) } }))}
                                />
                                {isIndividual ? (
                                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">لا ينطبق على الجلسات الفردية.</p>
                                ) : (
                                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">الحد الأدنى 2 للجلسات الجماعية.</p>
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
                                <h2 className="text-lg font-bold text-slate-800 dark:text-white">التسعير</h2>
                                <p className="text-xs text-slate-400 font-medium">حدد سعر الدورة</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                    السعر <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all text-left text-sm"
                                        value={Number(courseData.price)}
                                        onChange={(e) => setCourseData((prev) => ({ ...prev, courseData: { ...prev.courseData, price: e.target.value } }))}
                                    />
                                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                                        <SaudiRiyal size={16} />
                                    </span>
                                </div>
                            </div>

                            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 text-sm font-medium text-center">
                                يُحتسب السعر للدورة كاملة.
                            </div>

                            <div className="flex items-center justify-between pt-3">
                                <div>
                                    <h4 className="text-sm font-bold text-slate-800 dark:text-white">إتاحة إدراجها ضمن الباقات</h4>
                                    <p className="text-xs text-slate-400 font-medium">السماح بتضمين هذه الدورة ضمن الباقات الشاملة</p>
                                </div>
                                <button
                                    onClick={() => setCourseData((prev) => ({ ...prev, courseData: { ...prev.courseData, canIncludeInPackages: !prev.courseData.canIncludeInPackages } }))}
                                    className={`w-11 h-6 rounded-full relative transition-all ${courseData.canIncludeInPackages ? 'dark:bg-secondary bg-primary' : 'bg-slate-300 dark:bg-slate-700'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${courseData.canIncludeInPackages ? 'left-1' : 'left-6'}`} />
                                </button>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Preview Section */}
                <div className="lg:col-span-4">
                    <div className="sticky top-4 space-y-3">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">معاينة ظهور الدورة للطالب</h3>

                        <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-md border border-slate-100 dark:border-slate-800">
                            <div className="p-5 space-y-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                            <Video size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-base font-bold text-slate-800 dark:text-white leading-tight">
                                                {courseData.title || 'عنوان الدورة يظهر هنا'}
                                            </h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-sm text-slate-400 font-medium">أ. فاطمة العلي</span>
                                                <div className="flex items-center gap-1 text-amber-500 text-sm font-bold">
                                                    <Star size={12} fill="currentColor" />
                                                    <span className="leading-none">4.8</span>
                                                    <span className="text-slate-400 font-normal text-sm">(89)</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg text-slate-500 text-xs font-bold">
                                        مطابق 95%
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-1.5">
                                    <span className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-1 rounded-lg text-xs font-bold">{courseData.domainName || 'المجال'}</span>
                                    <span className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-1 rounded-lg text-xs font-bold">{courseData.subjectName || 'المادة'}</span>
                                    <span className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-1 rounded-lg text-xs font-bold">{sessionTypes.find(type => type.id === courseData.sessionTypeId)?.nameAr}</span>
                                </div>

                                <div className="space-y-2.5 pt-2.5 border-t border-slate-50 dark:border-slate-800">
                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                        <Video size={14} className="text-teal-600" />
                                        <span className="text-sm font-medium">{teachingModes.find(mode => mode.id === courseData.teachingModeId)?.nameAr}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                        <Clock size={14} className="text-teal-600" />
                                        <span className="text-sm font-medium">يبدأ في 8 رمضان</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                        <Clock size={14} className="text-teal-600" />
                                        <span className="text-sm font-medium">{courseData.sessionsCount || '16'} جلسة • {courseData.sessionDurationMinutes || '90'} دقيقة</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-red-500">
                                        <Users size={14} />
                                        <span className="text-sm font-bold">{courseData.maxStudents} مقاعد فقط</span>
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
        </div>
    );
};


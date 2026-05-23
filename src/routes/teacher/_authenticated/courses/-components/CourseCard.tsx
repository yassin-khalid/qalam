
import React, { useState } from 'react';
import { Calendar, Clock, Users as UsersIcon, Banknote, Eye, Trash2, Edit3, SaudiRiyal, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Course } from '../-types/types';
import { useNavigate } from '@tanstack/react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { EnrollmentRequestsModal } from './EnrollmentRequestsModal';
import { courseDetailQueryOptions, deleteCourse } from '../-queries/courseDetailQueryOptions';
import { showToast } from '@/lib/utils/toast';
import { AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/lib/hooks/useLocale';
import { LOCALE_DIRECTION } from '@/lib/i18n';

interface CourseCardProps {
    course: Course;
    index: number;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, index }) => {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { t } = useTranslation('teacher');
    const locale = useLocale();
    const [isEnrollmentModalOpen, setIsEnrollmentModalOpen] = useState(false);
    const [isLoadingEdit, setIsLoadingEdit] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const { mutate: deleteCourseMutate, isPending: isDeleting } = useMutation({
        mutationFn: async () => {
            const token = localStorage.getItem('token')
            if (!token) {
                navigate({ to: '/teacher/register', search: { step: 0, authSubStep: 'phone' } })
                return
            }
            return await deleteCourse(course.id, token)
        },
        onSuccess: () => {
            showToast({ type: 'success', message: t('courses.card.toasts.deleted') })
            setIsDeleteOpen(false)
            queryClient.invalidateQueries({ queryKey: ['courses'] })
        },
        onError: (error: Error) => {
            showToast({ type: 'server', message: error.message })
        },
    })

    const handleEdit = async () => {
        const token = localStorage.getItem('token')
        if (!token) {
            navigate({ to: '/teacher/register', search: { step: 0, authSubStep: 'phone' } })
            return
        }
        setIsLoadingEdit(true)
        try {
            const detail = await queryClient.fetchQuery(courseDetailQueryOptions(course.id, token))
            navigate({
                to: '/teacher/courses/new',
                search: {
                    courseData: {
                        title: detail.title ?? '',
                        description: detail.description ?? '',
                        teacherSubjectId: detail.teacherSubjectId ?? null,
                        subjectName: detail.subjectNameAr ?? detail.subjectNameEn ?? '',
                        domainName: detail.domainNameAr ?? detail.domainNameEn ?? '',
                        teachingModeId: detail.teachingModeId,
                        sessionTypeId: detail.sessionTypeId,
                        isFlexible: !!detail.isFlexible,
                        sessionsCount: detail.sessions?.length ?? detail.sessionsCount ?? 0,
                        sessionDurationMinutes: detail.sessionDurationMinutes != null ? String(detail.sessionDurationMinutes) : '',
                        sessions: (detail.sessions ?? []).map(s => ({
                            // Generate a client-side id for drag-and-drop; the
                            // backend will get a stable id once it ships.
                            id: `sess-srv-${s.id}`,
                            durationMinutes: s.durationMinutes,
                            title: s.title,
                            notes: s.notes,
                            // Backend doesn't return these yet; the wizard schema
                            // requires them so default to null on load.
                            description: null,
                            unitId: null,
                            unitName: null,
                            lessonId: null,
                            lessonName: null,
                            attachments: [],
                            homework: [],
                        })),
                        price: detail.price != null ? String(detail.price) : '0',
                        maxStudents: detail.maxStudents ?? null,
                        canIncludeInPackages: !!detail.canIncludeInPackages,
                        mode: 'edit',
                        id: detail.id,
                    },
                },
            })
        } catch (err) {
            showToast({
                type: 'server',
                message: err instanceof Error ? err.message : t('courses.card.toasts.loadFailed'),
            })
        } finally {
            setIsLoadingEdit(false)
        }
    }

    const normalizeStatus = (status: number | string | null | undefined): 1 | 2 | 3 | null => {
        if (status === 1 || status === 2 || status === 3) return status
        if (typeof status === 'string') {
            const s = status.toLowerCase()
            if (s === 'draft') return 1
            if (s === 'published') return 2
            if (s === 'archived' || s === 'inactive') return 3
        }
        return null
    }

    const getStatusLabel = (status: number | string | null | undefined) => {
        switch (normalizeStatus(status)) {
            case 1: return t('courses.card.status.draft');
            case 2: return t('courses.card.status.published');
            case 3: return t('courses.card.status.archived');
            default: return '';
        }
    };

    const getStatusStyles = (status: number | string | null | undefined) => {
        switch (normalizeStatus(status)) {
            case 1: return 'bg-amber-100 text-amber-700 border-amber-200';
            case 2: return 'bg-[#D1FAE5] text-[#065F46] border-[#A7F3D0]';
            case 3: return 'bg-slate-100 text-slate-700 border-slate-200';
            default: return '';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-xl border border-slate-100 dark:border-slate-800 flex flex-col h-full group min-w-0"
        >
            {/* Card Header (Teal Section) */}
            <div className="bg-linear-to-br from-primary to-secondary p-5 relative min-h-[140px] flex flex-col justify-end">
                {getStatusLabel(course.status) && (
                    <div className={`absolute top-3 end-4 px-3 py-1 rounded-lg text-xs font-bold border ${getStatusStyles(course.status)}`}>
                        {getStatusLabel(course.status)}
                    </div>
                )}
                <h3 className="text-lg font-bold text-white leading-snug mb-3 mt-8">
                    {course.title}
                </h3>
                <div className="flex flex-wrap gap-1.5">
                    <span className="bg-white/10 backdrop-blur-md text-white px-3 py-1 rounded-lg text-xs font-medium border border-white/20">
                        {locale === 'ar' ? (course as any).subjectNameAr ?? course.subjectNameEn : course.subjectNameEn}
                    </span>
                    <span className="bg-white/10 backdrop-blur-md text-white px-3 py-1 rounded-lg text-xs font-medium border border-white/20 flex items-center gap-1">
                        <UsersIcon size={14} />
                        {locale === 'ar' ? (course as any).sessionTypeNameAr ?? course.sessionTypeNameEn : course.sessionTypeNameEn}
                    </span>
                    <span className="bg-white/10 backdrop-blur-md text-white px-3 py-1 rounded-lg text-xs font-medium border border-white/20 flex items-center gap-1">
                        <Clock size={14} />
                        {locale === 'ar' ? (course as any).teachingModeNameAr ?? course.teachingModeNameEn : course.teachingModeNameEn}
                    </span>
                </div>
            </div>

            {/* Card Body (Details Section) */}
            <div className="p-5 flex-1 flex flex-col space-y-3">
                <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                            <Calendar size={18} className="text-slate-400" />
                            <span className="text-sm font-medium">{t('courses.card.startDate')}</span>
                        </div>
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{course.startDate}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                            <Clock size={18} className="text-slate-400" />
                            <span className="text-sm font-medium">{t('courses.card.sessionsCount')}</span>
                        </div>
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{course.sessionsCount} {t('courses.card.sessionsSuffix')}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                            <UsersIcon size={18} className="text-slate-400" />
                            <span className="text-sm font-medium">{t('courses.card.registeredStudents')}</span>
                        </div>
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                            {course.registeredCount ?? 0}
                            {course.maxStudents != null ? ` / ${course.maxStudents}` : ''}
                        </span>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Banknote size={18} className="text-slate-400" />
                        <span className="text-sm font-medium text-slate-500">{t('courses.card.price')}</span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-xl font-black text-primary dark:text-secondary">{course.price}</span>
                        <SaudiRiyal size={18} className="text-primary dark:text-secondary" />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-3">
                    <button
                        type="button"
                        onClick={() => setIsEnrollmentModalOpen(true)}
                        className="flex-1 bg-primary hover:bg-secondary text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-slate-900/10 text-sm"
                    >
                        <UserPlus size={16} />
                        {t('courses.card.enrollmentRequests')}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate({ to: '/teacher/courses/$courseId', params: { courseId: course.id } })}
                        aria-label={t('common.viewDetailsAria', { name: course.title })}
                        className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-primary dark:hover:text-secondary hover:bg-slate-50 dark:hover:bg-slate-800 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 dark:focus-visible:ring-secondary/40"
                    >
                        <Eye size={18} />
                    </button>
                    <button
                        type="button"
                        onClick={handleEdit}
                        disabled={isLoadingEdit}
                        aria-label={t('common.editAria', { name: course.title })}
                        className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 dark:focus-visible:ring-secondary/40"
                    >
                        <Edit3 size={18} className={isLoadingEdit ? 'animate-pulse' : ''} />
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsDeleteOpen(true)}
                        disabled={isDeleting}
                        aria-label={t('common.deleteAria', { name: course.title })}
                        className="p-2.5 rounded-xl border border-red-50 dark:border-red-900/20 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/40"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {isDeleteOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => !isDeleting && setIsDeleteOpen(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            dir={LOCALE_DIRECTION[locale]}
                            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 text-start">
                                {t('courses.card.deleteConfirm.title')}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 text-start">
                                {t('courses.card.deleteConfirm.message', { title: course.title })}
                            </p>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    disabled={isDeleting}
                                    onClick={() => deleteCourseMutate()}
                                    className="flex-1 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 disabled:cursor-not-allowed text-white py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition"
                                >
                                    {isDeleting && <Loader2 size={14} className="animate-spin" />}
                                    {t('courses.card.deleteConfirm.confirm')}
                                </button>
                                <button
                                    type="button"
                                    disabled={isDeleting}
                                    onClick={() => setIsDeleteOpen(false)}
                                    className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-2.5 rounded-xl font-bold text-sm transition"
                                >
                                    {t('courses.card.deleteConfirm.cancel')}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <EnrollmentRequestsModal
                course={course}
                open={isEnrollmentModalOpen}
                onClose={() => setIsEnrollmentModalOpen(false)}
            />
        </motion.div>
    );
};

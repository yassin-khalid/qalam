import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, Save, User as UserIcon } from 'lucide-react'

import { showToast } from '@/lib/utils/toast'

import { setAttendance } from '../../-queries/sessionsQueries'
import type { AttendanceMark, SessionDetail } from '../../-types/types'

const MARKS: { id: AttendanceMark; tone: string }[] = [
    { id: 'Present', tone: 'bg-emerald-600 text-white border-transparent' },
    { id: 'Late', tone: 'bg-amber-500 text-white border-transparent' },
    { id: 'Absent', tone: 'bg-rose-600 text-white border-transparent' },
    { id: 'Pending', tone: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-transparent' },
]

const labelKeys: Record<AttendanceMark, string> = {
    Present: 'sessions.detail.attendance.present',
    Late: 'sessions.detail.attendance.late',
    Absent: 'sessions.detail.attendance.absent',
    Pending: 'sessions.detail.attendance.pending',
}

export const AttendanceTab: React.FC<{ session: SessionDetail }> = ({ session }) => {
    const { t } = useTranslation('teacher')
    const queryClient = useQueryClient()

    const [marks, setMarks] = useState<Record<number, AttendanceMark>>(() =>
        Object.fromEntries(session.students.map((s) => [s.studentId, s.attendance])),
    )

    useEffect(() => {
        setMarks(Object.fromEntries(session.students.map((s) => [s.studentId, s.attendance])))
    }, [session.students])

    const isDirty = useMemo(
        () => session.students.some((s) => marks[s.studentId] !== s.attendance),
        [marks, session.students],
    )

    const mutation = useMutation({
        mutationFn: () =>
            setAttendance(
                session.id,
                session.students.map((s) => ({
                    studentId: s.studentId,
                    attendance: marks[s.studentId] ?? 'Pending',
                })),
            ),
        onSuccess: () => {
            showToast({ type: 'success', message: t('sessions.detail.toasts.attendanceSaved') })
            queryClient.invalidateQueries({ queryKey: ['sessions', 'detail', session.id] })
        },
        onError: (err: Error) => showToast({ type: 'server', message: t(err.message, { defaultValue: err.message }) }),
    })

    return (
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 space-y-4">
            <header>
                <h2 className="text-base font-bold text-slate-800 dark:text-white">
                    {t('sessions.detail.attendance.title')}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {t('sessions.detail.attendance.subtitle')}
                </p>
            </header>

            <ul className="space-y-2.5">
                {session.students.map((stu) => (
                    <li
                        key={stu.studentId}
                        className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500">
                                <UserIcon size={16} />
                            </div>
                            <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                                {stu.studentName}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {MARKS.map(({ id, tone }) => {
                                const active = marks[stu.studentId] === id
                                return (
                                    <button
                                        key={id}
                                        type="button"
                                        onClick={() => setMarks((prev) => ({ ...prev, [stu.studentId]: id }))}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${active
                                            ? tone
                                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                                            }`}
                                    >
                                        {t(labelKeys[id])}
                                    </button>
                                )
                            })}
                        </div>
                    </li>
                ))}
            </ul>

            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={() => mutation.mutate()}
                    disabled={!isDirty || mutation.isPending}
                    className="px-5 py-2.5 rounded-lg bg-primary dark:bg-secondary text-white text-sm font-bold flex items-center gap-2 hover:opacity-85 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {mutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    {t('sessions.detail.attendance.save')}
                </button>
            </div>
        </section>
    )
}

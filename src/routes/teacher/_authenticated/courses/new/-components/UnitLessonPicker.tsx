import React from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { BookOpen, ChevronDown, Loader2 } from 'lucide-react'

import { useLocale } from '@/lib/hooks/useLocale'
import {
    lessonsQueryOptions,
    unitsQueryOptions,
} from '../-queries/unitsLessonsQueryOptions'

interface UnitLessonPickerProps {
    teacherSubjectId: number | null
    unitId: number | null
    lessonId: number | null
    onChange: (patch: {
        unitId: number | null
        unitName: string | null
        lessonId: number | null
        lessonName: string | null
    }) => void
}

export const UnitLessonPicker: React.FC<UnitLessonPickerProps> = ({
    teacherSubjectId,
    unitId,
    lessonId,
    onChange,
}) => {
    const { t } = useTranslation('teacher')
    const locale = useLocale()
    const isAr = locale === 'ar'

    const unitsQuery = useQuery(unitsQueryOptions(teacherSubjectId))
    const lessonsQuery = useQuery(lessonsQueryOptions(unitId))

    const noSubject = teacherSubjectId === null
    const labelFor = <T extends { nameAr: string; nameEn: string }>(o: T) =>
        isAr ? o.nameAr : o.nameEn

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                <BookOpen size={13} className="text-primary dark:text-secondary" />
                {t('courses.new.sections.sessions.unitLesson.title')}
            </div>

            {noSubject ? (
                <p className="text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-lg px-3 py-2 font-medium">
                    {t('courses.new.sections.sessions.unitLesson.pickSubjectFirst')}
                </p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    <PickerSelect
                        label={t('courses.new.sections.sessions.unitLesson.unitLabel')}
                        loading={unitsQuery.isLoading}
                        value={unitId ?? ''}
                        onChange={(value) => {
                            if (value === '') {
                                onChange({ unitId: null, unitName: null, lessonId: null, lessonName: null })
                                return
                            }
                            const id = Number(value)
                            const u = unitsQuery.data?.find((x) => x.id === id)
                            onChange({
                                unitId: id,
                                unitName: u ? labelFor(u) : null,
                                // Clear lesson because it's scoped to the unit.
                                lessonId: null,
                                lessonName: null,
                            })
                        }}
                    >
                        <option value="">{t('courses.new.sections.sessions.unitLesson.unitNone')}</option>
                        {unitsQuery.data?.map((u) => (
                            <option key={u.id} value={u.id}>
                                {labelFor(u)}
                            </option>
                        ))}
                    </PickerSelect>

                    <PickerSelect
                        label={t('courses.new.sections.sessions.unitLesson.lessonLabel')}
                        loading={lessonsQuery.isLoading && unitId !== null}
                        disabled={unitId === null}
                        value={lessonId ?? ''}
                        onChange={(value) => {
                            if (value === '') {
                                onChange({
                                    unitId: unitId,
                                    unitName: unitsQuery.data?.find((x) => x.id === unitId)
                                        ? labelFor(unitsQuery.data.find((x) => x.id === unitId)!)
                                        : null,
                                    lessonId: null,
                                    lessonName: null,
                                })
                                return
                            }
                            const id = Number(value)
                            const l = lessonsQuery.data?.find((x) => x.id === id)
                            onChange({
                                unitId: unitId,
                                unitName: unitsQuery.data?.find((x) => x.id === unitId)
                                    ? labelFor(unitsQuery.data.find((x) => x.id === unitId)!)
                                    : null,
                                lessonId: id,
                                lessonName: l ? labelFor(l) : null,
                            })
                        }}
                    >
                        <option value="">
                            {unitId === null
                                ? t('courses.new.sections.sessions.unitLesson.lessonPickUnitFirst')
                                : t('courses.new.sections.sessions.unitLesson.lessonNone')}
                        </option>
                        {lessonsQuery.data?.map((l) => (
                            <option key={l.id} value={l.id}>
                                {labelFor(l)}
                            </option>
                        ))}
                    </PickerSelect>
                </div>
            )}
        </div>
    )
}

interface PickerSelectProps {
    label: string
    value: string | number
    onChange: (value: string) => void
    loading?: boolean
    disabled?: boolean
    children: React.ReactNode
}

const PickerSelect: React.FC<PickerSelectProps> = ({ label, value, onChange, loading, disabled, children }) => (
    <div>
        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
            {label}
        </label>
        <div className="relative">
            <select
                value={value}
                disabled={disabled || loading}
                onChange={(e) => onChange(e.target.value)}
                className="w-full appearance-none px-3 py-2 pe-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {children}
            </select>
            <span className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                {loading ? <Loader2 size={12} className="animate-spin" /> : <ChevronDown size={12} />}
            </span>
        </div>
    </div>
)

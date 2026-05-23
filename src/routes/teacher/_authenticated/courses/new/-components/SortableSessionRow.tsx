import React from 'react'
import { useTranslation } from 'react-i18next'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
    Check,
    ChevronDown,
    ChevronUp,
    Clock,
    BookOpen,
    BookOpenCheck,
    GripVertical,
    Paperclip,
    Pencil,
    StickyNote,
    Trash2,
} from 'lucide-react'

import { SessionAttachmentsEditor } from './SessionAttachmentsEditor'
import { SessionHomeworkEditor } from './SessionHomeworkEditor'
import { UnitLessonPicker } from './UnitLessonPicker'
import type { SessionAttachment, SessionHomeworkItem } from '../route'

interface SessionItemLike {
    id: string
    durationMinutes: number
    title: string | null
    notes: string | null
    description: string | null
    unitId: number | null
    unitName: string | null
    lessonId: number | null
    lessonName: string | null
    attachments: SessionAttachment[]
    homework: SessionHomeworkItem[]
}

interface SortableSessionRowProps {
    session: SessionItemLike
    idx: number
    isEditing: boolean
    isLast: boolean
    teacherSubjectId: number | null
    onConfirm: () => void
    onRemove: () => void
    onStartEdit: () => void
    onMoveUp: () => void
    onMoveDown: () => void
    onUpdate: (patch: Partial<SessionItemLike>) => void
}

export const SortableSessionRow: React.FC<SortableSessionRowProps> = ({
    session,
    idx,
    isEditing,
    isLast,
    teacherSubjectId,
    onConfirm,
    onRemove,
    onStartEdit,
    onMoveUp,
    onMoveDown,
    onUpdate,
}) => {
    const { t } = useTranslation('teacher')
    // Disable drag while editing — the expanded form is too tall to drag sensibly.
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: session.id,
        disabled: isEditing,
    })

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 30 : undefined,
    }

    if (isEditing) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="p-3 rounded-lg border border-teal-300 dark:border-secondary/60 bg-slate-50 dark:bg-slate-950 space-y-2.5 ring-2 ring-teal-500/10 dark:ring-secondary/20"
            >
                <div className="flex items-center justify-between">
                    <h5 className="text-sm font-bold text-primary dark:text-secondary">
                        {t('courses.new.sections.sessions.sessionLabel', { number: idx + 1 })}
                    </h5>
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={onConfirm}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-primary dark:bg-secondary text-white hover:opacity-85 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 dark:focus-visible:ring-secondary/40"
                        >
                            <Check size={14} /> {t('courses.new.sections.sessions.saveSession')}
                        </button>
                        <button
                            type="button"
                            onClick={onRemove}
                            aria-label={t('courses.new.sections.sessions.deleteSession')}
                            title={t('courses.new.sections.sessions.deleteSession')}
                            className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 p-1.5 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/40"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                            {t('courses.new.sections.sessions.fieldDuration')} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            min={1}
                            value={session.durationMinutes}
                            onChange={(e) => onUpdate({ durationMinutes: Number(e.target.value) })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400">{t('courses.new.sections.sessions.fieldTitle')}</label>
                        <input
                            type="text"
                            maxLength={150}
                            value={session.title ?? ''}
                            onChange={(e) => onUpdate({ title: e.target.value || null })}
                            placeholder={t('courses.new.sections.sessions.fieldTitlePlaceholder')}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-start text-sm"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">{t('courses.new.sections.sessions.fieldDescription')}</label>
                    <textarea
                        rows={2}
                        maxLength={500}
                        value={session.description ?? ''}
                        onChange={(e) => onUpdate({ description: e.target.value || null })}
                        placeholder={t('courses.new.sections.sessions.fieldDescriptionPlaceholder')}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-start resize-none text-sm"
                    />
                </div>

                <UnitLessonPicker
                    teacherSubjectId={teacherSubjectId}
                    unitId={session.unitId}
                    lessonId={session.lessonId}
                    onChange={(patch) => onUpdate(patch)}
                />

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">{t('courses.new.sections.sessions.fieldNotes')}</label>
                    <textarea
                        rows={2}
                        maxLength={500}
                        value={session.notes ?? ''}
                        onChange={(e) => onUpdate({ notes: e.target.value || null })}
                        placeholder={t('courses.new.sections.sessions.fieldNotesPlaceholder')}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-start resize-none text-sm"
                    />
                    <div className="text-end text-[11px] text-slate-500 dark:text-slate-400">{(session.notes ?? '').length} / 500</div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/40 space-y-3">
                    <SessionAttachmentsEditor
                        attachments={session.attachments ?? []}
                        onChange={(next) => onUpdate({ attachments: next })}
                    />
                    <SessionHomeworkEditor
                        homework={session.homework ?? []}
                        onChange={(next) => onUpdate({ homework: next })}
                    />
                </div>
            </div>
        )
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`p-3 rounded-lg border bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 transition-all ${isDragging
                ? 'border-primary dark:border-secondary shadow-lg'
                : 'border-slate-200 dark:border-slate-800'
                }`}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2 min-w-0 flex-1">
                    {/* Drag handle */}
                    <button
                        type="button"
                        {...attributes}
                        {...listeners}
                        aria-label={t('courses.new.sections.sessions.dragHandle')}
                        title={t('courses.new.sections.sessions.dragHandle')}
                        className="touch-none cursor-grab active:cursor-grabbing text-slate-300 dark:text-slate-600 hover:text-primary dark:hover:text-secondary p-1 -ms-1 rounded transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 dark:focus-visible:ring-secondary/40"
                    >
                        <GripVertical size={14} />
                    </button>

                    <div className="w-7 h-7 shrink-0 rounded-lg bg-primary/10 dark:bg-secondary/15 flex items-center justify-center text-primary dark:text-secondary text-xs font-black">
                        {idx + 1}
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                        <h5 className="text-sm font-bold text-slate-800 dark:text-white truncate">
                            {session.title?.trim() || t('courses.new.sections.sessions.sessionLabel', { number: idx + 1 })}
                        </h5>
                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium flex-wrap">
                            <span className="flex items-center gap-1">
                                <Clock size={12} className="text-teal-600" />
                                {t('courses.new.sections.sessions.durationMinutes', { count: session.durationMinutes })}
                            </span>
                            {session.unitName && (
                                <span className="flex items-center gap-1 truncate">
                                    <BookOpen size={12} className="text-primary dark:text-secondary shrink-0" />
                                    <span className="truncate">{session.unitName}</span>
                                </span>
                            )}
                            {(session.attachments?.length ?? 0) > 0 && (
                                <span className="flex items-center gap-1 text-primary dark:text-secondary font-bold">
                                    <Paperclip size={12} />
                                    {session.attachments.length}
                                </span>
                            )}
                            {(session.homework?.length ?? 0) > 0 && (
                                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
                                    <BookOpenCheck size={12} />
                                    {session.homework.length}
                                </span>
                            )}
                            {session.notes?.trim() && (
                                <span className="flex items-center gap-1 truncate">
                                    <StickyNote size={12} className="text-slate-400 shrink-0" />
                                    <span className="truncate">{session.notes}</span>
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    <div className="flex flex-col gap-0.5 me-1">
                        <button
                            type="button"
                            onClick={onMoveUp}
                            disabled={idx === 0}
                            title={t('courses.new.sections.sessions.moveUp')}
                            aria-label={t('courses.new.sections.sessions.moveUp')}
                            className="text-slate-400 hover:text-primary dark:hover:text-secondary hover:bg-slate-100 dark:hover:bg-slate-800 p-1 rounded transition disabled:opacity-25 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 dark:focus-visible:ring-secondary/40"
                        >
                            <ChevronUp size={12} />
                        </button>
                        <button
                            type="button"
                            onClick={onMoveDown}
                            disabled={isLast}
                            title={t('courses.new.sections.sessions.moveDown')}
                            aria-label={t('courses.new.sections.sessions.moveDown')}
                            className="text-slate-400 hover:text-primary dark:hover:text-secondary hover:bg-slate-100 dark:hover:bg-slate-800 p-1 rounded transition disabled:opacity-25 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 dark:focus-visible:ring-secondary/40"
                        >
                            <ChevronDown size={12} />
                        </button>
                    </div>
                    <button
                        type="button"
                        onClick={onStartEdit}
                        aria-label={t('courses.new.sections.sessions.editSession')}
                        title={t('courses.new.sections.sessions.editSession')}
                        className="text-primary dark:text-secondary hover:bg-primary/5 dark:hover:bg-secondary/10 p-1.5 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 dark:focus-visible:ring-secondary/40"
                    >
                        <Pencil size={14} />
                    </button>
                    <button
                        type="button"
                        onClick={onRemove}
                        aria-label={t('courses.new.sections.sessions.deleteSession')}
                        title={t('courses.new.sections.sessions.deleteSession')}
                        className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 p-1.5 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/40"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
        </div>
    )
}

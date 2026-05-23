import React, { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Paperclip,
    Upload,
    FileText,
    Image as ImageIcon,
    Video as VideoIcon,
    Trash2,
} from 'lucide-react'
import type { SessionAttachment } from '../route'

interface SessionAttachmentsEditorProps {
    attachments: SessionAttachment[]
    onChange: (next: SessionAttachment[]) => void
}

const inferType = (name: string): SessionAttachment['fileType'] => {
    const ext = name.split('.').pop()?.toLowerCase() ?? ''
    if (ext === 'pdf') return 'pdf'
    if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) return 'image'
    if (['mp4', 'mov', 'avi', 'webm'].includes(ext)) return 'video'
    if (['doc', 'docx'].includes(ext)) return 'doc'
    return 'other'
}

const ICON: Record<SessionAttachment['fileType'], React.ComponentType<{ size?: number }>> = {
    pdf: FileText,
    image: ImageIcon,
    video: VideoIcon,
    doc: FileText,
    other: FileText,
}

export const SessionAttachmentsEditor: React.FC<SessionAttachmentsEditorProps> = ({
    attachments,
    onChange,
}) => {
    const { t } = useTranslation('teacher')
    const inputRef = useRef<HTMLInputElement>(null)

    const handlePick = (file: File) => {
        const entry: SessionAttachment = {
            id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            fileName: file.name,
            fileType: inferType(file.name),
            sizeBytes: file.size,
        }
        onChange([...attachments, entry])
        if (inputRef.current) inputRef.current.value = ''
    }

    const handleRemove = (id: string) => onChange(attachments.filter((a) => a.id !== id))

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                    <Paperclip size={13} className="text-primary dark:text-secondary" />
                    {t('courses.new.sections.sessions.attachments.title')}
                </div>
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-primary dark:bg-secondary text-white hover:opacity-85 transition inline-flex items-center gap-1"
                >
                    <Upload size={11} />
                    {t('courses.new.sections.sessions.attachments.add')}
                </button>
                <input
                    ref={inputRef}
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.mp4,.mov,.avi,.doc,.docx"
                    className="hidden"
                    onChange={(e) => {
                        const f = e.target.files?.[0]
                        if (f) handlePick(f)
                    }}
                />
            </div>

            {attachments.length === 0 ? (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 italic py-2 px-2.5 rounded-md border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40">
                    {t('courses.new.sections.sessions.attachments.empty')}
                </p>
            ) : (
                <ul className="space-y-1.5">
                    {attachments.map((att) => {
                        const Icon = ICON[att.fileType]
                        return (
                            <li
                                key={att.id}
                                className="flex items-center gap-2.5 p-2 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                            >
                                <div className="w-7 h-7 rounded-md bg-primary/10 dark:bg-secondary/15 text-primary dark:text-secondary flex items-center justify-center shrink-0">
                                    <Icon size={13} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
                                        {att.fileName}
                                    </p>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                        {Math.round(att.sizeBytes / 1024)} KB
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    aria-label={t('courses.new.sections.sessions.attachments.remove')}
                                    onClick={() => handleRemove(att.id)}
                                    className="p-1 rounded-md text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition shrink-0"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </li>
                        )
                    })}
                </ul>
            )}
        </div>
    )
}

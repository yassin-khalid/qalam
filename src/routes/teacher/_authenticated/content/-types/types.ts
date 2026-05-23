// Content Library — teacher-wide hub for reusable files and homework templates.
// Distinct from per-session files (which live on the session).

export type ContentKind = 'file' | 'homework'
export type ContentFileType = 'pdf' | 'image' | 'video' | 'doc' | 'other'

export interface ContentLibraryEntry {
    id: string
    kind: ContentKind
    title: string
    description: string | null
    fileType: ContentFileType | null // null for homework templates
    sizeBytes: number | null
    uploadedAt: string // ISO
    usedInSessionsCount: number
    tags: string[]
}

export type ContentFilter = 'all' | 'file' | 'homework'

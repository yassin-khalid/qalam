import type { ContentFilter, ContentLibraryEntry, ContentFileType } from '../-types/types'

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

const NOW = new Date('2026-05-22T10:00:00Z').getTime()
const at = (offsetHours: number) => new Date(NOW + offsetHours * 3_600_000).toISOString()

let seq = 100
const newId = () => `cl-${++seq}-${Date.now()}`

const ENTRIES: ContentLibraryEntry[] = [
    {
        id: 'cl-1',
        kind: 'file',
        title: 'مصحف_التجويد.pdf',
        description: 'المصحف مع علامات التجويد بالألوان.',
        fileType: 'pdf',
        sizeBytes: 8_400_000,
        uploadedAt: at(-24 * 30),
        usedInSessionsCount: 12,
        tags: ['قرآن', 'تجويد'],
    },
    {
        id: 'cl-2',
        kind: 'file',
        title: 'restaurant_vocab.pdf',
        description: 'Vocabulary list for restaurant conversations.',
        fileType: 'pdf',
        sizeBytes: 145_000,
        uploadedAt: at(-24 * 12),
        usedInSessionsCount: 4,
        tags: ['English', 'Speaking', 'A2'],
    },
    {
        id: 'cl-3',
        kind: 'file',
        title: 'الجبر_تمارين_تطبيقية.pdf',
        description: '30 تمرين متدرج للجبر مع الحلول.',
        fileType: 'pdf',
        sizeBytes: 2_100_000,
        uploadedAt: at(-24 * 60),
        usedInSessionsCount: 18,
        tags: ['رياضيات', 'جبر'],
    },
    {
        id: 'cl-4',
        kind: 'file',
        title: 'البقرة_الربع_1_شرح.mp4',
        description: 'فيديو شرح للربع الأول من سورة البقرة.',
        fileType: 'video',
        sizeBytes: 78_000_000,
        uploadedAt: at(-24 * 7),
        usedInSessionsCount: 2,
        tags: ['قرآن', 'حفظ'],
    },
    {
        id: 'cl-5',
        kind: 'homework',
        title: 'Record a 60-second introduction',
        description: 'Submit a voice note introducing yourself in English. Focus on clear pronunciation.',
        fileType: null,
        sizeBytes: null,
        uploadedAt: at(-24 * 12),
        usedInSessionsCount: 6,
        tags: ['English', 'Speaking'],
    },
    {
        id: 'cl-6',
        kind: 'homework',
        title: 'حل 10 مسائل في معادلات الدرجة الأولى',
        description: 'حل المسائل من 1 إلى 10 في الكتاب وارفع صورة الحل.',
        fileType: null,
        sizeBytes: null,
        uploadedAt: at(-24 * 50),
        usedInSessionsCount: 8,
        tags: ['رياضيات', 'جبر'],
    },
    {
        id: 'cl-7',
        kind: 'file',
        title: 'Tenses_cheatsheet.png',
        description: 'A single-page reference chart for English tenses.',
        fileType: 'image',
        sizeBytes: 220_000,
        uploadedAt: at(-24 * 3),
        usedInSessionsCount: 0,
        tags: ['English', 'Grammar'],
    },
]

const inferType = (name: string): ContentFileType => {
    const ext = name.split('.').pop()?.toLowerCase() ?? ''
    if (ext === 'pdf') return 'pdf'
    if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) return 'image'
    if (['mp4', 'mov', 'avi', 'webm'].includes(ext)) return 'video'
    if (['doc', 'docx'].includes(ext)) return 'doc'
    return 'other'
}

export const contentMockApi = {
    async list(filter: ContentFilter, search: string): Promise<ContentLibraryEntry[]> {
        await sleep(180)
        const q = search.trim().toLowerCase()
        return ENTRIES.filter((e) => {
            if (filter === 'file' && e.kind !== 'file') return false
            if (filter === 'homework' && e.kind !== 'homework') return false
            if (q) {
                const haystack = `${e.title} ${e.description ?? ''} ${e.tags.join(' ')}`.toLowerCase()
                if (!haystack.includes(q)) return false
            }
            return true
        })
            .slice()
            .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
            .map((e) => JSON.parse(JSON.stringify(e)) as ContentLibraryEntry)
    },

    async uploadFile(input: { fileName: string; sizeBytes: number; description: string | null; tags: string[] }): Promise<ContentLibraryEntry> {
        await sleep(420)
        if (!input.fileName.trim()) throw new Error('mockErrors.fileNameRequired')
        const entry: ContentLibraryEntry = {
            id: newId(),
            kind: 'file',
            title: input.fileName,
            description: input.description,
            fileType: inferType(input.fileName),
            sizeBytes: input.sizeBytes,
            uploadedAt: new Date().toISOString(),
            usedInSessionsCount: 0,
            tags: input.tags,
        }
        ENTRIES.unshift(entry)
        return JSON.parse(JSON.stringify(entry))
    },

    async addHomeworkTemplate(input: { title: string; description: string | null; tags: string[] }): Promise<ContentLibraryEntry> {
        await sleep(320)
        if (!input.title.trim()) throw new Error('mockErrors.homeworkTitleRequired')
        const entry: ContentLibraryEntry = {
            id: newId(),
            kind: 'homework',
            title: input.title,
            description: input.description,
            fileType: null,
            sizeBytes: null,
            uploadedAt: new Date().toISOString(),
            usedInSessionsCount: 0,
            tags: input.tags,
        }
        ENTRIES.unshift(entry)
        return JSON.parse(JSON.stringify(entry))
    },

    async delete(id: string): Promise<void> {
        await sleep(160)
        const idx = ENTRIES.findIndex((e) => e.id === id)
        if (idx >= 0) ENTRIES.splice(idx, 1)
    },
}

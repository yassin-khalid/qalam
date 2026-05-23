import { queryOptions } from '@tanstack/react-query'
import { sessionsMockApi } from '../-mocks/mockDb'
import type { AttendanceMark, SessionFile, SessionsListFilter } from '../-types/types'

export const sessionsListQueryOptions = (filter: SessionsListFilter) =>
    queryOptions({
        queryKey: ['sessions', 'list', filter] as const,
        queryFn: () => sessionsMockApi.list(filter),
    })

export const sessionDetailQueryOptions = (sessionId: number) =>
    queryOptions({
        queryKey: ['sessions', 'detail', sessionId] as const,
        queryFn: () => sessionsMockApi.get(sessionId),
    })

export const setAttendance = (
    sessionId: number,
    marks: { studentId: number; attendance: AttendanceMark }[],
) => sessionsMockApi.setAttendance(sessionId, marks)

export const updateSessionNotes = (sessionId: number, notes: string | null) =>
    sessionsMockApi.updateNotes(sessionId, notes)

export const uploadSessionFile = (
    sessionId: number,
    file: { fileName: string; fileType: SessionFile['fileType']; sizeBytes: number },
) => sessionsMockApi.uploadFile(sessionId, file)

export const deleteSessionFile = (sessionId: number, fileId: string) =>
    sessionsMockApi.deleteFile(sessionId, fileId)

export const addSessionHomework = (
    sessionId: number,
    input: { title: string; description: string | null; dueAt: string | null },
) => sessionsMockApi.addHomework(sessionId, input)

export const deleteSessionHomework = (sessionId: number, homeworkId: string) =>
    sessionsMockApi.deleteHomework(sessionId, homeworkId)

export const endSession = (sessionId: number) => sessionsMockApi.endSession(sessionId)

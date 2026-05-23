import { queryOptions } from '@tanstack/react-query'
import { contentMockApi } from '../-mocks/mockDb'
import type { ContentFilter } from '../-types/types'

export const contentListQueryOptions = (filter: ContentFilter, search: string) =>
    queryOptions({
        queryKey: ['content-library', filter, search] as const,
        queryFn: () => contentMockApi.list(filter, search),
    })

export const uploadContentFile = (input: { fileName: string; sizeBytes: number; description: string | null; tags: string[] }) =>
    contentMockApi.uploadFile(input)

export const addHomeworkTemplate = (input: { title: string; description: string | null; tags: string[] }) =>
    contentMockApi.addHomeworkTemplate(input)

export const deleteContentEntry = (id: string) => contentMockApi.delete(id)

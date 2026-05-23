import { queryOptions } from '@tanstack/react-query'
import { courseDetailExtrasMockApi } from '../-mocks/mockDb'

export const activeEnrollmentsQueryOptions = (courseId: number) =>
    queryOptions({
        queryKey: ['course', courseId, 'active-enrollments'] as const,
        queryFn: () => courseDetailExtrasMockApi.listActiveEnrollments(courseId),
    })

export const enrollmentSessionsQueryOptions = (enrollmentId: number, enabled = true) =>
    queryOptions({
        queryKey: ['enrollment', enrollmentId, 'sessions'] as const,
        queryFn: () => courseDetailExtrasMockApi.listEnrollmentSessions(enrollmentId),
        enabled,
    })

export const courseContentLibraryQueryOptions = (courseId: number) =>
    queryOptions({
        queryKey: ['course', courseId, 'content-library'] as const,
        queryFn: () => courseDetailExtrasMockApi.listContentLibrary(courseId),
    })

export const courseAnalyticsQueryOptions = (courseId: number) =>
    queryOptions({
        queryKey: ['course', courseId, 'analytics'] as const,
        queryFn: () => courseDetailExtrasMockApi.getAnalytics(courseId),
    })

import { queryOptions } from '@tanstack/react-query'

export type RequestStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled'
export type GroupMemberType = 'Own' | 'Invited'
export type GroupMemberConfirmationStatus = 'Pending' | 'Confirmed' | 'Rejected'

export interface EnrollmentRequestListItem {
    id: number
    courseId: number
    courseTitle: string | null
    teachingModeId: number
    teachingModeNameEn: string | null
    status: RequestStatus
    createdAt: string
    notes: string | null
}

export interface EnrollmentRequestGroupMember {
    studentId: number
    studentName: string | null
    memberType: GroupMemberType
    confirmationStatus: GroupMemberConfirmationStatus
    confirmedAt: string | null
    confirmedByUserId?: number | null
}

export interface EnrollmentRequestProposedSession {
    sessionNumber: number
    durationMinutes: number
    title: string | null
    notes: string | null
}

export interface EnrollmentRequestDetail {
    id: number
    courseId: number
    courseTitle: string | null
    requestedByUserName: string | null
    status: RequestStatus
    createdAt: string
    totalMinutes: number
    estimatedTotalPrice: number
    teachingModeNameEn: string | null
    sessionTypeNameEn: string | null
    notes: string | null
    rejectionReason: string | null
    selectedAvailabilityIds: number[] | null
    groupMembers: EnrollmentRequestGroupMember[] | null
    proposedSessions: EnrollmentRequestProposedSession[] | null
}

interface ApiEnvelope<T> {
    statusCode: string | number
    succeeded: boolean
    message: string
    data: T
    errors: unknown
    meta: unknown
}

interface PaginatedResult<T> {
    items: T[] | null
    totalCount: number
    pageNumber: number
    pageSize: number
    totalPages: number
    hasPreviousPage: boolean
    hasNextPage: boolean
}

const buildHeaders = (token: string): HeadersInit => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json',
    'Accept-Language': 'ar-EG',
})

const parseError = async (response: Response): Promise<string> => {
    try {
        const err = await response.json() as { message?: string }
        return err.message ?? 'حدث خطأ غير متوقع'
    } catch {
        return 'حدث خطأ غير متوقع'
    }
}

interface ListParams {
    courseId: number
    status?: RequestStatus
    pageNumber?: number
    pageSize?: number
}

export const enrollmentRequestsListQueryOptions = (
    token: string,
    params: ListParams,
) => {
    const { courseId, status = 'Pending', pageNumber = 1, pageSize = 20 } = params
    return queryOptions({
        queryKey: ['enrollment-requests', 'list', courseId, status, pageNumber, pageSize],
        queryFn: async () => {
            const url = new URL(`${import.meta.env.VITE_API_URL}/Api/V1/Teacher/EnrollmentRequests`)
            url.searchParams.set('CourseId', String(courseId))
            url.searchParams.set('Status', status)
            url.searchParams.set('PageNumber', String(pageNumber))
            url.searchParams.set('PageSize', String(pageSize))

            const response = await fetch(url.toString(), {
                method: 'GET',
                headers: buildHeaders(token),
            })
            if (!response.ok) throw new Error(await parseError(response))

            const json = await response.json() as ApiEnvelope<PaginatedResult<EnrollmentRequestListItem>>
            return json.data
        },
    })
}

export const enrollmentRequestDetailQueryOptions = (
    token: string,
    id: number,
    enabled: boolean = true,
) => queryOptions({
    queryKey: ['enrollment-requests', 'detail', id],
    enabled,
    queryFn: async () => {
        const response = await fetch(
            `${import.meta.env.VITE_API_URL}/Api/V1/Teacher/EnrollmentRequests/${id}`,
            { method: 'GET', headers: buildHeaders(token) },
        )
        if (!response.ok) throw new Error(await parseError(response))
        const json = await response.json() as ApiEnvelope<EnrollmentRequestDetail>
        return json.data
    },
})

export const approveEnrollmentRequest = async (token: string, id: number) => {
    const response = await fetch(
        `${import.meta.env.VITE_API_URL}/Api/V1/Teacher/EnrollmentRequests/${id}/Approve`,
        { method: 'POST', headers: buildHeaders(token) },
    )
    if (!response.ok) throw new Error(await parseError(response))
    return await response.json() as ApiEnvelope<unknown>
}

export const rejectEnrollmentRequest = async (
    token: string,
    id: number,
    rejectionReason?: string,
) => {
    const response = await fetch(
        `${import.meta.env.VITE_API_URL}/Api/V1/Teacher/EnrollmentRequests/${id}/Reject`,
        {
            method: 'POST',
            headers: buildHeaders(token),
            body: JSON.stringify({ rejectionReason: rejectionReason ?? null }),
        },
    )
    if (!response.ok) throw new Error(await parseError(response))
    return await response.json() as ApiEnvelope<unknown>
}

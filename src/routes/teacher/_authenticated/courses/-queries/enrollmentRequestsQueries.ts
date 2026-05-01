import { queryOptions } from '@tanstack/react-query'

export const RequestStatus = {
    Pending: 1,
    Approved: 2,
    Rejected: 3,
    Cancelled: 4,
} as const
export type RequestStatus = typeof RequestStatus[keyof typeof RequestStatus]

export const GroupMemberType = {
    Own: 1,
    Invited: 2,
} as const
export type GroupMemberType = typeof GroupMemberType[keyof typeof GroupMemberType]

export const GroupMemberConfirmationStatus = {
    Pending: 1,
    Confirmed: 2,
    Rejected: 3,
} as const
export type GroupMemberConfirmationStatus =
    typeof GroupMemberConfirmationStatus[keyof typeof GroupMemberConfirmationStatus]

export interface EnrollmentRequestListItem {
    id: number
    courseId: number
    courseTitle: string | null
    requestedByUserName: string | null
    status: RequestStatus
    createdAt: string
    totalMinutes: number
    estimatedTotalPrice: number
    groupMemberCount: number
    teachingModeNameEn: string | null
    sessionTypeNameEn: string | null
}

export interface EnrollmentRequestGroupMember {
    studentId: number
    studentName: string | null
    memberType: GroupMemberType
    confirmationStatus: GroupMemberConfirmationStatus
    confirmedAt: string | null
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

interface PaginationMeta {
    totalCount: number
    pageNumber: number
    pageSize: number
    totalPages: number
    hasPreviousPage: boolean
    hasNextPage: boolean
}

interface ApiEnvelope<T, M = unknown> {
    statusCode: string | number
    succeeded: boolean
    message: string
    data: T
    errors: unknown
    meta: M
}

export interface PaginatedListResponse<T> extends PaginationMeta {
    items: T[]
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
    const { courseId, status, pageNumber = 1, pageSize = 20 } = params
    return queryOptions({
        queryKey: ['enrollment-requests', 'list', courseId, status ?? 'all', pageNumber, pageSize],
        queryFn: async (): Promise<PaginatedListResponse<EnrollmentRequestListItem>> => {
            const url = new URL(`${import.meta.env.VITE_API_URL}/Api/V1/Teacher/EnrollmentRequests`)
            url.searchParams.set('CourseId', String(courseId))
            if (status !== undefined) url.searchParams.set('Status', String(status))
            url.searchParams.set('PageNumber', String(pageNumber))
            url.searchParams.set('PageSize', String(pageSize))

            const response = await fetch(url.toString(), {
                method: 'GET',
                headers: buildHeaders(token),
            })
            if (!response.ok) throw new Error(await parseError(response))

            const json = await response.json() as ApiEnvelope<EnrollmentRequestListItem[] | null, PaginationMeta | null>
            return {
                items: json.data ?? [],
                totalCount: json.meta?.totalCount ?? 0,
                pageNumber: json.meta?.pageNumber ?? pageNumber,
                pageSize: json.meta?.pageSize ?? pageSize,
                totalPages: json.meta?.totalPages ?? 0,
                hasPreviousPage: json.meta?.hasPreviousPage ?? false,
                hasNextPage: json.meta?.hasNextPage ?? false,
            }
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
    return await response.json() as ApiEnvelope<string>
}

export const rejectEnrollmentRequest = async (
    token: string,
    id: number,
    rejectionReason?: string,
) => {
    const body = rejectionReason ? { rejectionReason } : {}
    const response = await fetch(
        `${import.meta.env.VITE_API_URL}/Api/V1/Teacher/EnrollmentRequests/${id}/Reject`,
        {
            method: 'POST',
            headers: buildHeaders(token),
            body: JSON.stringify(body),
        },
    )
    if (!response.ok) throw new Error(await parseError(response))
    return await response.json() as ApiEnvelope<string>
}

export const RequestStatusLabel: Record<RequestStatus, string> = {
    [RequestStatus.Pending]: 'قيد المراجعة',
    [RequestStatus.Approved]: 'مقبول',
    [RequestStatus.Rejected]: 'مرفوض',
    [RequestStatus.Cancelled]: 'ملغى',
}

export const RequestStatusStyles: Record<RequestStatus, string> = {
    [RequestStatus.Pending]: 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50',
    [RequestStatus.Approved]: 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50',
    [RequestStatus.Rejected]: 'bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/50',
    [RequestStatus.Cancelled]: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
}

export const GroupMemberConfirmationLabel: Record<GroupMemberConfirmationStatus, string> = {
    [GroupMemberConfirmationStatus.Pending]: 'في انتظار الرد',
    [GroupMemberConfirmationStatus.Confirmed]: 'وافق',
    [GroupMemberConfirmationStatus.Rejected]: 'رفض',
}

export const GroupMemberConfirmationStyles: Record<GroupMemberConfirmationStatus, string> = {
    [GroupMemberConfirmationStatus.Pending]: 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400',
    [GroupMemberConfirmationStatus.Confirmed]: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400',
    [GroupMemberConfirmationStatus.Rejected]: 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400',
}

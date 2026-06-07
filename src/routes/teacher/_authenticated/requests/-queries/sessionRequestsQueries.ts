import { queryOptions } from '@tanstack/react-query'
import { mockApi } from '../-mocks/mockDb'
import type { InboxFilters, RequestInboxTab } from '../-types/types'

// =============================================================================
// Aligned with backend v1 (TEACHER-ROLE-Scenario2.md). When the backend lands,
// replace each queryFn / mutation body with a real fetch() against the endpoint
// noted above it. Component code does not need to change.
//
// v1 transport is POLLING — the conversation/message queries are meant to be
// used with react-query `refetchInterval`. SignalR is v1.5; when it arrives,
// only the message query needs a live-update source (same return shape).
// =============================================================================

export const inboxQueryKey = (tab: RequestInboxTab, filters: InboxFilters) =>
    ['session-requests', 'inbox', tab, filters] as const

// GET /Api/V1/Teacher/AvailableRequests?status={tab}&...
export const inboxQueryOptions = (tab: RequestInboxTab, filters: InboxFilters) =>
    queryOptions({
        queryKey: inboxQueryKey(tab, filters),
        queryFn: () =>
            mockApi.listInbox(tab, {
                search: filters.search,
                teachingMode: filters.teachingMode,
                sessionType: filters.sessionType,
                subject: filters.subject,
                requestKind: filters.requestKind,
                dateWindow: filters.dateWindow,
                sort: filters.sort,
            }),
    })

// GET /Api/V1/Teacher/AvailableRequests/{id} (marks Notified -> Viewed)
export const requestDetailQueryOptions = (requestId: number) =>
    queryOptions({
        queryKey: ['session-requests', 'detail', requestId] as const,
        queryFn: () => mockApi.getRequest(requestId),
    })

// GET /Api/V1/Teacher/Offers/my (filtered to this request)
export const myOfferForRequestQueryOptions = (requestId: number) =>
    queryOptions({
        queryKey: ['session-offers', 'mine', requestId] as const,
        queryFn: () => mockApi.getMyOfferForRequest(requestId),
    })

// GET /Api/V1/Teacher/AvailableRequests/{id}/availability-match
export const availabilityMatchQueryOptions = (requestId: number) =>
    queryOptions({
        queryKey: ['session-requests', 'availability-match', requestId] as const,
        queryFn: () => mockApi.getAvailabilityMatch(requestId),
    })

// ----- mutations -------------------------------------------------------------

export interface SubmitOfferInput {
    sessionRequestId: number
    price: number
    teacherNotes: string | null
    validityHours: number
    commitmentConfirmed: boolean
}

export interface UpdateOfferInput {
    id: number
    price?: number
    teacherNotes?: string | null
    validityHours?: number
}

// POST /Api/V1/Teacher/Offers
export const submitOffer = (input: SubmitOfferInput) => mockApi.submitOffer(input)
// PUT /Api/V1/Teacher/Offers/{id}
export const updateOffer = (input: UpdateOfferInput) => mockApi.updateOffer(input)
// POST /Api/V1/Teacher/Offers/{id}/withdraw — optional reason shown to student.
export const withdrawOffer = (offerId: number, reason?: string | null) =>
    mockApi.withdrawOffer(offerId, reason)
// PUT /Api/V1/Teacher/AvailableRequests/{id}/mark-viewed
export const markViewed = (requestId: number) => mockApi.markViewed(requestId)
// POST /Api/V1/Teacher/AvailableRequests/{id}/dismiss
export const dismissRequest = (requestId: number) => mockApi.dismissRequest(requestId)

// ----- conversations / chat (polling) ---------------------------------------

// GET /Api/V1/Conversations/by-request/{requestId}/teacher/{teacherId}
export const conversationQueryOptions = (requestId: number) =>
    queryOptions({
        queryKey: ['conversation', requestId] as const,
        queryFn: () => mockApi.getConversation(requestId),
    })

// GET /Api/V1/Conversations/{conversationId}/messages
// Polled with `direction: 'newer'` to pick up new messages; pass a cursor to
// page older history. Returns the full page each call in the mock.
export const messagesQueryOptions = (
    conversationId: number,
    opts?: { cursor?: string | null; take?: number; direction?: 'older' | 'newer' },
) =>
    queryOptions({
        queryKey: ['conversation', conversationId, 'messages', opts ?? {}] as const,
        queryFn: () => mockApi.getMessages(conversationId, opts),
    })

// POST /Api/V1/Conversations/{conversationId}/messages
export const sendChatMessage = (conversationId: number, content: string) =>
    mockApi.postMessage(conversationId, content)

// POST /Api/V1/Conversations/{conversationId}/read
export const markConversationRead = (conversationId: number) =>
    mockApi.markConversationRead(conversationId)

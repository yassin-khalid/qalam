import { queryOptions } from '@tanstack/react-query'
import { mockApi } from '../-mocks/mockDb'
import type {
    ChatMessage,
    ChatThreadMeta,
    InboxFilters,
    PerSessionOfferResponse,
    RequestInboxTab,
} from '../-types/types'

// =============================================================================
// When the backend lands, replace each queryFn / mutation body with a real
// fetch() call (see COURSE_ENROLLMENT_TEACHER_PLAN.md §6 for the proposed
// endpoint shapes). Component code does not need to change.
// =============================================================================

export const inboxQueryKey = (tab: RequestInboxTab, filters: InboxFilters) =>
    ['session-requests', 'inbox', tab, filters] as const

export const inboxQueryOptions = (tab: RequestInboxTab, filters: InboxFilters) =>
    queryOptions({
        queryKey: inboxQueryKey(tab, filters),
        queryFn: () =>
            mockApi.listInbox(tab, {
                search: filters.search,
                teachingMode: filters.teachingMode,
                sessionType: filters.sessionType,
                sort: filters.sort,
            }),
    })

export const requestDetailQueryOptions = (requestId: number) =>
    queryOptions({
        queryKey: ['session-requests', 'detail', requestId] as const,
        queryFn: () => mockApi.getRequest(requestId),
    })

export const myOfferForRequestQueryOptions = (requestId: number) =>
    queryOptions({
        queryKey: ['session-offers', 'mine', requestId] as const,
        queryFn: () => mockApi.getMyOfferForRequest(requestId),
    })

export interface SubmitOfferInput {
    requestId: number
    totalPrice: number
    pricePerSession: number | null
    generalNotes: string | null
    perSessionResponses: PerSessionOfferResponse[]
    validityHours: number
}

export const submitOffer = (input: SubmitOfferInput) => mockApi.submitOffer(input)
export const withdrawOffer = (offerId: number) => mockApi.withdrawOffer(offerId)

// ----- chat ------------------------------------------------------------------
// When the real backend lands, replace the queryFn with a fetch() and replace
// `subscribeToThread` with a SignalR / WebSocket connection (same signature).

export const chatThreadQueryOptions = (requestId: number) =>
    queryOptions({
        queryKey: ['chat-thread', requestId] as const,
        queryFn: () => mockApi.getThread(requestId),
    })

export const sendChatMessage = (requestId: number, body: string) =>
    mockApi.sendMessage(requestId, body)

export const subscribeToThread = (
    requestId: number,
    onMessage: (m: ChatMessage, meta: ChatThreadMeta) => void,
    onTyping?: (meta: ChatThreadMeta) => void,
): (() => void) => mockApi.subscribeToThread(requestId, onMessage, onTyping)

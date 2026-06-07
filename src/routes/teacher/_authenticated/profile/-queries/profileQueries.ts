import { queryOptions } from '@tanstack/react-query'
import { mockApi, type CurrentTeacherOverlay } from '../-mocks/mockDb'

// =============================================================================
// When the backend lands, replace the queryFn body with a real fetch() against
// the endpoint noted above it. Component code does not need to change.
// =============================================================================

// GET /Api/V1/Teacher/Profile/me
export const myProfileQueryOptions = (overlay?: CurrentTeacherOverlay) =>
    queryOptions({
        // Keyed by the teacher id so switching accounts refetches.
        queryKey: ['teacher-profile', 'me', overlay?.id ?? null] as const,
        queryFn: () => mockApi.getMyProfile(overlay),
    })

import { queryOptions } from '@tanstack/react-query'
import { notificationsMockApi } from '../-mocks/mockDb'
import type { NotificationFilter } from '../-types/types'

export const notificationsListQueryOptions = (filter: NotificationFilter) =>
    queryOptions({
        queryKey: ['notifications', filter] as const,
        queryFn: () => notificationsMockApi.list(filter),
    })

export const markNotificationAsRead = (id: number) => notificationsMockApi.markAsRead(id)
export const markAllNotificationsAsRead = () => notificationsMockApi.markAllAsRead()

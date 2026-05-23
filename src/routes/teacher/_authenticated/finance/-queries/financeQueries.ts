import { queryOptions } from '@tanstack/react-query'
import { financeMockApi } from '../-mocks/mockDb'
import type { FinanceTransactionFilter } from '../-types/types'

export const financeSummaryQueryOptions = () =>
    queryOptions({
        queryKey: ['finance', 'summary'] as const,
        queryFn: () => financeMockApi.getSummary(),
    })

export const financeTransactionsQueryOptions = (filter: FinanceTransactionFilter) =>
    queryOptions({
        queryKey: ['finance', 'transactions', filter] as const,
        queryFn: () => financeMockApi.listTransactions(filter),
    })

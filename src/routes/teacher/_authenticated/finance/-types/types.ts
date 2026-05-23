// Finance domain — earnings, payouts, transaction history.

export const TransactionType = {
    Payment: 'Payment',
    Refund: 'Refund',
    Payout: 'Payout',
    PlatformFee: 'PlatformFee',
} as const
export type TransactionType = typeof TransactionType[keyof typeof TransactionType]

export const TransactionStatus = {
    Completed: 'Completed',
    Pending: 'Pending',
    Failed: 'Failed',
} as const
export type TransactionStatus = typeof TransactionStatus[keyof typeof TransactionStatus]

export interface FinanceTransaction {
    id: string
    type: TransactionType
    status: TransactionStatus
    amount: number // in SAR — positive means credit, negative means debit
    currency: 'SAR'
    createdAt: string // ISO
    description: string
    relatedStudentName: string | null
    relatedCourseTitle: string | null
    invoiceNumber: string | null
}

export interface FinanceSummary {
    totalEarningsAllTime: number
    earningsThisMonth: number
    earningsLastMonth: number
    pendingPayout: number
    nextPayoutDate: string // ISO
    platformFeesThisMonth: number
    refundsThisMonth: number
    transactionsCount: number
}

export type FinanceTransactionFilter = 'all' | TransactionType

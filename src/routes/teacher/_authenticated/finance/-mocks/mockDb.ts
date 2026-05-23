import type {
    FinanceSummary,
    FinanceTransaction,
    FinanceTransactionFilter,
} from '../-types/types'

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

const NOW = new Date('2026-05-22T10:00:00Z').getTime()
const at = (offsetHours: number) => new Date(NOW + offsetHours * 3_600_000).toISOString()

const TRANSACTIONS: FinanceTransaction[] = [
    {
        id: 'tx-2001',
        type: 'Payment',
        status: 'Completed',
        amount: 600,
        currency: 'SAR',
        createdAt: at(-2),
        description: 'دفع اشتراك — دورة الفيزياء',
        relatedStudentName: 'طالبة #1002',
        relatedCourseTitle: 'الفيزياء — تأسيس ثانوي',
        invoiceNumber: 'INV-2026-0421',
    },
    {
        id: 'tx-2002',
        type: 'PlatformFee',
        status: 'Completed',
        amount: -60,
        currency: 'SAR',
        createdAt: at(-2),
        description: 'رسوم المنصة 10%',
        relatedStudentName: 'طالبة #1002',
        relatedCourseTitle: 'الفيزياء — تأسيس ثانوي',
        invoiceNumber: 'INV-2026-0421',
    },
    {
        id: 'tx-2003',
        type: 'Payment',
        status: 'Completed',
        amount: 2400,
        currency: 'SAR',
        createdAt: at(-24),
        description: 'دفع اشتراك جماعي — دورة الإنجليزية',
        relatedStudentName: 'مجموعة 3 طلاب',
        relatedCourseTitle: 'اللغة الإنجليزية — التحدث',
        invoiceNumber: 'INV-2026-0420',
    },
    {
        id: 'tx-2004',
        type: 'PlatformFee',
        status: 'Completed',
        amount: -240,
        currency: 'SAR',
        createdAt: at(-24),
        description: 'رسوم المنصة 10%',
        relatedStudentName: 'مجموعة 3 طلاب',
        relatedCourseTitle: 'اللغة الإنجليزية — التحدث',
        invoiceNumber: 'INV-2026-0420',
    },
    {
        id: 'tx-2005',
        type: 'Payment',
        status: 'Completed',
        amount: 900,
        currency: 'SAR',
        createdAt: at(-72),
        description: 'دفع اشتراك — دورة القرآن',
        relatedStudentName: 'طالب #1004',
        relatedCourseTitle: 'القرآن الكريم — حفظ',
        invoiceNumber: 'INV-2026-0418',
    },
    {
        id: 'tx-2006',
        type: 'PlatformFee',
        status: 'Completed',
        amount: -90,
        currency: 'SAR',
        createdAt: at(-72),
        description: 'رسوم المنصة 10%',
        relatedStudentName: 'طالب #1004',
        relatedCourseTitle: 'القرآن الكريم — حفظ',
        invoiceNumber: 'INV-2026-0418',
    },
    {
        id: 'tx-2007',
        type: 'Payout',
        status: 'Completed',
        amount: -2700,
        currency: 'SAR',
        createdAt: at(-24 * 14),
        description: 'تحويل دوري إلى الحساب البنكي',
        relatedStudentName: null,
        relatedCourseTitle: null,
        invoiceNumber: 'PAY-2026-04',
    },
    {
        id: 'tx-2008',
        type: 'Refund',
        status: 'Completed',
        amount: -300,
        currency: 'SAR',
        createdAt: at(-24 * 8),
        description: 'استرداد جزئي — جلستان لم تُنفذ',
        relatedStudentName: 'طالبة #1005',
        relatedCourseTitle: 'الرياضيات — الكسور',
        invoiceNumber: 'REF-2026-0011',
    },
    {
        id: 'tx-2009',
        type: 'Payment',
        status: 'Pending',
        amount: 1200,
        currency: 'SAR',
        createdAt: at(-3),
        description: 'دفع قيد المعالجة',
        relatedStudentName: 'طالب #2001',
        relatedCourseTitle: 'الرياضيات — تأسيس ثانوي',
        invoiceNumber: 'INV-2026-0422',
    },
]

const SUMMARY: FinanceSummary = {
    totalEarningsAllTime: 18_640,
    earningsThisMonth: 3_900,
    earningsLastMonth: 4_120,
    pendingPayout: 3_510,
    nextPayoutDate: at(24 * 6),
    platformFeesThisMonth: 390,
    refundsThisMonth: 300,
    transactionsCount: TRANSACTIONS.length,
}

export const financeMockApi = {
    async getSummary(): Promise<FinanceSummary> {
        await sleep(160)
        return JSON.parse(JSON.stringify(SUMMARY))
    },

    async listTransactions(filter: FinanceTransactionFilter): Promise<FinanceTransaction[]> {
        await sleep(180)
        const items = TRANSACTIONS.filter((tx) => (filter === 'all' ? true : tx.type === filter))
            .slice()
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        return items.map((tx) => JSON.parse(JSON.stringify(tx)) as FinanceTransaction)
    },
}

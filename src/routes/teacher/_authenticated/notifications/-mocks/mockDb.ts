// Mock notification feed. Replace with /Api/V1/Teacher/Notifications when the
// backend ships, plus a SignalR push for newly arriving notifications.

import type { AppNotification, NotificationFilter, NotificationCounts } from '../-types/types'

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

const NOW = new Date('2026-05-22T10:00:00Z').getTime()
const at = (offsetMinutes: number) => new Date(NOW + offsetMinutes * 60_000).toISOString()

let seq = 9000
const newId = () => ++seq

const NOTIFICATIONS: AppNotification[] = [
    {
        id: newId(),
        type: 'NewQualifiedRequest',
        titleAr: 'طلب جلسات جديد مؤهَّل لك',
        titleEn: 'New qualified request for you',
        bodyAr: 'طالب جديد ينتظر عرضك في مادة الرياضيات — تأسيس ثانوي.',
        bodyEn: 'A student is waiting for your offer in Mathematics — high school foundations.',
        createdAt: at(-12),
        readAt: null,
        link: { to: '/teacher/requests/$requestId', params: { requestId: 1002 } },
    },
    {
        id: newId(),
        type: 'NewMessage',
        titleAr: 'رسالة جديدة من الطالب',
        titleEn: 'New message from student',
        bodyAr: 'هل يمكن خفض السعر قليلاً؟ ميزانيتي محدودة.',
        bodyEn: 'Can we lower the price a bit? My budget is tight.',
        createdAt: at(-65),
        readAt: null,
        link: { to: '/teacher/requests/$requestId', params: { requestId: 1001 } },
    },
    {
        id: newId(),
        type: 'OfferViewed',
        titleAr: 'الطالب اطلع على عرضك',
        titleEn: 'Student viewed your offer',
        bodyAr: 'فُتح عرضك على طلب اللغة الإنجليزية للمجموعة.',
        bodyEn: 'Your offer on the English group request was opened.',
        createdAt: at(-120),
        readAt: at(-100),
        link: { to: '/teacher/requests/$requestId', params: { requestId: 1003 } },
    },
    {
        id: newId(),
        type: 'OfferAccepted',
        titleAr: 'تم قبول عرضك! 🎉',
        titleEn: 'Your offer was accepted! 🎉',
        bodyAr: 'الطالب قبل عرضك على جلسات الفيزياء. الجلسات ستظهر في تقويمك بعد الدفع.',
        bodyEn: 'The student accepted your offer for Physics sessions. They will appear in your calendar after payment.',
        createdAt: at(-180),
        readAt: null,
        link: { to: '/teacher/requests/$requestId', params: { requestId: 1002 } },
    },
    {
        id: newId(),
        type: 'PaymentSucceeded',
        titleAr: 'تم استلام دفعة جديدة',
        titleEn: 'New payment received',
        bodyAr: 'تم استلام 600 ر.س مقابل اشتراك طالبة #1002.',
        bodyEn: 'You received 600 SAR for student #1002\'s enrollment.',
        createdAt: at(-200),
        readAt: at(-195),
        link: { to: '/teacher/courses' },
    },
    {
        id: newId(),
        type: 'SessionStartingSoon',
        titleAr: 'جلسة تبدأ خلال 30 دقيقة',
        titleEn: 'A session starts in 30 minutes',
        bodyAr: 'Conversation practice — restaurants. اضغط للانتقال للجلسة.',
        bodyEn: 'Conversation practice — restaurants. Tap to open the session.',
        createdAt: at(-25),
        readAt: null,
        link: { to: '/teacher/sessions/$sessionId', params: { sessionId: 5002 } },
    },
    {
        id: newId(),
        type: 'FeedbackReceived',
        titleAr: 'تقييم جديد على إحدى جلساتك',
        titleEn: 'New feedback on one of your sessions',
        bodyAr: 'حصلت على 5 نجوم في جلسة "البقرة - الربع الأول".',
        bodyEn: 'You received a 5-star rating on "Al-Baqarah - first quarter".',
        createdAt: at(-360),
        readAt: at(-300),
        link: { to: '/teacher/sessions/$sessionId', params: { sessionId: 5004 } },
    },
    {
        id: newId(),
        type: 'OfferAutoRejected',
        titleAr: 'تم رفض عرضك تلقائياً',
        titleEn: 'Your offer was auto-rejected',
        bodyAr: 'الطالب قبل عرض معلم آخر على طلب الكسور.',
        bodyEn: 'The student accepted another teacher\'s offer on the Fractions request.',
        createdAt: at(-1440),
        readAt: at(-1400),
        link: { to: '/teacher/requests/$requestId', params: { requestId: 1005 } },
    },
    {
        id: newId(),
        type: 'NewEnrollmentRequest',
        titleAr: 'طلب انضمام جديد لدورتك',
        titleEn: 'New enrollment request on your course',
        bodyAr: 'طالب يطلب الانضمام لدورة "الرياضيات — تأسيس متوسط".',
        bodyEn: 'A student is requesting to enroll in "Mathematics — middle school foundations".',
        createdAt: at(-720),
        readAt: at(-700),
        link: { to: '/teacher/courses' },
    },
]

const computeCounts = (): NotificationCounts => ({
    all: NOTIFICATIONS.length,
    unread: NOTIFICATIONS.filter((n) => n.readAt === null).length,
})

export const notificationsMockApi = {
    async list(filter: NotificationFilter): Promise<{ items: AppNotification[]; counts: NotificationCounts }> {
        await sleep(180)
        const items = NOTIFICATIONS.filter((n) => (filter === 'unread' ? n.readAt === null : true))
            .slice()
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        return {
            items: JSON.parse(JSON.stringify(items)),
            counts: computeCounts(),
        }
    },

    async markAsRead(id: number): Promise<NotificationCounts> {
        await sleep(120)
        const n = NOTIFICATIONS.find((x) => x.id === id)
        if (n && n.readAt === null) n.readAt = new Date().toISOString()
        return computeCounts()
    },

    async markAllAsRead(): Promise<NotificationCounts> {
        await sleep(200)
        const now = new Date().toISOString()
        for (const n of NOTIFICATIONS) if (n.readAt === null) n.readAt = now
        return computeCounts()
    },
}

import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { ChevronLeft, Loader2 } from 'lucide-react'
import { createStandardSchemaV1, parseAsStringLiteral, useQueryStates } from 'nuqs'

import { LOCALE_DIRECTION } from '@/lib/i18n'
import { useLocale } from '@/lib/hooks/useLocale'

import { TabsBar } from './-components/TabsBar'
import { OverviewTab } from './-components/OverviewTab'
import { EnrollmentRequestsTab } from './-components/EnrollmentRequestsTab'
import { ActiveEnrollmentsTab } from './-components/ActiveEnrollmentsTab'
import { SessionsByEnrollmentTab } from './-components/SessionsByEnrollmentTab'
import { ContentLibraryTab } from './-components/ContentLibraryTab'
import { AnalyticsTab } from './-components/AnalyticsTab'

import { courseDetailQueryOptions } from '../-queries/courseDetailQueryOptions'
import type { CourseDetailTab } from './-types/types'

const searchParams = {
    tab: parseAsStringLiteral([
        'overview',
        'requests',
        'active',
        'sessions',
        'content',
        'analytics',
    ] as const).withDefault('overview'),
}

export const Route = createFileRoute('/teacher/_authenticated/courses/$courseId')({
    component: RouteComponent,
    parseParams: ({ courseId }) => ({ courseId: Number(courseId) }),
    stringifyParams: ({ courseId }) => ({ courseId: String(courseId) }),
    validateSearch: createStandardSchemaV1(searchParams, { partialOutput: true }),
})

function RouteComponent() {
    const { courseId } = Route.useParams()
    const { t } = useTranslation('teacher')
    const locale = useLocale()
    const isAr = locale === 'ar'
    const [params, setParams] = useQueryStates(searchParams)
    const tab = (params.tab ?? 'overview') as CourseDetailTab
    const [selectedEnrollment, setSelectedEnrollment] = useState<number | null>(null)

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') ?? '' : ''
    const detailQuery = useQuery({
        ...courseDetailQueryOptions(courseId, token),
        enabled: !!token,
    })

    if (detailQuery.isLoading) {
        return (
            <div dir={LOCALE_DIRECTION[locale]} className="min-h-[60vh] flex items-center justify-center text-slate-400">
                <Loader2 size={32} className="animate-spin" />
            </div>
        )
    }
    if (detailQuery.isError || !detailQuery.data) {
        return (
            <div dir={LOCALE_DIRECTION[locale]} className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 rounded-2xl p-6 text-center text-sm font-bold">
                {t('courses.card.toasts.loadFailed')}
            </div>
        )
    }
    const course = detailQuery.data

    const goToSessionsForEnrollment = (id: number) => {
        setSelectedEnrollment(id)
        setParams({ tab: 'sessions' })
    }

    return (
        <div dir={LOCALE_DIRECTION[locale]} className="min-h-screen">
            <div className="mb-5">
                <Link
                    to="/teacher/courses"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-secondary transition mb-3"
                >
                    {isAr ? <ChevronLeft size={14} /> : <ChevronLeft size={14} className="rotate-180" />}
                    {t('courseDetail.back')}
                </Link>

                <h1 className="text-2xl md:text-3xl font-black text-primary dark:text-secondary">
                    {course.title}
                </h1>
                {course.teacherDisplayName && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {course.teacherDisplayName}
                    </p>
                )}
            </div>

            <div className="mb-5">
                <TabsBar value={tab} onChange={(next) => setParams({ tab: next })} />
            </div>

            <div>
                {tab === 'overview' && <OverviewTab detail={course} />}
                {tab === 'requests' && <EnrollmentRequestsTab courseId={courseId} />}
                {tab === 'active' && (
                    <ActiveEnrollmentsTab
                        courseId={courseId}
                        onSelectEnrollment={goToSessionsForEnrollment}
                    />
                )}
                {tab === 'sessions' && (
                    <SessionsByEnrollmentTab
                        courseId={courseId}
                        selectedEnrollmentId={selectedEnrollment}
                        onSelectEnrollment={setSelectedEnrollment}
                    />
                )}
                {tab === 'content' && <ContentLibraryTab courseId={courseId} />}
                {tab === 'analytics' && <AnalyticsTab courseId={courseId} />}
            </div>
        </div>
    )
}

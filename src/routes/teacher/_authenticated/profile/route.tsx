import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useLiveQuery } from '@tanstack/react-db'

import { useLocale } from '@/lib/hooks/useLocale'
import { LOCALE_DIRECTION } from '@/lib/i18n'
import { localStorageCollection } from '@/lib/db/localStorageCollection'
import { SkeletonCard } from '@/lib/components/Skeleton'

import { myProfileQueryOptions } from './-queries/profileQueries'
import { ProfileHeader } from './-components/ProfileHeader'
import { StatsGrid } from './-components/StatsGrid'
import { AboutCard } from './-components/AboutCard'
import { QualificationsCard } from './-components/QualificationsCard'
import { DocumentsCard } from './-components/DocumentsCard'
import { SpecializationsCard } from './-components/SpecializationsCard'
import { TeachingCard } from './-components/TeachingCard'
import { AvailabilityCard } from './-components/AvailabilityCard'
import { RatingsCard } from './-components/RatingsCard'

export const Route = createFileRoute('/teacher/_authenticated/profile')({
    component: RouteComponent,
})

function RouteComponent() {
    const { t } = useTranslation('teacher')
    const locale = useLocale()

    // The signed-in teacher, from the local auth session.
    const { data: authSession = [] } = useLiveQuery((q) => q.from({ session: localStorageCollection }))
    const teacher = authSession[0]?.teacher

    const profileQuery = useQuery(
        myProfileQueryOptions(
            teacher
                ? { id: teacher.id, name: teacher.name, email: teacher.email, mobile: teacher.mobile }
                : undefined,
        ),
    )

    return (
        <div dir={LOCALE_DIRECTION[locale]} className="min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {t('profile.breadcrumbDashboard')} / {t('profile.breadcrumbCurrent')}
                </p>
                <h1 className="text-3xl font-black text-primary dark:text-secondary mt-1">{t('profile.heading')}</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('profile.subtitle')}</p>
            </div>

            {profileQuery.isLoading ? (
                <div className="space-y-4">
                    <SkeletonCard />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <SkeletonCard />
                        <SkeletonCard />
                    </div>
                </div>
            ) : profileQuery.isError || !profileQuery.data ? (
                <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 rounded-2xl p-6 text-center text-sm font-bold">
                    {t('profile.error')}
                </div>
            ) : (
                (() => {
                    const profile = profileQuery.data
                    return (
                        <div className="space-y-4">
                            <ProfileHeader profile={profile} />
                            <StatsGrid stats={profile.statistics} />

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
                                <div className="space-y-4">
                                    <AboutCard basic={profile.basic} professional={profile.professional} />
                                    <SpecializationsCard specializations={profile.specializations} />
                                    <TeachingCard teaching={profile.teaching} serviceAreas={profile.serviceAreas} />
                                    <AvailabilityCard availability={profile.availability} />
                                </div>
                                <div className="space-y-4">
                                    <QualificationsCard qualifications={profile.qualifications} />
                                    <DocumentsCard documents={profile.documents} />
                                    <RatingsCard ratings={profile.ratings} />
                                </div>
                            </div>
                        </div>
                    )
                })()
            )}
        </div>
    )
}

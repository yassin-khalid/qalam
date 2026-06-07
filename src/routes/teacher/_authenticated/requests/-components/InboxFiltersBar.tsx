import React from 'react'
import { useTranslation } from 'react-i18next'
import { Search, SlidersHorizontal } from 'lucide-react'
import type { InboxFilters, SubjectFacet } from '../-types/types'

interface InboxFiltersBarProps {
    filters: InboxFilters
    subjects: SubjectFacet[]
    onChange: (next: InboxFilters) => void
}

export const InboxFiltersBar: React.FC<InboxFiltersBarProps> = ({ filters, subjects, onChange }) => {
    const { t, i18n } = useTranslation('teacher')
    const isAr = i18n.language === 'ar'

    const update = <K extends keyof InboxFilters>(key: K, value: InboxFilters[K]) =>
        onChange({ ...filters, [key]: value })

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
            <div className="relative flex-1">
                <Search size={16} className="absolute top-1/2 -translate-y-1/2 start-3 text-slate-400" />
                <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => update('search', e.target.value)}
                    placeholder={t('requests.inbox.filters.searchPlaceholder')}
                    className="w-full ps-9 pe-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm"
                />
            </div>

            <div className="flex gap-2 flex-wrap">
                <select
                    value={filters.subject}
                    onChange={(e) => update('subject', e.target.value)}
                    className="px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                    <option value="all">{t('requests.inbox.filters.subjectAll')}</option>
                    {subjects.map((s) => (
                        <option key={s.key} value={s.key}>{isAr ? s.labelAr : s.labelEn}</option>
                    ))}
                </select>
                <select
                    value={filters.requestKind}
                    onChange={(e) => update('requestKind', e.target.value as InboxFilters['requestKind'])}
                    className="px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                    <option value="all">{t('requests.inbox.filters.kindAll')}</option>
                    <option value="Directed">{t('requests.inbox.filters.kindDirected')}</option>
                    <option value="Published">{t('requests.inbox.filters.kindPublished')}</option>
                </select>
                <select
                    value={filters.teachingMode}
                    onChange={(e) => update('teachingMode', e.target.value as InboxFilters['teachingMode'])}
                    className="px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                    <option value="all">{t('requests.inbox.filters.teachingModeAll')}</option>
                    <option value="Online">{t('requests.inbox.filters.teachingModeOnline')}</option>
                    <option value="InPerson">{t('requests.inbox.filters.teachingModeInPerson')}</option>
                </select>
                <select
                    value={filters.sessionType}
                    onChange={(e) => update('sessionType', e.target.value as InboxFilters['sessionType'])}
                    className="px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                    <option value="all">{t('requests.inbox.filters.sessionTypeAll')}</option>
                    <option value="Individual">{t('requests.inbox.filters.sessionTypeIndividual')}</option>
                    <option value="Group">{t('requests.inbox.filters.sessionTypeGroup')}</option>
                </select>
                <select
                    value={filters.dateWindow}
                    onChange={(e) => update('dateWindow', e.target.value as InboxFilters['dateWindow'])}
                    className="px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                    <option value="all">{t('requests.inbox.filters.dateAll')}</option>
                    <option value="next7">{t('requests.inbox.filters.dateNext7')}</option>
                    <option value="next30">{t('requests.inbox.filters.dateNext30')}</option>
                </select>
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                    <SlidersHorizontal size={14} className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        {t('requests.inbox.filters.sortLabel')}:
                    </span>
                    <select
                        value={filters.sort}
                        onChange={(e) => update('sort', e.target.value as InboxFilters['sort'])}
                        className="bg-transparent text-slate-700 dark:text-slate-200 text-sm font-medium focus:outline-none"
                    >
                        <option value="Newest">{t('requests.inbox.filters.sortNewest')}</option>
                        <option value="ExpiringSoon">{t('requests.inbox.filters.sortUrgent')}</option>
                        <option value="MostOffers">{t('requests.inbox.filters.sortMostOffers')}</option>
                    </select>
                </div>
            </div>
        </div>
    )
}

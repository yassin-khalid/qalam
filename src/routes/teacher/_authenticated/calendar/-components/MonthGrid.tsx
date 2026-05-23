import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { SessionListItem } from '../../sessions/-types/types'

interface MonthGridProps {
    year: number
    month: number // 0-indexed (Date semantics)
    sessionsByDayKey: Map<string, SessionListItem[]>
    selectedDayKey: string | null
    onSelect: (dayKey: string, date: Date) => void
}

const dayKey = (y: number, m: number, d: number) => `${y}-${m}-${d}`

export const MonthGrid: React.FC<MonthGridProps> = ({
    year,
    month,
    sessionsByDayKey,
    selectedDayKey,
    onSelect,
}) => {
    const { t } = useTranslation('teacher')

    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstWeekday = new Date(year, month, 1).getDay() // 0 = Sunday

    const todayKey = useMemo(() => {
        const today = new Date()
        return dayKey(today.getFullYear(), today.getMonth(), today.getDate())
    }, [])

    const weekDayLabels = t('common.weekDaysShort', { returnObjects: true }) as string[]

    const cells: React.ReactNode[] = []
    for (let i = 0; i < firstWeekday; i++) {
        cells.push(<div key={`empty-${i}`} className="aspect-square" />)
    }
    for (let d = 1; d <= daysInMonth; d++) {
        const key = dayKey(year, month, d)
        const sessions = sessionsByDayKey.get(key) ?? []
        const hasSessions = sessions.length > 0
        const isToday = key === todayKey
        const isSelected = key === selectedDayKey
        const tone = isSelected
            ? 'bg-primary dark:bg-secondary text-white border-transparent shadow-md shadow-primary/20 dark:shadow-secondary/20'
            : isToday
                ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/60 text-amber-700 dark:text-amber-300'
                : hasSessions
                    ? 'bg-white dark:bg-slate-900 border-primary/30 dark:border-secondary/30 text-slate-800 dark:text-slate-100 hover:border-primary dark:hover:border-secondary'
                    : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'

        cells.push(
            <button
                key={key}
                type="button"
                onClick={() => onSelect(key, new Date(year, month, d))}
                aria-label={t('calendar.dayAria', { day: d, sessions: sessions.length })}
                className={`aspect-square rounded-xl border-2 p-2 flex flex-col items-stretch justify-between text-start transition ${tone}`}
            >
                <span className={`text-sm font-bold ${isSelected ? '' : ''}`}>{d}</span>
                {hasSessions ? (
                    <div className="flex items-center gap-1 justify-end">
                        <span className={`text-[10px] font-black ${isSelected ? 'text-white' : 'text-primary dark:text-secondary'}`}>
                            {sessions.length}
                        </span>
                        <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-primary dark:bg-secondary'}`} />
                    </div>
                ) : (
                    <div className="h-3" />
                )}
            </button>,
        )
    }

    return (
        <div>
            <div className="grid grid-cols-7 gap-2 mb-2">
                {weekDayLabels.map((d) => (
                    <div
                        key={d}
                        className="text-center text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 py-1"
                    >
                        {d}
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-2">{cells}</div>
        </div>
    )
}

export const computeDayKey = dayKey

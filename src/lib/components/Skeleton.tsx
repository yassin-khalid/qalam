import React from 'react'

/**
 * Tiny shimmering placeholder block. Use anywhere a value/element is loading,
 * sized to roughly match the final content so the layout doesn't shift when
 * the real data arrives.
 *
 * Convenience: `lines` renders multiple stacked bars (e.g. for a paragraph).
 */
interface SkeletonProps {
    className?: string
    lines?: number
    rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
}

const ROUNDED: Record<NonNullable<SkeletonProps['rounded']>, string> = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    full: 'rounded-full',
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', lines, rounded = 'md' }) => {
    const base = `bg-slate-200/80 dark:bg-slate-800/60 animate-pulse ${ROUNDED[rounded]}`
    if (lines && lines > 1) {
        return (
            <div className="space-y-2">
                {Array.from({ length: lines }, (_, i) => (
                    <div
                        key={i}
                        className={`${base} h-3 ${i === lines - 1 ? 'w-2/3' : 'w-full'} ${className}`}
                    />
                ))}
            </div>
        )
    }
    return <div className={`${base} ${className}`} />
}

/**
 * Pre-styled card skeleton that matches the shape of the request / session
 * cards used across the teacher portal — header row, body lines, footer.
 */
export const SkeletonCard: React.FC<{ rows?: number }> = ({ rows = 3 }) => (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="p-5 space-y-4">
            <div className="flex items-start gap-3">
                <Skeleton className="w-12 h-12" rounded="2xl" />
                <div className="flex-1 space-y-2 pt-1">
                    <Skeleton className="h-4 w-3/5" />
                    <Skeleton className="h-3 w-2/5" />
                </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-12" />
            </div>
            <div className="grid grid-cols-2 gap-2">
                {Array.from({ length: rows }, (_, i) => (
                    <Skeleton key={i} className="h-3 w-full" />
                ))}
                <Skeleton className="h-3 w-3/4" />
            </div>
        </div>
        <Skeleton className="h-11 w-full rounded-none" />
    </div>
)

/**
 * Pre-styled list-item skeleton for vertical stacks (notifications, transactions).
 */
export const SkeletonRow: React.FC = () => (
    <div className="flex items-start gap-3 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
        <Skeleton className="w-11 h-11" rounded="xl" />
        <div className="flex-1 space-y-2 pt-1">
            <Skeleton className="h-3.5 w-3/5" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-2.5 w-1/4" />
        </div>
    </div>
)

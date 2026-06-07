import React from 'react'
import { Star } from 'lucide-react'
import type { Locale } from '@/lib/i18n'
import type { LocalizedText, ProfileStatus } from '../-types/types'

/** Resolve a bilingual label for the active locale. */
export const pickLocalized = (text: LocalizedText, locale: Locale): string =>
    text[locale] ?? text.ar

// ----- section card wrapper (matches requests/DetailSection styling) ---------

interface SectionCardProps {
    icon: React.ReactNode
    title: string
    subtitle?: string
    action?: React.ReactNode
    children: React.ReactNode
}

export const SectionCard: React.FC<SectionCardProps> = ({ icon, title, subtitle, action, children }) => (
    <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 space-y-4">
        <header className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary dark:bg-secondary text-white flex items-center justify-center shrink-0">
                {icon}
            </div>
            <div className="min-w-0 flex-1">
                <h2 className="text-base font-bold text-slate-800 dark:text-white">{title}</h2>
                {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{subtitle}</p>}
            </div>
            {action}
        </header>
        <div>{children}</div>
    </section>
)

// ----- small building blocks -------------------------------------------------

export const Pill: React.FC<{ children: React.ReactNode; tone?: 'primary' | 'neutral' }> = ({
    children,
    tone = 'neutral',
}) => (
    <span
        className={
            tone === 'primary'
                ? 'inline-flex items-center rounded-full bg-secondary/10 text-secondary dark:bg-secondary/20 px-3 py-1 text-xs font-bold'
                : 'inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-3 py-1 text-xs font-semibold'
        }
    >
        {children}
    </span>
)

export const Field: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">{label}</p>
        <p className="text-sm font-bold text-slate-800 dark:text-white mt-0.5 break-words">{value}</p>
    </div>
)

export const StarRating: React.FC<{ value: number; size?: number }> = ({ value, size = 16 }) => (
    <span className="inline-flex items-center gap-0.5" aria-hidden>
        {Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                size={size}
                className={
                    i < Math.round(value)
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700'
                }
            />
        ))}
    </span>
)

// ----- profile lifecycle status badge (doc §4) ------------------------------

const STATUS_TONE: Record<ProfileStatus, string> = {
    Active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    Approved: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
    PendingReview: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    ProfileIncomplete: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    DocumentsRejected: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
    Suspended: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
    Inactive: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
}

export const StatusBadge: React.FC<{ status: ProfileStatus; label: string }> = ({ status, label }) => (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${STATUS_TONE[status]}`}>
        {label}
    </span>
)

import React from 'react'

interface DetailSectionProps {
    icon: React.ReactNode
    title: string
    subtitle?: string
    children: React.ReactNode
}

export const DetailSection: React.FC<DetailSectionProps> = ({ icon, title, subtitle, children }) => (
    <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 space-y-4">
        <header className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary dark:bg-secondary text-white flex items-center justify-center">
                {icon}
            </div>
            <div>
                <h2 className="text-base font-bold text-slate-800 dark:text-white">{title}</h2>
                {subtitle && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{subtitle}</p>
                )}
            </div>
        </header>
        <div>{children}</div>
    </section>
)

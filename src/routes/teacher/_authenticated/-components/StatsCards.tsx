
import React from 'react';
import { StatCardProps } from '../types';

const StatCard: React.FC<StatCardProps> = ({
    label, value, change, changeType, icon, iconBgColor, iconTextColor
}) => {
    const changeColorClass =
        changeType === 'positive' ? 'text-green-500' :
            changeType === 'negative' ? 'text-red-500' :
                'text-slate-400';

    return (
        <div className="bg-white dark:bg-qalam-navy-dark p-6 rounded-[2.5rem] card-shadow border border-slate-50 dark:border-white/5 transition-all hover:-translate-y-1">
            <div className="flex justify-between items-start mb-6">
                <div className={`w-14 h-14 ${iconBgColor} rounded-2xl flex items-center justify-center ${iconTextColor}`}>
                    <span className="material-icons-outlined text-2xl">{icon}</span>
                </div>
                <span className={`${changeColorClass} font-bold text-xs bg-slate-50 dark:bg-white/5 px-3 py-1 rounded-full`}>
                    {change}
                </span>
            </div>
            <div className="space-y-1">
                <h3 className="text-slate-400 dark:text-slate-500 text-sm font-medium">{label}</h3>
                <p className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{value}</p>
            </div>
        </div>
    );
};

export const StatsCards: React.FC = () => {
    const stats: StatCardProps[] = [
        {
            label: 'إجمالي المبيعات',
            value: '12,450 ر.س',
            change: '+12%',
            changeType: 'positive',
            icon: 'shopping_bag',
            iconBgColor: 'bg-emerald-50 dark:bg-emerald-500/10',
            iconTextColor: 'text-emerald-500'
        },
        {
            label: 'العملاء الجدد',
            value: '1,204',
            change: '+5%',
            changeType: 'positive',
            icon: 'group',
            iconBgColor: 'bg-indigo-50 dark:bg-indigo-500/10',
            iconTextColor: 'text-indigo-500'
        },
        {
            label: 'المخزون المتوفر',
            value: '842',
            change: '-2%',
            changeType: 'negative',
            icon: 'inventory',
            iconBgColor: 'bg-orange-50 dark:bg-orange-500/10',
            iconTextColor: 'text-orange-500'
        },
        {
            label: 'طلبات معلقة',
            value: '18',
            change: 'مستقر',
            changeType: 'neutral',
            icon: 'pending_actions',
            iconBgColor: 'bg-blue-50 dark:bg-blue-500/10',
            iconTextColor: 'text-blue-500'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {stats.map((stat, idx) => (
                <StatCard key={idx} {...stat} />
            ))}
        </div>
    );
};

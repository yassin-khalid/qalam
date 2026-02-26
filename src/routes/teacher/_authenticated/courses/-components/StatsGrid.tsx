import { motion } from 'framer-motion';
import { StatItem } from '../-types/types';

interface StatsGridProps {
    stats: StatItem[];
}

export const StatsGrid = ({ stats }: StatsGridProps) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {stats.map((stat, index) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative p-5 rounded-xl border ${stat.borderColor} ${stat.color} flex flex-col items-end justify-between min-h-[100px] transition-all duration-300 shadow-sm`}
                >
                    <span className={`text-base font-bold ${stat.textColor}`}>{stat.label}</span>
                    <div className={`text-4xl font-black tracking-tighter ${stat.valueColor}`}>{stat.value}</div>
                </motion.div>
            ))}
        </div>
    );
};
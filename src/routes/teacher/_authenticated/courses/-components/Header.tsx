import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

interface DashboardHeaderProps {
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = () => {
    const navigate = useNavigate()
    const { t } = useTranslation('teacher');
    return (
        <div className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-6">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-start"
                >
                    <h1 className="text-4xl font-extrabold text-[#004D4D] dark:text-white tracking-tight">{t('courses.list.title')}</h1>
                    <p className="text-[#64748B] dark:text-slate-500 text-base font-semibold mt-0.5">{t('courses.list.subtitle')}</p>
                </motion.div>
            </div>

            <motion.button
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 bg-[#00B5AD] hover:bg-[#00968F] text-white px-6 py-2.5 rounded-xl font-extrabold text-base transition-all shadow-lg shadow-teal-500/20"
                onClick={() => { navigate({ to: '/teacher/courses/new' }) }}
            >
                <Plus size={20} strokeWidth={3} />
                <span>{t('courses.list.createCta')}</span>
            </motion.button>
        </div>
    );
};

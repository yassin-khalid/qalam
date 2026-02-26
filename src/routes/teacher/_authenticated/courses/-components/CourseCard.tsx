
import React from 'react';
import { Calendar, Clock, Users as UsersIcon, Banknote, Eye, Trash2, Edit3, SaudiRiyal } from 'lucide-react';
import { motion } from 'framer-motion';
import { Course } from '../-types/types';

interface CourseCardProps {
    course: Course;
    index: number;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, index }) => {
    const getStatusLabel = (status: number) => {
        switch (status) {
            case 1: return 'مسودة';
            case 2: return 'منشورة';
            case 3: return 'متوقفة';
            default: return '';
        }
    };

    const getStatusStyles = (status: number) => {
        switch (status) {
            case 1: return 'bg-amber-100 text-amber-700 border-amber-200';
            case 2: return 'bg-[#D1FAE5] text-[#065F46] border-[#A7F3D0]';
            case 3: return 'bg-slate-100 text-slate-700 border-slate-200';
            default: return '';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-xl border border-slate-100 dark:border-slate-800 flex flex-col h-full group min-w-0"
        >
            {/* Card Header (Teal Section) */}
            <div className="bg-linear-to-br from-primary to-secondary p-5 relative min-h-[140px] flex flex-col justify-end">
                <div className={`absolute top-3 right-4 px-3 py-1 rounded-lg text-xs font-bold border ${getStatusStyles(course.status)}`}>
                    {getStatusLabel(course.status)}
                </div>
                <h3 className="text-lg font-bold text-white leading-snug mb-3 mt-8">
                    {course.title}
                </h3>
                <div className="flex flex-wrap gap-1.5">
                    <span className="bg-white/10 backdrop-blur-md text-white px-3 py-1 rounded-lg text-xs font-medium border border-white/20">
                        {course.subjectNameEn}
                    </span>
                    <span className="bg-white/10 backdrop-blur-md text-white px-3 py-1 rounded-lg text-xs font-medium border border-white/20">
                        الثالث الثانوي
                    </span>
                    <span className="bg-white/10 backdrop-blur-md text-white px-3 py-1 rounded-lg text-xs font-medium border border-white/20 flex items-center gap-1">
                        <UsersIcon size={14} />
                        {course.sessionTypeNameEn}
                    </span>
                    <span className="bg-white/10 backdrop-blur-md text-white px-3 py-1 rounded-lg text-xs font-medium border border-white/20 flex items-center gap-1">
                        <Clock size={14} />
                        {course.teachingModeNameEn}
                    </span>
                </div>
            </div>

            {/* Card Body (Details Section) */}
            <div className="p-5 flex-1 flex flex-col space-y-3">
                <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                            <Calendar size={18} className="text-slate-400" />
                            <span className="text-sm font-medium">تاريخ البداية</span>
                        </div>
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{course.startDate}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                            <Clock size={18} className="text-slate-400" />
                            <span className="text-sm font-medium">عدد الجلسات</span>
                        </div>
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{course.sessionsCount} جلسة</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                            <UsersIcon size={18} className="text-slate-400" />
                            <span className="text-sm font-medium">الطلاب المسجلين</span>
                        </div>
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{course.registeredCount} / 15</span>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Banknote size={18} className="text-slate-400" />
                        <span className="text-sm font-medium text-slate-500">السعر</span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-xl font-black text-primary dark:text-secondary">{course.price}</span>
                        <SaudiRiyal size={18} className="text-primary dark:text-secondary" />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-3">
                    <button className="flex-1 bg-primary hover:bg-secondary text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-slate-900/10 text-sm">
                        <Edit3 size={16} />
                        تعديل
                    </button>
                    <button className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                        <Eye size={18} />
                    </button>
                    <button className="p-2.5 rounded-xl border border-red-50 dark:border-red-900/20 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all">
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

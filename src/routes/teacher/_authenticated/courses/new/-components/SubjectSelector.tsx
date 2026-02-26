import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Check, BookOpen, Layers } from 'lucide-react';
import { Subject } from '../-types/types';

interface SubjectSelectorProps {
    selectedSubjectId: number | null;
    onSelect: (subject: Subject) => void;
}

export const SubjectSelector: React.FC<SubjectSelectorProps> = ({ selectedSubjectId, onSelect }) => {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const response = await fetch('/api/subjects');
                const result = await response.json();
                if (result.succeeded) {
                    setSubjects(result.data);
                }
            } catch (error) {
                console.error('Error fetching subjects:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSubjects();
    }, []);

    const filteredSubjects = subjects.filter(s =>
        s.subjectNameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.subjectNameEn.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="ابحث عن مادة..."
                    className="w-full pr-12 pl-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-right"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <div className="w-10 h-10 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
                        <p className="text-slate-400 font-bold">جاري تحميل المواد...</p>
                    </div>
                ) : filteredSubjects.length > 0 ? (
                    filteredSubjects.map((subject) => (
                        <motion.div
                            key={subject.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => onSelect(subject)}
                            className={`relative cursor-pointer group p-6 rounded-[24px] border-2 transition-all duration-300 ${selectedSubjectId === subject.id
                                ? 'bg-teal-50/50 dark:bg-teal-950/20 border-teal-500 shadow-lg shadow-teal-500/10'
                                : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-teal-200 dark:hover:border-teal-900'
                                }`}
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-center gap-6">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${selectedSubjectId === subject.id ? 'bg-teal-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-teal-500'
                                        }`}>
                                        <BookOpen size={28} />
                                    </div>
                                    <div>
                                        <h4 className={`text-xl font-black transition-colors ${selectedSubjectId === subject.id ? 'text-teal-900 dark:text-teal-100' : 'text-slate-800 dark:text-white'
                                            }`}>
                                            {subject.subjectNameAr}
                                        </h4>
                                        <p className="text-slate-400 dark:text-slate-500 font-bold text-sm mt-0.5">{subject.subjectNameEn}</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 md:justify-end max-w-md">
                                    {subject.canTeachFullSubject ? (
                                        <span className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 px-4 py-1.5 rounded-xl text-sm font-black border border-emerald-100 dark:border-emerald-900/30">
                                            كافة الوحدات
                                        </span>
                                    ) : subject.units.length > 0 ? (
                                        subject.units.map(unit => (
                                            <span key={unit.id} className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-100 dark:border-slate-800">
                                                {unit.unitNameAr}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-slate-300 dark:text-slate-700 text-sm font-bold italic">لا توجد وحدات محددة</span>
                                    )}
                                </div>
                            </div>

                            {selectedSubjectId === subject.id && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-2 -left-2 w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center shadow-lg border-4 border-white dark:border-slate-900"
                                >
                                    <Check size={16} strokeWidth={4} />
                                </motion.div>
                            )}
                        </motion.div>
                    ))
                ) : (
                    <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                        <Layers className="mx-auto text-slate-300 mb-4" size={48} />
                        <p className="text-slate-400 font-bold">لم يتم العثور على مواد تطابق بحثك</p>
                    </div>
                )}
            </div>

            <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #CBD5E1;
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
        }
      `}</style>
        </div>
    );
};

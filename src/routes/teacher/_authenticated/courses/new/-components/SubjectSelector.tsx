import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Check, BookOpen, Layers } from 'lucide-react';
import { Subject } from '../-types/types';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/lib/hooks/useLocale';

interface SubjectSelectorProps {
    selectedSubjectId: number | null;
    onSelect: (subject: Subject) => void;
    subjects: Subject[];
}

export const SubjectSelector: React.FC<SubjectSelectorProps> = ({ selectedSubjectId, onSelect, subjects }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const { t } = useTranslation('teacher');
    const locale = useLocale();
    const isAr = locale === 'ar';

    console.log({ selectedSubjectId, subjects })

    const filteredSubjects = subjects.filter(s =>
        s.subjectNameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.subjectNameEn.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="relative">
                <Search className="absolute end-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                    type="text"
                    placeholder={t('courses.new.sections.subject.searchPlaceholder')}
                    className="w-full pe-10 ps-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-secondary/20 focus:border-primary dark:focus:border-secondary transition-all text-start text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 gap-3 max-h-[420px] overflow-y-auto overflow-x-hidden pr-1.5 custom-scrollbar">
                {filteredSubjects.length > 0 ? (
                    filteredSubjects.map((subject) => (
                        <motion.div
                            key={subject.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ y: -1 }}
                            whileTap={{ scale: 0.995 }}
                            onClick={() => onSelect(subject)}
                            className={`relative w-full max-w-full overflow-hidden cursor-pointer group p-4 rounded-xl border-2 transition-all duration-300 ${selectedSubjectId === subject.id
                                ? 'bg-primary/5 dark:bg-secondary/10 border-primary dark:border-secondary shadow-md shadow-primary/10 dark:shadow-secondary/10'
                                : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-primary/90 dark:hover:border-secondary/90'
                                }`}
                        >
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 min-w-0">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${selectedSubjectId === subject.id ? 'bg-primary dark:bg-secondary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-primary dark:group-hover:text-secondary'
                                        }`}>
                                        <BookOpen size={20} />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className={`text-base font-semibold leading-tight wrap-break-words transition-colors ${selectedSubjectId === subject.id ? 'text-primary dark:text-secondary' : 'text-slate-800 dark:text-white'
                                            }`}>
                                            {isAr ? subject.subjectNameAr : subject.subjectNameEn}
                                        </h4>
                                        <p className="text-slate-500 dark:text-slate-400 font-semibold text-xs mt-0.5 truncate">{isAr ? subject.subjectNameEn : subject.subjectNameAr}</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-1.5 md:justify-end max-w-full md:max-w-[52%]">
                                    {subject.canTeachFullSubject ? (
                                        <span className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-lg text-xs font-semibold border border-emerald-100 dark:border-emerald-900/30">
                                            {t('courses.new.sections.subject.allUnits')}
                                        </span>
                                    ) : subject.units.length > 0 ? (
                                        subject.units.map(unit => (
                                            <span key={unit.id} className="max-w-full wrap-break-words bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 px-2.5 py-1 rounded-lg text-xs font-semibold border border-slate-100 dark:border-slate-800">
                                                {isAr ? unit.unitNameAr : (unit as any).unitNameEn ?? unit.unitNameAr}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-slate-300 dark:text-slate-700 text-xs font-bold italic">{t('courses.new.sections.subject.noUnits')}</span>
                                    )}
                                </div>
                            </div>

                            {selectedSubjectId === subject.id && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-1.5 -start-1.5 w-7 h-7 bg-primary dark:bg-secondary text-white rounded-full flex items-center justify-center shadow-md border-2 border-white dark:border-slate-900"
                                >
                                    <Check size={14} strokeWidth={3.5} />
                                </motion.div>
                            )}
                        </motion.div>
                    ))
                ) : (
                    <div className="text-center py-14 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                        <Layers className="mx-auto text-slate-300 mb-3" size={36} />
                        <p className="text-slate-400 text-sm font-bold">{t('courses.new.sections.subject.noResults')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

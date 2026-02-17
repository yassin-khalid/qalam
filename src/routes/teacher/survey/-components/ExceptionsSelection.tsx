
import React, { useState } from 'react';
import { Exception } from '../types/types';

const PRESET_TIME_SLOTS = [
    { start: '08:00', end: '09:00' }, { start: '09:00', end: '10:00' }, { start: '10:00', end: '11:00' },
    { start: '11:00', end: '12:00' }, { start: '12:00', end: '13:00' }, { start: '13:00', end: '14:00' },
    { start: '14:00', end: '15:00' }, { start: '15:00', end: '16:00' }, { start: '16:00', end: '17:00' },
    { start: '17:00', end: '18:00' }, { start: '18:00', end: '19:00' }, { start: '19:00', end: '20:00' }
];

interface ExceptionsSelectionProps {
    exceptions: Exception[];
    onSetExceptions: (exceptions: Exception[]) => void;
    onContinue: () => void;
}

const ExceptionsSelection: React.FC<ExceptionsSelectionProps> = ({ exceptions, onSetExceptions, onContinue }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [draft, setDraft] = useState<Omit<Exception, 'id'>>({
        type: 'full_day',
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '10:00'
    });

    const handleAdd = () => {
        onSetExceptions([...exceptions, { ...draft, id: (Date.now() + Math.random()).toString() }]);
        setIsAdding(false);
    };

    return (
        <div className="bg-white rounded-[1.5rem] p-6 md:p-8 shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col min-h-[750px]">
            <div className="flex flex-col items-center mb-8 text-center">
                <div className="mb-2 text-primary text-5xl font-bold">قلم</div>
                <h2 className="text-2xl font-bold text-primary mb-1">الاستثناءات والإجازات</h2>
                <p className="text-xs text-gray-400">حدد مواعيد الإجازات أو الاستثناءات الخاصة بجدولك</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-grow mb-6">
                {/* RIGHT COLUMN (FIRST IN RTL): Info and List */}
                <div className="flex flex-col gap-6 order-last md:order-first">
                    <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-6 text-right shadow-sm">
                        <div className="flex justify-end items-center gap-2 mb-2">
                            <h4 className="text-sm font-bold text-primary">متى تحتاج إضافة استثناء؟</h4>
                            <svg className="w-5 h-5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <ul className="text-[10px] text-gray-500 space-y-1">
                            <li>• عند وجود إجازة رسمية في يوم معين</li>
                            <li>• عند عدم التواجد في فترة زمنية محددة</li>
                            <li>• لإلغاء التوفر في تاريخ معين دون تعديل الجدول</li>
                        </ul>
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={() => setIsAdding(true)}
                            className="bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/95 transition-all flex items-center gap-2"
                        >
                            <span>+ إضافة استثناء جديد</span>
                        </button>
                    </div>

                    <div className="space-y-4">
                        <h5 className="text-right text-sm font-bold text-primary">الاستثناءات المضافة ({exceptions.length})</h5>
                        <div className="space-y-3 overflow-y-auto max-h-[300px] pr-2">
                            {exceptions.length === 0 ? (
                                <div className="text-center py-10 text-gray-300 text-xs bg-gray-50/30 rounded-2xl border border-dashed border-gray-100">لا توجد استثناءات مضافة بعد</div>
                            ) : (
                                exceptions.map(ex => (
                                    <div key={ex.id} className="bg-white border border-gray-100 rounded-2xl p-4 flex justify-between items-center shadow-sm hover:border-secondary/20 transition-all">
                                        <button onClick={() => onSetExceptions(exceptions.filter(e => e.id !== ex.id))} className="text-red-300 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                        </button>
                                        <div className="text-right">
                                            <div className="flex items-center justify-end gap-2 mb-1">
                                                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${ex.type === 'full_day' ? 'bg-blue-50 text-blue-400 border-blue-100' : 'bg-orange-50 text-orange-400 border-orange-100'}`}>{ex.type === 'full_day' ? 'يوم كامل' : 'فترة محددة'}</span>
                                                <svg className={`w-4 h-4 ${ex.type === 'full_day' ? 'text-blue-400' : 'text-orange-400'}`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
                                            </div>
                                            <p className="text-xs font-bold text-primary mb-1">{ex.date}</p>
                                            {ex.type === 'period' && <p className="text-[10px] text-gray-400">من {ex.startTime} إلى {ex.endTime}</p>}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* LEFT COLUMN (SECOND IN RTL): Form Area */}
                <div className="border border-secondary/20 rounded-2xl p-6 bg-white flex flex-col shadow-sm">
                    {isAdding ? (
                        <div className="h-full flex flex-col">
                            <div className="flex justify-between items-start mb-6">
                                <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-primary transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                </button>
                                <div className="text-right">
                                    <h4 className="text-xl font-bold text-primary">إضافة استثناء</h4>
                                    <p className="text-xs text-gray-400">حدد الموعد والنوع</p>
                                </div>
                            </div>

                            <div className="space-y-6 flex-grow overflow-y-auto pr-1">
                                <div>
                                    <label className="block text-right text-xs font-bold text-primary mb-2">التاريخ *</label>
                                    <input
                                        type="date"
                                        value={draft.date}
                                        onChange={e => setDraft({ ...draft, date: e.target.value })}
                                        className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl outline-none text-right text-sm shadow-sm focus:border-secondary transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-right text-xs font-bold text-primary mb-3">نوع الاستثناء *</label>
                                    <div className="space-y-3">
                                        <button
                                            onClick={() => setDraft({ ...draft, type: 'full_day' })}
                                            className={`w-full p-4 border rounded-2xl flex justify-between items-center transition-all ${draft.type === 'full_day' ? 'border-secondary bg-secondary/5 ring-1 ring-secondary/20' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                                        >
                                            <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${draft.type === 'full_day' ? 'border-secondary' : 'border-gray-300'}`}>
                                                {draft.type === 'full_day' && <div className="h-2.5 w-2.5 bg-secondary rounded-full"></div>}
                                            </div>
                                            <div className="text-right">
                                                <h5 className="font-bold text-primary text-sm">يوم كامل</h5>
                                                <p className="text-[10px] text-gray-400">إلغاء المواعيد طوال اليوم</p>
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => setDraft({ ...draft, type: 'period' })}
                                            className={`w-full p-4 border rounded-2xl flex justify-between items-center transition-all ${draft.type === 'period' ? 'border-secondary bg-secondary/5 ring-1 ring-secondary/20' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                                        >
                                            <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${draft.type === 'period' ? 'border-secondary' : 'border-gray-300'}`}>
                                                {draft.type === 'period' && <div className="h-2.5 w-2.5 bg-secondary rounded-full"></div>}
                                            </div>
                                            <div className="text-right">
                                                <h5 className="font-bold text-primary text-sm">فترة محددة</h5>
                                                <p className="text-[10px] text-gray-400">إلغاء مواعيد لفترة معينة</p>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                {draft.type === 'period' && (
                                    <div className="space-y-3 pt-2">
                                        <label className="block text-right text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wide">اختر الفترة</label>
                                        <div className="grid grid-cols-2 gap-2 max-h-[150px] overflow-y-auto pr-1">
                                            {PRESET_TIME_SLOTS.map(slot => (
                                                <button
                                                    key={slot.start}
                                                    onClick={() => setDraft({ ...draft, startTime: slot.start, endTime: slot.end })}
                                                    className={`p-3 border rounded-xl text-center transition-all ${draft.startTime === slot.start ? 'border-secondary bg-secondary/10 shadow-sm' : 'border-gray-50 hover:border-gray-100 bg-white'}`}
                                                >
                                                    <span className={`text-sm font-bold ${draft.startTime === slot.start ? 'text-secondary' : 'text-primary'}`}>{slot.start}</span>
                                                    <span className="block text-[9px] text-gray-400">إلى {slot.end}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-4 mt-8 pt-6 border-t border-gray-100">
                                <button
                                    onClick={handleAdd}
                                    className="flex-[2] bg-primary text-white py-4 rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/95 transition-all"
                                >
                                    إضافة الاستثناء
                                </button>
                                <button
                                    onClick={() => setIsAdding(false)}
                                    className="flex-1 border border-gray-100 py-4 rounded-xl font-bold text-primary hover:bg-gray-50 transition-all"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center py-20 px-8">
                            <div className="text-9xl mb-8 relative">
                                📝
                                <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-md border border-gray-100">
                                    <div className="w-6 h-6 text-orange-400"><svg fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg></div>
                                </div>
                            </div>
                            <h4 className="text-xl font-bold text-primary mb-2">إضافة استثناء</h4>
                            <p className="text-gray-400 text-xs leading-relaxed mb-10 px-6">اضغط على زر الإضافة لبدء تحديد مواعيد الإجازات أو الاستثناءات</p>
                            <button
                                onClick={() => setIsAdding(true)}
                                className="bg-primary text-white px-10 py-4 rounded-xl font-bold flex items-center gap-3 shadow-xl shadow-primary/20 hover:scale-105 transition-all"
                            >
                                <span>+ إضافة استثناء جديد</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <button
                onClick={onContinue}
                className="w-full py-5 rounded-[1.25rem] font-bold text-lg bg-primary text-white hover:bg-primary/95 transition-all shadow-xl shadow-primary/10 mt-4"
            >
                متابعة
            </button>
        </div>
    );
};

export default ExceptionsSelection;

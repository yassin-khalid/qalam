

import React, { useState, useEffect } from 'react';
import { DayAvailability } from '../types/types';
import { useLiveQuery } from '@tanstack/react-db';
import { localStorageCollection } from '@/lib/db/localStorageCollection';

interface ApiDay {
    id: number;
    nameAr: string;
    nameEn: string;
    orderIndex: number;
}

interface ApiTimeSlot {
    id: number;
    startTime: string;
    endTime: string;
    labelAr: string;
    labelEn: string;
}

const FALLBACK_DAYS: ApiDay[] = [
    { "id": 1, "nameAr": "الأحد", "nameEn": "Sunday", "orderIndex": 1 },
    { "id": 2, "nameAr": "الإثنين", "nameEn": "Monday", "orderIndex": 2 },
    { "id": 3, "nameAr": "الثلاثاء", "nameEn": "Tuesday", "orderIndex": 3 },
    { "id": 4, "nameAr": "الأربعاء", "nameEn": "Wednesday", "orderIndex": 4 },
    { "id": 5, "nameAr": "الخميس", "nameEn": "Thursday", "orderIndex": 5 },
    { "id": 6, "nameAr": "الجمعة", "nameEn": "Friday", "orderIndex": 6 },
    { "id": 7, "nameAr": "السبت", "nameEn": "Saturday", "orderIndex": 7 }
];

const FALLBACK_SLOTS: ApiTimeSlot[] = [
    { "id": 1, "startTime": "08:00:00", "endTime": "09:00:00", "labelAr": "فترة الصباح", "labelEn": "Morning" },
    { "id": 2, "startTime": "09:00:00", "endTime": "10:00:00", "labelAr": "فترة الصباح", "labelEn": "Morning" },
    { "id": 3, "startTime": "10:00:00", "endTime": "11:00:00", "labelAr": "فترة الصباح", "labelEn": "Morning" },
    { "id": 4, "startTime": "11:00:00", "endTime": "12:00:00", "labelAr": "فترة الصباح", "labelEn": "Morning" },
    { "id": 5, "startTime": "12:00:00", "endTime": "13:00:00", "labelAr": "فترة الظهيرة", "labelEn": "Afternoon" },
    { "id": 10, "startTime": "17:00:00", "endTime": "18:00:00", "labelAr": "فترة المساء", "labelEn": "Evening" }
];

interface AvailabilitySelectionProps {
    selectedDays: string[];
    dayDetails: Record<string, DayAvailability>;
    onSetSelectedDays: (days: string[]) => void;
    onSetDayDetails: (details: Record<string, DayAvailability>) => void;
    onContinue: () => void;
}

const AvailabilitySelection: React.FC<AvailabilitySelectionProps> = ({
    selectedDays, dayDetails, onSetSelectedDays, onSetDayDetails, onContinue
}) => {
    const [activeDay, setActiveDay] = useState<string | null>(null);
    const [isPickingTime, setIsPickingTime] = useState(false);
    const [availableDays, setAvailableDays] = useState<ApiDay[]>([]);
    const [availableTimeSlots, setAvailableTimeSlots] = useState<ApiTimeSlot[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data } = useLiveQuery(q => q.from({ session: localStorageCollection }))
    const token = data?.[0]?.token ?? "";

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const tryFetch = async (urls: string[]) => {
                for (const url of urls) {
                    try {
                        const res = await fetch(url, {
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            }
                        });
                        if (res.ok) {
                            const json = await res.json();
                            if (json.succeeded) return json.data.items;
                        }
                    } catch (e) { }
                }
                return null;
            };
            const days = await tryFetch([`${import.meta.env.VITE_API_URL}/Api/V1/Teaching/DaysOfWeek`]);
            setAvailableDays(days || FALLBACK_DAYS);
            const slots = await tryFetch([`${import.meta.env.VITE_API_URL}/Api/V1/Teaching/TimeSlots`]);
            setAvailableTimeSlots(slots || FALLBACK_SLOTS);
            setLoading(false);
        };
        fetchData();
    }, []);

    const formatTime = (timeStr: string) => timeStr.split(':').slice(0, 2).join(':');

    const toggleDay = (dayName: string) => {
        if (selectedDays.includes(dayName)) {
            onSetSelectedDays(selectedDays.filter(d => d !== dayName));
            if (activeDay === dayName) setActiveDay(null);
        } else {
            onSetSelectedDays([...selectedDays, dayName]);
            setActiveDay(dayName);
        }
    };

    const toggleTimeSlot = (day: string, slot: ApiTimeSlot) => {
        const slots = dayDetails[day]?.slots || [];
        const formattedStart = formatTime(slot.startTime);
        const formattedEnd = formatTime(slot.endTime);
        const exists = slots.some(s => s.startTime === formattedStart && s.endTime === formattedEnd);
        const newSlots = exists
            ? slots.filter(s => !(s.startTime === formattedStart && s.endTime === formattedEnd))
            : [...slots, { id: String(slot.id), startTime: formattedStart, endTime: formattedEnd }];
        onSetDayDetails({ ...dayDetails, [day]: { slots: newSlots } });
    };

    const removeSlot = (day: string, slotId: string) => {
        const slots = dayDetails[day]?.slots || [];
        onSetDayDetails({ ...dayDetails, [day]: { slots: slots.filter(s => s.id !== slotId) } });
    };

    const handleFinalContinue = async () => {
        setIsSubmitting(true);
        onContinue();
    };

    if (loading) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 md:p-8 shadow-2xl w-full max-w-6xl flex flex-col items-center justify-center min-h-[750px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary mb-4"></div>
                <p className="text-primary dark:text-slate-100 font-bold">جاري تحميل البيانات...</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 md:p-8 shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col min-h-[750px]">
            <div className="flex flex-col items-center mb-8 text-center">
                <div className="mb-2 text-primary dark:text-slate-100 text-5xl font-bold">قلم</div>
                <h2 className="text-2xl font-bold text-primary dark:text-slate-200 mb-1">أوقات العمل</h2>
                <p className="text-xs text-gray-400 dark:text-slate-500">حدد الأيام والساعات التي تتوفر فيها للتدريس</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow mb-6">
                <div className="border border-secondary/20 dark:border-slate-800 rounded-[2rem] p-8 bg-white dark:bg-slate-800/20 overflow-y-auto shadow-sm">
                    <div className="flex items-center justify-end gap-2 mb-6 text-right">
                        <span className="text-primary dark:text-slate-100 font-bold text-sm">الأيام المتاحة</span>
                        <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-8">
                        {availableDays.map(day => (
                            <button key={day.id} onClick={() => toggleDay(day.nameAr)} className={`py-3.5 rounded-xl font-bold text-sm border transition-all ${selectedDays.includes(day.nameAr) ? 'bg-secondary text-white border-secondary shadow-md' : 'bg-blue-50/30 dark:bg-slate-800 text-secondary dark:text-slate-400 border-blue-100 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-700'}`}>
                                {day.nameAr}
                            </button>
                        ))}
                    </div>
                    <div className="text-right mb-4"><h4 className="text-primary dark:text-slate-100 font-bold text-sm">الأيام المحددة</h4></div>
                    <div className="space-y-3">
                        {selectedDays.length === 0 ? (
                            <div className="text-center py-10 text-gray-300 dark:text-slate-700 text-xs italic">يرجى اختيار أيام العمل المتاحة</div>
                        ) : (
                            selectedDays.map(dayName => {
                                const isActive = activeDay === dayName;
                                const slotCount = dayDetails[dayName]?.slots.length || 0;
                                return (
                                    <button key={dayName} onClick={() => { setActiveDay(dayName); setIsPickingTime(false); }} className={`w-full flex justify-between items-center p-5 border rounded-2xl transition-all ${isActive ? 'border-secondary ring-1 ring-secondary/20 bg-blue-50/20 dark:bg-secondary/10' : 'border-blue-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-200 dark:hover:border-slate-600'}`}>
                                        <div className="flex items-center gap-2">
                                            {slotCount > 0 ? (
                                                <span className="bg-blue-50 dark:bg-slate-900 text-secondary px-3 py-1 rounded-full text-[10px] font-bold border border-blue-100 dark:border-slate-700">{slotCount} فترات</span>
                                            ) : (
                                                <span className="text-orange-400 text-[10px] font-bold">بدون فترات ⚠️</span>
                                            )}
                                        </div>
                                        <span className={`text-primary dark:text-slate-200 font-bold text-base ${isActive ? 'text-secondary' : ''}`}>{dayName}</span>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
                <div className="border border-secondary/20 dark:border-slate-800 rounded-[2rem] p-8 bg-white dark:bg-slate-800/20 overflow-y-auto shadow-sm">
                    {activeDay ? (
                        <div className="h-full flex flex-col">
                            <div className="flex justify-between items-start mb-6">
                                <button onClick={() => { setActiveDay(null); setIsPickingTime(false); }} className="text-gray-400 hover:text-primary"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
                                <div className="text-right">
                                    <h4 className="text-xl font-bold text-primary dark:text-slate-100">أوقات {activeDay}</h4>
                                    <p className="text-xs text-gray-400 dark:text-slate-500">اختر الفترات الزمنية المتاحة لديك</p>
                                </div>
                            </div>
                            {!isPickingTime ? (
                                <>
                                    <button onClick={() => setIsPickingTime(true)} className="w-full py-4 text-secondary font-bold text-sm border-2 border-dotted border-secondary/20 rounded-2xl hover:bg-secondary/5 dark:hover:bg-secondary/10 transition-all mb-8 shadow-sm">+ إضافة فترة زمنية</button>
                                    <div className="flex-grow space-y-3 overflow-y-auto pr-1">
                                        {(!dayDetails[activeDay]?.slots || dayDetails[activeDay].slots.length === 0) ? (
                                            <div className="h-full flex flex-col items-center justify-center text-center py-20 opacity-40"><div className="text-7xl mb-4">⏰</div><p className="text-gray-400 dark:text-slate-500 text-xs">لا توجد فترات زمنية مضافة لهذا اليوم</p></div>
                                        ) : (
                                            dayDetails[activeDay].slots.map((s, idx) => (
                                                <div key={s.id} className="p-5 border border-gray-100 dark:border-slate-700 rounded-[1.5rem] flex justify-between items-center bg-gray-50/30 dark:bg-slate-900 hover:bg-white dark:hover:bg-slate-800 transition-all">
                                                    <button onClick={() => removeSlot(activeDay, s.id)} className="text-red-300 dark:text-red-900 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
                                                    <div className="text-right">
                                                        <p className="text-[10px] text-gray-400 dark:text-slate-500 mb-1">الفترة {idx + 1}</p>
                                                        <span className="text-base font-bold text-primary dark:text-slate-200">{s.startTime} إلى {s.endTime}</span>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="h-full flex flex-col">
                                    <div className="flex justify-between items-center mb-6">
                                        <button onClick={() => setIsPickingTime(false)} className="text-gray-400 dark:text-slate-500 font-bold text-xs">إلغاء</button>
                                        <h6 className="text-xs font-bold text-primary dark:text-slate-200">الفترات المتاحة</h6>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 overflow-y-auto pr-1 pb-6">
                                        {availableTimeSlots.map(slot => {
                                            const formattedStart = formatTime(slot.startTime);
                                            const formattedEnd = formatTime(slot.endTime);
                                            const isSelected = dayDetails[activeDay]?.slots.some(s => s.startTime === formattedStart && s.endTime === formattedEnd);
                                            return (
                                                <button key={slot.id} onClick={() => toggleTimeSlot(activeDay, slot)} className={`flex flex-col items-center p-4 border rounded-xl transition-all ${isSelected ? 'border-secondary bg-blue-50/50 dark:bg-secondary/10 shadow-sm' : 'border-gray-50 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-gray-200 dark:hover:border-slate-600'}`}>
                                                    <span className={`text-lg font-bold ${isSelected ? 'text-secondary' : 'text-primary dark:text-slate-200'}`}>{formattedStart}</span>
                                                    <span className="text-[10px] text-gray-400 dark:text-slate-500">إلى {formattedEnd}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <div className="mt-auto pt-6 border-t border-gray-50 dark:border-slate-800">
                                        <button onClick={() => setIsPickingTime(false)} className="w-full bg-primary dark:bg-slate-800 text-white py-4 rounded-xl font-bold hover:bg-primary/95 dark:hover:bg-slate-700 shadow-lg">حفظ وتأكيد</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center py-20 px-8">
                            <div className="text-8xl mb-6 opacity-30">⏰</div>
                            <h4 className="text-xl font-bold text-primary dark:text-slate-100 mb-2">اختر يوماً</h4>
                            <p className="text-gray-400 dark:text-slate-500 text-sm">اضغط على أحد الأيام المحددة لتعديل فتراته الزمنية</p>
                        </div>
                    )}
                </div>
            </div>
            <button onClick={handleFinalContinue} disabled={selectedDays.length === 0 || isSubmitting} className={`w-full py-5 rounded-2xl font-bold text-xl shadow-xl transition-all flex items-center justify-center gap-2 ${selectedDays.length > 0 && !isSubmitting ? 'bg-primary dark:bg-slate-800 text-white hover:bg-primary/90' : 'bg-gray-100 dark:bg-slate-800/50 text-gray-400 dark:text-slate-600 cursor-not-allowed'}`}>
                {isSubmitting && <div className="animate-spin h-6 w-6 border-3 border-white/30 border-t-white rounded-full"></div>}
                <span>{isSubmitting ? 'جاري الحفظ...' : 'متابعة'}</span>
            </button>
        </div>
    );
};

export default AvailabilitySelection;

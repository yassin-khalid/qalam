
import React, { useState, useEffect } from 'react';
import { Exception } from '../types/types';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/lib/hooks/useLocale';
import { useLiveQuery } from '@tanstack/react-db';
import { localStorageCollection } from '@/lib/db/localStorageCollection';
import { showToast } from '@/lib/utils/toast';

interface WeeklySlot {
    id: number;
    availabilityId?: number;
    startTime: string;
    endTime: string;
    labelAr?: string;
    labelEn?: string;
}

interface WeeklyDay {
    dayOfWeekId: number;
    dayNameAr?: string;
    dayNameEn?: string;
    timeSlots: WeeklySlot[];
}

const formatTime = (s: string) => s.split(':').slice(0, 2).join(':');

// Date string 'YYYY-MM-DD' → backend dayOfWeekId (1=Sun..7=Sat)
const dayIdForDate = (dateStr: string): number => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    return dt.getUTCDay() + 1;
};

interface ExceptionsSelectionProps {
    exceptions: Exception[];
    onSetExceptions: (exceptions: Exception[]) => void;
    onContinue: () => void;
}

const EMPTY_DRAFT = (): Omit<Exception, 'id'> => ({
    type: 'full_day',
    date: new Date().toISOString().split('T')[0],
    timeSlotId: undefined,
    startTime: undefined,
    endTime: undefined,
    reason: '',
});

const ExceptionsSelection: React.FC<ExceptionsSelectionProps> = ({ exceptions, onSetExceptions, onContinue }) => {
    const { t } = useTranslation('teacher');
    const locale = useLocale();
    const isAr = locale === 'ar';
    const { data: sessionData } = useLiveQuery(q => q.from({ session: localStorageCollection }));
    const token = sessionData?.[0]?.token ?? '';

    const [weeklySchedule, setWeeklySchedule] = useState<WeeklyDay[]>([]);
    const [loadingSchedule, setLoadingSchedule] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [draft, setDraft] = useState<Omit<Exception, 'id'>>(EMPTY_DRAFT);

    const [hasPrefilled, setHasPrefilled] = useState(false);

    useEffect(() => {
        if (!token) return;
        const load = async () => {
            setLoadingSchedule(true);
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/Api/V1/Teacher/TeacherAvailability`, {
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                });
                if (res.ok) {
                    const j = await res.json();
                    if (j.succeeded) {
                        setWeeklySchedule(j.data?.weeklySchedule ?? []);

                        // Seed existing server-side exceptions into the visible list (only once).
                        if (!hasPrefilled) {
                            const serverExceptions = (j.data?.exceptions ?? []) as Array<{
                                id: number;
                                date: string;
                                timeSlot?: { id: number; startTime: string; endTime: string };
                                exceptionType?: string;
                                reason?: string;
                            }>;
                            const prefilled: Exception[] = serverExceptions.map(e => ({
                                id: `srv-${e.id}`,
                                serverId: e.id,
                                type: 'period',
                                date: e.date,
                                timeSlotId: e.timeSlot?.id,
                                startTime: e.timeSlot ? formatTime(e.timeSlot.startTime) : undefined,
                                endTime: e.timeSlot ? formatTime(e.timeSlot.endTime) : undefined,
                                reason: e.reason || undefined,
                            }));
                            if (prefilled.length > 0) {
                                onSetExceptions([...prefilled, ...exceptions.filter(x => !x.serverId)]);
                            }
                        }
                    }
                }
            } catch (e) {
                console.error('Failed to load weekly schedule:', e);
            } finally {
                setHasPrefilled(true);
                setLoadingSchedule(false);
            }
        };
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const slotsForDate = (date: string): WeeklySlot[] => {
        const dayId = dayIdForDate(date);
        return weeklySchedule.find(w => w.dayOfWeekId === dayId)?.timeSlots ?? [];
    };

    const availableSlots = slotsForDate(draft.date);

    const pickSlot = (slot: WeeklySlot) => {
        setDraft({
            ...draft,
            timeSlotId: slot.id,
            startTime: formatTime(slot.startTime),
            endTime: formatTime(slot.endTime),
        });
    };

    const canAdd =
        draft.type === 'full_day'
            ? slotsForDate(draft.date).length > 0
            : draft.timeSlotId != null;

    const handleAdd = () => {
        if (!canAdd) return;
        const newException: Exception = {
            id: (Date.now() + Math.random()).toString(),
            type: draft.type,
            date: draft.date,
            timeSlotId: draft.type === 'period' ? draft.timeSlotId : undefined,
            startTime: draft.startTime,
            endTime: draft.endTime,
            reason: draft.reason?.trim() || undefined,
        };
        onSetExceptions([...exceptions, newException]);
        setIsAdding(false);
        setDraft(EMPTY_DRAFT());
    };

    type ExceptionBody = { date: string; timeSlotId: number; exceptionType: 'Blocked'; reason?: string };

    const buildPostBodies = (): ExceptionBody[] => {
        const bodies: ExceptionBody[] = [];
        for (const ex of exceptions) {
            // Skip already-persisted exceptions — they came from GET.
            if (ex.serverId != null) continue;
            const base: Pick<ExceptionBody, 'exceptionType'> & { reason?: string } = {
                exceptionType: 'Blocked',
                ...(ex.reason ? { reason: ex.reason } : {}),
            };
            if (ex.type === 'full_day') {
                for (const s of slotsForDate(ex.date)) {
                    bodies.push({ ...base, date: ex.date, timeSlotId: s.id });
                }
            } else if (ex.timeSlotId != null) {
                bodies.push({ ...base, date: ex.date, timeSlotId: ex.timeSlotId });
            }
        }
        return bodies;
    };

    const removeException = async (ex: Exception) => {
        if (ex.serverId != null) {
            // Persisted: call DELETE then drop from local list on success.
            try {
                const res = await fetch(
                    `${import.meta.env.VITE_API_URL}/Api/V1/Teacher/TeacherAvailability/exceptions/${ex.serverId}`,
                    { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }
                );
                if (!res.ok) {
                    showToast({
                        type: 'server',
                        title: t('survey.exceptions.toasts.saveErrorTitle'),
                        message: t('survey.exceptions.toasts.saveErrorMessage', { count: 1 }),
                    });
                    return;
                }
            } catch (e) {
                console.error('Exception DELETE failed:', ex, e);
                showToast({
                    type: 'server',
                    title: t('survey.exceptions.toasts.saveErrorTitle'),
                    message: t('survey.exceptions.toasts.saveErrorMessage', { count: 1 }),
                });
                return;
            }
        }
        onSetExceptions(exceptions.filter(e => e.id !== ex.id));
    };

    const handleContinue = async () => {
        const bodies = buildPostBodies();
        if (bodies.length === 0) {
            onContinue();
            return;
        }
        setIsSubmitting(true);
        let failed = 0;
        for (const body of bodies) {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/Api/V1/Teacher/TeacherAvailability/exceptions`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(body),
                });
                const j = await res.json().catch(() => ({}));
                if (!res.ok || !j.succeeded) {
                    // Treat "already exists" as soft success so retries are safe.
                    const isDuplicate = typeof j.message === 'string' && j.message.toLowerCase().includes('already exists');
                    if (!isDuplicate) failed++;
                }
            } catch (e) {
                console.error('Exception POST failed:', body, e);
                failed++;
            }
        }
        setIsSubmitting(false);
        if (failed > 0) {
            showToast({
                type: 'server',
                title: t('survey.exceptions.toasts.saveErrorTitle'),
                message: t('survey.exceptions.toasts.saveErrorMessage', { count: failed }),
            });
            return;
        }
        onContinue();
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] p-6 md:p-8 shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col min-h-[750px]">
            <div className="flex flex-col items-center mb-8 text-center">
                <div className="mb-2 text-primary dark:text-slate-100 text-5xl font-bold">{t('survey.common.brand')}</div>
                <h2 className="text-2xl font-bold text-primary dark:text-slate-200 mb-1">{t('survey.exceptions.title')}</h2>
                <p className="text-xs text-gray-400 dark:text-slate-500">{t('survey.exceptions.subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-grow mb-6">
                {/* RIGHT COLUMN (FIRST IN RTL): Info and List */}
                <div className="flex flex-col gap-6 order-last md:order-first">
                    <div className="bg-orange-50/50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 rounded-2xl p-6 text-start shadow-sm">
                        <div className="flex justify-start items-center gap-2 mb-2">
                            <svg className="w-5 h-5 text-orange-400 dark:text-orange-300" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <h4 className="text-sm font-bold text-primary dark:text-orange-200">{t('survey.exceptions.whenNeeded')}</h4>
                        </div>
                        <ul className="text-[10px] text-gray-600 dark:text-slate-300 space-y-1">
                            <li>• {t('survey.exceptions.tips.official')}</li>
                            <li>• {t('survey.exceptions.tips.unavailable')}</li>
                            <li>• {t('survey.exceptions.tips.cancel')}</li>
                        </ul>
                    </div>

                    <div className="flex justify-start">
                        <button
                            onClick={() => { setDraft(EMPTY_DRAFT()); setIsAdding(true); }}
                            className="bg-primary dark:bg-slate-800 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/95 dark:hover:bg-slate-700 transition-all flex items-center gap-2"
                        >
                            <span>{t('survey.exceptions.addNew')}</span>
                        </button>
                    </div>

                    <div className="space-y-4">
                        <h5 className="text-start text-sm font-bold text-primary dark:text-slate-200">{t('survey.exceptions.addedTitle', { count: exceptions.length })}</h5>
                        <div className="space-y-3 overflow-y-auto max-h-[300px] pe-2">
                            {exceptions.length === 0 ? (
                                <div className="text-center py-10 text-gray-400 dark:text-slate-500 text-xs bg-gray-50/30 dark:bg-slate-800/30 rounded-2xl border border-dashed border-gray-100 dark:border-slate-700">{t('survey.exceptions.empty')}</div>
                            ) : (
                                exceptions.map(ex => (
                                    <div key={ex.id} className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-4 flex justify-between items-center shadow-sm hover:border-secondary/20 dark:hover:border-secondary/40 transition-all">
                                        <button onClick={() => removeException(ex)} className="text-red-300 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                        </button>
                                        <div className="text-start">
                                            <div className="flex items-center justify-start gap-2 mb-1">
                                                <svg className={`w-4 h-4 ${ex.type === 'full_day' ? 'text-blue-400' : 'text-orange-400'}`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
                                                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${ex.type === 'full_day' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-400 dark:text-blue-300 border-blue-100 dark:border-blue-900/40' : 'bg-orange-50 dark:bg-orange-900/20 text-orange-400 dark:text-orange-300 border-orange-100 dark:border-orange-900/40'}`}>{ex.type === 'full_day' ? t('survey.exceptions.types.fullDay') : t('survey.exceptions.types.period')}</span>
                                                {ex.serverId != null && (
                                                    <span className="text-[9px] px-2 py-0.5 rounded-full font-bold border bg-green-50 dark:bg-green-900/20 text-green-500 dark:text-green-400 border-green-100 dark:border-green-900/40">{t('survey.exceptions.savedBadge')}</span>
                                                )}
                                            </div>
                                            <p className="text-xs font-bold text-primary dark:text-slate-200 mb-1">{ex.date}</p>
                                            {ex.type === 'period' && ex.startTime && ex.endTime && (
                                                <p className="text-[10px] text-gray-400 dark:text-slate-400">{t('survey.exceptions.timeRange', { start: ex.startTime, end: ex.endTime })}</p>
                                            )}
                                            {ex.reason && (
                                                <p className="text-[10px] text-gray-500 dark:text-slate-400 mt-1 italic">“{ex.reason}”</p>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* LEFT COLUMN (SECOND IN RTL): Form Area */}
                <div className="border border-secondary/20 dark:border-slate-800 rounded-2xl p-6 bg-white dark:bg-slate-800/20 flex flex-col shadow-sm">
                    {isAdding ? (
                        <div className="h-full flex flex-col">
                            <div className="flex justify-between items-start mb-6">
                                <button onClick={() => setIsAdding(false)} className="text-gray-400 dark:text-slate-500 hover:text-primary dark:hover:text-slate-200 transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                </button>
                                <div className="text-start">
                                    <h4 className="text-xl font-bold text-primary dark:text-slate-100">{t('survey.exceptions.addTitle')}</h4>
                                    <p className="text-xs text-gray-400 dark:text-slate-500">{t('survey.exceptions.addSubtitle')}</p>
                                </div>
                            </div>

                            <div className="space-y-6 flex-grow overflow-y-auto pe-1">
                                <div>
                                    <label className="block text-start text-xs font-bold text-primary dark:text-slate-200 mb-2">{t('survey.exceptions.dateLabel')}</label>
                                    <input
                                        type="date"
                                        value={draft.date}
                                        onChange={e => setDraft({ ...draft, date: e.target.value, timeSlotId: undefined, startTime: undefined, endTime: undefined })}
                                        className="w-full p-4 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-xl outline-none text-start text-sm shadow-sm focus:border-secondary text-primary dark:text-slate-100 dark:scheme-dark transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-start text-xs font-bold text-primary dark:text-slate-200 mb-3">{t('survey.exceptions.typeLabel')}</label>
                                    <div className="space-y-3">
                                        <button
                                            onClick={() => setDraft({ ...draft, type: 'full_day', timeSlotId: undefined, startTime: undefined, endTime: undefined })}
                                            className={`w-full p-4 border rounded-2xl flex justify-between items-center transition-all ${draft.type === 'full_day' ? 'border-secondary bg-secondary/5 dark:bg-secondary/10 ring-1 ring-secondary/20' : 'border-gray-100 dark:border-slate-700 hover:border-gray-200 dark:hover:border-slate-600 bg-white dark:bg-slate-900'}`}
                                        >
                                            <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${draft.type === 'full_day' ? 'border-secondary' : 'border-gray-300 dark:border-slate-600'}`}>
                                                {draft.type === 'full_day' && <div className="h-2.5 w-2.5 bg-secondary rounded-full"></div>}
                                            </div>
                                            <div className="text-start">
                                                <h5 className="font-bold text-primary dark:text-slate-200 text-sm">{t('survey.exceptions.types.fullDay')}</h5>
                                                <p className="text-[10px] text-gray-400 dark:text-slate-500">{t('survey.exceptions.fullDayHint')}</p>
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => setDraft({ ...draft, type: 'period' })}
                                            className={`w-full p-4 border rounded-2xl flex justify-between items-center transition-all ${draft.type === 'period' ? 'border-secondary bg-secondary/5 dark:bg-secondary/10 ring-1 ring-secondary/20' : 'border-gray-100 dark:border-slate-700 hover:border-gray-200 dark:hover:border-slate-600 bg-white dark:bg-slate-900'}`}
                                        >
                                            <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${draft.type === 'period' ? 'border-secondary' : 'border-gray-300 dark:border-slate-600'}`}>
                                                {draft.type === 'period' && <div className="h-2.5 w-2.5 bg-secondary rounded-full"></div>}
                                            </div>
                                            <div className="text-start">
                                                <h5 className="font-bold text-primary dark:text-slate-200 text-sm">{t('survey.exceptions.types.period')}</h5>
                                                <p className="text-[10px] text-gray-400 dark:text-slate-500">{t('survey.exceptions.periodHint')}</p>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                {draft.type === 'period' && (
                                    <div className="space-y-3 pt-2">
                                        <label className="block text-start text-[10px] font-bold text-gray-400 dark:text-slate-500 mb-2 uppercase tracking-wide">{t('survey.exceptions.choosePeriod')}</label>
                                        {loadingSchedule ? (
                                            <div className="text-center text-xs text-gray-400 dark:text-slate-500 py-6 animate-pulse">{t('survey.exceptions.loadingSlots')}</div>
                                        ) : availableSlots.length === 0 ? (
                                            <div className="text-center text-xs text-orange-400 dark:text-orange-300 py-6 bg-orange-50/40 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 rounded-xl">
                                                {t('survey.exceptions.noWeeklySlotsForDay')}
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-2 max-h-[150px] overflow-y-auto pe-1">
                                                {availableSlots.map(slot => {
                                                    const start = formatTime(slot.startTime);
                                                    const end = formatTime(slot.endTime);
                                                    const isPicked = draft.timeSlotId === slot.id;
                                                    return (
                                                        <button
                                                            key={slot.id}
                                                            onClick={() => pickSlot(slot)}
                                                            className={`p-3 border rounded-xl text-center transition-all ${isPicked ? 'border-secondary bg-secondary/10 shadow-sm' : 'border-gray-50 dark:border-slate-700 hover:border-gray-100 dark:hover:border-slate-600 bg-white dark:bg-slate-900'}`}
                                                        >
                                                            <span className={`text-sm font-bold ${isPicked ? 'text-secondary' : 'text-primary dark:text-slate-200'}`}>{start}</span>
                                                            <span className="block text-[9px] text-gray-400 dark:text-slate-500">{t('survey.exceptions.slotTo', { end })}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {draft.type === 'full_day' && !loadingSchedule && availableSlots.length === 0 && (
                                    <div className="text-center text-xs text-orange-400 dark:text-orange-300 py-4 bg-orange-50/40 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 rounded-xl">
                                        {t('survey.exceptions.noWeeklySlotsForDay')}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-start text-xs font-bold text-primary dark:text-slate-200 mb-2">{t('survey.exceptions.reasonLabel')}</label>
                                    <input
                                        type="text"
                                        value={draft.reason ?? ''}
                                        onChange={e => setDraft({ ...draft, reason: e.target.value })}
                                        placeholder={t('survey.exceptions.reasonPlaceholder')}
                                        className="w-full p-4 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-xl outline-none text-start text-sm shadow-sm focus:border-secondary text-primary dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 mt-8 pt-6 border-t border-gray-100 dark:border-slate-800">
                                <button
                                    onClick={handleAdd}
                                    disabled={!canAdd}
                                    className={`flex-[2] py-4 rounded-xl font-bold shadow-lg transition-all ${canAdd ? 'bg-primary dark:bg-slate-800 text-white shadow-primary/20 hover:bg-primary/95 dark:hover:bg-slate-700' : 'bg-gray-100 dark:bg-slate-800/50 text-gray-400 dark:text-slate-600 cursor-not-allowed'}`}
                                >
                                    {t('survey.exceptions.addException')}
                                </button>
                                <button
                                    onClick={() => setIsAdding(false)}
                                    className="flex-1 border border-gray-100 dark:border-slate-700 py-4 rounded-xl font-bold text-primary dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all"
                                >
                                    {t('survey.exceptions.cancel')}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center py-20 px-8">
                            <div className="text-9xl mb-8 relative">
                                📝
                                <div className="absolute -bottom-2 -right-2 bg-white dark:bg-slate-800 rounded-full p-2 shadow-md border border-gray-100 dark:border-slate-700">
                                    <div className="w-6 h-6 text-orange-400"><svg fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg></div>
                                </div>
                            </div>
                            <h4 className="text-xl font-bold text-primary dark:text-slate-100 mb-2">{t('survey.exceptions.emptyPanelTitle')}</h4>
                            <p className="text-gray-400 dark:text-slate-500 text-xs leading-relaxed mb-10 px-6">{t('survey.exceptions.emptyPanelHint')}</p>
                            <button
                                onClick={() => { setDraft(EMPTY_DRAFT()); setIsAdding(true); }}
                                className="bg-primary dark:bg-slate-800 text-white px-10 py-4 rounded-xl font-bold flex items-center gap-3 shadow-xl shadow-primary/20 hover:scale-105 dark:hover:bg-slate-700 transition-all"
                            >
                                <span>{t('survey.exceptions.addNew')}</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <button
                onClick={handleContinue}
                disabled={isSubmitting}
                className={`w-full py-5 rounded-[1.25rem] font-bold text-lg transition-all shadow-xl shadow-primary/10 mt-4 flex items-center justify-center gap-3 ${isSubmitting ? 'bg-primary/70 dark:bg-slate-800/70 text-white cursor-not-allowed' : 'bg-primary dark:bg-slate-800 text-white hover:bg-primary/95 dark:hover:bg-slate-700'}`}
            >
                {isSubmitting && <div className="animate-spin h-5 w-5 border-3 border-white/30 border-t-white rounded-full"></div>}
                <span>{isSubmitting ? t('survey.common.saving') : t('survey.common.continue')}</span>
            </button>
        </div>
    );
};

export default ExceptionsSelection;


import React, { useState, useEffect, useMemo } from 'react';
import { FilterResponse, FilterOption, UnitOption } from '../types/types';
import { localStorageCollection } from '@/lib/db/localStorageCollection';
import { useLiveQuery } from '@tanstack/react-db';
import { showToast } from '@/lib/utils/toast';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/lib/hooks/useLocale';

interface QuranSubjectSelectionProps {
    domainId: number | null;
    onContinue: () => void;
}

type UnitTypeCode = 'QuranPart' | 'QuranSurah';

interface UnitSpec {
    contentTypeId: number | null;
    levelId: number | null;
}

const PAGE_SIZE = 30;

const QuranSubjectSelection: React.FC<QuranSubjectSelectionProps> = ({ domainId, onContinue }) => {
    const { t } = useTranslation('teacher');
    const locale = useLocale();
    const isAr = locale === 'ar';
    const { data: sessionData } = useLiveQuery(q => q.from({ session: localStorageCollection }));
    const token = sessionData?.[0]?.token ?? '';

    const [unitTypeCode, setUnitTypeCode] = useState<UnitTypeCode>('QuranPart');
    const [pageNumber, setPageNumber] = useState(1);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [subject, setSubject] = useState<FilterOption | null>(null);
    const [contentTypes, setContentTypes] = useState<FilterOption[]>([]);
    const [levels, setLevels] = useState<FilterOption[]>([]);
    const [units, setUnits] = useState<UnitOption[]>([]);
    const [totalPages, setTotalPages] = useState(1);

    const [isFullSubject, setIsFullSubject] = useState(false);
    // Per-unit specialization, persists across pages and unit-type switches.
    const [specs, setSpecs] = useState<Map<number, UnitSpec>>(new Map());
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        if (!domainId || !token) return;
        const params = new URLSearchParams({
            domainId: String(domainId),
            unitTypeCode,
            pageNumber: String(pageNumber),
            pageSize: String(PAGE_SIZE),
        });
        const url = `${import.meta.env.VITE_API_URL}/Api/V1/Education/filter-options?${params.toString()}`;
        setLoading(true);
        setLoadError(null);
        fetch(url, {
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        })
            .then(async r => {
                const json = (await r.json().catch(() => null)) as (FilterResponse & { message?: string }) | null;
                if (!r.ok || !json || !json.succeeded) {
                    setLoadError(json?.message ?? `Request failed (HTTP ${r.status})`);
                    return;
                }
                const d = json.data as any;
                setSubject(d.subject ?? null);
                setContentTypes(d.contentTypes ?? []);
                setLevels(d.levels ?? []);
                setUnits(d.unit ?? []);
                setTotalPages(d.totalPages ?? 1);
            })
            .catch(e => {
                console.error('Quran filter-options failed:', e);
                setLoadError(t('survey.subject.toasts.connectionErrorMessage'));
            })
            .finally(() => setLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [domainId, token, unitTypeCode, pageNumber]);

    // Prefill specs / full-subject toggle from any existing Quran subjects the teacher has.
    // One-shot — we don't want to clobber edits if the user re-enters the step.
    const [hasPrefilled, setHasPrefilled] = useState(false);
    useEffect(() => {
        if (!token || hasPrefilled) return;
        const load = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/Api/V1/Teacher/TeacherSubject`, {
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                });
                if (!res.ok) return;
                const j = await res.json();
                if (!j.succeeded) return;
                const quranSubjects = (j.data ?? []).filter(
                    (s: any) => typeof s.domainCode === 'string' && s.domainCode.toLowerCase() === 'quran'
                );
                if (quranSubjects.length === 0) return;
                if (quranSubjects.some((s: any) => s.canTeachFullSubject)) {
                    setIsFullSubject(true);
                    return;
                }
                const merged = new Map<number, UnitSpec>();
                for (const qs of quranSubjects) {
                    for (const u of qs.units ?? []) {
                        if (u.unitId == null) continue;
                        merged.set(u.unitId, {
                            contentTypeId: u.quranContentTypeId ?? null,
                            levelId: u.quranLevelId ?? null,
                        });
                    }
                }
                if (merged.size > 0) setSpecs(merged);
            } catch (e) {
                console.error('Quran subject prefill failed:', e);
            } finally {
                setHasPrefilled(true);
            }
        };
        load();
    }, [token, hasPrefilled]);

    const toggleUnit = (unitId: number) => {
        setSpecs(prev => {
            const next = new Map(prev);
            if (next.has(unitId)) {
                next.delete(unitId);
            } else {
                next.set(unitId, { contentTypeId: null, levelId: null });
            }
            return next;
        });
    };

    const setSpec = (unitId: number, patch: Partial<UnitSpec>) => {
        setSpecs(prev => {
            const next = new Map(prev);
            const current = next.get(unitId) ?? { contentTypeId: null, levelId: null };
            next.set(unitId, { ...current, ...patch });
            return next;
        });
    };

    const selectedCount = specs.size;
    const incompleteSpecs = useMemo(
        () => Array.from(specs.values()).filter(s => s.contentTypeId == null || s.levelId == null).length,
        [specs]
    );

    const canSubmit =
        !isSubmitting &&
        subject != null &&
        (isFullSubject || (selectedCount > 0 && incompleteSpecs === 0));

    const handleSubmit = async () => {
        if (!subject || !canSubmit) return;
        setIsSubmitting(true);
        const payload = {
            subjects: [
                {
                    subjectId: subject.id,
                    canTeachFullSubject: isFullSubject,
                    units: isFullSubject
                        ? []
                        : Array.from(specs.entries()).map(([unitId, spec]) => ({
                              unitId,
                              quranContentTypeId: spec.contentTypeId,
                              quranLevelId: spec.levelId,
                          })),
                },
            ],
        };
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/Api/V1/Teacher/TeacherSubject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload),
            });
            const json = await res.json().catch(() => ({}));
            if (!res.ok || !json.succeeded) {
                const isDuplicate = typeof json.message === 'string' && json.message.toLowerCase().includes('duplicate');
                showToast({
                    type: isDuplicate ? 'warning' : 'server',
                    title: isDuplicate
                        ? t('survey.subject.toasts.duplicateTitle')
                        : t('survey.subject.toasts.saveErrorTitle'),
                    message: isDuplicate
                        ? t('survey.subject.toasts.duplicateMessage')
                        : json.message || t('survey.subject.toasts.saveErrorMessage'),
                });
                return;
            }
            onContinue();
        } catch (e) {
            console.error('Quran subject POST failed:', e);
            showToast({
                type: 'server',
                title: t('survey.subject.toasts.connectionErrorTitle'),
                message: t('survey.subject.toasts.connectionErrorMessage'),
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const display = (o: { nameAr: string; nameEn: string }) => (isAr ? o.nameAr : o.nameEn ?? o.nameAr);

    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-10 shadow-2xl w-full max-w-5xl flex flex-col min-h-[750px] transition-colors duration-300">
            <div className="flex flex-col items-center mb-8 text-center">
                <div className="text-primary dark:text-slate-100 text-5xl font-bold mb-2">{t('survey.common.brand')}</div>
                <h2 className="text-2xl font-bold text-primary dark:text-slate-200 mb-1">{t('survey.subject.quran.title')}</h2>
                <p className="text-sm text-gray-400 dark:text-slate-400">{t('survey.subject.quran.subtitle')}</p>
            </div>

            {/* Subject badge */}
            {subject && (
                <div className="mx-auto mb-6 px-5 py-2 rounded-full bg-secondary/10 dark:bg-secondary/20 text-secondary text-sm font-bold border border-secondary/30">
                    {display(subject)}
                </div>
            )}

            {/* Full-subject toggle */}
            <button
                onClick={() => setIsFullSubject(prev => !prev)}
                className={`w-full p-5 border-2 rounded-2xl mb-6 flex justify-between items-center transition-all ${
                    isFullSubject
                        ? 'border-secondary bg-[#F2FAF9] dark:bg-secondary/10'
                        : 'border-gray-50 dark:border-slate-700 bg-white dark:bg-slate-800/50'
                }`}
            >
                <div
                    className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        isFullSubject ? 'bg-secondary border-secondary' : 'border-gray-300 dark:border-slate-500'
                    }`}
                >
                    {isFullSubject && (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M5 13l4 4L19 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    )}
                </div>
                <div className="text-start">
                    <span className="font-bold text-primary dark:text-slate-100 block text-sm">
                        {t('survey.subject.quran.fullSubjectTitle')}
                    </span>
                    <span className="text-[11px] text-gray-400 dark:text-slate-400">
                        {t('survey.subject.quran.fullSubjectHint')}
                    </span>
                </div>
            </button>

            {/* Unit type toggle */}
            <div className={`flex gap-3 mb-6 ${isFullSubject ? 'opacity-40 pointer-events-none' : ''}`}>
                <button
                    onClick={() => { setUnitTypeCode('QuranPart'); setPageNumber(1); }}
                    className={`flex-1 py-3 rounded-xl font-bold text-sm border transition-all ${
                        unitTypeCode === 'QuranPart'
                            ? 'bg-primary text-white border-primary shadow-md'
                            : 'bg-white dark:bg-slate-800 text-primary dark:text-slate-200 border-gray-100 dark:border-slate-700 hover:border-secondary'
                    }`}
                >
                    {t('survey.subject.quran.juz')}
                </button>
                <button
                    onClick={() => { setUnitTypeCode('QuranSurah'); setPageNumber(1); }}
                    className={`flex-1 py-3 rounded-xl font-bold text-sm border transition-all ${
                        unitTypeCode === 'QuranSurah'
                            ? 'bg-primary text-white border-primary shadow-md'
                            : 'bg-white dark:bg-slate-800 text-primary dark:text-slate-200 border-gray-100 dark:border-slate-700 hover:border-secondary'
                    }`}
                >
                    {t('survey.subject.quran.surah')}
                </button>
            </div>

            {/* Status row */}
            <div className={`flex justify-between items-center text-xs mb-4 px-1 ${isFullSubject ? 'opacity-40' : ''}`}>
                <span className="text-gray-400 dark:text-slate-500 font-bold">
                    {t('survey.subject.quran.unitsSelected', { count: selectedCount })}
                </span>
                <span className="text-gray-400 dark:text-slate-500">
                    {t('survey.subject.quran.pageOf', { page: pageNumber, total: totalPages })}
                </span>
            </div>

            {/* Units list */}
            <div className={`grow space-y-3 overflow-y-auto pe-2 mb-6 ${isFullSubject ? 'opacity-30 pointer-events-none' : ''}`}>
                {loading ? (
                    <div className="text-center py-20 text-gray-300 dark:text-slate-500 animate-pulse">
                        {t('survey.subject.quran.loadingUnits')}
                    </div>
                ) : loadError ? (
                    <div className="mx-auto max-w-md text-center py-10 px-6 bg-red-50/60 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl">
                        <p className="text-sm font-bold text-red-500 dark:text-red-300 mb-1">{t('survey.subject.quran.loadErrorTitle')}</p>
                        <p className="text-[11px] text-red-400 dark:text-red-300/80 break-words">{loadError}</p>
                    </div>
                ) : units.length === 0 ? (
                    <div className="text-center py-20 text-gray-300 dark:text-slate-500 italic">
                        {t('survey.subject.quran.noUnits')}
                    </div>
                ) : (
                    units.map(u => {
                        const spec = specs.get(u.id);
                        const isSelected = spec != null;
                        const missingSpec = isSelected && (spec!.contentTypeId == null || spec!.levelId == null);
                        return (
                            <div
                                key={u.id}
                                className={`border rounded-2xl p-4 transition-all ${
                                    isSelected
                                        ? missingSpec
                                            ? 'border-orange-300 bg-orange-50/40 dark:bg-orange-900/10 dark:border-orange-700'
                                            : 'border-secondary bg-secondary/5 dark:bg-secondary/10'
                                        : 'border-gray-50 dark:border-slate-700 bg-white dark:bg-slate-800/40'
                                }`}
                            >
                                <button
                                    onClick={() => toggleUnit(u.id)}
                                    className="w-full flex justify-between items-center"
                                >
                                    <div
                                        className={`h-5 w-5 rounded border flex items-center justify-center transition-all ${
                                            isSelected ? 'bg-secondary border-secondary' : 'border-gray-300 dark:border-slate-500'
                                        }`}
                                    >
                                        {isSelected && (
                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path d="M5 13l4 4L19 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        )}
                                    </div>
                                    <span className="text-sm font-bold text-primary dark:text-slate-100">{display(u)}</span>
                                </button>

                                {isSelected && (
                                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 dark:text-slate-500 mb-1 uppercase">
                                                {t('survey.subject.quran.contentTypeLabel')}
                                            </label>
                                            <select
                                                value={spec!.contentTypeId ?? ''}
                                                onChange={e =>
                                                    setSpec(u.id, { contentTypeId: e.target.value ? Number(e.target.value) : null })
                                                }
                                                className="w-full py-2.5 px-3 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-primary dark:text-slate-100 outline-none focus:border-secondary"
                                            >
                                                <option value="" disabled>
                                                    {t('survey.subject.quran.pickContentType')}
                                                </option>
                                                {contentTypes.map(ct => (
                                                    <option key={ct.id} value={ct.id}>
                                                        {display(ct)}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 dark:text-slate-500 mb-1 uppercase">
                                                {t('survey.subject.quran.levelLabel')}
                                            </label>
                                            <select
                                                value={spec!.levelId ?? ''}
                                                onChange={e =>
                                                    setSpec(u.id, { levelId: e.target.value ? Number(e.target.value) : null })
                                                }
                                                className="w-full py-2.5 px-3 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-primary dark:text-slate-100 outline-none focus:border-secondary"
                                            >
                                                <option value="" disabled>
                                                    {t('survey.subject.quran.pickLevel')}
                                                </option>
                                                {levels.map(lv => (
                                                    <option key={lv.id} value={lv.id}>
                                                        {display(lv)}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Pagination */}
            {!isFullSubject && totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mb-6">
                    <button
                        disabled={pageNumber <= 1}
                        onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                        className={`px-3 py-1.5 rounded-lg border text-sm font-bold transition-all ${
                            pageNumber <= 1
                                ? 'text-gray-300 dark:text-slate-700 border-gray-100 dark:border-slate-800 cursor-not-allowed'
                                : 'text-primary dark:text-slate-100 border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800'
                        }`}
                    >
                        ‹
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                        <button
                            key={p}
                            onClick={() => setPageNumber(p)}
                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                                p === pageNumber
                                    ? 'bg-secondary text-white'
                                    : 'bg-gray-50 dark:bg-slate-800 text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-700'
                            }`}
                        >
                            {p}
                        </button>
                    ))}
                    <button
                        disabled={pageNumber >= totalPages}
                        onClick={() => setPageNumber(p => Math.min(totalPages, p + 1))}
                        className={`px-3 py-1.5 rounded-lg border text-sm font-bold transition-all ${
                            pageNumber >= totalPages
                                ? 'text-gray-300 dark:text-slate-700 border-gray-100 dark:border-slate-800 cursor-not-allowed'
                                : 'text-primary dark:text-slate-100 border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800'
                        }`}
                    >
                        ›
                    </button>
                </div>
            )}

            {/* Inline warning if missing specs */}
            {!isFullSubject && selectedCount > 0 && incompleteSpecs > 0 && (
                <div className="mb-4 text-center text-xs text-orange-500 dark:text-orange-300 bg-orange-50/40 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 rounded-xl py-3 px-4">
                    {t('survey.subject.quran.missingSpec', { count: incompleteSpecs })}
                </div>
            )}

            <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={`w-full py-5 rounded-2xl font-bold text-xl shadow-2xl transition-all flex items-center justify-center gap-3 ${
                    canSubmit
                        ? 'bg-primary text-white hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90'
                        : 'bg-primary text-white/40 cursor-not-allowed opacity-70'
                }`}
            >
                {isSubmitting && (
                    <div className="animate-spin h-6 w-6 border-3 border-white/30 border-t-white rounded-full"></div>
                )}
                <span>{isSubmitting ? t('survey.common.saving') : t('survey.common.continue')}</span>
            </button>
        </div>
    );
};

export default QuranSubjectSelection;

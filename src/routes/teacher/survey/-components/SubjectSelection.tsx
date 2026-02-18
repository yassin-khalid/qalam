
import React, { useState, useEffect } from 'react';
import { Group, SubjectDetails, FilterOption, UnitOption, FilterResponse } from '../types/types';
import { localStorageCollection } from '@/lib/db/localStorageCollection';
import { useLiveQuery } from '@tanstack/react-db';

interface SubjectSelectionProps {
    domainId: number | null;
    groups: Group[];
    onSetGroups: (groups: Group[]) => void;
    onContinue: () => void;
}

// Robust mock data for fallback when API fails or returns empty
const MOCK_DATA: Record<string, FilterOption[]> = {
    curriculums: [
        { id: 1, nameAr: "منهج سعودي", nameEn: "Saudi Curriculum", code: "saudi" },
        { id: 2, nameAr: "منهج مصري", nameEn: "Egyptian Curriculum", code: "egypt" },
        { id: 3, nameAr: "منهج دولي", nameEn: "International Curriculum", code: "intl" }
    ],
    levels: [
        { id: 1, nameAr: "ابتدائي", nameEn: "Elementary", code: "primary" },
        { id: 2, nameAr: "متوسط", nameEn: "Middle School", code: "middle" },
        { id: 3, nameAr: "ثانوي", nameEn: "High School", code: "high" }
    ],
    grades: [
        { id: 1, nameAr: "الأول", nameEn: "First", code: "1" },
        { id: 2, nameAr: "الثاني", nameEn: "Second", code: "2" },
        { id: 3, nameAr: "الثالث", nameEn: "Third", code: "3" }
    ],
    subjects: [
        { id: 1, nameAr: "رياضيات", nameEn: "Math", code: "math" },
        { id: 2, nameAr: "لغة عربية", nameEn: "Arabic", code: "arabic" },
        { id: 3, nameAr: "علوم", nameEn: "Science", code: "science" }
    ],
    units: [
        { id: 1, nameAr: "الأعداد", nameEn: "Numbers", code: "u1" },
        { id: 2, nameAr: "الجبر", nameEn: "Algebra", code: "u2" },
        { id: 3, nameAr: "الهندسة", nameEn: "Geometry", code: "u3" },
        { id: 4, nameAr: "الإحصاء", nameEn: "Statistics", code: "u4" }
    ]
};

const fetchFilterOptions = async (params: Record<string, any>, token: string) => {
    const { DomainId, CurriculumId, LevelId, GradeId, SubjectId, TermIds, PageNumber = 1, PageSize = 10, search = '' } = params;

    const query = new URLSearchParams();
    if (DomainId) query.append('DomainId', String(DomainId));
    if (CurriculumId) query.append('CurriculumId', String(CurriculumId));
    if (LevelId) query.append('LevelId', String(LevelId));
    if (GradeId) query.append('GradeId', String(GradeId));
    if (SubjectId) query.append('SubjectId', String(SubjectId));
    if (PageNumber) query.append('PageNumber', String(PageNumber));
    if (PageSize) query.append('PageSize', String(PageSize));
    if (search) query.append('search', search);

    if (Array.isArray(TermIds)) {
        TermIds.forEach(id => query.append('TermIds', String(id)));
    }

    // const urls = [
    //     `https://qalam.runasp.net/Api/V1/Teaching/FilterOptions?${query.toString()}`,
    //     `https://qalam.runasp.net/filter-options?${query.toString()}`,
    //     `http://qalam.runasp.net/filter-options?${query.toString()}`
    // ];

    const url = `${import.meta.env.VITE_API_URL}/filter-options?${query.toString()}`;
    // for (const url of urls) {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (response.ok) {
            const json = await response.json();
            if (json.succeeded && json.data.options && json.data.options.length > 0) return json as FilterResponse;
        }
    } catch (e) {
        console.error("Error fetching filter options:", e)
    }
    // }

    // await new Promise(r => setTimeout(r, 400));
    // let options = MOCK_DATA.curriculums;
    // if (CurriculumId) options = MOCK_DATA.levels;
    // if (LevelId) options = MOCK_DATA.grades;
    // if (GradeId) options = MOCK_DATA.subjects;

    // return {
    //     statusCode: 200, succeeded: true, message: "Fallback Success",
    //     data: {
    //         currentState: { domainId: DomainId, curriculumId: CurriculumId, levelId: LevelId, gradeId: GradeId, termIds: TermIds || null, subjectId: SubjectId || null },
    //         rule: { hasCurriculum: true, hasEducationLevel: true, hasGrade: true, hasAcademicTerm: true, hasContentUnits: true, hasLessons: true },
    //         nextStep: "Mock", options: options, unit: MOCK_DATA.units as UnitOption[], totalCount: options.length, pageNumber: 1, pageSize: 10, totalPages: 1
    //     }
    // };
};

const SubjectSelection: React.FC<SubjectSelectionProps> = ({ domainId, groups, onSetGroups, onContinue }) => {
    const [isAddingGroup, setIsAddingGroup] = useState(false);
    const [isAddingSubjects, setIsAddingSubjects] = useState(false);
    const [activeGroupIdx, setActiveGroupIdx] = useState<number | null>(null);
    const [unitFlow, setUnitFlow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { data } = useLiveQuery(q => q.from({ session: localStorageCollection }))

    const token = data?.[0]?.token ?? "";


    // Form State
    const [curriculums, setCurriculums] = useState<FilterOption[]>([]);
    const [levels, setLevels] = useState<FilterOption[]>([]);
    const [grades, setGrades] = useState<FilterOption[]>([]);
    const [newGroup, setNewGroup] = useState<Partial<Group>>({ name: '' });

    // List State
    const [subjects, setSubjects] = useState<any[]>([]);
    const [subjectSearch, setSubjectSearch] = useState('');
    const [units, setUnits] = useState<UnitOption[]>([]);
    const [activeSubject, setActiveSubject] = useState<any>(null);
    const [selectedUnitIds, setSelectedUnitIds] = useState<number[]>([]);
    const [isFullSubject, setIsFullSubject] = useState(false);

    useEffect(() => {
        if (isAddingGroup && domainId) {
            setLoading(true);
            fetchFilterOptions({ DomainId: domainId }, token).then(res => {
                setCurriculums(res?.data.options || []);
                setLoading(false);
            });
        }
    }, [isAddingGroup, domainId]);

    const handleCurriculumChange = (id: number) => {
        const cur = curriculums.find(c => c.id === id);
        setNewGroup({ ...newGroup, curriculumId: id, curriculum: cur?.nameAr || '' });
        setLoading(true);
        fetchFilterOptions({ DomainId: domainId, CurriculumId: id }, token).then(res => {
            setLevels(res?.data.options || []);
            setLoading(false);
        });
    };

    const handleLevelChange = (id: number) => {
        const lvl = levels.find(l => l.id === id);
        setNewGroup({ ...newGroup, levelId: id, stage: lvl?.nameAr || '' });
        setLoading(true);
        fetchFilterOptions({ DomainId: domainId, CurriculumId: newGroup.curriculumId, LevelId: id }, token).then(res => {
            setGrades(res?.data.options || []);
            setLoading(false);
        });
    };

    const handleSaveGroup = () => {
        if (!newGroup.name || !newGroup.curriculumId || !newGroup.levelId || !newGroup.gradeId) {
            alert("يرجى إكمال جميع الحقول");
            return;
        }
        const grade = grades.find(g => g.id === newGroup.gradeId);
        const finalGroup: Group = {
            id: Date.now().toString(),
            name: newGroup.name!,
            curriculum: newGroup.curriculum!,
            curriculumId: newGroup.curriculumId,
            stage: newGroup.stage!,
            levelId: newGroup.levelId,
            level: grade?.nameAr || '',
            gradeId: newGroup.gradeId,
            subjects: []
        };
        onSetGroups([...groups, finalGroup]);
        setIsAddingGroup(false);
        setNewGroup({ name: '' });
    };

    const fetchGroupSubjects = (idx: number) => {
        const g = groups[idx];
        setLoading(true);
        fetchFilterOptions({
            DomainId: domainId, CurriculumId: g.curriculumId, LevelId: g.levelId, GradeId: g.gradeId,
            search: subjectSearch, PageSize: 20
        }, token).then(res => {
            setSubjects(res?.data.options || []);
            setLoading(false);
        });
    };

    const startUnitFlow = async (subject: any) => {
        setLoading(true);
        setActiveSubject(subject);
        const g = groups[activeGroupIdx!];
        const unitRes = await fetchFilterOptions({ DomainId: domainId, CurriculumId: g.curriculumId, LevelId: g.levelId, GradeId: g.gradeId, SubjectId: subject.id, PageSize: 30 }, token);
        setUnits(unitRes?.data.unit || MOCK_DATA.units as UnitOption[]);
        const existing = g.subjects?.find(s => s.id === subject.id);
        setIsFullSubject(existing?.isFull || false);
        setSelectedUnitIds(existing?.unitIds || []);
        setUnitFlow(true);
        setLoading(false);
    };

    const saveSubjectUnits = () => {
        const updated = [...groups];
        const g = updated[activeGroupIdx!];
        const chosenUnitNames = isFullSubject ? ["كافة الوحدات"] : units.filter(u => selectedUnitIds.includes(u.id)).map(u => u.nameAr);
        const subDetails: SubjectDetails = { id: activeSubject.id, name: activeSubject.nameAr, isFull: isFullSubject, units: chosenUnitNames, unitIds: isFullSubject ? [] : selectedUnitIds };
        g.subjects = [...(g.subjects || []).filter(s => s.id !== activeSubject.id), subDetails];
        onSetGroups(updated);
        setUnitFlow(false);
    };

    const handleFinalContinue = async () => {
        setIsSubmitting(true);
        const payload = {
            subjects: groups.flatMap(g => (g.subjects || []).map(s => {
                const subObj: any = { subjectId: s.id, canTeachFullSubject: s.isFull };
                if (!s.isFull && s.unitIds) {
                    subObj.units = s.unitIds.map(uId => ({ unitId: uId, quranContentTypeId: 1, quranLevelId: null }));
                }
                return subObj;
            }))
        };
        try {
            await fetch("http://qalam.runasp.net/Api/V1/Teacher/TeacherSubject", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            onContinue();
        } catch (error) {
            console.error("Subject submission failed:", error);
            // onContinue();
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-10 shadow-2xl w-full max-w-7xl overflow-hidden flex flex-col min-h-[750px] transition-colors duration-300">
            {/* Design Header */}
            <div className="flex flex-col items-center mb-10">
                <div className="relative mb-2">
                    <div className="text-primary dark:text-slate-100 text-6xl font-bold flex flex-col items-center">
                        <span className="leading-tight">قلم</span>
                        <div className="h-1.5 w-16 bg-secondary mt-1 rounded-full opacity-40"></div>
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-primary dark:text-slate-100 mb-1">إنشاء حساب مُعلم</h2>
                <h3 className="text-xl font-bold text-primary dark:text-slate-200 opacity-80 mt-2">المواد الدراسية</h3>
            </div>

            <div className="grow flex flex-col overflow-hidden">
                {groups.length === 0 && !isAddingGroup ? (
                    <div className="grow flex flex-col items-center justify-center">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-5xl">
                            <div className="border border-blue-50 dark:border-slate-700 rounded-4xl p-16 flex flex-col items-center text-center bg-white dark:bg-slate-800/50 shadow-sm hover:shadow-md transition-all">
                                <div className="text-8xl mb-8">📋</div>
                                <h4 className="text-2xl font-bold text-primary dark:text-slate-100 mb-4">ابدأ بإضافة مجموعة</h4>
                                <p className="text-gray-400 dark:text-slate-400 text-base leading-relaxed">اضغط على زر "إضافة مجموعة جديدة" لبدء إنشاء مجموعاتك التعليمية</p>
                            </div>

                            <div className="border border-blue-50 dark:border-slate-700 rounded-4xl p-16 flex flex-col items-center text-center bg-white dark:bg-slate-800/50 shadow-sm hover:shadow-md transition-all">
                                <div className="text-8xl mb-8">📚</div>
                                <h4 className="text-2xl font-bold text-primary dark:text-slate-100 mb-4">لا توجد مجموعات حتى الآن</h4>
                                <p className="text-gray-400 dark:text-slate-400 text-base mb-10 leading-relaxed">ابدأ بإضافة مجموعة جديدة لتحديد المواد التي تدرسها</p>
                                <button
                                    onClick={() => setIsAddingGroup(true)}
                                    className="bg-primary text-white px-12 py-4 rounded-xl font-bold text-base flex items-center gap-2 hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90 transition-all shadow-xl"
                                >
                                    <span>+ إضافة مجموعة جديدة</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grow grid grid-cols-1 lg:grid-cols-12 gap-8 overflow-hidden px-2">
                        {/* LEFT Column: FORM or UNIT SELECTION */}
                        <div className={`lg:col-span-5 flex flex-col ${isAddingGroup || isAddingSubjects ? 'block' : 'hidden lg:block'}`}>
                            {isAddingGroup ? (
                                <div className="bg-white dark:bg-slate-800/80 border border-blue-100 dark:border-slate-600 p-8 rounded-[2rem] shadow-sm relative h-full flex flex-col animate-fade-in">
                                    <button onClick={() => setIsAddingGroup(false)} className="absolute top-8 left-8 text-gray-400 dark:text-slate-400 hover:text-primary dark:hover:text-secondary transition-colors">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                    </button>

                                    <div className="text-right mb-10">
                                        <h4 className="text-2xl font-bold text-primary dark:text-slate-100 mb-2">إضافة مجموعة جديدة</h4>
                                        <p className="text-sm text-gray-400 dark:text-slate-400">املأ البيانات التالية لإنشاء مجموعة تعليمية</p>
                                    </div>

                                    <div className="space-y-6 grow overflow-y-auto pr-1">
                                        <div className="text-right">
                                            <label className="block text-sm font-bold text-primary dark:text-slate-200 mb-3">اسم المجموعة *</label>
                                            <input
                                                type="text"
                                                placeholder="مثال: رياضيات المرحلة الابتدائية"
                                                value={newGroup.name}
                                                onChange={e => setNewGroup({ ...newGroup, name: e.target.value })}
                                                className="w-full py-5 px-6 bg-[#F9FBFC] dark:bg-slate-700/50 border border-gray-100 dark:border-slate-600 rounded-2xl text-right text-base outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-secondary transition-all text-primary dark:text-slate-100 placeholder:dark:text-slate-400"
                                            />
                                        </div>
                                        <div className="text-right">
                                            <label className="block text-sm font-bold text-primary dark:text-slate-200 mb-3">المنهج *</label>
                                            <select
                                                value={newGroup.curriculumId || ''}
                                                onChange={e => handleCurriculumChange(Number(e.target.value))}
                                                className="w-full py-5 px-6 bg-[#F9FBFC] dark:bg-slate-700/50 border border-gray-100 dark:border-slate-600 rounded-2xl text-right text-base outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-secondary appearance-none transition-all cursor-pointer text-primary dark:text-slate-100"
                                            >
                                                <option value="" disabled>اختر المنهج...</option>
                                                {curriculums.map(c => <option key={c.id} value={c.id}>{c.nameAr}</option>)}
                                            </select>
                                        </div>
                                        <div className="text-right">
                                            <label className="block text-sm font-bold text-primary dark:text-slate-200 mb-3">المرحلة *</label>
                                            <select
                                                value={newGroup.levelId || ''}
                                                onChange={e => handleLevelChange(Number(e.target.value))}
                                                disabled={!newGroup.curriculumId}
                                                className="w-full py-5 px-6 bg-[#F9FBFC] dark:bg-slate-700/50 border border-gray-100 dark:border-slate-600 rounded-2xl text-right text-base outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-secondary appearance-none transition-all disabled:opacity-40 cursor-pointer text-primary dark:text-slate-100"
                                            >
                                                <option value="" disabled>اختر المرحلة...</option>
                                                {levels.map(l => <option key={l.id} value={l.id}>{l.nameAr}</option>)}
                                            </select>
                                        </div>
                                        <div className="text-right">
                                            <label className="block text-sm font-bold text-primary dark:text-slate-200 mb-3">الصف / المستوى *</label>
                                            <select
                                                value={newGroup.gradeId || ''}
                                                onChange={e => setNewGroup({ ...newGroup, gradeId: Number(e.target.value) })}
                                                disabled={!newGroup.levelId}
                                                className="w-full py-5 px-6 bg-[#F3F9FF] dark:bg-slate-700/50 border border-blue-100 dark:border-slate-600 rounded-2xl text-right text-base outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-secondary appearance-none transition-all disabled:opacity-40 cursor-pointer text-primary dark:text-slate-100"
                                            >
                                                <option value="" disabled>اختر الصف...</option>
                                                {grades.map(g => <option key={g.id} value={g.id}>{g.nameAr}</option>)}
                                            </select>
                                            {!newGroup.levelId && <p className="text-xs text-gray-400 dark:text-slate-500 mt-2">اختر المرحلة أولاً</p>}
                                        </div>
                                    </div>

                                    <div className="flex gap-4 mt-10">
                                        <button onClick={handleSaveGroup} className="flex-1 bg-primary text-white py-5 rounded-xl font-bold hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90 transition-all text-base shadow-lg">حفظ</button>
                                        <button onClick={() => setIsAddingGroup(false)} className="flex-1 border border-gray-200 dark:border-slate-600 py-5 rounded-xl font-bold text-primary dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all text-base">إلغاء</button>
                                    </div>
                                </div>
                            ) : isAddingSubjects ? (
                                <div className="bg-white dark:bg-slate-800/80 border border-blue-100 dark:border-slate-600 p-8 rounded-[2rem] shadow-sm relative h-full flex flex-col animate-fade-in">
                                    <button onClick={() => { setIsAddingSubjects(false); setUnitFlow(false); }} className="absolute top-8 left-8 text-gray-400 dark:text-slate-400 hover:text-primary dark:hover:text-secondary transition-colors">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                    </button>

                                    <div className="text-right mb-6">
                                        <h4 className="text-2xl font-bold text-primary dark:text-slate-100 mb-1">{unitFlow ? activeSubject?.nameAr : 'اختر المواد الدراسية'}</h4>
                                        <p className="text-sm text-gray-400 dark:text-slate-400">{unitFlow ? 'اختر الوحدات أو المادة كاملة' : 'اختر المواد التي تدرسها لهذه المجموعة'}</p>
                                    </div>

                                    {unitFlow ? (
                                        <div className="grow flex flex-col overflow-hidden">
                                            {/* Whole Subject Toggle Card */}
                                            <button
                                                onClick={() => {
                                                    setIsFullSubject(!isFullSubject);
                                                    if (!isFullSubject) setSelectedUnitIds([]);
                                                }}
                                                className={`w-full p-5 border-2 rounded-2xl mb-4 flex justify-between items-center transition-all ${isFullSubject ? 'border-secondary bg-[#F2FAF9] dark:bg-secondary/10' : 'border-gray-50 dark:border-slate-600 bg-white dark:bg-slate-700/50'}`}
                                            >
                                                <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${isFullSubject ? 'bg-secondary border-secondary' : 'border-gray-300 dark:border-slate-500'}`}>
                                                    {isFullSubject && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                                                </div>
                                                <div className="text-right">
                                                    <span className="font-bold text-primary dark:text-slate-100 block text-sm">المادة كاملة</span>
                                                    <span className="text-[11px] text-gray-400 dark:text-slate-400">تدريس جميع الوحدات ({units.length} وحدة)</span>
                                                </div>
                                            </button>

                                            {/* Separator */}
                                            <div className="relative flex items-center justify-center my-6">
                                                <div className="w-full border-t border-gray-100 dark:border-slate-600"></div>
                                                <span className="absolute px-4 bg-white dark:bg-slate-800 text-[10px] text-gray-400 dark:text-slate-500 font-bold">أو اختر وحدات محددة</span>
                                            </div>

                                            {/* Units List */}
                                            <div className="grow space-y-3 overflow-y-auto pr-2 custom-scrollbar pb-4">
                                                {loading ? <div className="text-center py-12 animate-pulse text-gray-300 dark:text-slate-500">جاري تحميل الوحدات...</div> : units.map(u => {
                                                    const isSelected = selectedUnitIds.includes(u.id);
                                                    return (
                                                        <button
                                                            key={u.id}
                                                            disabled={isFullSubject}
                                                            onClick={() => setSelectedUnitIds(prev => prev.includes(u.id) ? prev.filter(id => id !== u.id) : [...prev, u.id])}
                                                            className={`w-full p-5 border rounded-2xl flex justify-between items-center transition-all ${isFullSubject ? 'opacity-30' : isSelected ? 'border-secondary bg-white dark:bg-slate-700 shadow-sm' : 'border-gray-50 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
                                                        >
                                                            <div className={`h-5 w-5 rounded border flex items-center justify-center transition-all ${isSelected ? 'bg-secondary border-secondary' : 'border-gray-300 dark:border-slate-500'}`}>
                                                                {isSelected && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                                                            </div>
                                                            <span className="text-sm font-bold text-primary dark:text-slate-100">{u.nameAr}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {/* Unit Flow Footer Buttons */}
                                            <div className="flex gap-4 mt-6 pt-6 border-t border-gray-50 dark:border-slate-600">
                                                <button
                                                    onClick={saveSubjectUnits}
                                                    disabled={!isFullSubject && selectedUnitIds.length === 0}
                                                    className="flex-2 bg-primary text-white py-4.5 rounded-xl font-bold hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90 transition-all text-base shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    حفظ ({isFullSubject ? units.length : selectedUnitIds.length})
                                                </button>
                                                <button
                                                    onClick={() => setUnitFlow(false)}
                                                    className="flex-1 border border-gray-200 dark:border-slate-600 py-4.5 rounded-xl font-bold text-primary dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all text-base"
                                                >
                                                    رجوع
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grow flex flex-col overflow-hidden">
                                            <div className="mb-6 relative">
                                                <input type="text" placeholder="ابحث عن مادة..." value={subjectSearch} onChange={e => { setSubjectSearch(e.target.value); }} className="w-full py-5 px-6 bg-gray-50 dark:bg-slate-700/50 border border-transparent dark:border-slate-600 rounded-2xl text-right text-base outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-secondary transition-all pr-14 text-primary dark:text-slate-100 placeholder:dark:text-slate-400" />
                                                <svg className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-300 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                            </div>
                                            <div className="grow space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                                                {loading ? <div className="text-center py-20 text-gray-300 dark:text-slate-500 animate-pulse text-lg">جاري تحميل المواد...</div> : subjects.map(s => {
                                                    const isPicked = groups[activeGroupIdx!]?.subjects?.some(ps => ps.id === s.id);
                                                    return (
                                                        <button key={s.id} onClick={() => startUnitFlow(s)} className={`w-full p-6 border rounded-[1.5rem] flex justify-between items-center transition-all bg-white dark:bg-slate-700/50 hover:border-secondary/30 hover:shadow-md dark:hover:border-secondary/40 ${isPicked ? 'border-secondary ring-1 ring-secondary/20 bg-secondary/5 dark:bg-secondary/10' : 'border-gray-50 dark:border-slate-600'}`}>
                                                            <div className="text-right flex-1">
                                                                <h5 className="font-bold text-primary dark:text-slate-100 text-lg mb-1">{s.nameAr}</h5>
                                                                <p className="text-sm text-gray-400 dark:text-slate-400 line-clamp-1">{s.descriptionAr}</p>
                                                            </div>
                                                            {isPicked && <div className="bg-secondary text-white rounded-full p-1.5 ml-4"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg></div>}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            <button onClick={() => setIsAddingSubjects(false)} className="w-full bg-primary text-white py-5 rounded-xl font-bold mt-8 shadow-xl hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90">تم الاختيار</button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-slate-800/50 border border-dashed border-gray-100 dark:border-slate-600 p-16 rounded-[2rem] flex flex-col items-center justify-center text-center opacity-40 h-full">
                                    <div className="text-8xl mb-8">🏠</div>
                                    <h4 className="text-2xl font-bold text-primary dark:text-slate-200 mb-3">إدارة المجموعة</h4>
                                    <p className="text-sm text-gray-400 dark:text-slate-500 leading-relaxed px-10">اختر مجموعة من القائمة لبدء تعديل بياناتها أو إضافة مواد لها</p>
                                </div>
                            )}
                        </div>

                        {/* RIGHT Column: GROUPS LIST */}
                        <div className="lg:col-span-7 flex flex-col overflow-hidden">
                            <div className="flex justify-between items-center mb-8 px-2">
                                <button onClick={() => setIsAddingGroup(true)} className="text-secondary font-bold text-sm flex items-center gap-2 hover:underline">
                                    <span className="text-lg">+</span>
                                    <span>إضافة مجموعة أخرى</span>
                                </button>
                                <h4 className="text-primary dark:text-slate-100 font-bold text-xl">المجموعات الحالية</h4>
                            </div>

                            <div className="grow overflow-y-auto pr-3 custom-scrollbar space-y-6">
                                {groups.map((g, idx) => {
                                    const hasSubjects = g.subjects && g.subjects.length > 0;
                                    return (
                                        <div key={g.id} className="bg-white dark:bg-slate-800/80 border border-blue-100 dark:border-slate-600 rounded-[2rem] p-8 shadow-sm flex flex-col hover:shadow-md transition-all relative">
                                            <div className="flex justify-between items-start mb-8">
                                                <div className="flex items-center gap-4">
                                                    <button onClick={() => onSetGroups(groups.filter(item => item.id !== g.id))} className="text-red-200 dark:text-red-400/70 hover:text-red-500 dark:hover:text-red-400 transition-colors p-2">
                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                                    </button>
                                                    <button className="text-secondary hover:text-secondary/80 p-2">
                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="flex flex-wrap gap-2 justify-end">
                                                        <span className="bg-blue-50 dark:bg-secondary/10 text-secondary text-[11px] font-bold px-4 py-1.5 rounded-full border border-blue-100 dark:border-secondary/30">{g.level}</span>
                                                        <span className="bg-blue-50 dark:bg-secondary/10 text-secondary text-[11px] font-bold px-4 py-1.5 rounded-full border border-blue-100 dark:border-secondary/30">{g.stage}</span>
                                                        <span className="bg-blue-50 dark:bg-secondary/10 text-secondary text-[11px] font-bold px-4 py-1.5 rounded-full border border-blue-100 dark:border-secondary/30">{g.curriculum}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <h4 className="font-bold text-primary dark:text-slate-100 text-xl">{g.name}</h4>
                                                        <div className="w-9 h-9 bg-secondary text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md shadow-secondary/20">{idx + 1}</div>
                                                    </div>
                                                </div>
                                            </div>

                                            {hasSubjects ? (
                                                <div className="space-y-4">
                                                    {g.subjects?.map(s => (
                                                        <div key={s.id} className="flex justify-between items-center bg-gray-50/40 dark:bg-slate-700/40 border border-gray-50 dark:border-slate-600 px-5 py-3.5 rounded-2xl group transition-all">
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {s.units.map(u => <span key={u} className="bg-blue-100/40 dark:bg-secondary/20 text-secondary text-[11px] font-bold px-3 py-1 rounded-lg">{u}</span>)}
                                                            </div>
                                                            <span className="text-base font-bold text-primary dark:text-slate-100">{s.name}</span>
                                                        </div>
                                                    ))}
                                                    <button onClick={() => { setActiveGroupIdx(idx); setIsAddingSubjects(true); fetchGroupSubjects(idx); }} className="w-full py-5 mt-6 border border-dashed border-secondary/20 dark:border-secondary/40 rounded-xl text-secondary text-sm font-bold hover:bg-secondary/5 dark:hover:bg-secondary/10 transition-colors">+ إضافة مواد أخرى</button>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-12 bg-gray-50/20 dark:bg-slate-700/30 rounded-[2rem] border border-dashed border-gray-100 dark:border-slate-600 text-center">
                                                    <p className="text-gray-400 dark:text-slate-400 text-base mb-8">لم تقم بإضافة مواد لهذه المجموعة بعد</p>
                                                    <button
                                                        onClick={() => { setActiveGroupIdx(idx); setIsAddingSubjects(true); fetchGroupSubjects(idx); }}
                                                        className="bg-primary text-white px-12 py-4 rounded-xl font-bold text-base flex items-center gap-2 shadow-xl hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90 transition-all"
                                                    >
                                                        <span>+ إضافة مواد</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Main Footer Button */}
            <div className="mt-10 px-2">
                <button
                    onClick={handleFinalContinue}
                    disabled={isSubmitting || groups.length === 0 || !groups.some(g => g.subjects && g.subjects.length > 0)}
                    className={`w-full py-5 rounded-2xl font-bold text-xl shadow-2xl transition-all flex items-center justify-center gap-4 ${groups.length > 0 && groups.some(g => g.subjects && g.subjects.length > 0) && !isSubmitting ? 'bg-primary text-white hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90' : 'bg-primary text-white/40 cursor-not-allowed opacity-80 dark:opacity-60'}`}
                >
                    {isSubmitting && <div className="animate-spin h-6 w-6 border-3 border-white/30 border-t-white rounded-full"></div>}
                    <span>متابعة</span>
                </button>
            </div>

            <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 20px; }
        .animate-fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
        </div>
    );
};

export default SubjectSelection;

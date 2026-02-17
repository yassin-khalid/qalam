
import React, { useState, useEffect } from 'react';
import { DomainFromServer, DomainOption } from '../types/types';
import DomainCard from './DomainCard';
import { useQuery } from "@tanstack/react-query";
import { useLiveQuery, } from '@tanstack/react-db';
import { localStorageCollection } from '@/lib/db/localStorageCollection';

interface DomainSelectionProps {
    selectedDomainId: number | null;
    onSelectDomain: (id: number, name: string) => void;
    onContinue: () => void;
}

const ALL_MOCK_ITEMS: DomainFromServer[] = [
    { "id": 1, "nameAr": "تعليم مدرسي", "nameEn": "School Education", "code": "school", "descriptionAr": "التعليم المدرسي الأكاديمي", "descriptionEn": "Academic school education", "createdAt": "2026-02-02" },
    { "id": 2, "nameAr": "قرآن كريم", "nameEn": "Quran", "code": "quran", "descriptionAr": "تعليم القرآن الكريم حفظاً وتلاوة", "descriptionEn": "Quran education", "createdAt": "2026-02-02" },
    { "id": 3, "nameAr": "لغات", "nameEn": "Languages", "code": "language", "descriptionAr": "تعليم اللغات الأجنبية", "descriptionEn": "Foreign languages", "createdAt": "2026-02-02" },
    { "id": 4, "nameAr": "مهارات عامة", "nameEn": "General Skills", "code": "skills", "descriptionAr": "المهارات الحياتية والمهنية", "descriptionEn": "Life skills", "createdAt": "2026-02-02" },
    { "id": 5, "nameAr": "تعليم جامعي", "nameEn": "University Education", "code": "university", "descriptionAr": "التعليم العالي", "descriptionEn": "Higher education", "createdAt": "2026-02-02" },
    { "id": 6, "nameAr": "تربية موسيقية", "nameEn": "Music Education", "code": "music", "descriptionAr": "تعليم الموسيقى", "descriptionEn": "Music education", "createdAt": "2026-02-02" },
    { "id": 7, "nameAr": "فنون بصرية", "nameEn": "Visual Arts", "code": "art", "descriptionAr": "الرسم والتصميم", "descriptionEn": "Drawing and design", "createdAt": "2026-02-02" },
    { "id": 8, "nameAr": "تربية بدنية", "nameEn": "Physical Education", "code": "pe", "descriptionAr": "الرياضة والصحة", "descriptionEn": "Sports and health", "createdAt": "2026-02-02" },
    { "id": 9, "nameAr": "علوم الحاسب", "nameEn": "Computer Science", "code": "cs", "descriptionAr": "البرمجة والتقنية", "descriptionEn": "Programming", "createdAt": "2026-02-02" },
    { "id": 10, "nameAr": "تربية خاصة", "nameEn": "Special Education", "code": "special", "descriptionAr": "تعليم ذوي الاحتياجات", "descriptionEn": "Special needs education", "createdAt": "2026-02-02" },
    { "id": 11, "nameAr": "تدريب مهني", "nameEn": "Vocational Training", "code": "pro", "descriptionAr": "التدريب على المهن", "descriptionEn": "Job training", "createdAt": "2026-02-02" },
    { "id": 12, "nameAr": "تعليم الكبار", "nameEn": "Adult Education", "code": "adult", "descriptionAr": "محو الأمية وتعليم الكبار", "descriptionEn": "Adult literacy", "createdAt": "2026-02-02" },
    { "id": 13, "nameAr": "الطفولة المبكرة", "nameEn": "Early Childhood", "code": "early", "descriptionAr": "تعليم رياض الأطفال", "descriptionEn": "Kindergarten", "createdAt": "2026-02-02" },
    { "id": 14, "nameAr": "تعليم STEM", "nameEn": "STEM Education", "code": "stem", "descriptionAr": "العلوم والتكنولوجيا والهندسة", "descriptionEn": "STEM", "createdAt": "2026-02-02" },
    { "id": 15, "nameAr": "الذكاء الاصطناعي", "nameEn": "AI Education", "code": "ai", "descriptionAr": "المستقبل والتقنيات الناشئة", "descriptionEn": "AI and future tech", "createdAt": "2026-02-02" }
];

const DomainSelection: React.FC<DomainSelectionProps> = ({
    selectedDomainId,
    onSelectDomain,
    onContinue
}) => {
    // const [domains, setDomains] = useState<DomainOption[]>([]);
    // const [loading, setLoading] = useState(true);
    // const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize] = useState(6);
    const [totalPages, setTotalPages] = useState(1);

    const { data: currentSession } = useLiveQuery(q => q.from({ session: localStorageCollection }))

    // useEffect(() => {
    //     const fetchDomains = async () => {
    //         try {
    //             setLoading(true);
    //             setError(null);
    //             await new Promise(resolve => setTimeout(resolve, 600));
    //             const filtered = ALL_MOCK_ITEMS.filter(item =>
    //                 item.nameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
    //                 item.nameEn.toLowerCase().includes(searchTerm.toLowerCase())
    //             );
    //             const total = filtered.length;
    //             const totalP = Math.ceil(total / pageSize);
    //             setTotalPages(totalP);
    //             const start = (pageNumber - 1) * pageSize;
    //             const end = start + pageSize;
    //             const paginatedItems = filtered.slice(start, end);
    //             const mappedDomains: DomainOption[] = paginatedItems.map((item) => ({
    //                 id: item.id,
    //                 title: item.nameAr,
    //                 icon: '🎓'
    //             }));
    //             setDomains(mappedDomains);
    //         } catch (err: any) {
    //             setError('حدث خطأ أثناء تحميل البيانات');
    //         } finally {
    //             setLoading(false);
    //         }
    //     };
    //     fetchDomains();
    // }, [searchTerm, pageNumber, pageSize]);

    const { data: domains, isFetching: loading, error } = useQuery({
        queryKey: ['domains', pageNumber, pageSize, searchTerm],
        queryFn: async ({ queryKey: [_, pageNumber, pageSize, searchTerm] }) => {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/Api/V1/Education/Domains?pageNumber=${pageNumber}&pageSize=${pageSize}&searchTerm=${searchTerm}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentSession?.[0]?.token}`,
                    'Accept-Language': 'ar-EG',
                },
            });
            const json = await response.json();
            return json?.data?.items as DomainFromServer[]
        }
    });

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setPageNumber(1);
    };

    const handleSelect = (id: number) => {
        const domain = domains?.find(d => d.id === id) || ALL_MOCK_ITEMS.find(d => d.id === id);
        if (domain) {
            onSelectDomain(id, (domain as any).title || (domain as DomainFromServer).nameAr);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 md:p-12 shadow-2xl w-full max-w-2xl transform transition-all duration-300">
            <div className="flex flex-col items-center mb-10">
                <div className="mb-4 text-primary dark:text-slate-100 text-6xl font-bold">قلم</div>
                <h2 className="text-2xl font-semibold text-primary/80 dark:text-slate-300">إنشاء حساب مُعلم</h2>
            </div>

            <div className="mb-8 text-center">
                <h3 className="text-xl font-bold text-primary dark:text-slate-100 mb-2">اختر مجال التدريس</h3>
                <p className="text-gray-400 dark:text-slate-400 text-sm mb-6">اختر مجالاً واحداً فقط. سيتم تخصيص الخيارات المتاحة بناءً على اختيارك.</p>

                <div className="relative max-w-md mx-auto">
                    <input
                        type="text"
                        placeholder="بحث عن مجال..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-full p-4 pr-12 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl text-right text-base outline-none focus:border-secondary dark:text-slate-100 transition-all"
                    />
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
                    <p className="text-primary dark:text-slate-100 font-bold">جاري تحميل المجالات...</p>
                </div>
            ) : error ? (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 p-6 rounded-2xl text-center mb-8">
                    <p className="text-red-500 dark:text-red-400 font-bold mb-4">{error.message}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-red-500 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-red-600 transition-colors"
                    >
                        إعادة المحاولة
                    </button>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {domains?.length && domains?.length > 0 ? (
                            domains?.map(option => (
                                <DomainCard
                                    key={option.id}
                                    option={{ icon: '🎓', id: option.id, title: option.nameAr }}
                                    isSelected={selectedDomainId === option.id}
                                    onSelect={handleSelect}
                                />
                            ))
                        ) : (
                            <div className="col-span-2 text-center py-10 text-gray-400 dark:text-slate-500 italic">
                                لم يتم العثور على نتائج للبحث "{searchTerm}"
                            </div>
                        )}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-4 mb-8">
                            <button
                                disabled={pageNumber <= 1}
                                onClick={() => setPageNumber(prev => prev - 1)}
                                className={`p-2 rounded-lg border transition-all ${pageNumber <= 1 ? 'text-gray-300 dark:text-slate-700 border-gray-100 dark:border-slate-800' : 'text-primary dark:text-slate-100 border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                            <div className="flex gap-2">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => setPageNumber(i + 1)}
                                        className={`w-9 h-9 rounded-lg font-bold text-xs transition-all ${pageNumber === i + 1 ? 'bg-secondary text-white' : 'bg-gray-50 dark:bg-slate-800 text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            <button
                                disabled={pageNumber >= totalPages}
                                onClick={() => setPageNumber(prev => prev + 1)}
                                className={`p-2 rounded-lg border transition-all ${pageNumber >= totalPages ? 'text-gray-300 dark:text-slate-700 border-gray-100 dark:border-slate-800' : 'text-primary dark:text-slate-100 border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                        </div>
                    )}
                </>
            )}

            <button
                onClick={onContinue}
                disabled={!selectedDomainId || loading}
                className={`w-full py-5 rounded-2xl text-white font-bold text-xl transition-all shadow-xl ${selectedDomainId && !loading ? 'bg-primary dark:bg-slate-800 hover:bg-primary/90 dark:hover:bg-slate-700' : 'bg-gray-300 dark:bg-slate-800/50 dark:text-slate-500 cursor-not-allowed'
                    }`}
            >
                متابعة
            </button>
        </div>
    );
};

export default DomainSelection;

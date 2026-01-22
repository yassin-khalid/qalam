
import React, { useEffect, useRef, useState } from 'react';
import { StepTwoData } from '../-types/StepTwoData';
import { Certificate } from '../-types/Certificate';
import { IdentityType } from '../-types/IdentityData';
import { PlusIcon, UploadIcon, XIcon, FileIcon } from 'lucide-react';



interface StepTwoProps {
    userId: number;
    onSuccess: () => void;
}

// --- Constants for Calendars ---
const GREGORIAN_MONTHS = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
];

const HIJRI_MONTHS = [
    "محرم", "صفر", "ربيع الأول", "ربيع الآخر", "جمادى الأولى", "جمادى الآخرة",
    "رجب", "شعبان", "رمضان", "شوال", "ذو القعدة", "ذو الحجة"
];

const DAYS = Array.from({ length: 30 }, (_, i) => i + 1);
const GREGORIAN_YEARS = Array.from({ length: 81 }, (_, i) => 2030 - i);
const HIJRI_YEARS = Array.from({ length: 81 }, (_, i) => 1450 - i);

// --- Custom Select Component for Date Segments ---
const CustomSegmentSelect: React.FC<{
    value: string | number;
    options: { value: string | number; label: string | number }[];
    placeholder: string;
    onChange: (val: string) => void;
    widthClass?: string;
}> = ({ value, options, placeholder, onChange, widthClass = "flex-1" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => String(opt.value) === String(value));

    return (
        <div className={`relative ${widthClass}`} ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full h-10 px-2 bg-gray-50 dark:bg-slate-900 border ${isOpen ? 'border-[#00B5B5] ring-2 ring-[#00B5B5]/10' : 'border-transparent'} rounded-lg text-sm text-slate-900 dark:text-slate-100 flex items-center justify-between transition-all hover:bg-gray-100 dark:hover:bg-slate-800`}
            >
                <span className={`truncate ${!value ? 'text-gray-400' : 'font-bold'}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <svg className={`w-3 h-3 text-[#00B5B5] transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-200">
                    {options.map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                                onChange(String(opt.value));
                                setIsOpen(false);
                            }}
                            className={`w-full text-right px-4 py-2.5 text-sm transition-colors hover:bg-[#00B5B5]/5 dark:hover:bg-slate-700 ${String(opt.value) === String(value) ? 'bg-[#00B5B5]/10 text-[#00B5B5] font-bold' : 'text-slate-600 dark:text-slate-300'}`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// --- Elegant Date Selector Component ---
const DateSelector: React.FC<{
    value: string;
    type: 'gregorian' | 'hijri';
    onChange: (val: string) => void;
    onTypeToggle: () => void;
}> = ({ value, type, onChange, onTypeToggle }) => {
    const [year, month, day] = value ? value.split('-') : ['', '', ''];

    const handleUpdate = (part: 'y' | 'm' | 'd', newVal: string) => {
        let y = year, m = month, d = day;
        if (part === 'y') y = newVal;
        if (part === 'm') m = newVal;
        if (part === 'd') d = newVal;

        if (y && m && d) {
            onChange(`${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`);
        } else {
            onChange(`${y}-${m}-${d}`);
        }
    };

    const dayOptions = DAYS.map(d => ({ value: d, label: d }));
    const monthOptions = (type === 'hijri' ? HIJRI_MONTHS : GREGORIAN_MONTHS).map((m, i) => ({
        value: i + 1,
        label: m
    }));
    const yearOptions = (type === 'hijri' ? HIJRI_YEARS : GREGORIAN_YEARS).map(y => ({
        value: y,
        label: y
    }));

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-500 dark:text-slate-400">تاريخ الإصدار</label>
                <button
                    type="button"
                    onClick={onTypeToggle}
                    className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-[#00B5B5]/10 text-[#00B5B5] hover:bg-[#00B5B5]/20 transition-all flex items-center gap-1.5"
                >
                    <span>{type === 'hijri' ? 'التحويل للميلادي' : 'التحويل للهجري'}</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                </button>
            </div>

            <div className="flex gap-2" dir="rtl">
                <CustomSegmentSelect
                    value={day}
                    placeholder="يوم"
                    options={dayOptions}
                    onChange={(v) => handleUpdate('d', v)}
                    widthClass="w-1/4"
                />
                <CustomSegmentSelect
                    value={month}
                    placeholder="شهر"
                    options={monthOptions}
                    onChange={(v) => handleUpdate('m', v)}
                    widthClass="flex-1"
                />
                <CustomSegmentSelect
                    value={year}
                    placeholder="سنة"
                    options={yearOptions}
                    onChange={(v) => handleUpdate('y', v)}
                    widthClass="w-1/4"
                />
            </div>
        </div>
    );
};

const StepTwo: React.FC<StepTwoProps> = ({ userId, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const idFileInputRef = useRef<HTMLInputElement>(null);

    const [data, setData] = useState<StepTwoData>({
        isInSaudiArabia: true,
        identityDocument: {
            identityType: 1,
            documentNumber: '',
            issuingCountryCode: 'SA',
            file: null
        },
        certificates: [
            {
                id: 'initial-1',
                file: null,
                title: '',
                issuer: '',
                issueDate: '',
                dateType: 'gregorian'
            }
        ]
    });

    const updateData = (fields: Partial<StepTwoData>) => {
        setData(prev => ({ ...prev, ...fields }));
    };

    const addCertificate = () => {
        if (data.certificates.length < 5) {
            const newCertificate: Certificate = {
                id: Math.random().toString(36).substr(2, 9),
                file: null,
                title: '',
                issuer: '',
                issueDate: '',
                dateType: data.isInSaudiArabia ? 'hijri' : 'gregorian'
            };
            updateData({ certificates: [...data.certificates, newCertificate] });
        }
    };

    const removeCertificate = (id: string) => {
        updateData({
            certificates: data.certificates.filter(c => c.id !== id)
        });
    };

    const updateCertificate = (id: string, fields: Partial<Certificate>) => {
        updateData({
            certificates: data.certificates.map(c => (c.id === id ? { ...c, ...fields } : c))
        });
    };

    const handleIdFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            updateData({
                identityDocument: {
                    ...data.identityDocument,
                    file,
                    fileName: file.name
                }
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (data.certificates.length === 0) return;

        setLoading(true);
        try {
            console.log(`Submitting Step 2 API for User ID ${userId}...`, data);
            await new Promise(resolve => setTimeout(resolve, 2000));
            onSuccess();
        } catch (error) {
            console.error("Step 2 failed", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full" dir="rtl">
            {/* Scrollable Container with elegant max-height and custom scrollbar */}
            <div className="flex-1 overflow-y-auto custom-scrollbar max-h-[450px] pl-2 -ml-2 mb-6 rtl-scroll">
                <div className="space-y-8 pb-4">
                    {/* Saudi Residency Question */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <h3 className="text-[#003049] dark:text-slate-100 font-bold text-base text-right w-full md:w-auto">هل تقيم داخل المملكة العربية السعودية؟</h3>
                        <div className="flex gap-2 w-full md:w-auto">
                            <button
                                type="button"
                                onClick={() => updateData({ isInSaudiArabia: true })}
                                className={`flex-1 md:w-28 py-1.5 rounded-xl border-2 transition-all font-bold ${data.isInSaudiArabia ? 'bg-[#00B5B5] border-[#00B5B5] text-white shadow-lg shadow-[#00B5B5]/20' : 'border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-800'}`}
                            >
                                نعم
                            </button>
                            <button
                                type="button"
                                onClick={() => updateData({ isInSaudiArabia: false })}
                                className={`flex-1 md:w-28 py-1.5 rounded-xl border-2 transition-all font-bold ${!data.isInSaudiArabia ? 'bg-[#00B5B5] border-[#00B5B5] text-white shadow-lg shadow-[#00B5B5]/20' : 'border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-800'}`}
                            >
                                لا
                            </button>
                        </div>
                    </div>

                    {/* Identity Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-right text-sm font-bold text-[#003049] dark:text-slate-200">نوع الهوية</label>
                            <div className="relative">
                                <select
                                    required
                                    value={data.identityDocument.identityType}
                                    onChange={(e) => updateData({
                                        identityDocument: { ...data.identityDocument, identityType: Number(e.target.value) }
                                    })}
                                    className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-right text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#00B5B5] appearance-none cursor-pointer"
                                >
                                    <option value="">اختر نوع الهوية</option>
                                    {data.isInSaudiArabia ? (
                                        <>
                                            <option value={IdentityType.NATIONAL_ID}>هوية وطنية</option>
                                            <option value={IdentityType.IQAMA}>إقامة</option>
                                        </>
                                    ) : (
                                        <>
                                            <option value={IdentityType.PASSPORT}>جواز سفر</option>
                                            <option value={IdentityType.OTHER}>أخرى</option>
                                        </>
                                    )}
                                </select>
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#00B5B5]">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-right text-sm font-bold text-[#003049] dark:text-slate-200">
                                {data.isInSaudiArabia ? "رقم الإقامة / الهوية" : "رقم الجواز / الوثيقة"}
                            </label>
                            <input
                                type="text"
                                required
                                value={data.identityDocument.documentNumber}
                                onChange={(e) => updateData({
                                    identityDocument: { ...data.identityDocument, documentNumber: e.target.value }
                                })}
                                placeholder="مثال: 123456789"
                                className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-right text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#00B5B5] transition-all"
                            />
                        </div>
                    </div>

                    {/* Identity File Upload */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] sm:text-xs text-gray-400 dark:text-slate-500 uppercase tracking-wider">Max size 10MB</span>
                            <label className="block text-right text-sm font-bold text-[#003049] dark:text-slate-200">صورة الهوية / الوثيقة</label>
                        </div>
                        <div
                            onClick={() => idFileInputRef.current?.click()}
                            className="relative w-full bg-white dark:bg-slate-900 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl py-6 px-4 flex flex-col items-center justify-center cursor-pointer hover:border-[#00B5B5] hover:bg-[#00B5B5]/5 transition-all group"
                        >
                            {data.identityDocument.fileName ? (
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-12 h-12 bg-[#00B5B5]/10 rounded-full flex items-center justify-center text-[#00B5B5]">
                                        <FileIcon />
                                    </div>
                                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate max-w-[250px]">{data.identityDocument.fileName}</span>
                                    <button
                                        type="button"
                                        className="text-red-500 text-xs font-bold hover:underline"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            updateData({ identityDocument: { ...data.identityDocument, file: null, fileName: undefined } });
                                        }}
                                    >
                                        حذف الملف
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="w-12 h-12 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-gray-400 group-hover:text-[#00B5B5] group-hover:bg-[#00B5B5]/10 transition-all mb-3">
                                        <UploadIcon />
                                    </div>
                                    <span className="text-sm font-bold text-gray-500 dark:text-slate-400">انقر لرفع وثيقة الهوية</span>
                                </>
                            )}
                            <input
                                type="file"
                                ref={idFileInputRef}
                                className="hidden"
                                onChange={handleIdFileUpload}
                                accept=".jpg,.jpeg,.png,.pdf"
                            />
                        </div>
                    </div>

                    {/* Certificates Section */}
                    <div className="space-y-6 pt-6 border-t border-gray-100 dark:border-slate-800">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <button
                                type="button"
                                onClick={addCertificate}
                                disabled={data.certificates.length >= 5}
                                className="text-[#00B5B5] font-bold text-sm flex items-center gap-2 hover:opacity-80 transition-opacity disabled:opacity-50 w-full md:w-auto justify-center bg-[#00B5B5]/10 px-4 py-2 rounded-lg"
                            >
                                <PlusIcon />
                                إضافة شهادة أخرى
                            </button>
                            <div className="flex flex-col items-end gap-1 w-full md:w-auto">
                                <h3 className="text-[#003049] dark:text-slate-100 font-bold text-lg leading-none">الشهادات والدورات</h3>
                                <span className="text-[10px] text-gray-400 dark:text-slate-500 font-medium">أضف حتى 5 شهادات تدعم طلبك</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {data.certificates.map((cert, index) => (
                                <div key={cert.id} className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm relative space-y-4 hover:shadow-md transition-all border-b-4 border-b-[#00B5B5]/20">
                                    <button
                                        type="button"
                                        onClick={() => removeCertificate(cert.id)}
                                        className="absolute top-4 left-4 text-gray-300 hover:text-red-500 transition-colors"
                                    >
                                        <XIcon />
                                    </button>

                                    <div className="inline-block bg-[#00B5B5]/10 text-[#00B5B5] px-3 py-1 rounded-full text-[10px] font-bold mb-1">
                                        المستند #{index + 1}
                                    </div>

                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            placeholder="عنوان الشهادة (مثال: بكالوريوس تعليم)"
                                            required
                                            value={cert.title}
                                            onChange={(e) => updateCertificate(cert.id, { title: e.target.value })}
                                            className="w-full bg-gray-50/50 dark:bg-slate-950 px-3 py-2.5 rounded-xl text-right text-sm text-slate-900 dark:text-slate-100 border border-transparent focus:border-[#00B5B5] outline-none transition-all"
                                        />

                                        <input
                                            type="text"
                                            placeholder="جهة الإصدار"
                                            required
                                            value={cert.issuer}
                                            onChange={(e) => updateCertificate(cert.id, { issuer: e.target.value })}
                                            className="w-full bg-gray-50/50 dark:bg-slate-950 px-3 py-2.5 rounded-xl text-right text-sm text-slate-900 dark:text-slate-100 border border-transparent focus:border-[#00B5B5] outline-none transition-all"
                                        />

                                        <DateSelector
                                            value={cert.issueDate}
                                            type={cert.dateType || 'gregorian'}
                                            onChange={(val) => updateCertificate(cert.id, { issueDate: val })}
                                            onTypeToggle={() => updateCertificate(cert.id, {
                                                dateType: cert.dateType === 'hijri' ? 'gregorian' : 'hijri',
                                                issueDate: ''
                                            })}
                                        />
                                    </div>

                                    <div className="relative pt-2">
                                        <input
                                            type="file"
                                            id={`file-${cert.id}`}
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) updateCertificate(cert.id, { file, fileName: file.name });
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => document.getElementById(`file-${cert.id}`)?.click()}
                                            className={`w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all border-2 ${cert.fileName ? 'border-[#00B5B5] bg-white dark:bg-slate-900 text-[#00B5B5]' : 'border-dashed border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-950 text-gray-500'}`}
                                        >
                                            {cert.fileName ? <FileIcon /> : <UploadIcon />}
                                            {cert.fileName || 'رفع ملف الشهادة'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-6 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#003049] dark:bg-[#00B5B5] text-white py-3 rounded-2xl font-bold hover:opacity-90 transition-all shadow-xl shadow-[#003049]/10 dark:shadow-[#00B5B5]/20 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                    {loading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            جاري الإرسال...
                        </>
                    ) : 'إرسال الطلب النهائي'}
                </button>
            </div>
        </form>
    );
};

export default StepTwo;
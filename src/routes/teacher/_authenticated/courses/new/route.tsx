import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react';
import {
    ChevronLeft,
    Save,
    Send,
    Info,
    BookOpen,
    Settings,
    Banknote,
    Clock,
    Users,
    Video,
    Star,
    SaudiRiyal
} from 'lucide-react';

import { SubjectSelector } from './-components/SubjectSelector';

export const Route = createFileRoute('/teacher/_authenticated/courses/new')({
    component: RouteComponent,
})

// interface CreateCourseProps {
//     onBack: () => void;
//     isDark: boolean;
//     onToggleTheme: () => void;
// }

function RouteComponent() {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        teacherSubjectId: null as number | null,
        subjectName: '', // UI only
        domainName: '', // UI only
        teachingModeId: 1, // 1: online, 2: in-person
        sessionTypeId: 1, // 1: group, 2: individual
        isFlexible: false,
        sessionsCount: '',
        sessionDurationMinutes: '',
        price: '',
        maxStudents: 15,
        canIncludeInPackages: true
    });

    return (
        <div className={`min-h-screen px-6 md:px-10 lg:px-16 transition-colors duration-300 dark:bg-[#020617] bg-[#F8FAFC]}`} dir="rtl">
            <div className="max-w-7xl mx-auto">
                {/* Breadcrumbs & Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                    <div className="flex items-center gap-6">

                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-lg font-medium">
                                <button onClick={() => { }} className="hover:text-teal-600 transition-colors">لوحة التحكم</button>
                                <ChevronLeft size={18} />
                                <button onClick={() => { }} className="hover:text-teal-600 transition-colors">الدورات</button>
                                <ChevronLeft size={18} />
                                <span className="text-slate-600 dark:text-slate-300">إنشاء دورة</span>
                            </div>
                            <h1 className="text-5xl font-black text-[#004D4D] dark:text-white">إنشاء دورة</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                            <Save size={20} />
                            حفظ كمسودة
                        </button>
                        <button className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[#00B5AD] text-white font-bold hover:bg-[#00968F] transition-all shadow-lg shadow-teal-500/20">
                            <Send size={20} />
                            نشر
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Form Section */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* 1. Basic Information */}
                        <section className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-xl bg-[#004D4D] flex items-center justify-center text-white">
                                    <Info size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">المعلومات الأساسية</h2>
                                    <p className="text-slate-400 font-medium">أدخل المعلومات الأساسية للدورة</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-lg font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                        عنوان الدورة <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="مثال: دورة الفيزياء المتقدمة للصف الثالث الثانوي"
                                        className="w-full px-6 py-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-right"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                    <div className="text-left text-slate-400 dark:text-slate-500 text-sm">0 / 200</div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-lg font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                        وصف الدورة <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        placeholder="اكتب وصفاً يساعد الطالب على فهم ما سيتعلمه..."
                                        rows={4}
                                        className="w-full px-6 py-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-right resize-none"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400 dark:text-slate-500">اكتب وصفاً يساعد الطالب على فهم ما سيتعلمه.</span>
                                        <span className="text-slate-400 dark:text-slate-500">0 / 2000</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 2. Subject Selection */}
                        <section className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-xl bg-[#004D4D] flex items-center justify-center text-white">
                                    <BookOpen size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">اختيار المادة</h2>
                                    <p className="text-slate-400 font-medium">اختر المادة التعليمية لهذه الدورة</p>
                                </div>
                            </div>

                            <SubjectSelector
                                selectedSubjectId={formData.teacherSubjectId}
                                onSelect={(subject) => setFormData({
                                    ...formData,
                                    teacherSubjectId: subject.id,
                                    subjectName: subject.subjectNameAr,
                                    domainName: subject.domainCode === 'school' ? 'مدرسي' : subject.domainCode === 'language' ? 'لغات' : 'مهارات'
                                })}
                            />
                        </section>

                        {/* 3. Session Settings */}
                        <section className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-xl bg-[#004D4D] flex items-center justify-center text-white">
                                    <Settings size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">إعدادات الجلسات</h2>
                                    <p className="text-slate-400 font-medium">حدد طريقة التدريس ونوع الجلسة</p>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <label className="text-lg font-bold text-slate-700 dark:text-slate-300">طريقة التدريس</label>
                                    <div className="flex p-1 bg-slate-100 dark:bg-slate-950 rounded-xl w-full max-w-md">
                                        <button
                                            onClick={() => setFormData({ ...formData, teachingModeId: 1 })}
                                            className={`flex-1 py-3 rounded-lg font-bold transition-all ${formData.teachingModeId === 1 ? 'bg-white dark:bg-slate-800 text-teal-600 shadow-sm' : 'text-slate-500'}`}
                                        >
                                            عن بُعد
                                        </button>
                                        <button
                                            onClick={() => setFormData({ ...formData, teachingModeId: 2 })}
                                            className={`flex-1 py-3 rounded-lg font-bold transition-all ${formData.teachingModeId === 2 ? 'bg-white dark:bg-slate-800 text-teal-600 shadow-sm' : 'text-slate-500'}`}
                                        >
                                            حضوري
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-lg font-bold text-slate-700 dark:text-slate-300">نوع الجلسة</label>
                                    <div className="flex p-1 bg-slate-100 dark:bg-slate-950 rounded-xl w-full max-w-md">
                                        <button
                                            onClick={() => setFormData({ ...formData, sessionTypeId: 1 })}
                                            className={`flex-1 py-3 rounded-lg font-bold transition-all ${formData.sessionTypeId === 1 ? 'bg-white dark:bg-slate-800 text-teal-600 shadow-sm' : 'text-slate-500'}`}
                                        >
                                            جماعية
                                        </button>
                                        <button
                                            onClick={() => setFormData({ ...formData, sessionTypeId: 2 })}
                                            className={`flex-1 py-3 rounded-lg font-bold transition-all ${formData.sessionTypeId === 2 ? 'bg-white dark:bg-slate-800 text-teal-600 shadow-sm' : 'text-slate-500'}`}
                                        >
                                            فردية
                                        </button>
                                    </div>
                                </div>

                                <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 flex items-center justify-between">
                                    <div>
                                        <h4 className="text-lg font-bold text-amber-900 dark:text-amber-200">الدورة مرنة؟</h4>
                                        <p className="text-amber-700 dark:text-amber-400 font-medium">محددة: عدد الجلسات ومدة الجلسة ثابتة.</p>
                                    </div>
                                    <button
                                        onClick={() => setFormData({ ...formData, isFlexible: !formData.isFlexible })}
                                        className={`w-14 h-8 rounded-full relative transition-all ${formData.isFlexible ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                                    >
                                        <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${formData.isFlexible ? 'left-1' : 'left-7'}`} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-lg font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                            عدد الجلسات <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="مثال: 10"
                                            className="w-full px-6 py-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
                                            value={formData.sessionsCount}
                                            onChange={(e) => setFormData({ ...formData, sessionsCount: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-lg font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                            مدة الجلسة (بالدقائق) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="مثال: 60"
                                            className="w-full px-6 py-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
                                            value={formData.sessionDurationMinutes}
                                            onChange={(e) => setFormData({ ...formData, sessionDurationMinutes: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-lg font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                        أقصى عدد للطلاب <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="مثال: 15"
                                        className="w-full px-6 py-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
                                        value={formData.maxStudents}
                                        onChange={(e) => setFormData({ ...formData, maxStudents: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* 4. Pricing */}
                        <section className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-xl bg-[#004D4D] flex items-center justify-center text-white">
                                    <Banknote size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">التسعير</h2>
                                    <p className="text-slate-400 font-medium">حدد سعر الدورة</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-lg font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                        السعر <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            placeholder="0.00"
                                            className="w-full px-6 py-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all text-left"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        />
                                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                                            <SaudiRiyal size={20} />
                                        </span>
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 font-medium text-center">
                                    يُحتسب السعر للدورة كاملة.
                                </div>

                                <div className="flex items-center justify-between pt-4">
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-800 dark:text-white">إتاحة إدراجها ضمن الباقات</h4>
                                        <p className="text-slate-400 font-medium">السماح بتضمين هذه الدورة ضمن الباقات الشاملة</p>
                                    </div>
                                    <button
                                        onClick={() => setFormData({ ...formData, canIncludeInPackages: !formData.canIncludeInPackages })}
                                        className={`w-14 h-8 rounded-full relative transition-all ${formData.canIncludeInPackages ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                                    >
                                        <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${formData.canIncludeInPackages ? 'left-1' : 'left-7'}`} />
                                    </button>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Preview Section */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-10 space-y-6">
                            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">معاينة ظهور الدورة للطالب</h3>

                            <div className="bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden shadow-xl border border-slate-100 dark:border-slate-800">
                                <div className="p-8 space-y-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                                <Video size={32} />
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-bold text-slate-800 dark:text-white leading-tight">
                                                    {formData.title || 'عنوان الدورة يظهر هنا'}
                                                </h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-slate-400 font-medium">أ. فاطمة العلي</span>
                                                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                                                        <Star size={14} fill="currentColor" />
                                                        <span>4.8</span>
                                                        <span className="text-slate-400 font-normal text-sm">(89)</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg text-slate-500 text-sm font-bold">
                                            مطابق 95%
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <span className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-4 py-1.5 rounded-lg text-sm font-bold">{formData.domainName || 'المجال'}</span>
                                        <span className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-4 py-1.5 rounded-lg text-sm font-bold">{formData.subjectName || 'المادة'}</span>
                                        <span className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-4 py-1.5 rounded-lg text-sm font-bold">{formData.sessionTypeId === 1 ? 'جماعي' : 'فردي'}</span>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                                            <Video size={18} className="text-teal-600" />
                                            <span className="font-medium">{formData.teachingModeId === 1 ? 'عن بُعد' : 'حضوري'}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                                            <Clock size={18} className="text-teal-600" />
                                            <span className="font-medium">يبدأ في 8 رمضان</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                                            <Clock size={18} className="text-teal-600" />
                                            <span className="font-medium">{formData.sessionsCount || '16'} جلسة • {formData.sessionDurationMinutes || '90'} دقيقة</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-red-500">
                                            <Users size={18} />
                                            <span className="font-bold">{formData.maxStudents} مقاعد فقط</span>
                                        </div>
                                    </div>

                                    <div className="pt-6 flex items-baseline justify-end gap-2">
                                        <span className="text-4xl font-black text-[#003333] dark:text-teal-400">{formData.price || '800'}</span>
                                        <span className="text-xl font-bold text-slate-400">ر.س</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


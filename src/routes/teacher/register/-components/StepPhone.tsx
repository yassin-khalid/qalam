
import React, { useState, useMemo } from 'react';
import { useForm } from '@tanstack/react-form';
import { PhoneIcon } from 'lucide-react';
import z from 'zod';
import { sendOtp, SendOtpError } from '../-api/sendOtp';
import { showToast } from '@/lib/utils/toast';

interface CountryCode {
    code: string;
    name: string;
    flag: string;
}

const registerPhoneSchema = z.object({ phoneNumber: z.string().min(9, { error: 'رقم الهاتف يجب أن يكون على الأقل 9 أرقام' }).max(15, { error: 'رقم الهاتف يجب أن يكون على الأكثر 15 أرقام' }).refine(val => !Number.isNaN(Number(val)), { error: 'رقم الهاتف يجب أن يكون أرقاماً' }) });
type registerPhoneSchemaType = z.infer<typeof registerPhoneSchema>;
type registerPhoneSchemaErrors = {
    [K in keyof registerPhoneSchemaType]: string;
};

const COUNTRIES: CountryCode[] = [
    { code: '+966', name: 'المملكة العربية السعودية', flag: '🇸🇦' },
    { code: '+971', name: 'الإمارات العربية المتحدة', flag: '🇦🇪' },
    { code: '+965', name: 'الكويت', flag: '🇰🇼' },
    { code: '+973', name: 'البحرين', flag: '🇧🇭' },
    { code: '+968', name: 'عمان', flag: '🇴🇲' },
    { code: '+974', name: 'قطر', flag: '🇶🇦' },
    { code: '+962', name: 'الأردن', flag: '🇯🇴' },
    { code: '+20', name: 'مصر', flag: '🇪🇬' },
    { code: '+961', name: 'لبنان', flag: '🇱🇧' },
    { code: '+964', name: 'العراق', flag: '🇮🇶' },
    { code: '+212', name: 'المغرب', flag: '🇲🇦' },
    { code: '+213', name: 'الجزائر', flag: '🇩🇿' },
    { code: '+216', name: 'تونس', flag: '🇹🇳' },
    { code: '+218', name: 'ليبيا', flag: '🇱🇾' },
    { code: '+967', name: 'اليمن', flag: '🇾🇪' },
    { code: '+1', name: 'الولايات المتحدة', flag: '🇺🇸' },
    { code: '+44', name: 'المملكة المتحدة', flag: '🇬🇧' },
    { code: '+33', name: 'فرنسا', flag: '🇫🇷' },
    { code: '+49', name: 'ألمانيا', flag: '🇩🇪' },
    { code: '+90', name: 'تركيا', flag: '🇹🇷' },
];

interface StepPhoneProps {
    onSuccess: (phone: string) => void;
    onPhoneChanges: (phone: string) => void;
    phoneNumber?: string;
}

const StepPhone: React.FC<StepPhoneProps> = ({ onSuccess, onPhoneChanges, phoneNumber }) => {
    const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
    const [showPicker, setShowPicker] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [errors, setErrors] = useState<registerPhoneSchemaErrors>({ phoneNumber: '' });

    const filteredCountries = useMemo(() => {
        return COUNTRIES.filter(c =>
            c.name.includes(searchTerm) || c.code.includes(searchTerm)
        );
    }, [searchTerm]);

    const form = useForm({
        defaultValues: {
            phoneNumber: phoneNumber ?? '',
        },
        validators: {
            onChange: registerPhoneSchema,
        },
        onSubmit: async ({ value: { phoneNumber } }) => {
            try {

                const response = await sendOtp({ phoneNumber, countryCode: selectedCountry.code });
                onSuccess(phoneNumber)
                showToast({ type: 'success', message: response.message ?? 'تم إرسال رمز التحقق بنجاح' })
            } catch (error) {
                if (error instanceof SendOtpError) {
                    // setErrors({ phoneNumber: error.message });
                    showToast({ type: 'validation', message: error.message })
                    return
                }
                showToast({ type: 'server', message: error instanceof Error ? error.message : 'حدث خطأ ما' })
            }
        },
    })

    return (
        <div className="flex flex-col items-center w-full max-w-[480px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
            <form onSubmit={e => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
            }}
                className="w-full space-y-4">
                <div className="space-y-2">
                    <label className="block text-right text-lg font-bold text-[#003049] dark:text-slate-100 pr-1">
                        رقم الجوال
                    </label>
                    <div className="relative" dir="ltr">
                        {/* Country Picker Button */}
                        <button
                            type="button"
                            onClick={() => setShowPicker(!showPicker)}
                            className="absolute right-0 top-0 h-[64px] w-[100px] flex items-center justify-center border-l border-gray-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors rounded-r-xl z-20"
                        >
                            <div className="flex flex-col items-center leading-none gap-1">
                                <span className="text-[#003049] dark:text-slate-200 font-bold text-lg">{selectedCountry.code}</span>
                                <span className="text-[10px] text-gray-500 dark:text-slate-400">{selectedCountry.flag}</span>
                            </div>
                        </button>

                        <form.Field name="phoneNumber" children={(field) => {
                            const invalid = field.state.meta.isTouched && !field.state.meta.isValid;

                            return <>
                                <div className="relative h-[64px]">
                                    <input
                                        type="tel"
                                        required
                                        value={field.state.value}
                                        onChange={e => {
                                            field.handleChange(e.target.value);
                                            onPhoneChanges(e.target.value);
                                        }}
                                        placeholder="5xxxxxxxx"
                                        className={`w-full h-full pl-12 pr-[110px] bg-white dark:bg-slate-900 border-2 rounded-xl text-left text-xl text-slate-900 dark:text-white focus:outline-none focus:ring-4 transition-all placeholder:text-gray-300 dark:placeholder:text-slate-700 ${!invalid ? 'border-[#00B5B5] focus:ring-[#00B5B5]/10' : 'border-red-500 dark:border-red-500 focus:ring-red-500/10'
                                            }`}
                                    />
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-600 pointer-events-none">
                                        <PhoneIcon />
                                    </div>
                                </div>

                                {invalid && (
                                    <p className="text-red-500 text-sm mt-1 text-right">
                                        {field.state.meta.errors[0]?.message ?? ''}
                                    </p>
                                )}
                                {errors.phoneNumber && (
                                    <p className="text-red-500 text-sm mt-1 text-right">
                                        {errors.phoneNumber}
                                    </p>
                                )}
                            </>
                        }}></form.Field>
                    </div>

                    {/* Country Selection Dropdown */}
                    {showPicker && (
                        <div className="absolute right-0 top-[70px] w-full max-h-[400px] flex flex-col bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] z-100 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                            <div className="p-3 border-b border-gray-100 dark:border-slate-700 shrink-0 bg-white dark:bg-slate-800">
                                <input
                                    type="text"
                                    placeholder="ابحث عن الدولة أو الرمز..."
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border-none rounded-lg text-right text-sm outline-none focus:ring-1 focus:ring-[#00B5B5]"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    dir="rtl"
                                />
                            </div>
                            <div className="overflow-y-auto custom-scrollbar flex-1">
                                {filteredCountries.length > 0 ? (
                                    filteredCountries.map((c) => (
                                        <button
                                            key={c.code}
                                            type="button"
                                            onClick={() => {
                                                setSelectedCountry(c);
                                                setShowPicker(false);
                                                setSearchTerm('');
                                            }}
                                            className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-b border-gray-50 dark:border-slate-700 last:border-0"
                                        >
                                            <span className="font-bold text-[#003049] dark:text-slate-200" dir="ltr">{c.code}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-gray-600 dark:text-slate-300">{c.name}</span>
                                                <span className="text-lg">{c.flag}</span>
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-gray-400 text-sm">لا توجد نتائج</div>
                                )}
                            </div>
                        </div>
                    )}

                    <p className="text-right text-gray-400 dark:text-slate-500 text-sm mt-2">
                        سيتم استخدام رقم الهاتف لتسجيل الدخول أو إنشاء حساب جديد
                    </p>
                </div>

                <form.Subscribe selector={state => [state.canSubmit, state.isSubmitting, state.isFormValid]} children={([canSubmit, isSubmitting, isFormValid]) => {
                    return <>

                        <button
                            type="submit"
                            disabled={!canSubmit || isSubmitting}
                            className={`w-full py-3 mt-8 rounded-xl font-bold text-xl transition-all shadow-lg flex items-center justify-center gap-2 ${isFormValid && !isSubmitting
                                ? 'bg-[#003049] dark:bg-[#00B5B5] text-white active:scale-[0.98]'
                                : 'bg-[#8199ad]/60 text-white/80 cursor-not-allowed shadow-none'
                                }`}
                        >
                            {isSubmitting ? (
                                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : 'متابعة'}
                        </button>
                    </>
                }} />



                <p className="mt-8 text-center text-gray-400 dark:text-slate-500 text-sm">
                    بالمتابعة، أنت توافق على الشروط والأحكام وسياسة الخصوصية
                </p>
            </form>

            {/* Backdrop for picker */}
            {
                showPicker && (
                    <div
                        className="fixed inset-0 z-90 bg-transparent"
                        onClick={() => setShowPicker(false)}
                    />
                )
            }
        </div >
    );
};

export default StepPhone;
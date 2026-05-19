import QalamLogo from '@/lib/components/QalamLogo';
import { useForm } from '@tanstack/react-form';
import { Link } from '@tanstack/react-router';
import { Loader2, Phone } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import z from 'zod';
import { useTranslation } from 'react-i18next';
import { sendOtp, SendOtpError, SendOtpResponseData } from '@/routes/teacher/register/-api/sendOtp';
import { showToast } from '@/lib/utils/toast';

interface CountryCode {
    code: string;
    name: string;
    flag: string;
}

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

interface LoginFormProps {
    phoneNumber: string;
    onPhoneNumberChange: (phoneNumber: string) => void;
    onOtpSent: (phoneNumber: string, data: SendOtpResponseData) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ phoneNumber, onPhoneNumberChange, onOtpSent }) => {
    const { t } = useTranslation('teacher');
    const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
    const [showPicker, setShowPicker] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const loginFormSchema = useMemo(() => z.object({
        phoneNumber: z.string()
            .min(9, { error: t('auth.register.phone.validation.minLength') })
            .max(15, { error: t('auth.register.phone.validation.maxLength') })
            .refine((val) => /^[0-9]+$/.test(val), { error: t('auth.register.phone.validation.mustBeNumeric') }),
    }), [t]);

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
            onChange: loginFormSchema,
        },
        onSubmit: async ({ value }) => {
            try {
                const response = await sendOtp({ phoneNumber: value.phoneNumber, countryCode: selectedCountry.code });
                onOtpSent(value.phoneNumber, response.data);
                showToast({ type: 'success', message: response.message ?? t('auth.register.phone.toasts.otpSent') });
            } catch (error) {
                if (error instanceof SendOtpError) {
                    showToast({ type: 'validation', message: error.message });
                    return;
                }
                showToast({ type: 'server', message: error instanceof Error ? error.message : t('auth.register.stepOne.toasts.unexpected') });
            }
        },
    });

    return (
        <div className="bg-white dark:bg-slate-900 flex flex-col items-center p-8 rounded-2xl relative">
            <div className="mb-10">
                <QalamLogo className="w-32" />
            </div>

            <h1 className="text-[#003351] dark:text-slate-100 text-3xl font-extrabold mb-12 transition-colors duration-300">
                {t('auth.login.title')}
            </h1>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    form.handleSubmit();
                }}
                className="w-full"
            >
                <div className="mb-6 flex flex-col items-start w-full">
                    <label className="text-[#003351] dark:text-slate-300 text-base font-bold mb-3 transition-colors duration-300">
                        {t('auth.login.phoneLabel')}
                    </label>
                    <form.Field name="phoneNumber" children={(field) => {
                        const invalid = field.state.meta.isTouched && !field.state.meta.isValid;
                        return (
                            <div className="relative w-full" dir="ltr">
                                {/* Country Picker Button */}
                                <button
                                    type="button"
                                    onClick={() => setShowPicker(!showPicker)}
                                    className="absolute right-0 top-0 h-[60px] w-[110px] flex items-center justify-center border-l-2 border-gray-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors rounded-r-md z-20"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-[#003351] dark:text-slate-200 font-bold text-base">{selectedCountry.code}</span>
                                        <span className="text-sm">{selectedCountry.flag}</span>
                                    </div>
                                </button>

                                <input
                                    type="tel"
                                    dir="ltr"
                                    value={field.state.value}
                                    onChange={(e) => { field.handleChange(e.target.value); onPhoneNumberChange(e.target.value); }}
                                    placeholder={t('auth.login.phonePlaceholder')}
                                    maxLength={15}
                                    className={`w-full h-[60px] py-3 pl-6 pr-[120px] text-xl rounded-md border-2 bg-white dark:bg-slate-900 focus:outline-none focus:ring-4 text-[#003351] dark:text-white font-bold placeholder:text-gray-400 dark:placeholder:text-gray-600 text-left transition-all duration-300 ${invalid ? 'border-red-500 focus:ring-red-500/10' : 'border-[#14b8a6] dark:border-teal-500 focus:ring-[#14b8a6]/10 dark:focus:ring-teal-500/20'}`}
                                    required
                                />
                                {/* Phone Icon */}
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <Phone className="w-6 h-6 text-[#003351] dark:text-teal-500 transition-colors" />
                                </div>
                                {invalid && (
                                    <p className="text-red-500 text-sm mt-1 text-right">
                                        {field.state.meta.errors?.[0]?.message ?? ''}
                                    </p>
                                )}
                            </div>
                        );
                    }} />

                    {/* Country Selection Dropdown */}
                    {showPicker && (
                        <div className="absolute left-8 right-8 top-[230px] max-h-[320px] flex flex-col bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] z-30 overflow-hidden">
                            <div className="p-3 border-b border-gray-100 dark:border-slate-700 shrink-0">
                                <input
                                    type="text"
                                    placeholder={t('auth.register.phone.searchCountry')}
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border-none rounded-lg text-start text-sm outline-none focus:ring-1 focus:ring-[#00B5B5]"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
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
                                    <div className="p-8 text-center text-gray-400 text-sm">{t('auth.register.phone.noResults')}</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]} children={([canSubmit, isSubmitting]) => (
                    <button
                        type="submit"
                        disabled={!canSubmit || isSubmitting}
                        className="w-full bg-[#003351] dark:bg-teal-600 hover:bg-[#00263d] dark:hover:bg-teal-500 text-white text-2xl font-bold py-3 rounded-md shadow-lg transition-all active:scale-[0.98] mb-8 disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : t('auth.login.submit')}
                    </button>
                )} />
            </form>

            <div className="text-xl">
                <span className="text-gray-600 dark:text-slate-400 font-medium">{t('auth.login.noAccount')}</span>
                <Link
                    to="/teacher/register"
                    search={{
                        authSubStep: 'phone',
                        step: 0,
                        phoneNumber,
                    }}
                    className="text-[#14b8a6] dark:text-teal-400 font-bold hover:underline decoration-2 underline-offset-4"
                >
                    {t('auth.login.signup')}
                </Link>
            </div>

            {showPicker && (
                <div
                    className="fixed inset-0 z-20 bg-transparent"
                    onClick={() => setShowPicker(false)}
                />
            )}
        </div>
    );
};

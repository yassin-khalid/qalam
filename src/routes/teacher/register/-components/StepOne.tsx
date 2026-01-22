

import React, { useEffect, useState } from 'react';
// import { StepOneData } from '../-types/StepOneData';
import { UserIcon, MailIcon, LockIcon, EyeIcon } from 'lucide-react';
import { useForm, useStore } from '@tanstack/react-form';
import z from 'zod';
import { StepOneDataOmitPassword } from '../-types/StepOneData';
import { personalInfo } from '../-api/personalInfo';


const stepOneFormSchema = z.object({
    userId: z.number(),
    firstName: z.string().min(1, { error: "الاسم الأول يجب أن يكون على الأقل 1 حرف" }).max(100, { error: "الاسم الأول يجب أن يكون على الأقل 100 حرف" }),
    lastName: z.string().min(1, { error: "الاسم الأخير يجب أن يكون على الأقل 1 حرف" }).max(100, { error: "الاسم الأخير يجب أن يكون على الأقل 100 حرف" }),
    email: z.email({ error: "البريد الإلكتروني غير صالح" }),
    // at least 8 characters, at least one uppercase letter, at least one lowercase letter, at least one number, at least one special character
    password: z.string().min(8, { error: "كلمة المرور يجب أن تكون على الأقل 8 أحرف" }).regex(/[A-Z]/, 'يجب أن تحتوي كلمة المرور على حرف أو أكثر من الحروف الكبيرة')
        .regex(/[^A-Za-z0-9]/, 'كلمة المرور يجب أن تحتوي على رمز خاص واحد على الأقل')
        .regex(/\d/, 'يجب أن تحتوي كلمة المرور على عدد واحد على الأقل'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'كلمات المرور غير متطابقة',
});

type StepOneData = z.infer<typeof stepOneFormSchema>;

interface StepOneProps {
    onSuccess: (userId: number) => void;
    stepOneData: StepOneDataOmitPassword;
    onDataChanges: (data: StepOneDataOmitPassword) => void;
}


const StepOne: React.FC<StepOneProps> = ({ onSuccess, stepOneData, onDataChanges }) => {
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // const [data, setData] = useState<StepOneData>({
    //     userId: 0,
    //     firstName: '',
    //     lastName: '',
    //     email: '',
    //     password: '',
    //     confirmPassword: '',
    // });

    const form = useForm({
        defaultValues: {
            ...stepOneData,
            password: '',
            confirmPassword: '',
        },
        validators: {
            onChange: stepOneFormSchema,
        },

        onSubmit: async (data) => {
            const response = await personalInfo(data.value)
            console.log(response)
            // onSuccess(mockUserId);
        },
    })

    const values = useStore(form.store, state => state.values)

    useEffect(() => {

        // remove password and confirmPassword from values
        // and send the rest to onDataChanges
        // so that it doesn't appear in url
        const { password, confirmPassword, ...rest } = values
        onDataChanges(rest)
    }, [values])


    // const updateData = (fields: Partial<StepOneData>) => {
    //     setData(prev => ({ ...prev, ...fields }));
    //     if (error) setError(null);
    // };

    // const handleSubmit = async (e: React.FormEvent) => {
    //     e.preventDefault();
    //     if (data.password !== data.confirmPassword) {
    //         setError('كلمات المرور غير متطابقة');
    //         return;
    //     }

    //     setLoading(true);
    //     try {
    //         // Mock API call using the requested data structure
    //         const payload = {
    //             userId: 0,
    //             firstName: data.firstName,
    //             lastName: data.lastName,
    //             email: data.email,
    //             password: data.password
    //         };

    //         console.log("Submitting Step 1 Data:", payload);
    //         await new Promise(resolve => setTimeout(resolve, 1500));

    //         // In a real app, the server would return a real userId here
    //         const mockUserId = Math.floor(Math.random() * 10000) + 1;
    //         onSuccess(mockUserId);
    //     } catch (err) {
    //         console.error("Step 1 submission failed", err);
    //         setError('حدث خطأ أثناء حفظ البيانات. يرجى المحاولة مرة أخرى.');
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    return (
        <form onSubmit={e => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit()
        }} className="space-y-6">
            {/* {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-xl text-right text-sm font-bold animate-in fade-in slide-in-from-top-2">
                    {error}
                </div>
            )} */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="block text-right text-sm font-bold text-[#003049] dark:text-slate-200">الاسم الأول</label>
                    <form.Field name='firstName' children={(field) => {
                        const invalid = field.state.meta.isTouched && !field.state.meta.isValid
                        return (
                            <>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={field.state.value}
                                        onChange={e => field.handleChange(e.target.value)}
                                        placeholder="محمد"
                                        className="w-full px-10 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-right text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#00B5B5] focus:border-transparent transition-all"
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500">
                                        <UserIcon />
                                    </div>
                                </div >
                                {invalid && (
                                    <p className="text-red-500 text-sm text-right">
                                        {field.state.meta.errors?.[0]?.message}
                                    </p>
                                )}
                            </>
                        )
                    }} />

                </div>

                <div className="space-y-2">
                    <label className="block text-right text-sm font-bold text-[#003049] dark:text-slate-200">الاسم الأخير</label>
                    <form.Field name='lastName' children={(field) => {
                        const invalid = field.state.meta.isTouched && !field.state.meta.isValid
                        return (
                            <>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={field.state.value}
                                        onChange={e => field.handleChange(e.target.value)}
                                        placeholder="أحمد"
                                        className="w-full px-10 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-right text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#00B5B5] focus:border-transparent transition-all"
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500">
                                        <UserIcon />
                                    </div>
                                </div>
                                {invalid && (
                                    <p className="text-red-500 text-sm text-right">
                                        {field.state.meta.errors?.[0]?.message}
                                    </p>
                                )}
                            </>
                        )
                    }} />
                </div>
            </div>

            <div className="space-y-2">
                <label className="block text-right text-sm font-bold text-[#003049] dark:text-slate-200">البريد الإلكتروني</label>
                <form.Field name='email' children={(field) => {
                    const invalid = field.state.meta.isTouched && !field.state.meta.isValid
                    return (
                        <>
                            <div className="relative">
                                <input
                                    value={field.state.value}
                                    onChange={e => field.handleChange(e.target.value)}
                                    placeholder="example@email.com"
                                    className="w-full px-10 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-right text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#00B5B5] focus:border-transparent transition-all"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500">
                                    <MailIcon />
                                </div>
                            </div>
                            {invalid && (
                                <p className="text-red-500 text-sm text-right">
                                    {field.state.meta.errors?.[0]?.message}
                                </p>
                            )}
                        </>
                    )
                }} />
            </div>

            <div className="space-y-2">
                <label className="block text-right text-sm font-bold text-[#003049] dark:text-slate-200">كلمة المرور</label>
                <form.Field name='password' children={(field) => {
                    const invalid = field.state.meta.isTouched && !field.state.meta.isValid
                    return (
                        <>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={field.state.value}
                                    onChange={e => field.handleChange(e.target.value)}
                                    placeholder="أدخل كلمة المرور"
                                    className="w-full px-10 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-right text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#00B5B5] focus:border-transparent transition-all"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500">
                                    <LockIcon />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#00B5B5] dark:hover:text-[#00B5B5] p-2"
                                >
                                    <EyeIcon />
                                </button>
                            </div>
                            {invalid && (
                                <p className="text-red-500 text-sm text-right">
                                    {field.state.meta.errors?.[0]?.message}
                                </p>
                            )}
                        </>
                    )
                }} />
            </div>

            <div className="space-y-2">
                <label className="block text-right text-sm font-bold text-[#003049] dark:text-slate-200">تأكيد كلمة المرور</label>
                <form.Field name='confirmPassword' children={(field) => {
                    const invalid = field.state.meta.isTouched && !field.state.meta.isValid
                    return (
                        <>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={field.state.value}
                                    onChange={e => field.handleChange(e.target.value)}
                                    placeholder="تأكيد كلمة المرور"
                                    className="w-full px-10 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-right text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#00B5B5] focus:border-transparent transition-all"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500">
                                    <LockIcon />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#00B5B5] dark:hover:text-[#00B5B5] p-2"
                                >
                                    <EyeIcon />
                                </button>
                            </div>
                            {invalid && (
                                <p className="text-red-500 text-sm text-right">
                                    {field.state.meta.errors?.[0]?.message}
                                </p>
                            )}
                        </>
                    )
                }} />
            </div>

            <form.Subscribe selector={state => [state.canSubmit, state.isSubmitting]} children={([canSubmit, isSubmitting]) =>
                <button
                    type="submit"
                    disabled={!canSubmit}
                    className="w-full bg-[#003049] dark:bg-[#00B5B5] text-white py-3 rounded-xl font-bold hover:opacity-95 transition-all mt-8 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg active:scale-[0.98]"
                >
                    {isSubmitting ? (
                        <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : 'متابعة الخطوة التالية'}
                </button>

            } />
        </form>
    );
};

export default StepOne;

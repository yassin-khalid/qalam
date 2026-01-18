import React, { useState } from 'react';
import QalamLogo from '@/lib/components/QalamLogo';

interface RegisterFormProps {
    onNavigateToOTP: (phone: string) => void;
    onNavigateToBack: () => void;
    onLogoClick?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onNavigateToOTP, onNavigateToBack, onLogoClick = () => { } }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        idNumber: '',
        mobile: '',
        agreed: false
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.agreed) {
            onNavigateToOTP('0' + formData.mobile);
        }
    };

    return (

        <div className="bg-white dark:bg-[#0a192f] rounded-xl shadow-2xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-transparent dark:border-[#233554] p-6 md:p-8 transition-all duration-500 hover:translate-y-[-4px]">
            <div className="flex flex-col items-center h-full">
                {/* Back Button */}
                <button className="self-end mb-2 text-[#003555] dark:text-[#ccd6f6] hover:scale-110 transition-transform" onClick={onNavigateToBack}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                <QalamLogo className="w-32 mb-8" onClick={onLogoClick} />

                <h1 className="text-center text-[#003555] dark:text-[#ccd6f6] text-3xl font-bold mb-8">
                    إنشاء حساب مُعلم
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6 grow">
                    {/* Full Name */}
                    <div className="space-y-2">
                        <label className="block text-[#003555] dark:text-[#8892b0] font-bold text-lg text-right">
                            الاسم الكامل
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="أدخل اسمك الكامل"
                                className="w-full h-14 pr-12 pl-4 rounded-xl border-2 border-[#00d1c1]/30 dark:border-[#233554] bg-[#f9fafb] dark:bg-[#112240] text-right focus:border-[#00d1c1] outline-none transition-all dark:text-white text-[#003555]"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            />
                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-[#003555] dark:text-[#64ffda]">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* ID Number */}
                    <div className="space-y-2">
                        <label className="block text-[#003555] dark:text-[#8892b0] font-bold text-lg text-right">
                            رقم الهوية
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="1xxxxxxxxx"
                                className="w-full h-14 pr-12 pl-4 rounded-xl border border-gray-200 dark:border-[#233554] bg-[#f9fafb] dark:bg-[#112240] text-right focus:border-[#00d1c1] outline-none transition-all dark:text-white text-[#003555]"
                                value={formData.idNumber}
                                onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                            />
                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-[#003555]/50 dark:text-[#64ffda]/50">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Number */}
                    <div className="space-y-2">
                        <label className="block text-[#003555] dark:text-[#8892b0] font-bold text-lg text-right">
                            رقم الجوال
                        </label>
                        <div className="relative flex" dir="ltr">
                            <div className="h-14 flex items-center px-4 bg-[#f9fafb] dark:bg-[#112240] border-y border-l border-gray-200 dark:border-[#233554] rounded-l-xl text-[#003555] dark:text-[#ccd6f6]">
                                +966
                            </div>
                            <input
                                type="text"
                                placeholder="5xxxxxxxx"
                                className="grow h-14 px-4 border border-gray-200 dark:border-[#233554] bg-[#f9fafb] dark:bg-[#112240] focus:border-[#00d1c1] outline-none transition-all dark:text-white text-[#003555]"
                                value={formData.mobile}
                                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                            />
                            <div className="h-14 flex items-center pr-4 bg-[#f9fafb] dark:bg-[#112240] border-y border-r border-gray-200 dark:border-[#233554] rounded-r-xl text-[#003555] dark:text-[#64ffda]">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Terms and Conditions */}
                    <div className="flex items-center flex-row-reverse justify-end gap-3 mt-4">
                        <label htmlFor="terms" className="text-right cursor-pointer select-none">
                            <span className="text-[#003555] dark:text-[#ccd6f6]">أوافق على </span>
                            <span className="text-[#00d1c1] font-bold underline">الشروط والأحكام</span>
                        </label>
                        <div className="relative flex items-center">
                            <input
                                id="terms"
                                type="checkbox"
                                className="w-6 h-6 rounded border-2 border-[#003555] dark:border-[#64ffda] text-[#003555] focus:ring-[#003555] cursor-pointer appearance-none checked:bg-[#003555] dark:checked:bg-[#64ffda]"
                                checked={formData.agreed}
                                onChange={(e) => setFormData({ ...formData, agreed: e.target.checked })}
                            />
                            {formData.agreed && (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-1 text-white dark:text-[#0a192f] pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            )}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full h-14 bg-[#003555] dark:bg-[#112240] dark:border dark:border-[#64ffda] text-white dark:text-[#64ffda] font-bold text-xl rounded-xl hover:bg-[#002a45] dark:hover:bg-[#1d3359] transition-all mt-6 shadow-lg shadow-[#003555]/20"
                    >
                        إنشاء حساب
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RegisterForm;
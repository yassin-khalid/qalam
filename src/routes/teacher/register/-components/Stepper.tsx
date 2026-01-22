
import React from 'react';
import { CheckIcon } from 'lucide-react';


interface StepperProps {
    currentStep: number;
}

const Stepper: React.FC<StepperProps> = ({ currentStep }) => {
    const isStep1Complete = currentStep > 1;
    const isStep2Active = currentStep === 2;

    return (
        <div className="w-full mb-4 sm:mb-8" dir="rtl">
            <div className="flex items-stretch sm:h-20 border border-gray-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-white dark:bg-slate-800 relative shadow-sm">

                {/* Step 1 (Right - Personal Info) */}
                <div className={`relative flex-1 flex items-center justify-center sm:justify-start px-4 sm:px-6 transition-all duration-500 ${currentStep === 1 ? 'bg-slate-50/50 dark:bg-slate-900/30' : ''}`}>
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-500 shrink-0 ${isStep1Complete ? 'bg-[#00B5B5] text-white shadow-lg shadow-[#00B5B5]/20' : 'border-2 border-[#00B5B5] text-[#00B5B5]'} font-bold text-xs sm:text-sm z-10`}>
                        {isStep1Complete ? <CheckIcon /> : '01'}
                    </div>
                    <div className="hidden sm:flex flex-col items-start text-right mr-4 transition-all duration-500">
                        <span className={`text-sm font-bold leading-tight ${currentStep >= 1 ? 'text-[#003049] dark:text-slate-100' : 'text-gray-400 dark:text-slate-500'}`}>
                            المعلومات الشخصية
                        </span>
                        <span className={`text-[11px] font-medium leading-tight ${currentStep >= 1 ? 'text-[#00B5B5]' : 'text-gray-400 dark:text-slate-500'}`}>
                            الاسم والبريد الإلكتروني
                        </span>
                    </div>
                </div>

                {/* Separator Chevron (Pointing Left for RTL flow) */}
                <div className="relative w-6 sm:w-8 h-full shrink-0 z-20">
                    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 32 80" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M32 0 L16 40 L32 80" stroke="currentColor" className="text-gray-200 dark:text-slate-700" strokeWidth="1" />
                        <path d="M31 0 L15 40 L31 80 L0 80 L0 0 Z" fill="currentColor" className="text-white dark:bg-slate-800" />
                    </svg>
                </div>

                {/* Step 2 (Left - Documents) */}
                <div className={`relative flex-1 flex items-center justify-center sm:justify-start px-4 sm:px-6 transition-all duration-500 ${isStep2Active ? 'bg-slate-50/50 dark:bg-slate-900/30' : ''}`}>
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 shrink-0 ${isStep2Active ? 'border-[#00B5B5] text-[#00B5B5] bg-white dark:bg-slate-800 shadow-lg shadow-[#00B5B5]/10' : 'border-gray-200 dark:border-slate-700 text-gray-300 dark:text-slate-600'} font-bold text-xs sm:text-sm z-10`}>
                        02
                    </div>
                    <div className="hidden sm:flex flex-col items-start text-right mr-4 transition-all duration-500">
                        <span className={`text-sm font-bold leading-tight ${isStep2Active ? 'text-[#003049] dark:text-slate-100' : 'text-gray-400 dark:text-slate-500'}`}>
                            بيانات المستندات
                        </span>
                        <span className={`text-[11px] font-medium leading-tight ${isStep2Active ? 'text-[#00B5B5]' : 'text-gray-400 dark:text-slate-500'}`}>
                            رفع الوثائق والشهادات
                        </span>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Stepper;

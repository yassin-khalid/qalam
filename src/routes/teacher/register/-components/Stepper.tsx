
// import React from 'react';
// import { CheckIcon } from 'lucide-react';


// interface StepperProps {
//     currentStep: number;
// }

// const Stepper: React.FC<StepperProps> = ({ currentStep }) => {
//     const isStep1Complete = currentStep > 1;
//     const isStep2Active = currentStep === 2;

//     return (
//         <div className="w-full mb-2 sm:mb-4" dir="rtl">
//             <div className="flex items-stretch sm:h-20 border border-gray-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-white dark:bg-slate-800 relative shadow-sm">

//                 {/* Step 1 (Right - Personal Info) */}
//                 <div className={`relative flex-1 flex items-center justify-center sm:justify-start px-4 sm:px-6 transition-all duration-500 ${currentStep === 1 ? 'bg-slate-50/50 dark:bg-slate-900/30' : ''}`}>
//                     <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-500 shrink-0 ${isStep1Complete ? 'bg-[#00B5B5] text-white shadow-lg shadow-[#00B5B5]/20' : 'border-2 border-[#00B5B5] text-[#00B5B5]'} font-bold text-xs sm:text-sm z-10`}>
//                         {isStep1Complete ? <CheckIcon /> : '01'}
//                     </div>
//                     <div className="hidden sm:flex flex-col items-start text-right mr-4 transition-all duration-500">
//                         <span className={`text-sm font-bold leading-tight ${currentStep >= 1 ? 'text-[#003049] dark:text-slate-100' : 'text-gray-400 dark:text-slate-500'}`}>
//                             المعلومات الشخصية
//                         </span>
//                         <span className={`text-[11px] font-medium leading-tight ${currentStep >= 1 ? 'text-[#00B5B5]' : 'text-gray-400 dark:text-slate-500'}`}>
//                             الاسم والبريد الإلكتروني
//                         </span>
//                     </div>
//                 </div>

//                 {/* Separator Chevron (Pointing Left for RTL flow) */}
//                 <div className="relative w-6 sm:w-8 h-full shrink-0 z-20">
//                     <svg className="absolute inset-0 h-full w-full" viewBox="0 0 32 80" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
//                         <path d="M32 0 L16 40 L32 80" stroke="currentColor" className="text-gray-200 dark:text-slate-700" strokeWidth="1" />
//                         <path d="M31 0 L15 40 L31 80 L0 80 L0 0 Z" fill="currentColor" className="text-white dark:bg-slate-800" />
//                     </svg>
//                 </div>

//                 {/* Step 2 (Left - Documents) */}
//                 <div className={`relative flex-1 flex items-center justify-center sm:justify-start px-4 sm:px-6 transition-all duration-500 ${isStep2Active ? 'bg-slate-50/50 dark:bg-slate-900/30' : ''}`}>
//                     <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 shrink-0 ${isStep2Active ? 'border-[#00B5B5] text-[#00B5B5] bg-white dark:bg-slate-800 shadow-lg shadow-[#00B5B5]/10' : 'border-gray-200 dark:border-slate-700 text-gray-300 dark:text-slate-600'} font-bold text-xs sm:text-sm z-10`}>
//                         02
//                     </div>
//                     <div className="hidden sm:flex flex-col items-start text-right mr-4 transition-all duration-500">
//                         <span className={`text-sm font-bold leading-tight ${isStep2Active ? 'text-[#003049] dark:text-slate-100' : 'text-gray-400 dark:text-slate-500'}`}>
//                             بيانات المستندات
//                         </span>
//                         <span className={`text-[11px] font-medium leading-tight ${isStep2Active ? 'text-[#00B5B5]' : 'text-gray-400 dark:text-slate-500'}`}>
//                             رفع الوثائق والشهادات
//                         </span>
//                     </div>
//                 </div>

//             </div>
//         </div>
//     );
// };

// export default Stepper;


import React from 'react';
import { FormStep } from '../-types/FormStep';
import { CheckIcon } from 'lucide-react';

interface StepperProps {
    currentStep: FormStep;
}

const Stepper: React.FC<StepperProps> = ({ currentStep }) => {
    const isStep1Complete = currentStep > FormStep.PERSONAL_INFO;
    const isStep2Active = currentStep === FormStep.UPLOAD_DOCUMENTS;

    return (
        <div className="flex items-stretch w-full border-2 border-secondary rounded-xl overflow-hidden bg-white dark:bg-slate-800 h-24 md:h-28 relative shadow-lg transition-colors duration-300">

            {/* Step 1: Personal Info */}
            <div className={`relative flex-1 flex items-center justify-center py-4 md:py-8 pr-8 md:pr-12 pl-12 md:pl-16 border-l-2 border-secondary bg-transparent step-clip-right transition-all duration-500 ${isStep1Complete ? 'opacity-100' : 'opacity-80'}`}>
                <div className={`relative flex items-center justify-center w-10 h-10 md:w-14 md:h-14 rounded-full shrink-0 ml-4 md:ml-6 transition-all duration-500 ${isStep1Complete ? 'bg-secondary' : 'border-2 border-secondary bg-transparent'}`}>
                    {isStep1Complete ? (
                        // <span className="material-symbols-outlined text-white text-2xl md:text-3xl font-bold">check</span>
                        <CheckIcon className="text-white text-2xl md:text-3xl font-bold" />
                    ) : (
                        <span className={`text-lg md:text-xl font-bold ${currentStep === FormStep.PERSONAL_INFO ? 'text-secondary' : 'text-slate-400 dark:text-slate-500'}`}>01</span>
                    )}
                </div>
                <div className="flex flex-col items-start overflow-hidden">
                    <span className="text-base md:text-lg font-bold text-primary dark:text-white whitespace-nowrap">المعلومات الشخصية</span>
                    <span className={`text-xs md:text-sm transition-colors duration-500 ${isStep1Complete ? 'text-secondary' : 'text-slate-500 dark:text-slate-400'}`}>
                        {isStep1Complete ? 'اكتملت الخطوة بنجاح' : 'الخطوة الأولى'}
                    </span>
                </div>

                {/* The Chevron Divider SVG overlaying the clip-path border */}
                <div className="absolute -left-[2px] top-0 bottom-0 items-center z-20 pointer-events-none hidden md:flex">
                    <svg className="h-full" height="100%" preserveAspectRatio="none" viewBox="0 0 24 100" width="24">
                        <path className="text-secondary" d="M24 0 L2 50 L24 100" fill="none" stroke="currentColor" strokeWidth="3"></path>
                    </svg>
                </div>
            </div>

            {/* Step 2: Upload Documents */}
            <div className={`relative flex-1 flex items-center justify-center py-4 md:py-8 pr-12 md:pr-16 pl-8 md:pl-8 bg-slate-50 dark:bg-white/5 step-clip-left transition-all duration-500 ${isStep2Active ? 'bg-slate-100 dark:bg-white/10' : ''}`}>
                <div className={`relative flex items-center justify-center w-10 h-10 md:w-14 md:h-14 rounded-full border-2 shrink-0 ml-4 md:ml-6 transition-all duration-500 ${isStep2Active ? 'border-secondary' : 'border-slate-300 dark:border-slate-600'}`}>
                    <span className={`text-lg md:text-xl font-bold transition-colors duration-500 ${isStep2Active ? 'text-secondary' : 'text-slate-400 dark:text-slate-500'}`}>02</span>
                </div>
                <div className="flex flex-col items-start overflow-hidden">
                    <span className={`text-base md:text-lg font-bold transition-colors duration-500 ${isStep2Active ? 'text-primary dark:text-white' : 'text-slate-400 dark:text-slate-500'} whitespace-nowrap`}>رفع الوثائق والشهادات</span>
                    <span className={`text-xs md:text-sm transition-colors duration-500 ${isStep2Active ? 'text-secondary' : 'text-slate-400 dark:text-slate-500'}`}>
                        {isStep2Active ? 'الخطوة الحالية' : 'قيد الانتظار'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Stepper;
import QalamLogo from "@/lib/components/QalamLogo";
import React, { useState } from "react";
import StepOne from '../-components/StepOne'
import StepPhone from '../-components/StepPhone'
import StepOTP from '../-components/StepOTP'
import StepTwo from '../-components/StepTwo'
import Stepper from "./Stepper";
import { StepOneDataOmitPassword } from "../-types/StepOneData";

interface RegisterFormProps {
    step: number;
    authSubStep: 'phone' | 'otp' | 'none';
    onPhoneRegistered: (phone: string) => void;
    phoneNumber?: string;
    onBackToPhoneStep: () => void;
    onOtpSuccess: (token: string) => void;
    onPhoneChanges: (phone: string) => void;
    onStepOneDataChanges: (stepOneData: StepOneDataOmitPassword) => void;
    stepOneData: StepOneDataOmitPassword;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ step, authSubStep, onPhoneRegistered, phoneNumber, onBackToPhoneStep, onOtpSuccess, onPhoneChanges, onStepOneDataChanges, stepOneData }) => {
    // const [step, setStep] = useState(0);
    // const [authSubStep, setAuthSubStep] = useState<'phone' | 'otp'>('phone');
    // const [phoneNumber, setPhoneNumber] = useState('');
    const [userId, setUserId] = useState<number | null>(null);
    const [submitted, setSubmitted] = useState(false);



    const handlePhoneSuccess = (phone: string) => {
        // setPhoneNumber(phone);
        // setAuthSubStep('otp');
        onPhoneRegistered(phone)
    };

    const handleOTPSuccess = (token: string) => {
        // setStep(1);
        onOtpSuccess(token);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleStepOneSuccess = (newUserId: number) => {
        setUserId(newUserId);
        // setStep(2);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleStepTwoSuccess = () => {
        setSubmitted(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleBack = () => {
        if (step === 0 && authSubStep === 'otp') {
            onBackToPhoneStep();
        } else if (step > 1) { // Prevents going back from Step 1 to OTP as per flow logic
            // setStep(prev => prev - 1);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    console.log({ step, authSubStep })
    return (
        <div className="w-full max-w-[640px] bg-white dark:bg-slate-900 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)] transition-all duration-500 relative">
            {/* Header Section */}
            <div className={`pt-8 flex flex-col items-center transition-all ${step === 0 ? 'pb-8' : 'pb-4'}`}>
                <div className="transform scale-110 mb-2">
                    <QalamLogo className="w-32" />
                </div>
                <h1 className="text-4xl font-bold text-[#003049] dark:text-slate-100 mb-6">إنشاء حساب مُعلم</h1>
                {/* Show stepper only for step 1 and 2 */}
                {step > 0 && <div className="w-full p-2"><Stepper currentStep={step} /></div>}
            </div>

            {/* Form Body */}
            <div className="px-4 md:px-10 pb-8">
                {step === 0 && (
                    authSubStep === 'phone' ? (
                        <StepPhone onSuccess={handlePhoneSuccess} onPhoneChanges={onPhoneChanges} phoneNumber={phoneNumber} />
                    ) : (
                        <StepOTP phoneNumber={`+966${phoneNumber}`} onSuccess={handleOTPSuccess} onBack={handleBack} />
                    )
                )}
                {step === 1 && (
                    <StepOne onSuccess={handleStepOneSuccess} stepOneData={stepOneData} onDataChanges={onStepOneDataChanges} />
                )}
                {step === 2 && (
                    <StepTwo
                        userId={userId ?? 0}
                        onSuccess={handleStepTwoSuccess}
                    />
                )}
            </div>
        </div>
    )
}

export default RegisterForm;
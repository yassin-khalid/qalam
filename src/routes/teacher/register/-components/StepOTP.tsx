
import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { verifyOtp, VerifyOtpError } from '../-api/verifyOtp';

interface StepOTPProps {
    onSuccess: (token: string) => void;
    onBack: () => void;
    phoneNumber: string;
}

const StepOTP: React.FC<StepOTPProps> = ({ onSuccess, onBack, phoneNumber }) => {
    const [otp, setOtp] = useState(['', '', '', '']);
    const [timer, setTimer] = useState(299); // 4:59 in seconds
    const [loading, setLoading] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);

        if (value && index < 3) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.join('').length < 4) return;

        setLoading(true);
        try {
            const result = await verifyOtp({ otpCode: otp.join(''), phoneNumber })
            onSuccess(result.data);
            toast.success(result.message)
        } catch (error) {
            if (error instanceof VerifyOtpError) {
                console.log({ error })
                toast.error(error.message)
                return
            }
            toast.error(error instanceof Error ? error.message : 'حدث خطأ ما')
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="flex flex-col items-center w-full max-w-sm mx-auto animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="text-center space-y-2 mb-8">
                <h2 className="text-xl font-bold text-[#003049] dark:text-slate-100">تحقق من رقم جوالك</h2>
                <div className="text-sm text-gray-500 dark:text-slate-400">
                    تم إرسال رمز التحقق إلى
                    <div className="flex items-center justify-center gap-2">
                        <button onClick={onBack} className="text-[#00B5B5] hover:underline text-xs">تغيير الرقم؟</button>
                        <div className="font-bold text-[#003049] dark:text-slate-200 mt-1" dir="ltr">{phoneNumber}</div>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="w-full space-y-8">
                <div className="flex justify-center gap-4" dir="ltr">
                    {otp.map((digit, idx) => (
                        <input
                            key={idx}
                            // Fixed: Wrap the assignment in curly braces to ensure the ref callback returns void.
                            // Implicit returns in arrow functions for refs can cause TypeScript errors if the return value is an element.
                            ref={(el) => { inputRefs.current[idx] = el; }}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(idx, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(idx, e)}
                            className="w-16 h-16 text-center text-2xl font-bold border-2 border-cyan-100 dark:border-slate-700 rounded-xl focus:border-[#00B5B5] focus:ring-4 focus:ring-cyan-50 dark:focus:ring-cyan-900/20 focus:outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-all shadow-sm"
                            required
                        />
                    ))}
                </div>

                <div className="text-center space-y-4">
                    <div className="text-sm">
                        <span className="text-gray-400 dark:text-slate-500">انتهاء الصلاحية بعد </span>
                        <span className="text-[#00B5B5] font-bold" dir="ltr">{formatTime(timer)}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setTimer(299)}
                        className="text-[#00B5B5] font-bold text-sm hover:underline"
                    >
                        إعادة إرسال الرمز
                    </button>
                </div>

                <button
                    type="submit"
                    disabled={loading || otp.join('').length < 4}
                    className="w-full bg-[#003049] dark:bg-[#00B5B5] text-white py-3 rounded-xl font-bold hover:opacity-95 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : 'متابعة'}
                </button>
            </form>
        </div>
    );
};

export default StepOTP;

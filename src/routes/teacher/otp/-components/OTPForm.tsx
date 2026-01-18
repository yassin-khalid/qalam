import QalamLogo from '@/lib/components/QalamLogo';
import React, { useState, useRef, useEffect, ChangeEvent, KeyboardEvent } from 'react';

const OTPForm: React.FC<{ phone: string }> = ({ phone }) => {
    const [otp, setOtp] = useState<string[]>(['', '', '', '']);
    const [timer, setTimer] = useState<number>(120);
    const [isVerifying, setIsVerifying] = useState<boolean>(false);
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
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
        const value = e.target.value;
        if (isNaN(Number(value)) && value !== '') return;

        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        if (value && index < 3) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = () => {
        const code = otp.join('');
        if (code.length < 4) return;
        setIsVerifying(true);
        setTimeout(() => {
            setIsVerifying(false);
            alert(`تم التحقق بنجاح! الرمز: ${code}`);
        }, 1500);
    };

    return (
        <div className="bg-white dark:bg-[#0a192f] rounded-xl shadow-2xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-transparent dark:border-[#233554] p-6 md:p-8 transition-all duration-500 hover:translate-y-[-4px]">
            <div className="flex flex-col items-center w-full">

                <QalamLogo className="w-32" />

                <div className="text-center w-full my-10">
                    <h2 className="text-[#333] dark:text-[#ccd6f6] text-lg md:text-xl font-medium mb-2 transition-colors">
                        لقد أرسلنا رمزاً مكوناً من 4 أرقام إلى هاتفك
                    </h2>
                    <div className="text-[#003555] dark:text-[#64ffda] text-xl font-bold mb-4 transition-colors tracking-wide" dir="ltr">
                        +966 {phone.slice(1)}
                    </div>
                    <p className="text-gray-700 dark:text-[#8892b0] font-medium transition-colors">يرجى إدخاله أدناه</p>
                </div>

                <div className="w-full mb-10">
                    <label className="block text-gray-500 dark:text-[#8892b0] text-sm mb-5 text-center transition-colors">
                        أدخل الكود المُرسل
                    </label>
                    <div className="flex justify-center gap-4" dir="ltr">
                        {otp.map((digit, idx) => (
                            <input
                                key={idx}
                                ref={(el) => { inputRefs.current[idx] = el; }}
                                // type="number"
                                value={digit}
                                onChange={(e) => handleChange(e, idx)}
                                onKeyDown={(e) => handleKeyDown(e, idx)}
                                className="w-14 h-16 md:w-16 md:h-18 text-center text-2xl font-bold bg-[#f9fafb] dark:bg-[#112240] border border-gray-200 dark:border-[#233554] text-black dark:text-[#ccd6f6] rounded-2xl focus:border-[#003555] dark:focus:border-[#64ffda] focus:ring-4 focus:ring-[#003555]/10 dark:focus:ring-[#64ffda]/10 transition-all outline-none"
                                placeholder=""
                            />
                        ))}
                    </div>
                </div>

                <button
                    onClick={handleVerify}
                    disabled={isVerifying || otp.join('').length < 4}
                    className={`w-full py-4 rounded-lg font-bold text-lg transition-all shadow-xl active:scale-95 ${otp.join('').length === 4
                        ? 'bg-[#003555] dark:bg-transparent dark:border dark:border-[#64ffda] text-white dark:text-[#64ffda] hover:bg-[#002a45] dark:hover:bg-[#64ffda]/10'
                        : 'bg-[#d1d5db] dark:bg-[#233554] text-white dark:text-gray-500 cursor-not-allowed shadow-none'
                        }`}
                >
                    {isVerifying ? 'جاري التحقق...' : 'تحقق'}
                </button>

                <div className="mt-10 text-center">
                    <p className="text-[#333] dark:text-[#8892b0] font-medium text-sm flex items-center justify-center gap-2 transition-colors">
                        إعادة ارسال الرمز بعد
                        <span className="text-red-600 dark:text-rose-400 font-mono font-bold text-lg transition-colors">{formatTime(timer)}</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OTPForm;
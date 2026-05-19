import React, { useState, useEffect, useRef, useMemo } from "react";
import { verifyOtp, VerifyOtpError } from "../-api/verifyOtp";
import { VerifyOtpSuccessResponseData } from "../-types/VerifyOtpSuccessResponseData";
import { showToast } from "@/lib/utils/toast";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/lib/contexts/auth";

interface StepOTPProps {
  onSuccess: (data: VerifyOtpSuccessResponseData) => void;
  onBack: () => void;
  phoneNumber: string;
  maskedDestination?: string;
}

const StepOTP: React.FC<StepOTPProps> = ({
  onSuccess,
  onBack,
  phoneNumber,
  maskedDestination,
}) => {
  const { t, i18n } = useTranslation('teacher');
  const { config } = useAuth();
  const otpLength = config!.otp.length;
  const expirySeconds = config!.otp.expirySeconds;
  const teacherConfig = config!.teacher;

  const [otp, setOtp] = useState<string[]>(() => Array(otpLength).fill(""));
  const [timer, setTimer] = useState(expirySeconds);
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
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const otpHint = useMemo(
    () => (i18n.language === 'ar' ? teacherConfig.otpHintAr : teacherConfig.otpHintEn),
    [i18n.language, teacherConfig.otpHintAr, teacherConfig.otpHintEn],
  );

  const destinationDisplay = maskedDestination ?? phoneNumber;

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < otpLength - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (otp.join("").length < otpLength) return;

    setLoading(true);
    try {
      const result = await verifyOtp({ otpCode: otp.join(""), phoneNumber });
      onSuccess(result.data);
      showToast({
        type: "success",
        message: result.message ?? t('auth.register.otpStep.toasts.success'),
      });
    } catch (error) {
      if (error instanceof VerifyOtpError) {
        showToast({ type: "validation", message: error.message });
        return;
      }
      showToast({
        type: "server",
        message: error instanceof Error ? error.message : t('auth.register.stepOne.toasts.unexpected'),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-xl font-bold text-[#003049] dark:text-slate-100">
          {t('auth.register.otpStep.title')}
        </h2>
        <p className="text-sm text-gray-500 dark:text-slate-400">{otpHint}</p>
        <div className="text-sm text-gray-500 dark:text-slate-400">
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={onBack}
              className="text-[#00B5B5] hover:underline text-xs"
            >
              {t('auth.register.otpStep.changeNumber')}
            </button>
            <div
              className="font-bold text-[#003049] dark:text-slate-200 mt-1"
              dir="ltr"
            >
              {destinationDisplay}
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-8">
        <div className="flex justify-center gap-4" dir="ltr">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => {
                inputRefs.current[idx] = el;
              }}
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
            <span className="text-gray-400 dark:text-slate-500">
              {t('auth.register.otpStep.expiresAfter')}
            </span>
            <span className="text-[#00B5B5] font-bold" dir="ltr">
              {formatTime(timer)}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setTimer(expirySeconds)}
            className="text-[#00B5B5] font-bold text-sm hover:underline"
          >
            {t('auth.register.otpStep.resend')}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading || otp.join("").length < otpLength}
          className="w-full bg-[#003049] dark:bg-[#00B5B5] text-white py-3 rounded-xl font-bold hover:opacity-95 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            t('auth.register.otpStep.continue')
          )}
        </button>
      </form>
    </div>
  );
};

export default StepOTP;

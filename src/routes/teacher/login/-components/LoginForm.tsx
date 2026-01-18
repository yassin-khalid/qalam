import QalamLogo from '@/lib/components/QalamLogo';
import { Link } from '@tanstack/react-router';
import React, { useState } from 'react';

interface LoginFormProps {
  onSubmit: (phoneNumber: string) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit }) => {
  const [phoneNumber, setPhoneNumber] = useState('');



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Logging in with:', phoneNumber);
    onSubmit('0' + phoneNumber);

  };

  return (
    <div className="bg-white dark:bg-slate-900 flex flex-col items-center p-8 rounded-2xl">
      <div className="mb-10">
        <QalamLogo className="w-32" />
      </div>

      <h1 className="text-[#003351] dark:text-slate-100 text-3xl font-extrabold mb-12 transition-colors duration-300">
        تسجيل الدخول كمُعلم
      </h1>

      <form onSubmit={handleSubmit} className="w-full">
        <div className="mb-6 flex flex-col items-start">
          <label className="text-[#003351] dark:text-slate-300 text-base font-bold mb-3 transition-colors duration-300">
            رقم الجوال
          </label>
          <div className="relative w-full">
            <input
              type="tel"
              dir="ltr"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="5xxxxxxxx"
              maxLength={9}
              className="w-full py-3 px-6 text-xl rounded-md border-2 border-[#14b8a6] dark:border-teal-500 bg-white dark:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-[#14b8a6]/10 dark:focus:ring-teal-500/20 text-[#003351] dark:text-white font-bold placeholder:text-gray-400 dark:placeholder:text-gray-600 text-center transition-all duration-300"
              required
            />
            {/* Country Code Prefix */}
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#003351] dark:text-slate-200 font-bold text-xl border-r-2 border-gray-200 dark:border-slate-700 pr-4 transition-colors">
              +966
            </div>
            {/* Phone Icon */}
            <div className="absolute right-5 top-1/2 -translate-y-1/2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7 text-[#003351] dark:text-teal-500 transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-[#003351] dark:bg-teal-600 hover:bg-[#00263d] dark:hover:bg-teal-500 text-white text-2xl font-bold py-3 rounded-md shadow-lg transition-all active:scale-[0.98] mb-8"
        >
          دخول
        </button>
      </form>

      <div className="text-xl">
        <span className="text-gray-600 dark:text-slate-400 font-medium">ليس لديك حساب؟ </span>
        <Link
          to="/teacher/register"
          className="text-[#14b8a6] dark:text-teal-400 font-bold hover:underline decoration-2 underline-offset-4"
        >
          إنشاء حساب
        </Link>
      </div>
    </div>
  );
};

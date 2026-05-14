import QalamLogo from '@/lib/components/QalamLogo';
import { useForm } from '@tanstack/react-form';
import { Link } from '@tanstack/react-router';
import { Loader2, Phone } from 'lucide-react';
import React, { useMemo } from 'react';
import z from 'zod';
import { useTranslation } from 'react-i18next';

interface LoginFormProps {
  onSubmit: (phoneNumber: string) => void;
  phoneNumber: string;
  onPhoneNumberChange: (phoneNumber: string) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, phoneNumber, onPhoneNumberChange }) => {
  const { t } = useTranslation('teacher');

  const loginFormSchema = useMemo(() => z.object({
    phoneNumber: z.string()
      .min(1, { error: t('auth.login.validation.phoneRequired') })
      .max(9, { error: t('auth.login.validation.phoneLength') }),
  }), [t]);

  const form = useForm({
    defaultValues: {
      phoneNumber: phoneNumber ?? '',
    },
    validators: {
      onChange: loginFormSchema
    },
    onSubmit: ({ value }) => {
      onSubmit('0' + value.phoneNumber);
    }
  })

  return (
    <div className="bg-white dark:bg-slate-900 flex flex-col items-center p-8 rounded-2xl">
      <div className="mb-10">
        <QalamLogo className="w-32" />
      </div>

      <h1 className="text-[#003351] dark:text-slate-100 text-3xl font-extrabold mb-12 transition-colors duration-300">
        {t('auth.login.title')}
      </h1>

      <form onSubmit={e => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }} className="w-full">
        <div className="mb-6 flex flex-col items-start">
          <label className="text-[#003351] dark:text-slate-300 text-base font-bold mb-3 transition-colors duration-300">
            {t('auth.login.phoneLabel')}
          </label>
          <form.Field name="phoneNumber" children={(field) => {
            const invalid = field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <>
                <div className="relative w-full">
                  <input
                    type="tel"
                    dir="ltr"
                    value={field.state.value}
                    onChange={(e) => { field.handleChange(e.target.value); onPhoneNumberChange(e.target.value) }}
                    placeholder={t('auth.login.phonePlaceholder')}
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
                    <Phone className="w-7 h-7 text-[#003351] dark:text-teal-500 transition-colors" />
                  </div>
                  {invalid && <p className="text-red-500 text-sm">{field.state.meta.errors?.[0]?.message}</p>}
                </div>
              </>
            )
          }} />
        </div>

        <form.Subscribe selector={state => [state.canSubmit, state.isSubmitting]} children={([canSubmit, isSubmitting]) => {
          return (
            <button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className="w-full bg-[#003351] dark:bg-teal-600 hover:bg-[#00263d] dark:hover:bg-teal-500 text-white text-2xl font-bold py-3 rounded-md shadow-lg transition-all active:scale-[0.98] mb-8"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : t('auth.login.submit')}
            </button>
          )
        }} />

      </form>

      <div className="text-xl">
        <span className="text-gray-600 dark:text-slate-400 font-medium">{t('auth.login.noAccount')}</span>
        <Link
          to="/teacher/register"
          search={{
            authSubStep: 'phone',
            step: 0,
            phoneNumber
          }}
          className="text-[#14b8a6] dark:text-teal-400 font-bold hover:underline decoration-2 underline-offset-4"
        >
          {t('auth.login.signup')}
        </Link>
      </div>
    </div>
  );
};

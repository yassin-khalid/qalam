import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { LoginForm } from './-components/LoginForm'
import ThemeToggleButton from '@/lib/components/ThemeToggleButton'
import { createStandardSchemaV1, parseAsString, useQueryStates } from 'nuqs'
import { upsertSession } from '@/lib/utils/sessionHelpers'
import type { SendOtpResponseData } from '@/routes/teacher/register/-api/sendOtp'

const searchParams = {
  phoneNumber: parseAsString.withDefault(''),
}
export const Route = createFileRoute('/teacher/login')({
  component: RouteComponent,
  validateSearch: createStandardSchemaV1(searchParams, { partialOutput: true }),
})

function RouteComponent() {
  const [{ phoneNumber }, setSearchParams] = useQueryStates(searchParams)
  const navigate = useNavigate()

  const handleOtpSent = (submittedPhone: string, data: SendOtpResponseData) => {
    upsertSession({ phoneNumber: submittedPhone })
    // Hand off to the register flow's OTP sub-step — it already calls verifyOtp
    // and routes by nextStepName, which handles both new and existing users
    // (existing complete users land on the dashboard via `Registration Complete`).
    navigate({
      to: '/teacher/register',
      search: {
        step: 0,
        authSubStep: 'otp',
        phoneNumber: submittedPhone,
        maskedDestination: data.maskedDestination,
      },
    })
  }

  return (
    <>
      <ThemeToggleButton className="fixed top-6 left-6 w-fit z-50 p-3 rounded-full bg-white dark:bg-[#112240] shadow-lg border border-gray-200 dark:border-[#233554] text-[#003555] dark:text-[#64ffda] hover:scale-110 active:scale-95 transition-all" />

      <div className="grid grid-cols-1 md:grid-cols-2 justify-center h-screen bg-[#003555]">
        <div className='relative flex items-center justify-center'>
          <img src="/login/qalam-login-shadow.svg" alt="Qalam Login Shadow" className='absolute top-0 right-0 w-full h-full z-0' />
          <div className="relative z-10 mx-4 md:mx-0 w-full max-w-md">
            <LoginForm
              phoneNumber={phoneNumber ?? ''}
              onPhoneNumberChange={(value) => setSearchParams({ phoneNumber: value })}
              onOtpSent={handleOtpSent}
            />
          </div>
        </div>
        <div className='w-full h-screen hidden md:block'>
          <img src="/login/qalam-login.svg" alt="Qalam Login" className='w-full h-full object-cover' />
        </div>
      </div>
    </>
  )
}

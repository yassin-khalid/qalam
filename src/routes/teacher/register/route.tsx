import ThemeToggleButton from '@/lib/components/ThemeToggleButton'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { createStandardSchemaV1, parseAsJson, parseAsNumberLiteral, parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs'
import RegisterForm from './-components/RegisterForm'
import z from 'zod'
import { StepOneData } from './-types/StepOneData'

const stepOneDataSchema = z.object({
  userId: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
})

const searchParams = {
  step: parseAsNumberLiteral([0, 1, 2] as const).withDefault(0),
  authSubStep: parseAsStringLiteral(['phone', 'otp', 'none'] as const).withDefault('none'),
  phoneNumber: parseAsString.withDefault(''),
  stepOneData: parseAsJson(stepOneDataSchema).withDefault({ userId: 0, firstName: '', lastName: '', email: '' }),
}
export const Route = createFileRoute('/teacher/register')({
  component: RouteComponent,
  validateSearch: createStandardSchemaV1(searchParams, { partialOutput: true }),
  errorComponent: ({ error }) => <div className='text-red-500'>{error.message}</div>
})

function RouteComponent() {
  const navigate = useNavigate()
  const [{ step, authSubStep, phoneNumber, stepOneData }, setSearchParams] = useQueryStates(searchParams)

  const handlePhoneChanges = (phone: string) => {
    setSearchParams(prev => ({ ...prev, phoneNumber: phone }))
  }
  const handleStepOneDataChanges = (stepOneData: StepOneData) => {
    setSearchParams(prev => ({ ...prev, stepOneData }))
  }

  return <>
    <ThemeToggleButton className="fixed top-6 left-6 w-fit z-50 p-3 rounded-full bg-white dark:bg-[#112240] shadow-lg border border-gray-200 dark:border-[#233554] text-[#003555] dark:text-[#64ffda] hover:scale-110 active:scale-95 transition-all" />
    <div className="grid grid-cols-1 md:grid-cols-2 justify-center min-h-screen h-full bg-[#003555]">
      <div className='relative flex justify-center items-center'>
        <img src="/login/qalam-login-shadow.svg" alt="Qalam Login Shadow" className='absolute top-0 right-0 w-full h-full z-0' />
        <div className="relative z-10 mx-4 md:mx-0">
          {/* <RegisterForm onNavigateToOTP={(phone) => { navigate({ to: '/teacher/otp', search: { phone } }) }} onNavigateToBack={() => { navigate({ to: '/teacher/login' }) }} onLogoClick={() => { navigate({ to: '/' }) }} /> */}
          <RegisterForm step={step} authSubStep={authSubStep} phoneNumber={phoneNumber ?? undefined} onPhoneRegistered={() => { navigate({ to: '/teacher/register', search: { step: 0, authSubStep: 'otp', phoneNumber } }) }} onBackToPhoneStep={() => { navigate({ to: '/teacher/register', search: { step: 0, authSubStep: 'phone' } }) }} onOtpSuccess={() => { navigate({ to: '/teacher/register', search: { step: 1, stepOneData } }) }} onPhoneChanges={handlePhoneChanges} onStepOneDataChanges={handleStepOneDataChanges} stepOneData={stepOneData} />
        </div>
      </div>
      <div className='w-full h-screen hidden md:block'>
        <img src="/login/qalam-login.svg" alt="Qalam Login" className='w-full h-full object-cover' />
      </div>
    </div>
  </>
}

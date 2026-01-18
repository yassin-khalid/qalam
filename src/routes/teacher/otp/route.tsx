import { createFileRoute } from '@tanstack/react-router'
import OTPForm from './-components/OTPForm'
import ThemeToggleButton from '@/lib/components/ThemeToggleButton'
import z from 'zod'

export const Route = createFileRoute('/teacher/otp')({
  component: RouteComponent,
  validateSearch: z.object({
    phone: z.string().regex(/^05\d{8}$/, 'رقم الهاتف يجب أن يكون 10 رقماً ويبدأ بـ05'),
  }),

})

function RouteComponent() {
  const { phone } = Route.useSearch()


  return <>
    <ThemeToggleButton className="fixed top-6 left-6 w-fit z-50 p-3 rounded-full bg-white dark:bg-[#112240] shadow-lg border border-gray-200 dark:border-[#233554] text-[#003555] dark:text-[#64ffda] hover:scale-110 active:scale-95 transition-all" />
    <div className="grid grid-cols-1 md:grid-cols-2 justify-center h-screen bg-[#003555]">
      <div className='relative flex items-center justify-center'>
        <img src="/login/qalam-login-shadow.svg" alt="Qalam Login Shadow" className='absolute top-0 right-0 w-full h-full z-0' />
        <div className="relative z-10 mx-4 md:mx-0">
          <OTPForm phone={phone} />
        </div>
      </div>
      <div className='w-full h-screen hidden md:block'>
        <img src="/login/qalam-login.svg" alt="Qalam Login" className='w-full h-full object-cover' />
      </div>
    </div>
  </>
}

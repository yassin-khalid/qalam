import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { Sidebar } from './-components/Sidebar'
import { Navbar } from './-components/Navbar'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/teacher/_authenticated')({
  ssr: false,
  beforeLoad: () => {
    const token = localStorage.getItem('token')
    if (!token) {
      throw redirect({ to: '/teacher/register', search: { step: 0, authSubStep: 'phone' } })
    }
    return { token }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(true)
  const sidebarWidth = isSidebarCollapsed ? 96 : 320
  const { t } = useTranslation('teacher')

  // Track whether we're at md+ width. Auto-close the drawer when growing into desktop.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(min-width: 768px)')
    setIsDesktop(mq.matches)
    const onChange = (e: MediaQueryListEvent) => {
      setIsDesktop(e.matches)
      if (e.matches) setMobileSidebarOpen(false)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    if (typeof document === 'undefined') return
    if (!mobileSidebarOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [mobileSidebarOpen])

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-300 overflow-x-hidden">
      <a
        href="#teacher-main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:start-2 focus:z-[60] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-primary focus:text-white focus:font-bold focus:shadow-lg"
      >
        {t('common.skipToContent')}
      </a>

      {/* Mobile backdrop */}
      {mobileSidebarOpen && (
        <button
          type="button"
          aria-label={t('common.closeAria')}
          onClick={() => setMobileSidebarOpen(false)}
          className="md:hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm"
        />
      )}

      {/* Sidebar — off-canvas drawer on mobile, fixed-position panel on md+ */}
      <div
        className={`fixed top-0 bottom-0 z-50 transition-transform md:transition-[width,transform] duration-300 ease-in-out ${mobileSidebarOpen
            ? 'translate-x-0'
            : '-translate-x-full md:translate-x-0 rtl:translate-x-full rtl:md:translate-x-0'
          }`}
        style={{ insetInlineStart: 0, width: sidebarWidth }}
      >
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onTitleChange={() => { }}
          onMobileClose={() => setMobileSidebarOpen(false)}
        />
      </div>

      <main
        id="teacher-main"
        className="flex flex-col h-screen overflow-hidden transition-[margin] duration-300"
        style={{ marginInlineStart: isDesktop ? sidebarWidth : 0 }}
      >
        <Navbar onMobileMenu={() => setMobileSidebarOpen(true)} />
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8 custom-scrollbar">
          <div className="space-y-6 w-full min-w-0">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}

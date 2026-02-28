import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { Sidebar } from './-components/Sidebar'
import { Navbar } from './-components/Navbar'
import { useState } from 'react'

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
  const sidebarWidth = isSidebarCollapsed ? 96 : 320 // w-24 = 96px, w-80 = 320px
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-300 overflow-x-hidden">
      <div
        className="fixed top-0 bottom-0 z-40 transition-[width] duration-300 ease-in-out"
        style={{ right: 0, width: sidebarWidth }}
      >
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onTitleChange={() => { }}
        />
      </div>
      <main
        className="flex flex-col h-screen overflow-hidden transition-[margin-right] duration-300"
        style={{ marginRight: sidebarWidth }}
      >
        <Navbar />
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-6 lg:p-8 custom-scrollbar">
          <div className="space-y-6 w-full min-w-0">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}

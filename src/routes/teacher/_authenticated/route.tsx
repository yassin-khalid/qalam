import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Sidebar } from './-components/Sidebar'
import { Navbar } from './-components/Navbar'
import { useState } from 'react'

export const Route = createFileRoute('/teacher/_authenticated')({
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
          onTitleChange={() => {}}
        />
      </div>
      <main
        className="flex flex-col min-h-screen overflow-hidden transition-[margin-right] duration-300"
        style={{ marginRight: sidebarWidth }}
      >
        <Navbar />
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6 w-full min-w-0">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}

import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Header } from './-components/Header'
import { Sidebar } from './-components/Sidebar'
import { useState } from 'react'

export const Route = createFileRoute('/teacher/_authenticated')({
  component: RouteComponent,
})

function RouteComponent() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [title, setTitle] = useState('')
  return (
    <div className="min-h-screen flex bg-background-light dark:bg-background-dark transition-colors duration-300 overflow-x-hidden">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onTitleChange={setTitle}
      />

      <main className="flex-1 p-8 lg:p-12 overflow-y-auto min-w-0">
        <Header title={title} />
        <div className="max-w-7xl mx-auto space-y-10">

          <Outlet />
        </div>
      </main>
    </div>
  )
}

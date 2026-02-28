import { createFileRoute, Outlet, useLocation, useNavigate } from '@tanstack/react-router'
import { useState, useMemo } from 'react';
import { ApiResponse } from './-types/types';
import { DashboardHeader } from './-components/Header';
import { StatsGrid } from './-components/StatsGrid';
import { CourseFilters } from './-components/Filters';
import { CourseList } from './-components/CourseList';
import { useQuery } from '@tanstack/react-query';

export const Route = createFileRoute('/teacher/_authenticated/courses')({
  component: RouteComponent,
})

function RouteComponent() {
  const location = useLocation()
  const isNewCoursePage = location.pathname.endsWith('/new')

  const [statusFilter, setStatusFilter] = useState<1 | 2 | 3 | 0>(0); // 2: published, 1: draft, 3: archived, 0: all
  const [pageNumber, setPageNumber] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const navigate = useNavigate();


  const { data, isFetching } = useQuery({
    queryKey: ['courses', pageNumber, statusFilter],
    queryFn: async ({ queryKey: [, pageNumber, statusFilter] }) => {
      const token = localStorage.getItem('token')
      if (!token) {
        navigate({ to: "/teacher/register", search: { step: 0, authSubStep: "phone" } })
      }
      const response = await fetch(`${import.meta.env.VITE_API_URL}/Api/V1/Teacher/TeacherCourse?pageNumber=${pageNumber}&${statusFilter ? `status=${statusFilter}` : ''}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Accept-Language': 'ar-EG',
        },
      })
      if (!response.ok) {

        throw new Error('Failed to fetch courses');
      }
      const json = await response.json() as ApiResponse;
      return json
    },
  });


  const stats = useMemo(() => [
    {
      label: 'إجمالي الدورات',
      value: String(data?.data.length ?? 0),
      color: 'bg-gradient-to-r from-secondary to-primary',
      textColor: 'text-white',
      borderColor: 'border-transparent',
      valueColor: 'text-white',
    },
    {
      label: 'منشورة',
      value: String(data?.data.filter(item => item.status === 2).length ?? 0),
      color: 'bg-[#F0FFF4] dark:bg-emerald-950/20',
      textColor: 'text-[#0D9488] dark:text-emerald-400',
      borderColor: 'border-[#86EFAC] dark:border-emerald-900/40',
      valueColor: 'text-[#064E3B] dark:text-emerald-200',
    },
    {
      label: 'مسودات',
      value: String(data?.data.filter(item => item.status === 1).length ?? 0),
      color: 'bg-[#FFFBEB] dark:bg-amber-950/20',
      textColor: 'text-[#D97706] dark:text-amber-400',
      borderColor: 'border-[#FCD34D] dark:border-amber-900/40',
      valueColor: 'text-[#78350F] dark:text-amber-200',
    },
    {
      label: 'متوقفة',
      value: String(data?.data.filter(item => item.status === 3).length ?? 0),
      color: 'bg-[#F7FAFC] dark:bg-slate-900/30',
      textColor: 'text-[#475569] dark:text-slate-400',
      borderColor: 'border-[#CBD5E1] dark:border-slate-800',
      valueColor: 'text-[#0F172A] dark:text-slate-200',
    },
    {
      label: 'إجمالي الطلاب',
      value: String(data?.data.reduce((acc, item) => acc + (item.registeredCount ?? 0), 0) ?? 0),
      color: 'bg-[#EBF8FF] dark:bg-blue-950/20',
      textColor: 'text-[#2563EB] dark:text-blue-400',
      borderColor: 'border-[#93C5FD] dark:border-blue-900/40',
      valueColor: 'text-[#1E3A8A] dark:text-blue-200',
    },
  ], []);

  if (isNewCoursePage) {
    return <Outlet />
  }

  console.log({ data })
  return (
    <div className={`min-h-screen transition-colors duration-300`} dir="rtl">
      <div className="px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <DashboardHeader
          />

          <StatsGrid stats={stats} />

          <CourseFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={(status) => { setStatusFilter(status); setPageNumber(1); }}
          />

          {data && <CourseList
            isLoading={isFetching}
            apiData={data}
            pageNumber={pageNumber}
            onPageChange={setPageNumber}
          />}
        </div>
      </div>
    </div>
  );
}



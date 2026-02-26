import { createFileRoute, Outlet, useLocation } from '@tanstack/react-router'
import { useState, useEffect, useMemo } from 'react';
import { ApiResponse, Course } from './-types/types';
import { DashboardHeader } from './-components/Header';
import { StatsGrid } from './-components/StatsGrid';
import { CourseFilters } from './-components/Filters';
import { CourseList } from './-components/CourseList';
import { useTheme } from '@/lib/hooks/useTheme';
import { useQuery } from '@tanstack/react-query';

export const Route = createFileRoute('/teacher/_authenticated/courses')({
  component: RouteComponent,
})

// --- Mock Data Generator ---
const generateMockCourses = (page: number, size: number, status: number): ApiResponse => {
  const allItems: Course[] = Array.from({ length: 50 }).map((_, i) => ({
    id: i,
    title: i % 2 === 0 ? "دورة الفيزياء المتقدمة للصف الثالث الثانوي" : "دورة الكيمياء العضوية الشاملة",
    descriptionShort: "وصف قصير للدورة التعليمية",
    teacherId: 1,
    domainId: 1,
    domainNameEn: "Science",
    subjectId: 1,
    subjectNameEn: i % 2 === 0 ? "الفيزياء" : "الكيمياء",
    teachingModeId: 1,
    teachingModeNameEn: "عن بُعد",
    sessionTypeId: 1,
    sessionTypeNameEn: "جماعية",
    status: (i % 3) + 1,
    isActive: true,
    price: 500,
    startDate: "١٤٤٥/٨/٢٠ هـ",
    sessionsCount: 10,
    registeredCount: 12 + (i % 5),
  }));

  const filtered = status === 0 ? allItems : allItems.filter(c => c.status === status);
  const start = (page - 1) * size;
  const items = filtered.slice(start, start + size);

  return {
    items,
    totalCount: filtered.length,
    pageNumber: page,
    pageSize: size,
    totalPages: Math.ceil(filtered.length / size),
    hasPreviousPage: page > 1,
    hasNextPage: page < Math.ceil(filtered.length / size),
  };
};

function RouteComponent() {
  const location = useLocation()
  const isNewCoursePage = location.pathname.endsWith('/new')

  const [statusFilter, setStatusFilter] = useState(0); // 0: الكل, 1: مسودة, 2: منشور, 3: متوقف
  const [pageNumber, setPageNumber] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const theme = useTheme();
  const isDark = theme === 'dark';

  // // Simulate API Fetch
  // useEffect(() => {
  //   setIsLoading(true);
  //   const timer = setTimeout(() => {
  //     const data = generateMockCourses(pageNumber, 6, statusFilter);
  //     setApiData(data);
  //     setIsLoading(false);
  //   }, 500);
  //   return () => clearTimeout(timer);
  // }, [pageNumber, statusFilter]);

  const { data, isFetching } = useQuery({
    queryKey: ['courses', pageNumber, statusFilter],
    queryFn: async ({ queryKey: [, pageNumber, statusFilter] }) => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/courses`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page: pageNumber,
          status: statusFilter,
        }),
      })
      const json = await response.json();
      return json as ApiResponse;
    },
  });

  const stats = useMemo(() => [
    {
      label: 'إجمالي الدورات',
      value: String(data?.items.length ?? 0),
      color: 'bg-gradient-to-r from-[#006B6B] to-[#004D4D]',
      textColor: 'text-white',
      borderColor: 'border-transparent',
      valueColor: 'text-white',
    },
    {
      label: 'منشورة',
      value: String(data?.items.filter(item => item.status === 2).length ?? 0),
      color: 'bg-[#F0FFF4] dark:bg-emerald-950/20',
      textColor: 'text-[#0D9488] dark:text-emerald-400',
      borderColor: 'border-[#86EFAC] dark:border-emerald-900/40',
      valueColor: 'text-[#064E3B] dark:text-emerald-200',
    },
    {
      label: 'مسودات',
      value: String(data?.items.filter(item => item.status === 1).length ?? 0),
      color: 'bg-[#FFFBEB] dark:bg-amber-950/20',
      textColor: 'text-[#D97706] dark:text-amber-400',
      borderColor: 'border-[#FCD34D] dark:border-amber-900/40',
      valueColor: 'text-[#78350F] dark:text-amber-200',
    },
    {
      label: 'متوقفة',
      value: String(data?.items.filter(item => item.status === 3).length ?? 0),
      color: 'bg-[#F7FAFC] dark:bg-slate-900/30',
      textColor: 'text-[#475569] dark:text-slate-400',
      borderColor: 'border-[#CBD5E1] dark:border-slate-800',
      valueColor: 'text-[#0F172A] dark:text-slate-200',
    },
    {
      label: 'إجمالي الطلاب',
      value: String(data?.items.reduce((acc, item) => acc + (item.registeredCount ?? 0), 0) ?? 0),
      color: 'bg-[#EBF8FF] dark:bg-blue-950/20',
      textColor: 'text-[#2563EB] dark:text-blue-400',
      borderColor: 'border-[#93C5FD] dark:border-blue-900/40',
      valueColor: 'text-[#1E3A8A] dark:text-blue-200',
    },
  ], []);

  if (isNewCoursePage) {
    return <Outlet />
  }

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

          <CourseList
            isLoading={isLoading}
            apiData={data ?? null}
            pageNumber={pageNumber}
            onPageChange={setPageNumber}
          />
        </div>
      </div>
    </div>
  );
}



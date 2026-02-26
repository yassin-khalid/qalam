export interface Course {
  id: number;
  title: string;
  descriptionShort: string;
  teacherId: number;
  domainId: number;
  domainNameEn: string;
  subjectId: number;
  subjectNameEn: string;
  teachingModeId: number;
  teachingModeNameEn: string;
  sessionTypeId: number;
  sessionTypeNameEn: string;
  status: number; // 1: مسودة, 2: منشور, 3: متوقف
  isActive: boolean;
  price: number;
  startDate?: string;
  sessionsCount?: number;
  registeredCount?: number;
}

export interface ApiResponse {
  items: Course[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface StatItem {
  label: string;
  value: string;
  color: string;
  textColor: string;
  borderColor: string;
  valueColor: string;
}


export interface DomainFromServer {
  id: number;
  nameAr: string;
  nameEn: string;
  code: string;
  descriptionAr: string;
  descriptionEn: string;
  createdAt: string;
}

export interface FilterOption {
  id: number;
  nameAr: string;
  nameEn: string;
  code: string | null;
}

export interface UnitOption {
  id: number;
  nameAr: string;
  nameEn: string;
  code: string | null;
}

export interface FilterResponse {
  statusCode: number;
  succeeded: boolean;
  message: string;
  data: {
    currentState: {
      domainId: number | null;
      curriculumId: number | null;
      levelId: number | null;
      gradeId: number | null;
      termIds: number[] | null;
      subjectId: number | null;
    };
    rule: {
      hasCurriculum: boolean;
      hasEducationLevel: boolean;
      hasGrade: boolean;
      hasAcademicTerm: boolean;
      hasContentUnits: boolean;
      hasLessons: boolean;
    };
    nextStep: string;
    options: FilterOption[];
    unit: UnitOption[] | null;
    totalCount: number | null;
    pageNumber: number | null;
    pageSize: number | null;
    totalPages: number | null;
  };
}

export interface DomainOption {
  id: number;
  title: string;
  icon: string;
}

export interface SubjectDetails {
  id: number;
  name: string;
  isFull: boolean;
  units: string[];
  unitIds?: number[];
}

export interface Group {
  id: string;
  name: string;
  curriculum: string;
  curriculumId?: number;
  stage: string;
  levelId?: number;
  level: string;
  gradeId?: number;
  subjects?: SubjectDetails[];
}

export enum AppStep {
  DOMAIN_SELECTION,
  SUBJECT_SELECTION,
  AVAILABILITY_SELECTION,
  EXCEPTIONS_SELECTION,
  SURVEY_GENERATION,
  SURVEY_EDITOR,
  SURVEY_PREVIEW
}

export interface SurveyQuestion {
  id: string;
  text: string;
  type: 'multiple_choice' | 'rating' | 'text';
  options?: string[];
}

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
}

export interface DayAvailability {
  slots: TimeSlot[];
}

export interface Exception {
  id: string;
  type: 'full_day' | 'period';
  date: string;
  startTime?: string;
  endTime?: string;
}

export interface Unit {
    id: number;
    unitId: number;
    unitNameAr: string;
    unitNameEn: string;
    unitTypeCode: string;
    quranContentTypeId: number | null;
    quranContentTypeNameAr: string | null;
    quranContentTypeNameEn: string | null;
    quranLevelId: number | null;
    quranLevelNameAr: string | null;
    quranLevelNameEn: string | null;
}

export interface Subject {
    id: number;
    subjectId: number;
    subjectNameAr: string;
    subjectNameEn: string;
    domainCode: string;
    curriculumId: number | null;
    curriculumNameAr: string | null;
    curriculumNameEn: string | null;
    levelId: number | null;
    levelNameAr: string | null;
    levelNameEn: string | null;
    gradeId: number | null;
    gradeNameAr: string | null;
    gradeNameEn: string | null;
    canTeachFullSubject: boolean;
    isActive: boolean;
    units: Unit[];
}
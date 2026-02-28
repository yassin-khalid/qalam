import { queryOptions } from "@tanstack/react-query"

type SubjectData = {
    id: number,
    subjectId: number,
    subjectNameAr: string,
    subjectNameEn: string,
    domainCode: string,
    curriculumId: number | null,
    curriculumNameAr: string | null,
    curriculumNameEn: string | null,
    levelId: number | null,
    levelNameAr: string | null,
    levelNameEn: string | null,
    gradeId: number | null,
    gradeNameAr: string | null,
    gradeNameEn: string | null,
    canTeachFullSubject: boolean,
    isActive: boolean,
    units: UnitData[]
}
type UnitData = {
    id: number,
    unitId: number,
    unitNameAr: string,
    unitNameEn: string,
    unitTypeCode: string,
    quranContentTypeId: number,
    quranContentTypeNameAr: string,
    quranContentTypeNameEn: string,
    quranLevelId: number | null,
    quranLevelNameAr: string | null,
    quranLevelNameEn: string | null
}
type SubjectResponse = {
    statusCode: number,
    succeeded: boolean,
    message: string,
    data: SubjectData[],
    errors: null,
    meta: null
}

export const subjectsQueryOptions = (token: string) => queryOptions({
    queryKey: ['subjects'],
    queryFn: async () => {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/Api/V1/Teacher/TeacherSubject`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Accept-Language': 'ar-EG',
                'Accept': 'application/json',
            },
        })
        console.log({ subjectsResponse: response })
        if (!response.ok) {
            const error = await response.json() as { message: string };
            throw new Error(error.message);
        }
        const data = await response.json() as SubjectResponse;
        return data.data as SubjectData[]
    }
})
import { queryOptions } from "@tanstack/react-query";

type TeachingModeData = {
    id: number,
    code: string,
    nameAr: string,
    nameEn: string,
    descriptionAr: string,
    descriptionEn: string,
    domainTeachingModes: []
}
type TeachingModeResponse = {
    statusCode: 200,
    succeeded: true,
    message: "Success",
    data: TeachingModeData[],
    errors: null,
    meta: {
        totalCount: number,
        pageNumber: number,
        pageSize: number,
        totalPages: number,
        hasPreviousPage: boolean,
        hasNextPage: boolean,
    } | null,
}

export const teachingModeQueryOptions = (token: string) => queryOptions({
    queryKey: ['teaching-modes'],
    queryFn: async () => {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/Api/V1/Teaching/Modes`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Accept-Language': 'ar-EG',
                'Accept': 'application/json',
            },
        })
        console.log({ teachingModesResponse: response })
        if (!response.ok) {
            const error = await response.json() as { message: string };
            throw new Error(error.message);
        }
        const data = await response.json() as TeachingModeResponse;
        return data.data
    }
})
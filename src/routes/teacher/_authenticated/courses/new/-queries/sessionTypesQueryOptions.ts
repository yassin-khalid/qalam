import { queryOptions } from "@tanstack/react-query"

type SessionTypesData = {
    id: number,
    code: string,
    nameAr: string,
    nameEn: string,
    descriptionAr: string,
    descriptionEn: string
}
type SessionTypesResponse = {
    statusCode: number,
    succeeded: boolean,
    message: string,
    data: SessionTypesData[],
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

export const sessionTypesQueryOptions = (token: string) => queryOptions({
    queryKey: ['session-types'],
    queryFn: async () => {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/Api/V1/Teaching/SessionTypes`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Accept-Language': 'ar-EG',
                'Accept': 'application/json',
            },
        })
        console.log({ sessionTypesResponse: response })
        if (!response.ok) {
            const error = await response.json() as { message: string };
            throw new Error(error.message);
        }
        const data = await response.json() as SessionTypesResponse;
        return data.data
    }
})
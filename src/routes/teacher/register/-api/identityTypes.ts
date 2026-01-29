type IdentityTypeData = {
    value: number
    name: string
    displayName: string
}

type IdentityTypeResponse = {
    statusCode: number,
    succeeded: boolean,
    message: string,
    data: IdentityTypeData[]
    errors: null,
    meta: null
}

type GetIdentityTypesParams = {
    token: string,
    isInSaudiArabia: boolean
}

export async function getIdentityTypes(params: GetIdentityTypesParams): Promise<IdentityTypeResponse> {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/Api/V1/Authentication/IdentityTypes?isInSaudiArabia=${params.isInSaudiArabia}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${params.token}`,
            'Accept-Language': 'ar-EG',
        },
    })
    const data = await response.json() as IdentityTypeResponse;
    return data
}
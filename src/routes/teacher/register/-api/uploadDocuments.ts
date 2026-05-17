import { objectToFormData } from "@/lib/utils/objectToFormData";

type UploadDocumentsParams = | {
    type: 'saudi';
    token: string;
    isInSaudiArabia: boolean;
    identityType: number;
    documentNumber: string;
    identityDocumentFile: File | null;
    certificates: {
        file: File | null;
        title: string;
        issuer: string;
        issueDate: string;
    }[];
} | {
    type: 'foreign';
    token: string;
    isInSaudiArabia: boolean;
    identityType: number;
    documentNumber: string;
    issuingCountryCode: string;
    identityDocumentFile: File | null;
    certificates: {
        file: File | null;
        title: string;
        issuer: string;
        issueDate: string;
    }[];
}

export interface UploadDocumentsSuccessResponse {
    statusCode: string;
    succeeded: true;
    message: string;
    data: string;
    errors: null;
    meta: null;
}

interface UploadDocumentsErrorResponse {
    statusCode: number | string;
    succeeded: false;
    message: string;
    data: null;
    errors: string[] | null;
    meta: null;
}

export class UploadDocumentsError extends Error {
    statusCode: number | string;
    errors: string[] | null;
    constructor(error: UploadDocumentsErrorResponse) {
        super(error.message ?? 'حدث خطأ ما');
        this.name = 'UploadDocumentsError';
        this.statusCode = error.statusCode;
        this.errors = error.errors;
    }
}

export async function uploadDocuments(params: UploadDocumentsParams): Promise<UploadDocumentsSuccessResponse> {
    const { token, type, ...rest } = params;
    const formData = objectToFormData(rest);
    const response = await fetch(`${import.meta.env.VITE_API_URL}/Api/V1/Authentication/Teacher/UploadDocuments`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        body: formData,
    });
    if (!response.ok) {
        const error = await response.json() as UploadDocumentsErrorResponse;
        throw new UploadDocumentsError(error);
    }
    return await response.json() as UploadDocumentsSuccessResponse;
}

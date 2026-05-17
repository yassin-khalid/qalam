export interface TeacherDocumentReview {
    documentId: number;
    documentType: number;
    status: number;
    rejectionReason: string | null;
    fileName?: string | null;
    fileUrl?: string | null;
    uploadedAt?: string | null;
    reviewedAt?: string | null;
}

interface DocumentsStatusResponse {
    statusCode: number | string;
    succeeded: true;
    message: string;
    data: TeacherDocumentReview[];
    errors: null;
    meta: null;
}

interface ApiErrorResponse {
    statusCode: number | string;
    succeeded: false;
    message: string;
    data: null;
    errors: string[] | null;
    meta: null;
}

export class TeacherDocumentsError extends Error {
    statusCode: number | string;
    errors: string[] | null;
    constructor(error: ApiErrorResponse) {
        super(error.message ?? 'حدث خطأ ما');
        this.name = 'TeacherDocumentsError';
        this.statusCode = error.statusCode;
        this.errors = error.errors;
    }
}

export async function getTeacherDocumentsStatus(token: string): Promise<TeacherDocumentReview[]> {
    const response = await fetch(
        `${import.meta.env.VITE_API_URL}/Api/V1/Teacher/TeacherDocuments/Status`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        },
    );
    if (!response.ok) {
        const error = await response.json() as ApiErrorResponse;
        throw new TeacherDocumentsError(error);
    }
    const json = await response.json() as DocumentsStatusResponse;
    return json.data;
}

interface ReuploadDocumentParams {
    documentId: number;
    file: File;
    token: string;
}

export async function reuploadDocument(params: ReuploadDocumentParams): Promise<{ message: string }> {
    const { documentId, file, token } = params;
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(
        `${import.meta.env.VITE_API_URL}/Api/V1/Teacher/TeacherDocuments/${documentId}/Reupload`,
        {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        },
    );
    if (!response.ok) {
        const error = await response.json() as ApiErrorResponse;
        throw new TeacherDocumentsError(error);
    }
    return await response.json();
}

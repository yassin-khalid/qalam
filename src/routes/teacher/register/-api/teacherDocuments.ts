import { RequirementType } from "../-types/RegistrationRequirement";

export type VerificationStatus = "Pending" | "Approved" | "Rejected";

/** Per-requirement review status returned by the Status endpoint (step 6). */
export interface RequirementStatus {
    code: string;
    nameAr?: string | null;
    nameEn?: string | null;
    requirementType: RequirementType;
    isRequired: boolean;
    isSubmitted: boolean;
    verificationStatus: VerificationStatus;
    rejectionReason?: string | null;
    teacherDocumentId?: number | null;
    textValue?: string | null;
    boolValue?: boolean | null;
}

/**
 * Legacy `TeacherDocument` DTO returned alongside `requirements`. Normally
 * empty, but it still carries the real document `id` for File requirements —
 * needed to recover a `teacherDocumentId` the backend left null on a rejected
 * requirement (see the reupload route's `rejectedDocuments` resolver).
 */
export interface LegacyDocument {
    id: number;
    documentType: string;
    filePath?: string | null;
    verificationStatus: VerificationStatus;
    rejectionReason?: string | null;
    certificateTitle?: string | null;
    documentNumber?: string | null;
}

export interface TeacherDocumentsStatus {
    requirements: RequirementStatus[];
    legacyDocuments: LegacyDocument[];
}

interface DocumentsStatusResponse {
    statusCode: number | string;
    succeeded: true;
    message: string;
    data: TeacherDocumentsStatus;
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
        super(error.message ?? "حدث خطأ ما");
        this.name = "TeacherDocumentsError";
        this.statusCode = error.statusCode;
        this.errors = error.errors;
    }
}

export async function getTeacherDocumentsStatus(
    token: string,
): Promise<TeacherDocumentsStatus> {
    const response = await fetch(
        `${import.meta.env.VITE_API_URL}/Api/V1/Teacher/TeacherDocuments/Status`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        },
    );
    if (!response.ok) {
        const error = (await response.json()) as ApiErrorResponse;
        throw new TeacherDocumentsError(error);
    }
    const json = (await response.json()) as DocumentsStatusResponse;
    return {
        requirements: json.data?.requirements ?? [],
        legacyDocuments: json.data?.legacyDocuments ?? [],
    };
}

interface ReuploadDocumentParams {
    teacherDocumentId: number;
    file: File;
    token: string;
}

export async function reuploadDocument(
    params: ReuploadDocumentParams,
): Promise<{ message: string }> {
    const { teacherDocumentId, file, token } = params;
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
        `${import.meta.env.VITE_API_URL}/Api/V1/Teacher/TeacherDocuments/${teacherDocumentId}/Reupload`,
        {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        },
    );
    if (!response.ok) {
        const error = (await response.json()) as ApiErrorResponse;
        throw new TeacherDocumentsError(error);
    }
    return await response.json();
}

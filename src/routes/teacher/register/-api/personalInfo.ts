interface PersonalInfoParams {
    firstName: string;
    lastName: string;
    /** Omit when the email was already collected at the OTP step. */
    email?: string;
    password: string;
    token: string;
}

export interface PersonalInfoSuccessResponseData {
    account: {
        firstName: string,
        lastName: string,
        email: string,
        phoneNumber: string,
        token: string,
    }
    nextStep: {
        currentStep: number,
        nextStep: number,
        nextStepName: string,
        isRegistrationComplete: boolean,
        message: string | null,
        rejectedDocuments: RejectedDocumentInfo[] | null,
    }
}

export interface RejectedDocumentInfo {
    documentId: number;
    documentType: number;
    rejectionReason: string;
}

type PersonalInfoSuccessResponse = {
    statusCode: number,
    succeeded: boolean,
    message: string,
    data: PersonalInfoSuccessResponseData,
    errors: null,
    meta: null
}

type PersonalInfoErrorType = {
    statusCode: number,
    succeeded: false,
    message: string,
    data: null,
    errors: string[] | null,
    meta: null
}

export class PersonalInfoError extends Error {
    statusCode: number;
    errors: string[] | null;
    constructor(error: PersonalInfoErrorType) {
        super(error.message ?? 'حدث خطأ ما');
        this.name = 'PersonalInfoError';
        this.statusCode = error.statusCode;
        this.errors = error.errors;
    }
}

export async function personalInfo(params: PersonalInfoParams): Promise<PersonalInfoSuccessResponse> {
    const { token, ...body } = params;
    const response = await fetch(`${import.meta.env.VITE_API_URL}/Api/V1/Authentication/Teacher/CompletePersonalInfo`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
    });
    if (!response.ok) {
        const error = await response.json() as PersonalInfoErrorType;
        throw new PersonalInfoError(error);
    }
    const data = await response.json() as PersonalInfoSuccessResponse;
    return data;
}

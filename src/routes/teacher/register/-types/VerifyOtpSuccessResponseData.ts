export interface RejectedDocumentInfo {
    documentId: number;
    documentType: number;
    rejectionReason: string;
}

export interface RegistrationStep {
    currentStep: number;
    nextStep: number;
    nextStepName: string;
    isRegistrationComplete: boolean;
    message: string | null;
    rejectedDocuments: RejectedDocumentInfo[] | null;
}

export interface VerifyOtpSuccessResponseData {
    token: string;
    isNewUser: boolean;
    nextStep: RegistrationStep;
}

export interface VerifyOtpSuccessResponseData {
    token: string;
    nextStep: {
        currentStep: number;
        nextStep: number;
        nextStepName: string;
        isRegistrationComplete: boolean;
        message: string | null;
    }
}
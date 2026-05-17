import type { NavigateOptions } from '@tanstack/react-router';
import type { RegistrationStep } from '@/routes/teacher/register/-types/VerifyOtpSuccessResponseData';

export const NextStepName = {
    CompletePersonalInformation: 'Complete Personal Information',
    UploadDocuments: 'Upload Documents',
    AwaitingAdminVerification: 'Awaiting Admin Verification',
    ReuploadRejectedDocuments: 'Re-upload Rejected Documents',
    AddTeachingSubjects: 'Add Teaching Subjects and Units',
    SetAvailability: 'Set Your Availability',
    RegistrationComplete: 'Registration Complete',
} as const;

export type NextStepNameValue = typeof NextStepName[keyof typeof NextStepName];

export function nextStepToNavigateOptions(step: RegistrationStep): NavigateOptions {
    switch (step.nextStepName) {
        case NextStepName.CompletePersonalInformation:
            return { to: '/teacher/register', search: { step: 1 } } as NavigateOptions;
        case NextStepName.UploadDocuments:
            return { to: '/teacher/register', search: { step: 2 } } as NavigateOptions;
        case NextStepName.AwaitingAdminVerification:
            return { to: '/teacher/await' } as NavigateOptions;
        case NextStepName.ReuploadRejectedDocuments:
            return { to: '/teacher/reupload' } as NavigateOptions;
        case NextStepName.AddTeachingSubjects:
            return { to: '/teacher/survey' } as NavigateOptions;
        case NextStepName.SetAvailability:
            return { to: '/teacher/survey' } as NavigateOptions;
        case NextStepName.RegistrationComplete:
            return { to: '/teacher' } as NavigateOptions;
        default:
            return { to: '/teacher' } as NavigateOptions;
    }
}

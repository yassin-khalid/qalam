import z from "zod";

export const teacherSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.email().optional(),
    mobile: z.string().optional(),
})

export const registrationStepSchema = z.object({
    currentStep: z.number(),
    nextStep: z.number(),
    nextStepName: z.string(),
    isRegistrationComplete: z.boolean(),
    message: z.string().nullable().optional(),
})

/**
 * Local storage schema for auth session
 */
export const authSessionSchema = z.object({
    id: z.literal('current'),
    teacher: teacherSchema,
    token: z.string(),
    theme: z.enum(['light', 'dark']),
    locale: z.enum(['ar', 'en']).optional(),
    phoneNumber: z.string().optional(),
    registrationStep: registrationStepSchema.optional(),
})

export interface EmailPasswordCredentials {
    type: 'email';
    email: string;
    password: string;
}

export interface MobileOTPCredentials {
    type: 'mobile';
    mobile: string;
    otp: string;
}

export type LoginCredentials = EmailPasswordCredentials | MobileOTPCredentials;

export type AuthSession = z.infer<typeof authSessionSchema>;
export type Teacher = z.infer<typeof teacherSchema>;

export const personaConfigSchema = z.object({
    loginMethod: z.string(),
    otpDelivery: z.enum(['Email', 'Sms']),
    showPhoneField: z.boolean(),
    showEmailField: z.boolean(),
    phoneRequired: z.boolean(),
    emailRequired: z.boolean(),
    otpHintEn: z.string(),
    otpHintAr: z.string(),
});

export const authConfigSchema = z.object({
    teacher: personaConfigSchema,
    otp: z.object({
        length: z.number().int().positive(),
        expirySeconds: z.number().int().positive(),
    }),
});

export type PersonaConfig = z.infer<typeof personaConfigSchema>;
export type AuthConfig = z.infer<typeof authConfigSchema>;
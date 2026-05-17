import z from "zod";

const certificateSchema = z.object({
    file: z.union([
        z.instanceof(File).refine((file) => file.size <= 5 * 1024 * 1024, {
            message: 'الملف يجب أن يكون أصغر من 5MB'
        }),
        z.null(),
    ]),
    title: z.string(),
    issuer: z.string(),
    issueDate: z.string(),
});

export const stepTwoFormSchema = z.object({
    isInSaudiArabia: z.boolean(),
    identityType: z.number(),
    documentNumber: z.string().min(1, { message: 'رقم المستند مطلوب' }),
    issuingCountryCode: z.string(),
    identityDocumentFile: z.union([
        z.instanceof(File).refine((file) => file.size <= 5 * 1024 * 1024, {
            message: 'الملف يجب أن يكون أصغر من 5MB'
        }),
        z.null(),
    ]),
    certificates: z.array(certificateSchema).min(1, { message: 'يجب إضافة شهادة واحدة على الأقل' }).max(5, { message: 'الحد الأقصى 5 شهادات' }),
})
    .refine((data) => data.identityDocumentFile !== null, {
        message: 'يجب إدخال ملف',
        path: ['identityDocumentFile'],
    })
    .refine((data) => data.certificates.every((cert) => cert.file !== null), {
        message: 'يجب إدخال ملف',
        path: ['certificates'],
    })
    .refine((data) => data.isInSaudiArabia || data.issuingCountryCode.trim().length > 0, {
        message: 'بلد الإصدار مطلوب',
        path: ['issuingCountryCode'],
    });

export type StepTwoData = z.infer<typeof stepTwoFormSchema>;
export type StepTwoDataOmitIssuingCountryCodeAndIdentityDocumentFileAndCertificates = Omit<StepTwoData, 'issuingCountryCode' | 'identityDocumentFile' | 'certificates'>;

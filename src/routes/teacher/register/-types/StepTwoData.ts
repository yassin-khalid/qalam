// import { Certificate } from "./Certificate";
// import { IdentityDocument } from "./IdentityDocument";

import z from "zod";


// export interface StepTwoData {
//   isInSaudiArabia: boolean;
//   identityDocument: IdentityDocument;
//   certificates: Certificate[];
// }


export const stepTwoFormSchema = z.object({
    isInSaudiArabia: z.boolean(),
    identityType: z.number(),
    documentNumber: z.string(),
    issuingCountryCode: z.string(),
    identityDocumentFile: z.union([
        z.instanceof(File).refine((file) => file.size <= 5 * 1024 * 1024, { 
            message: 'الملف يجب أن يكون أصغر من 5MB' 
        }),
        z.null()
    ]),
    certificates: z.array(z.object({
        certificateFile: z.union([
            z.instanceof(File).refine((file) => file.size <= 5 * 1024 * 1024, { 
                message: 'الملف يجب أن يكون أصغر من 5MB' 
            }),
            z.null()
        ]),
        title: z.string(),
        issuer: z.string(),
        issueDate: z.string(),
    })),
}).refine((data) => data.identityDocumentFile !== null, {
    message: 'يجب إدخال ملف',
    path: ['identityDocumentFile']
}).refine((data) => data.certificates.every(cert => cert.certificateFile !== null), {
    message: 'يجب إدخال ملف',
    path: ['certificates']
});

export type StepTwoData = z.infer<typeof stepTwoFormSchema>;

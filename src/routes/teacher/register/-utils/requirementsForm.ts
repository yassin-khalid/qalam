import z from "zod";
import type { TFunction } from "i18next";
import {
    KnownRequirementCode,
    RegistrationRequirement,
    isCustomFileRequirement,
    isCustomTextRequirement,
    isCustomBooleanRequirement,
    isSelectionRequirement,
} from "../-types/RegistrationRequirement";
import type { RequirementsFormValues } from "../-api/submitRegistrationRequirements";

export function byCode(
    requirements: RegistrationRequirement[],
): Record<string, RegistrationRequirement> {
    return Object.fromEntries(requirements.map((r) => [r.code, r]));
}

export function formatBytes(bytes: number): string {
    if (bytes >= 1024 * 1024) return `${Math.round(bytes / (1024 * 1024))}MB`;
    if (bytes >= 1024) return `${Math.round(bytes / 1024)}KB`;
    return `${bytes}B`;
}

export function fileExtension(fileName: string): string {
    const idx = fileName.lastIndexOf(".");
    return idx === -1 ? "" : fileName.slice(idx).toLowerCase();
}

export function isAllowedExtension(
    fileName: string,
    allowedExtensions?: string[] | null,
): boolean {
    if (!allowedExtensions || allowedExtensions.length === 0) return true;
    const ext = fileExtension(fileName);
    return allowedExtensions.some((e) => e.toLowerCase() === ext);
}

/** Comma-joined accept attribute, e.g. ".pdf,.jpg,.png". */
export function acceptAttribute(
    allowedExtensions?: string[] | null,
): string | undefined {
    if (!allowedExtensions || allowedExtensions.length === 0) return undefined;
    return allowedExtensions.join(",");
}

function buildFileSchema(req: RegistrationRequirement, t: TFunction) {
    return z
        .instanceof(File, {
            error: t("auth.register.stepTwo.requirements.validation.fileRequired"),
        })
        .refine(
            (file) =>
                !req.maxFileSizeBytes || file.size <= req.maxFileSizeBytes,
            {
                message: t(
                    "auth.register.stepTwo.requirements.validation.fileTooLarge",
                    { size: formatBytes(req.maxFileSizeBytes ?? 0) },
                ),
            },
        )
        .refine((file) => isAllowedExtension(file.name, req.allowedExtensions), {
            message: t(
                "auth.register.stepTwo.requirements.validation.fileWrongType",
                { exts: (req.allowedExtensions ?? []).join(", ") },
            ),
        });
}

/** Builds default form values from the active requirements. */
export function buildDefaults(
    requirements: RegistrationRequirement[],
    seed?: Partial<Pick<
        RequirementsFormValues,
        "isInSaudiArabia" | "identityType" | "documentNumber"
    >>,
): RequirementsFormValues {
    const map = byCode(requirements);
    const certificateReq = map[KnownRequirementCode.Certificate];

    const customFiles: Record<string, File[]> = {};
    const customTexts: Record<string, string> = {};
    const customBools: Record<string, boolean> = {};
    const customSelections: Record<string, string[]> = {};
    for (const req of requirements) {
        if (isCustomFileRequirement(req)) customFiles[req.code] = [];
        else if (isCustomTextRequirement(req)) customTexts[req.code] = "";
        else if (isCustomBooleanRequirement(req)) customBools[req.code] = false;
        else if (isSelectionRequirement(req)) customSelections[req.code] = [];
    }

    // Pre-seed one empty certificate row when certificates are required.
    const certificates =
        certificateReq?.isRequired
            ? [{ file: null, title: "", issuer: "", issueDate: "" }]
            : [];

    return {
        isInSaudiArabia: seed?.isInSaudiArabia ?? true,
        identityType: seed?.identityType ?? 1,
        documentNumber: seed?.documentNumber ?? "",
        issuingCountryCode: "",
        identityDocumentFile: null,
        certificates,
        bio: "",
        customFiles,
        customTexts,
        customBools,
        customSelections,
    };
}

/**
 * Builds a Zod schema that validates only the fields belonging to active
 * requirements. File limits, counts and text length come from the API.
 */
export function buildRequirementsSchema(
    requirements: RegistrationRequirement[],
    t: TFunction,
) {
    const map = byCode(requirements);
    const requiredMsg = t(
        "auth.register.stepTwo.requirements.validation.fieldRequired",
    );

    const shape: Record<string, z.ZodTypeAny> = {};

    const locationReq = map[KnownRequirementCode.Location];
    if (locationReq) {
        shape.isInSaudiArabia = z.boolean();
    }

    const identityReq = map[KnownRequirementCode.IdentityDocument];
    if (identityReq) {
        shape.identityType = z.number();
        shape.documentNumber = identityReq.isRequired
            ? z.string().min(1, { message: requiredMsg })
            : z.string();
        shape.issuingCountryCode = z.string();
        shape.identityDocumentFile = z.union([
            buildFileSchema(identityReq, t),
            z.null(),
        ]);
    }

    const certificateReq = map[KnownRequirementCode.Certificate];
    if (certificateReq) {
        const certSchema = z.object({
            file: z
                .union([buildFileSchema(certificateReq, t), z.null()])
                .refine((file) => file !== null, {
                    message: t(
                        "auth.register.stepTwo.requirements.validation.fileRequired",
                    ),
                }),
            title: z.string().min(1, { message: requiredMsg }),
            issuer: z.string().min(1, { message: requiredMsg }),
            issueDate: z.string().min(1, { message: requiredMsg }),
        });
        const minCount = certificateReq.isRequired
            ? Math.max(1, certificateReq.minCount ?? 1)
            : 0;
        const maxCount = certificateReq.maxCount ?? 5;
        shape.certificates = z
            .array(certSchema)
            .min(minCount, {
                message: t(
                    "auth.register.stepTwo.requirements.validation.minCertificates",
                    { count: minCount },
                ),
            })
            .max(maxCount, {
                message: t(
                    "auth.register.stepTwo.requirements.validation.maxCertificates",
                    { count: maxCount },
                ),
            });
    }

    const bioReq = map[KnownRequirementCode.Bio];
    if (bioReq) {
        let bioSchema = z.string();
        if (bioReq.isRequired) {
            bioSchema = bioSchema.min(1, { message: requiredMsg });
        }
        if (bioReq.maxLength) {
            bioSchema = bioSchema.max(bioReq.maxLength, {
                message: t(
                    "auth.register.stepTwo.requirements.validation.bioTooLong",
                    { max: bioReq.maxLength },
                ),
            });
        }
        shape.bio = bioSchema;
    }

    // Custom requirements keyed by code, grouped by wire format.
    const customFileShape: Record<string, z.ZodTypeAny> = {};
    const customTextShape: Record<string, z.ZodTypeAny> = {};
    const customBoolShape: Record<string, z.ZodTypeAny> = {};
    const customSelectionShape: Record<string, z.ZodTypeAny> = {};
    for (const req of requirements) {
        if (isCustomFileRequirement(req)) {
            // A non-required requirement has no minimum, even if the catalog
            // sends a stray minCount >= 1 (backend data can be inconsistent).
            const minCount = req.isRequired ? Math.max(1, req.minCount ?? 1) : 0;
            const maxCount = req.maxCount ?? 1;
            customFileShape[req.code] = z
                .array(buildFileSchema(req, t))
                .min(minCount, { message: requiredMsg })
                .max(maxCount, {
                    message: t(
                        "auth.register.stepTwo.requirements.validation.maxFiles",
                        { count: maxCount },
                    ),
                });
        } else if (isCustomTextRequirement(req)) {
            let textSchema = z.string();
            if (req.isRequired) {
                textSchema = textSchema.min(1, { message: requiredMsg });
            }
            if (req.maxLength) {
                textSchema = textSchema.max(req.maxLength, {
                    message: t(
                        "auth.register.stepTwo.requirements.validation.textTooLong",
                        { max: req.maxLength },
                    ),
                });
            }
            customTextShape[req.code] = textSchema;
        } else if (isCustomBooleanRequirement(req)) {
            // A toggle always carries a value; required just means it must be set,
            // which a boolean inherently is.
            customBoolShape[req.code] = z.boolean();
        } else if (isSelectionRequirement(req)) {
            const minCount = req.isRequired ? Math.max(1, req.minCount ?? 1) : 0;
            const maxCount = req.maxCount ?? (req.options?.length ?? 1);
            customSelectionShape[req.code] = z
                .array(z.string())
                .min(minCount, {
                    message: t(
                        "auth.register.stepTwo.requirements.validation.minSelections",
                        { count: minCount },
                    ),
                })
                .max(maxCount, {
                    message: t(
                        "auth.register.stepTwo.requirements.validation.maxSelections",
                        { count: maxCount },
                    ),
                });
        }
    }
    shape.customFiles = z.object(customFileShape);
    shape.customTexts = z.object(customTextShape);
    shape.customBools = z.object(customBoolShape);
    shape.customSelections = z.object(customSelectionShape);

    return z
        .object(shape)
        .superRefine((value: Record<string, unknown>, ctx) => {
            // Identity document file required when the requirement is required.
            if (
                identityReq?.isRequired &&
                !value.identityDocumentFile
            ) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["identityDocumentFile"],
                    message: t(
                        "auth.register.stepTwo.requirements.validation.fileRequired",
                    ),
                });
            }
            // Issuing country required for non-KSA teachers when identity is active.
            if (
                identityReq &&
                value.isInSaudiArabia === false &&
                !String(value.issuingCountryCode ?? "").trim()
            ) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["issuingCountryCode"],
                    message: t(
                        "auth.register.stepTwo.requirements.validation.issuingCountryRequired",
                    ),
                });
            }
        });
}

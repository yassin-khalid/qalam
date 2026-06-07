import {
    KnownRequirementCode,
    RegistrationRequirement,
    isCustomFileRequirement,
    isCustomTextRequirement,
    isCustomBooleanRequirement,
    isSelectionRequirement,
} from "../-types/RegistrationRequirement";

export interface CertificateValue {
    file: File | null;
    title: string;
    issuer: string;
    issueDate: string;
}

/** Internal form state for the dynamic registration-requirements form. */
export interface RequirementsFormValues {
    isInSaudiArabia: boolean;
    identityType: number;
    documentNumber: string;
    issuingCountryCode: string;
    identityDocumentFile: File | null;
    certificates: CertificateValue[];
    bio: string;
    /** Custom file requirements keyed by requirement code. */
    customFiles: Record<string, File[]>;
    /** Custom Text requirements keyed by requirement code. */
    customTexts: Record<string, string>;
    /** Custom Boolean requirements keyed by requirement code. */
    customBools: Record<string, boolean>;
    /** Selection requirements keyed by requirement code (chosen option values). */
    customSelections: Record<string, string[]>;
}

interface SubmitSuccessResponse {
    statusCode: number | string;
    succeeded: true;
    message: string;
    data: unknown;
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

export class SubmitRegistrationRequirementsError extends Error {
    statusCode: number | string;
    errors: string[] | null;
    constructor(error: ApiErrorResponse) {
        super(error.message ?? "حدث خطأ ما");
        this.name = "SubmitRegistrationRequirementsError";
        this.statusCode = error.statusCode;
        this.errors = error.errors;
    }
}

/**
 * Builds the multipart body for `SubmitRegistrationRequirements`, mapping each
 * active requirement `code` to its expected form fields. Only fields for
 * requirements present in `requirements` are appended.
 */
export function buildRequirementsFormData(
    values: RequirementsFormValues,
    requirements: RegistrationRequirement[],
): FormData {
    const formData = new FormData();
    const activeCodes = new Set(requirements.map((r) => r.code));

    // location → isInSaudiArabia
    if (activeCodes.has(KnownRequirementCode.Location)) {
        formData.append("isInSaudiArabia", String(values.isInSaudiArabia));
    }

    // identity_document → identityType, documentNumber, issuingCountryCode, identityDocumentFile
    if (activeCodes.has(KnownRequirementCode.IdentityDocument)) {
        formData.append("identityType", String(values.identityType));
        formData.append("documentNumber", values.documentNumber);
        // Issuing country only applies to teachers outside KSA.
        if (!values.isInSaudiArabia && values.issuingCountryCode.trim()) {
            formData.append("issuingCountryCode", values.issuingCountryCode);
        }
        if (values.identityDocumentFile) {
            formData.append(
                "identityDocumentFile",
                values.identityDocumentFile,
                values.identityDocumentFile.name,
            );
        }
    }

    // certificate → certificates[i].file / .title / .issuer / .issueDate
    if (activeCodes.has(KnownRequirementCode.Certificate)) {
        values.certificates.forEach((cert, index) => {
            if (cert.file) {
                formData.append(
                    `certificates[${index}].file`,
                    cert.file,
                    cert.file.name,
                );
            }
            formData.append(`certificates[${index}].title`, cert.title);
            formData.append(`certificates[${index}].issuer`, cert.issuer);
            formData.append(`certificates[${index}].issueDate`, cert.issueDate);
        });
    }

    // bio → bio (optional unless required)
    if (activeCodes.has(KnownRequirementCode.Bio) && values.bio.trim()) {
        formData.append("bio", values.bio);
    }

    // Generic custom requirements by code: File → file_{code}, Text → text_{code},
    // Boolean → bool_{code}, Selection → select_{code}. The backend parses these
    // four prefixes; multi-value rows repeat the same key.
    for (const req of requirements) {
        if (isCustomFileRequirement(req)) {
            const files = values.customFiles[req.code] ?? [];
            // The field is repeated once per file (no index) — the server keys
            // every `file_{code}` entry into CustomFilesByCode[code].
            files.forEach((file) => {
                formData.append(`file_${req.code}`, file, file.name);
            });
        } else if (isCustomTextRequirement(req)) {
            const text = values.customTexts[req.code] ?? "";
            if (text.trim()) formData.append(`text_${req.code}`, text);
        } else if (isCustomBooleanRequirement(req)) {
            const bool = values.customBools[req.code];
            if (typeof bool === "boolean") {
                formData.append(`bool_${req.code}`, String(bool));
            }
        } else if (isSelectionRequirement(req)) {
            const selected = values.customSelections[req.code] ?? [];
            // Repeat the key once per chosen option value.
            selected.forEach((value) => {
                formData.append(`select_${req.code}`, value);
            });
        }
    }

    return formData;
}

interface SubmitParams {
    token: string;
    values: RequirementsFormValues;
    requirements: RegistrationRequirement[];
}

/**
 * Step 5 — submit answers for the active registration requirements (multipart).
 */
export async function submitRegistrationRequirements(
    params: SubmitParams,
): Promise<SubmitSuccessResponse> {
    const { token, values, requirements } = params;
    const formData = buildRequirementsFormData(values, requirements);

    const response = await fetch(
        `${import.meta.env.VITE_API_URL}/Api/V1/Authentication/Teacher/SubmitRegistrationRequirements`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        },
    );
    if (!response.ok) {
        const error = (await response.json()) as ApiErrorResponse;
        throw new SubmitRegistrationRequirementsError(error);
    }
    return (await response.json()) as SubmitSuccessResponse;
}

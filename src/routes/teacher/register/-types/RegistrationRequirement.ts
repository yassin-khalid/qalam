export type RequirementType = "File" | "Text" | "Boolean" | "Selection";

/** A single choice for a `Selection` requirement. */
export interface RequirementOption {
    value: string;
    labelAr?: string | null;
    labelEn?: string | null;
}

export interface RegistrationRequirement {
    code: string;
    nameAr?: string | null;
    nameEn?: string | null;
    descriptionAr?: string | null;
    descriptionEn?: string | null;
    requirementType: RequirementType;
    isRequired: boolean;
    sortOrder: number;
    minCount?: number | null;
    maxCount?: number | null;
    maxFileSizeBytes?: number | null;
    allowedExtensions?: string[] | null;
    maxLength?: number | null;
    /** Populated for `Selection` requirements. */
    options?: RequirementOption[] | null;
}

/** System codes that map to fixed form fields on submit (see backend doc). */
export const KnownRequirementCode = {
    IdentityDocument: "identity_document",
    Certificate: "certificate",
    Bio: "bio",
    Location: "location",
} as const;

export type KnownRequirementCodeValue =
    typeof KnownRequirementCode[keyof typeof KnownRequirementCode];

/** File codes the app renders with a dedicated widget instead of the generic uploader. */
export const KNOWN_FILE_CODES: ReadonlySet<string> = new Set([
    KnownRequirementCode.IdentityDocument,
    KnownRequirementCode.Certificate,
]);

export function isCustomFileRequirement(req: RegistrationRequirement): boolean {
    return req.requirementType === "File" && !KNOWN_FILE_CODES.has(req.code);
}

/** Custom (non-system) Text requirement rendered with the generic widget. */
export function isCustomTextRequirement(req: RegistrationRequirement): boolean {
    return (
        req.requirementType === "Text" && req.code !== KnownRequirementCode.Bio
    );
}

/** Custom (non-system) Boolean requirement rendered with the generic toggle. */
export function isCustomBooleanRequirement(
    req: RegistrationRequirement,
): boolean {
    return (
        req.requirementType === "Boolean" &&
        req.code !== KnownRequirementCode.Location
    );
}

/** All Selection requirements are custom — there are no system selection codes. */
export function isSelectionRequirement(req: RegistrationRequirement): boolean {
    return req.requirementType === "Selection";
}

export function requirementLabel(
    req: RegistrationRequirement,
    locale: string,
): string {
    const label = locale === "ar" ? req.nameAr : req.nameEn;
    return label ?? req.nameEn ?? req.nameAr ?? req.code;
}

export function requirementDescription(
    req: RegistrationRequirement,
    locale: string,
): string | null {
    const desc = locale === "ar" ? req.descriptionAr : req.descriptionEn;
    return desc ?? req.descriptionEn ?? req.descriptionAr ?? null;
}

export function optionLabel(opt: RequirementOption, locale: string): string {
    const label = locale === "ar" ? opt.labelAr : opt.labelEn;
    return label ?? opt.labelEn ?? opt.labelAr ?? opt.value;
}

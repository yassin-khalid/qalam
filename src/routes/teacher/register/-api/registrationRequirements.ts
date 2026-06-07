import { RegistrationRequirement } from "../-types/RegistrationRequirement";

interface RegistrationRequirementsResponse {
    statusCode: number | string;
    succeeded: true;
    message: string;
    data: { requirements: RegistrationRequirement[] };
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

export class RegistrationRequirementsError extends Error {
    statusCode: number | string;
    errors: string[] | null;
    constructor(error: ApiErrorResponse) {
        super(error.message ?? "حدث خطأ ما");
        this.name = "RegistrationRequirementsError";
        this.statusCode = error.statusCode;
        this.errors = error.errors;
    }
}

/**
 * Step 4 — load the admin-controlled registration requirements catalog.
 * No Authorization header is required for this endpoint.
 */
export async function getRegistrationRequirements(): Promise<RegistrationRequirement[]> {
    const response = await fetch(
        `${import.meta.env.VITE_API_URL}/Api/V1/Authentication/Teacher/RegistrationRequirements`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        },
    );
    if (!response.ok) {
        const error = (await response.json()) as ApiErrorResponse;
        throw new RegistrationRequirementsError(error);
    }
    const json = (await response.json()) as RegistrationRequirementsResponse;
    const requirements = json.data?.requirements ?? [];
    return [...requirements].sort((a, b) => a.sortOrder - b.sortOrder);
}

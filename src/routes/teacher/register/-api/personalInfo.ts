

interface PersonalInfoParams {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export async function personalInfo(params: PersonalInfoParams): Promise<PersonalInfoSuccessResponse> {
    try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/Api/V1/Authentication/Teacher/Step3-PersonalInfo`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
    });
    if (!response.ok) {
        const error = await response.json() as SendOtpErrorType;
        throw new SendOtpError(error);
    }
    const data = await response.json() as SendOtpSuccessResponse;
    return data;
    } catch (error) {
        throw error
    }

}


interface PersonalInfoParams {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    token: string;
}

export interface PersonalInfoSuccessResponseData {
    account: {
        firstName: string,
        lastName: string,
        email: string,
        phoneNumber: string,
        token: string,
    }
    nextStep: {
        currentStep: number,
        nextStep: number,
        nextStepName: string,
        isRegistrationComplete: boolean,
        message: string | null,
    }
}

type PersonalInfoSuccessResponse = {
    statusCode: number,
    succeeded: boolean,
    message: string,
    data: PersonalInfoSuccessResponseData,
    errors: null,
    meta: null
}

export async function personalInfo(params: PersonalInfoParams): Promise<PersonalInfoSuccessResponse> {
    try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/Api/V1/Authentication/Teacher/Step3-PersonalInfo`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${params.token}`,
        },
        body: JSON.stringify(params),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
    }
    const data = await response.json() as PersonalInfoSuccessResponse;
    return data;
    } catch (error) {
        throw error
    }

}
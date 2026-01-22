interface VerifyOtpParams {
    phoneNumber: string;
    otpCode: string;
}

type VerifyOtpSuccessResponse = {
  statusCode: 200,
  succeeded: true,
  message: string,
  data: string,
  errors: null,
  meta: null
}

type VerifyOtpErrorType = {
    statusCode: number,
    succeeded: false,
    message: string,
    data: null,
    errors: null,
    meta: null
}

export class VerifyOtpError extends Error {
    statusCode: number;
    constructor(error: VerifyOtpErrorType) {
        super(error.message  ?? 'حدث خطأ ما');
        this.name = 'VerifyOtpError';
        this.statusCode = error.statusCode;
    }
}

export async function verifyOtp(params: VerifyOtpParams): Promise<VerifyOtpSuccessResponse> {
    try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/Api/V1/Authentication/Teacher/Step2-VerifyOtp`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
    });
    if (!response.ok) {
        const error = await response.json() as VerifyOtpErrorType;
        throw new VerifyOtpError(error);
    }
    const data = await response.json() as VerifyOtpSuccessResponse;
    return data;
    } catch (error) {
        throw error
    }
}
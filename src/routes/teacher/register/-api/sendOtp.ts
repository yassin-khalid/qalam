interface SendOtpParams {
    phoneNumber: string;
    countryCode: string;
}

type SendOtpBadRequestResponse = {
  statusCode: 400,
  succeeded: false,
  message: string,
  data: null,
  errors: null,
  meta: null
}

type SendOtpSuccessResponse = {
  statusCode: 200,
  succeeded: true,
  message: string,
  data: null,
  errors: null,
  meta: null
}

type SendOtpUnprocessableResponse = {
  statusCode: 422,
  succeeded: false,
  message: string,
  data: null,
  errors: null,
  meta: null
}


type SendOtpErrorType =  SendOtpBadRequestResponse | SendOtpUnprocessableResponse;

export class SendOtpError extends Error {
    statusCode: number;
    constructor(error: SendOtpErrorType) {
        super(error.message);
        this.name = 'SendOtpError';
        this.statusCode = error.statusCode;
        this.message = error.message;
        if (error.statusCode === 422) {
            this.cause = error.message.split(':')[0];
        }

    }
}

export async function sendOtp(params: SendOtpParams): Promise<SendOtpSuccessResponse> {
    try {
        
    const response = await fetch(`${import.meta.env.VITE_API_URL}/Api/V1/Authentication/Teacher/LoginOrRegister`, {
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
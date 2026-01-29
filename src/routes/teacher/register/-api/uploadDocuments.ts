import { objectToFormData } from "@/lib/utils/objectToFormData";

type UploadDocumentsParams = | {
    type: 'saudi';
    token: string;
    isInSaudiArabia: boolean;
    identityType: number;
    documentNumber: string;
    // issuingCountryCode: string;
    identityDocumentFile: File | null;
    certificates: {
        file: File | null;
        title: string;
        issuer: string;
        issueDate: string;
    }[];
}| {
    type: 'foreign';
    token: string;
    isInSaudiArabia: boolean;
    identityType: number;
    documentNumber: string;
    issuingCountryCode: string;
    identityDocumentFile: File | null;
    certificates: {
        file: File | null;
        title: string;
        issuer: string;
        issueDate: string;
    }[];
}


export async function uploadDocuments(params: UploadDocumentsParams){
    const { token, type, ...rest } = params;
    const formData = objectToFormData(rest);
    for (const [key, value] of formData.entries()) {
  if (value instanceof File) {
    console.log(`${key}:`, value.name, value.type, value.size, 'bytes');
  } else {
    console.log(`${key}:`, value);
  }
}
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/Api/V1/Authentication/Teacher/UploadDocuments`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message ?? 'حدث خطأ ما');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        throw error
    }
}
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
        certificateFile: File | null;
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
        certificateFile: File | null;
        title: string;
        issuer: string;
        issueDate: string;
    }[];
}


export async function uploadDocuments(params: UploadDocumentsParams){
    // const formData = new FormData();
    // Object.entries(params).forEach(([key,value]) => {
    //     const keyToAppend = key as keyof UploadDocumentsParams;
    //     if (value instanceof File) {
    //         formData.append(keyToAppend, value);
    //     } else if (Array.isArray(value)) {

    //         value.forEach(item => {
    //             formData.append(`${key}[]`, item.toString());
    //         })
    //     } else {
    //         if (value !== null) formData.append(key, value.toString());
    //     }
    // });
    const formData = objectToFormData(params);
    console.log(formData);
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/Api/V1/Authentication/Teacher/Step4-UploadDocuments`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${params.token}`,
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
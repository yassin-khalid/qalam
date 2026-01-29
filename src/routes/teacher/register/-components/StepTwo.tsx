import React, { useEffect, useRef, useState } from "react";
import { StepTwoData, StepTwoDataOmitIssuingCountryCodeAndIdentityDocumentFileAndCertificates, stepTwoFormSchema } from "../-types/StepTwoData";
import { IdentityType } from "../-types/IdentityData";
import {
    PlusIcon,
    UploadIcon,
    XIcon,
    FileIcon,
    ChevronDownIcon,
} from "lucide-react";
import { useForm, useStore } from "@tanstack/react-form";
import { showToast } from "@/lib/utils/toast";
import DatePicker from "@/lib/components/calendar/DatePicker";
import { useLiveQuery } from "@tanstack/react-db";
import { localStorageCollection } from "@/lib/db/localStorageCollection";
import { uploadDocuments } from "../-api/uploadDocuments";

interface StepTwoProps {
    onSuccess: (data: StepTwoData) => void;
    stepTwoData: StepTwoDataOmitIssuingCountryCodeAndIdentityDocumentFileAndCertificates;
    onDataChanges: (data: StepTwoDataOmitIssuingCountryCodeAndIdentityDocumentFileAndCertificates) => void;
}

const StepTwo: React.FC<StepTwoProps> = ({ onSuccess, stepTwoData, onDataChanges }) => {
    const [loading, setLoading] = useState(false);
    const idFileInputRef = useRef<HTMLInputElement>(null);

    // const { data: currentSession } = useLiveQuery((q) =>
    //     q.from({ session: localStorageCollection }),
    // );

    const { data: currentSession } = useLiveQuery((q) =>
        q.from({ session: localStorageCollection }),
    );

    const token = currentSession?.[0]?.token ?? "";

    const form = useForm({
        defaultValues: {
            isInSaudiArabia: stepTwoData.isInSaudiArabia ?? true,
            identityType: stepTwoData.identityType ?? 1,
            documentNumber: stepTwoData.documentNumber ?? "",
            issuingCountryCode: "SA",
            identityDocumentFile: null as File | null,
            certificates: [] as { file: File | null; title: string; issuer: string; issueDate: string; }[],
        },
        validators: {
            onChange: stepTwoFormSchema,
        },
        onSubmit: async ({ value }) => {
            try {
                console.log(value);
                if (value.isInSaudiArabia) {
                    const { issuingCountryCode, ...rest } = value;
                    const response = await uploadDocuments({
                        type: "saudi",
                        ...rest,
                        token,
                    });
                    console.log(response);
                    onSuccess(response.data);
                    showToast({
                        type: "success",
                        message: response.message ?? "تم تحميل المستندات بنجاح",
                    });
                } else {
                    const response = await uploadDocuments({
                        type: "foreign",
                        ...value,
                        token,
                    });
                    console.log(response);
                    onSuccess(response.data);
                    showToast({
                        type: "success",
                        message: response.message ?? "تم تحميل المستندات بنجاح",
                    });
                }
            } catch (error) {
                showToast({
                    type: "server",
                    message: error instanceof Error ? error.message : "حدث خطأ ما",
                });
            } finally {
                setLoading(false);
            }
        },
    });

    const values = useStore(form.store, (state) => state.values);

    useEffect(() => {
        // remove issuingCountryCode from values
        // and send the rest to onDataChanges
        // so that it doesn't appear in url
        const { issuingCountryCode, certificates, identityDocumentFile, ...rest } = values;
        onDataChanges(rest);
    }, [values]);

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
            }}
            className="flex flex-col h-full"
            dir="rtl"
        >
            {/* Scrollable Container with elegant max-height and custom scrollbar */}
            <div className="flex-1 overflow-y-auto custom-scrollbar max-h-[450px] pl-2 -ml-2 mb-6 rtl-scroll px-4">
                <div className="space-y-8 pb-4">
                    {/* Saudi Residency Question */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <h3 className="text-[#003049] dark:text-slate-100 font-bold text-base text-right w-full md:w-auto">
                            هل تقيم داخل المملكة العربية السعودية؟
                        </h3>
                        <form.Field
                            name="isInSaudiArabia"
                            children={(field) => {
                                const isInSaudiArabia = field.state.value;
                                return (
                                    <div className="flex gap-2 w-full md:w-auto">
                                        <button
                                            type="button"
                                            onClick={() => field.handleChange(true)}
                                            className={`flex-1 md:w-28 py-1.5 rounded-xl border-2 transition-all font-bold ${isInSaudiArabia ? "bg-[#00B5B5] border-[#00B5B5] text-white shadow-lg shadow-[#00B5B5]/20" : "border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-800"}`}
                                        >
                                            نعم
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => field.handleChange(false)}
                                            className={`flex-1 md:w-28 py-1.5 rounded-xl border-2 transition-all font-bold ${!isInSaudiArabia ? "bg-[#00B5B5] border-[#00B5B5] text-white shadow-lg shadow-[#00B5B5]/20" : "border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-800"}`}
                                        >
                                            لا
                                        </button>
                                    </div>
                                );
                            }}
                        ></form.Field>
                    </div>

                    {/* Identity Type and Document Number */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Identity Type */}
                        <div className="space-y-2">
                            <label className="block text-right text-sm font-bold text-[#003049] dark:text-slate-200">
                                نوع الهوية
                            </label>
                            <div className="relative">
                                <form.Field
                                    name="identityType"
                                    children={(field) => {
                                        const invalid =
                                            field.state.meta.isTouched && !field.state.meta.isValid;
                                        return (
                                            <>
                                                <select
                                                    required
                                                    value={field.state.value}
                                                    onChange={(e) =>
                                                        field.handleChange(Number(e.target.value))
                                                    }
                                                    className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-right text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#00B5B5] appearance-none cursor-pointer"
                                                >
                                                    <option value="">اختر نوع الهوية</option>
                                                    {form.state.values.isInSaudiArabia ? (
                                                        <>
                                                            <option value={IdentityType.NATIONAL_ID}>
                                                                هوية وطنية
                                                            </option>
                                                            <option value={IdentityType.IQAMA}>إقامة</option>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <option value={IdentityType.PASSPORT}>
                                                                جواز سفر
                                                            </option>
                                                            <option value={IdentityType.OTHER}>أخرى</option>
                                                        </>
                                                    )}
                                                </select>
                                                {invalid && (
                                                    <p className="text-red-500 text-sm mt-1 text-right">
                                                        {field.state.meta.errors[0]?.message ?? ""}
                                                    </p>
                                                )}
                                            </>
                                        );
                                    }}
                                />
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#00B5B5]">
                                    {/* <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="3"
                                            d="M19 9l-7 7-7-7"
                                        />
                                    </svg> */}
                                    <ChevronDownIcon className="w-4 h-4" />
                                </div>
                            </div>
                        </div>

                        {/* Document Number */}
                        <div className="space-y-2">
                            <label className="block text-right text-sm font-bold text-[#003049] dark:text-slate-200">
                                {form.state.values.isInSaudiArabia
                                    ? "رقم الإقامة / الهوية"
                                    : "رقم الجواز / الوثيقة"}
                            </label>
                            <form.Field
                                name="documentNumber"
                                children={(field) => {
                                    const invalid =
                                        field.state.meta.isTouched && !field.state.meta.isValid;
                                    return (
                                        <>
                                            <input
                                                type="text"
                                                required
                                                value={field.state.value}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                placeholder="مثال: 123456789"
                                                className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-right text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#00B5B5] transition-all"
                                            />
                                            {invalid && (
                                                <p className="text-red-500 text-sm mt-1 text-right">
                                                    {field.state.meta.errors[0]?.message ?? ""}
                                                </p>
                                            )}
                                        </>
                                    );
                                }}
                            />
                        </div>
                    </div>

                    {/* Identity File Upload */}
                    <form.Field
                        name="identityDocumentFile"
                        children={(field) => {
                            const invalid =
                                field.state.meta.isTouched && !field.state.meta.isValid;
                            return (
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="block text-right text-sm font-bold text-[#003049] dark:text-slate-200">
                                            صورة الهوية / الوثيقة
                                        </label>
                                        <span className="text-[10px] sm:text-xs text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                                            الحد الأقصى لحجم الملف هو 5MB
                                        </span>
                                    </div>
                                    <div
                                        onClick={() => idFileInputRef.current?.click()}
                                        className="relative w-full bg-white dark:bg-slate-900 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl py-6 px-4 flex flex-col items-center justify-center cursor-pointer hover:border-[#00B5B5] hover:bg-[#00B5B5]/5 transition-all group"
                                    >
                                        {field.state.value?.name ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-12 h-12 bg-[#00B5B5]/10 rounded-full flex items-center justify-center text-[#00B5B5]">
                                                    <FileIcon />
                                                </div>
                                                <span className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate max-w-[250px]">
                                                    {field.state.value.name}
                                                </span>
                                                <button
                                                    type="button"
                                                    className="text-red-500 text-xs font-bold hover:underline"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        // Clear the file input and field value
                                                        if (idFileInputRef.current) {
                                                            idFileInputRef.current.value = "";
                                                        }
                                                        field.handleChange(null as any);
                                                    }}
                                                >
                                                    حذف الملف
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="w-12 h-12 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-gray-400 group-hover:text-[#00B5B5] group-hover:bg-[#00B5B5]/10 transition-all mb-3">
                                                    <UploadIcon />
                                                </div>
                                                <span className="text-sm font-bold text-gray-500 dark:text-slate-400">
                                                    انقر لرفع وثيقة الهوية
                                                </span>
                                            </>
                                        )}

                                        <input
                                            type="file"
                                            ref={idFileInputRef}
                                            className="hidden"
                                            // onChange={handleIdFileUpload}
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    field.handleChange(file);
                                                }
                                            }}
                                            accept=".jpg,.jpeg,.png,.pdf"
                                        />
                                        {invalid && (
                                            <p className="text-red-500 text-sm mt-1 text-right">
                                                {field.state.meta.errors?.[0]?.message ?? ""}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        }}
                    />

                    {/* Certificates Section */}
                    <div className="space-y-6 pt-6 border-t border-gray-100 dark:border-slate-800">
                        {/* <div className="flex flex-col md:flex-row justify-between items-center gap-4"> */}
                        <form.Field
                            name="certificates"
                            mode="array"
                            children={(field) => {
                                return (
                                    <>
                                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                            <button
                                                type="button"
                                                // onClick={addCertificate}
                                                onClick={() => {
                                                    field.pushValue({
                                                        file: null,
                                                        title: "",
                                                        issuer: "",
                                                        issueDate: "",
                                                    });
                                                }}
                                                disabled={field.state.value.length >= 5}
                                                className="text-[#00B5B5] font-bold text-sm flex items-center gap-2 hover:opacity-80 transition-opacity disabled:opacity-50 w-full md:w-auto justify-center bg-[#00B5B5]/10 px-4 py-2 rounded-lg"
                                            >
                                                <PlusIcon />
                                                إضافة شهادة أخرى
                                            </button>
                                            <div className="flex flex-col items-start gap-1 w-full md:w-auto">
                                                <h3 className="text-[#003049] dark:text-slate-100 font-bold text-lg leading-none">
                                                    الشهادات والدورات
                                                </h3>
                                                <span className="text-[10px] text-gray-400 dark:text-slate-500 font-medium">
                                                    أضف حتى 5 شهادات تدعم طلبك
                                                </span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full col-span-full">
                                            {field.state.value.map((cert, index) => (
                                                <div
                                                    key={index}
                                                    className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm relative space-y-4 hover:shadow-md transition-all border-b-4 border-b-[#00B5B5]/20"
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() => field.removeValue(index)}
                                                        className="absolute top-4 left-4 text-gray-300 hover:text-red-500 transition-colors"
                                                    >
                                                        <XIcon />
                                                    </button>

                                                    <div className="inline-block bg-[#00B5B5]/10 text-[#00B5B5] px-3 py-1 rounded-full text-[10px] font-bold mb-1">
                                                        المستند #{index + 1}
                                                    </div>

                                                    <div className="space-y-3">
                                                        <form.Field
                                                            name={`certificates[${index}].title`}
                                                            children={(field) => {
                                                                const invalid =
                                                                    field.state.meta.isTouched &&
                                                                    !field.state.meta.isValid;
                                                                return (
                                                                    <>
                                                                        <input
                                                                            type="text"
                                                                            placeholder="عنوان الشهادة (مثال: بكالوريوس تعليم)"
                                                                            required
                                                                            value={field.state.value}
                                                                            onChange={(e) =>
                                                                                field.handleChange(e.target.value)
                                                                            }
                                                                            className="w-full bg-gray-50/50 dark:bg-slate-950 px-3 py-2.5 rounded-xl text-right text-sm text-slate-900 dark:text-slate-100 border border-transparent focus:border-[#00B5B5] outline-none transition-all"
                                                                        />
                                                                        {invalid && (
                                                                            <p className="text-red-500 text-sm mt-1 text-right">
                                                                                {field.state.meta.errors?.[0]
                                                                                    ?.message ?? ""}
                                                                            </p>
                                                                        )}
                                                                    </>
                                                                );
                                                            }}
                                                        />

                                                        <form.Field
                                                            name={`certificates[${index}].issuer`}
                                                            children={(field) => {
                                                                const invalid =
                                                                    field.state.meta.isTouched &&
                                                                    !field.state.meta.isValid;
                                                                return (
                                                                    <>
                                                                        <input
                                                                            type="text"
                                                                            placeholder="جهة الإصدار"
                                                                            required
                                                                            value={field.state.value}
                                                                            onChange={(e) =>
                                                                                field.handleChange(e.target.value)
                                                                            }
                                                                            className="w-full bg-gray-50/50 dark:bg-slate-950 px-3 py-2.5 rounded-xl text-right text-sm text-slate-900 dark:text-slate-100 border border-transparent focus:border-[#00B5B5] outline-none transition-all"
                                                                        />
                                                                        {invalid && (
                                                                            <p className="text-red-500 text-sm mt-1 text-right">
                                                                                {field.state.meta.errors?.[0]
                                                                                    ?.message ?? ""}
                                                                            </p>
                                                                        )}
                                                                    </>
                                                                );
                                                            }}
                                                        />

                                                        <form.Field
                                                            name={`certificates[${index}].issueDate`}
                                                            children={(field) => {
                                                                const invalid =
                                                                    field.state.meta.isTouched &&
                                                                    !field.state.meta.isValid;
                                                                return (
                                                                    <>
                                                                        <DatePicker
                                                                            label="تاريخ الإصدار"
                                                                            placeholder="اختر تاريخ الإصدار..."
                                                                            initialType="hijri"
                                                                            onChange={(date) => {
                                                                                console.log({ date: date.toISOString().split('T')[0] })
                                                                                field.handleChange(date.toISOString().split('T')[0])
                                                                            }}
                                                                        />
                                                                        {invalid && (
                                                                            <p className="text-red-500 text-sm mt-1 text-right">
                                                                                {field.state.meta.errors?.[0]
                                                                                    ?.message ?? ""}
                                                                            </p>
                                                                        )}
                                                                    </>
                                                                );
                                                            }}
                                                        />
                                                    </div>

                                                    <form.Field
                                                        name={`certificates[${index}].file`}
                                                        children={(field) => {
                                                            const invalid =
                                                                field.state.meta.isTouched &&
                                                                !field.state.meta.isValid;
                                                            return (
                                                                <div className="relative pt-2">
                                                                    <input
                                                                        type="file"
                                                                        id={`file-${index}`}
                                                                        className="hidden"
                                                                        onChange={(e) => {
                                                                            const file = e.target.files?.[0];
                                                                            if (file) field.handleChange(file);
                                                                        }}
                                                                        accept=".jpg,.jpeg,.png,.pdf"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            field.handleChange(null);
                                                                            document
                                                                                .getElementById(`file-${index}`)
                                                                                ?.click();
                                                                        }}
                                                                        className={`w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all border-2 ${field.state.value?.name ? "border-[#00B5B5] bg-white dark:bg-slate-900 text-[#00B5B5]" : "border-dashed border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-950 text-gray-500"}`}
                                                                    >
                                                                        {field.state.value?.name ? (
                                                                            <FileIcon />
                                                                        ) : (
                                                                            <UploadIcon />
                                                                        )}
                                                                        {field.state.value?.name ||
                                                                            "رفع ملف الشهادة"}
                                                                    </button>
                                                                    {field.state.value?.name && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                field.handleChange(null);
                                                                            }}
                                                                            className="text-red-500 text-xs font-bold hover:underline mt-2 text-center block w-full"
                                                                        >
                                                                            حذف الملف
                                                                        </button>
                                                                    )}
                                                                    {invalid && (
                                                                        <p className="text-red-500 text-sm mt-1 text-right">
                                                                            {field.state.meta.errors?.[0]?.message ??
                                                                                ""}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            );
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                );
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="pt-6 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800">
                <form.Subscribe
                    selector={(state) => [state.canSubmit, state.isSubmitting]}
                    children={([canSubmit, isSubmitting]) => (
                        <button
                            type="submit"
                            disabled={!canSubmit || isSubmitting}
                            className="w-full bg-[#003049] dark:bg-[#00B5B5] text-white py-3 rounded-2xl font-bold hover:opacity-90 transition-all shadow-xl shadow-[#003049]/10 dark:shadow-[#00B5B5]/20 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98]"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Jاري الإرسال...
                                </>
                            ) : (
                                "إرسال الطلب النهائي"
                            )}
                        </button>
                    )}
                />
            </div>
        </form>
    );
};

export default StepTwo;

import React, { useMemo, useRef, useState } from "react";
import {
    PlusIcon,
    UploadIcon,
    XIcon,
    FileIcon,
    ChevronDownIcon,
    Loader2,
    RefreshCcw,
    PencilIcon,
    CheckIcon,
    CalendarIcon,
} from "lucide-react";
import { useForm, useStore } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { useLiveQuery } from "@tanstack/react-db";
import { useTranslation } from "react-i18next";
import { showToast } from "@/lib/utils/toast";
import DatePicker from "@/lib/components/calendar/DatePicker";
import { localStorageCollection } from "@/lib/db/localStorageCollection";
import { COUNTRIES } from "@/lib/constants/countries";
import { useLocale } from "@/lib/hooks/useLocale";
import { LOCALE_DIRECTION } from "@/lib/i18n";
import {
    NonSaudiIdentityTypesCollection,
    SaudiIdentityTypesCollection,
} from "../-db/collections/identityTypesCollection";
import { getRegistrationRequirements } from "../-api/registrationRequirements";
import {
    RequirementsFormValues,
    submitRegistrationRequirements,
    SubmitRegistrationRequirementsError,
} from "../-api/submitRegistrationRequirements";
import {
    KnownRequirementCode,
    RegistrationRequirement,
    isCustomFileRequirement,
    isCustomTextRequirement,
    isCustomBooleanRequirement,
    isSelectionRequirement,
    optionLabel,
} from "../-types/RegistrationRequirement";
import {
    acceptAttribute,
    buildDefaults,
    buildRequirementsSchema,
    byCode,
    formatBytes,
    isAllowedExtension,
} from "../-utils/requirementsForm";

type KnownStepTwoSeed = Pick<
    RequirementsFormValues,
    "isInSaudiArabia" | "identityType" | "documentNumber"
>;

interface StepTwoProps {
    onSuccess: () => void;
    stepTwoData: KnownStepTwoSeed;
}

const StepTwo: React.FC<StepTwoProps> = ({ onSuccess, stepTwoData }) => {
    const { t } = useTranslation("teacher");
    const {
        data: requirements,
        isLoading,
        isError,
        refetch,
        isFetching,
    } = useQuery({
        queryKey: ["teacher-registration-requirements"],
        queryFn: getRegistrationRequirements,
        staleTime: 5 * 60 * 1000,
    });

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#00B5B5]" />
                <p className="text-sm text-gray-500 dark:text-slate-400">
                    {t("auth.register.stepTwo.requirements.loading")}
                </p>
            </div>
        );
    }

    if (isError || !requirements) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                <p className="text-red-500 text-sm">
                    {t("auth.register.stepTwo.requirements.loadError")}
                </p>
                <button
                    type="button"
                    onClick={() => refetch()}
                    disabled={isFetching}
                    className="flex items-center gap-2 px-6 py-2 bg-[#003049] dark:bg-[#00B5B5] text-white rounded-xl font-bold hover:opacity-95 transition-all disabled:opacity-50"
                >
                    {isFetching ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <RefreshCcw className="w-4 h-4" />
                    )}
                    {t("auth.register.stepTwo.requirements.retry")}
                </button>
            </div>
        );
    }

    if (requirements.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                <p className="text-sm text-gray-500 dark:text-slate-400">
                    {t("auth.register.stepTwo.requirements.empty")}
                </p>
            </div>
        );
    }

    return (
        <RequirementsForm
            requirements={requirements}
            seed={stepTwoData}
            onSuccess={onSuccess}
        />
    );
};

interface RequirementsFormProps {
    requirements: RegistrationRequirement[];
    seed: KnownStepTwoSeed;
    onSuccess: () => void;
}

const RequirementsForm: React.FC<RequirementsFormProps> = ({
    requirements,
    seed,
    onSuccess,
}) => {
    const { t } = useTranslation("teacher");
    const locale = useLocale();
    const idFileInputRef = useRef<HTMLInputElement>(null);

    const map = useMemo(() => byCode(requirements), [requirements]);
    const identityReq = map[KnownRequirementCode.IdentityDocument];
    const certificateReq = map[KnownRequirementCode.Certificate];
    const bioReq = map[KnownRequirementCode.Bio];
    const locationReq = map[KnownRequirementCode.Location];

    const schema = useMemo(
        () => buildRequirementsSchema(requirements, t),
        [requirements, t],
    );
    const defaultValues = useMemo(
        () => buildDefaults(requirements, seed),
        // seed is only used to initialise the form once.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [requirements],
    );

    const { data: currentSession } = useLiveQuery((q) =>
        q.from({ session: localStorageCollection }),
    );
    const token = currentSession?.[0]?.token ?? "";

    const form = useForm({
        defaultValues,
        // Schema is built dynamically from the requirements catalog, so its
        // inferred shape is a generic record rather than RequirementsFormValues.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        validators: { onChange: schema as any },
        onSubmit: async ({ value }) => {
            try {
                const response = await submitRegistrationRequirements({
                    token,
                    values: value as RequirementsFormValues,
                    requirements,
                });
                showToast({
                    type: "success",
                    message:
                        response.message ??
                        t("auth.register.stepTwo.toasts.uploadSuccess"),
                });
                onSuccess();
            } catch (error) {
                if (error instanceof SubmitRegistrationRequirementsError) {
                    const message = error.errors?.length
                        ? error.errors.join("\n")
                        : error.message;
                    showToast({ type: "validation", message });
                    return;
                }
                showToast({
                    type: "server",
                    message:
                        error instanceof Error
                            ? error.message
                            : t("auth.register.stepTwo.toasts.unexpected"),
                });
            }
        },
    });

    const isInSaudiArabia = useStore(
        form.store,
        (state) => (state.values as RequirementsFormValues).isInSaudiArabia,
    );

    const identityTypesCollection = useMemo(
        () =>
            isInSaudiArabia
                ? SaudiIdentityTypesCollection
                : NonSaudiIdentityTypesCollection,
        [isInSaudiArabia],
    );
    const { data: identityTypes } = useLiveQuery(
        (q) => q.from({ identityTypes: identityTypesCollection }),
        [isInSaudiArabia],
    );

    const sectionLabel = (req: RegistrationRequirement, fallback: string) => {
        const apiLabel = locale === "ar" ? req.nameAr : req.nameEn;
        return apiLabel || fallback;
    };
    const sectionDescription = (req: RegistrationRequirement) => {
        return locale === "ar" ? req.descriptionAr : req.descriptionEn;
    };

    const RequiredBadge: React.FC<{ required: boolean }> = ({ required }) => (
        <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${required
                ? "bg-red-50 text-red-500 dark:bg-red-500/10"
                : "bg-gray-100 text-gray-400 dark:bg-slate-800 dark:text-slate-500"
                }`}
        >
            {required
                ? t("auth.register.stepTwo.requirements.requiredBadge")
                : t("auth.register.stepTwo.requirements.optionalBadge")}
        </span>
    );

    const customFileReqs = requirements.filter(isCustomFileRequirement);
    const customTextReqs = requirements.filter(isCustomTextRequirement);
    const customBoolReqs = requirements.filter(isCustomBooleanRequirement);
    const selectionReqs = requirements.filter(isSelectionRequirement);

    // Tracks which certificate cards are still in edit mode. Saved cards
    // collapse to a compact summary row; new/incomplete ones stay editable.
    type CertValue = RequirementsFormValues["certificates"][number];
    const isCertComplete = (cert: CertValue) =>
        Boolean(
            cert.title?.trim() &&
            cert.issuer?.trim() &&
            cert.issueDate &&
            cert.file instanceof File,
        );
    const [editingCerts, setEditingCerts] = useState<Set<number>>(() => {
        const initial = new Set<number>();
        defaultValues.certificates.forEach((cert, index) => {
            if (!isCertComplete(cert as CertValue)) initial.add(index);
        });
        return initial;
    });
    const setEditing = (index: number, editing: boolean) =>
        setEditingCerts((prev) => {
            const next = new Set(prev);
            if (editing) next.add(index);
            else next.delete(index);
            return next;
        });
    // Keep the editing set aligned with indices after a row is removed.
    const remapAfterRemove = (removed: number) =>
        setEditingCerts((prev) => {
            const next = new Set<number>();
            prev.forEach((i) => {
                if (i < removed) next.add(i);
                else if (i > removed) next.add(i - 1);
            });
            return next;
        });
    const saveCert = (index: number) => {
        const cert = form.getFieldValue(
            `certificates[${index}]` as never,
        ) as CertValue;
        if (!isCertComplete(cert)) {
            // Surface validation errors on the incomplete fields.
            (["title", "issuer", "issueDate", "file"] as const).forEach((key) => {
                const name = `certificates[${index}].${key}` as never;
                form.setFieldMeta(name, (meta) => ({ ...meta, isTouched: true }));
                form.validateField(name, "change");
            });
            return;
        }
        setEditing(index, false);
    };

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
            }}
            className="flex flex-col h-full"
            dir={LOCALE_DIRECTION[locale]}
        >
            <div className="flex-1 overflow-y-auto custom-scrollbar max-h-[450px] pl-2 -ml-2 mb-6 rtl-scroll px-4">
                <div className="space-y-8 pb-4">
                    {/* Location (residency) — rendered atop identity since identity types depend on it */}
                    {locationReq && (
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <h3 className="text-[#003049] dark:text-slate-100 font-bold text-base text-start">
                                    {sectionLabel(
                                        locationReq,
                                        t("auth.register.stepTwo.residencyQuestion"),
                                    )}
                                </h3>
                                <RequiredBadge required={locationReq.isRequired} />
                            </div>
                            <form.Field name="isInSaudiArabia">
                                {(field) => {
                                    const current = field.state.value as boolean;
                                    const toggleResidency = (next: boolean) => {
                                        if (next === current) return;
                                        field.handleChange(next);
                                        form.setFieldValue("issuingCountryCode", "");
                                        form.setFieldValue(
                                            "identityType",
                                            next ? 1 : 3,
                                        );
                                    };
                                    return (
                                        <div className="flex gap-2 w-full md:w-auto">
                                            <button
                                                type="button"
                                                onClick={() => toggleResidency(true)}
                                                className={`flex-1 md:w-28 py-1.5 rounded-xl border-2 transition-all font-bold ${current ? "bg-[#00B5B5] border-[#00B5B5] text-white shadow-lg shadow-[#00B5B5]/20" : "border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-800"}`}
                                            >
                                                {t("auth.register.stepTwo.yes")}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => toggleResidency(false)}
                                                className={`flex-1 md:w-28 py-1.5 rounded-xl border-2 transition-all font-bold ${!current ? "bg-[#00B5B5] border-[#00B5B5] text-white shadow-lg shadow-[#00B5B5]/20" : "border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-800"}`}
                                            >
                                                {t("auth.register.stepTwo.no")}
                                            </button>
                                        </div>
                                    );
                                }}
                            </form.Field>
                        </div>
                    )}

                    {/* Identity document */}
                    {identityReq && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-2">
                                <h3 className="text-[#003049] dark:text-slate-100 font-bold text-base">
                                    {sectionLabel(
                                        identityReq,
                                        t("auth.register.stepTwo.identityFile"),
                                    )}
                                </h3>
                                <RequiredBadge required={identityReq.isRequired} />
                            </div>
                            {sectionDescription(identityReq) && (
                                <p className="text-xs text-gray-400 dark:text-slate-500 -mt-4">
                                    {sectionDescription(identityReq)}
                                </p>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Identity Type */}
                                <div className="space-y-2">
                                    <label className="block text-start text-sm font-bold text-[#003049] dark:text-slate-200">
                                        {t("auth.register.stepTwo.identityType")}
                                    </label>
                                    <div className="relative">
                                        <form.Field name="identityType">
                                            {(field) => {
                                                const invalid =
                                                    field.state.meta.isTouched &&
                                                    !field.state.meta.isValid;
                                                return (
                                                    <>
                                                        <select
                                                            required
                                                            value={field.state.value as number}
                                                            onChange={(e) =>
                                                                field.handleChange(
                                                                    Number(e.target.value),
                                                                )
                                                            }
                                                            className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-start text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#00B5B5] appearance-none cursor-pointer"
                                                        >
                                                            <option value="">
                                                                {t("auth.register.stepTwo.identityTypePlaceholder")}
                                                            </option>
                                                            {identityTypes?.map((identityType) => (
                                                                <option
                                                                    key={identityType.value}
                                                                    value={identityType.value}
                                                                >
                                                                    {identityType.displayName}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        {invalid && (
                                                            <p className="text-red-500 text-sm mt-1 text-start">
                                                                {field.state.meta.errors[0]?.message ?? ""}
                                                            </p>
                                                        )}
                                                    </>
                                                );
                                            }}
                                        </form.Field>
                                        <div className="absolute start-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#00B5B5]">
                                            <ChevronDownIcon className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>

                                {/* Document Number */}
                                <div className="space-y-2">
                                    <label className="block text-start text-sm font-bold text-[#003049] dark:text-slate-200">
                                        {isInSaudiArabia
                                            ? t("auth.register.stepTwo.documentNumberSaudi")
                                            : t("auth.register.stepTwo.documentNumberForeign")}
                                    </label>
                                    <form.Field name="documentNumber">
                                        {(field) => {
                                            const invalid =
                                                field.state.meta.isTouched &&
                                                !field.state.meta.isValid;
                                            return (
                                                <>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={field.state.value as string}
                                                        onChange={(e) =>
                                                            field.handleChange(e.target.value)
                                                        }
                                                        placeholder={t("auth.register.stepTwo.documentNumberPlaceholder")}
                                                        className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-start text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#00B5B5] transition-all"
                                                    />
                                                    {invalid && (
                                                        <p className="text-red-500 text-sm mt-1 text-start">
                                                            {field.state.meta.errors[0]?.message ?? ""}
                                                        </p>
                                                    )}
                                                </>
                                            );
                                        }}
                                    </form.Field>
                                </div>
                            </div>

                            {/* Issuing Country (foreign only) */}
                            {!isInSaudiArabia && (
                                <div className="space-y-2">
                                    <label className="block text-start text-sm font-bold text-[#003049] dark:text-slate-200">
                                        {t("auth.register.stepTwo.issuingCountry")}
                                    </label>
                                    <div className="relative">
                                        <form.Field name="issuingCountryCode">
                                            {(field) => {
                                                const invalid =
                                                    field.state.meta.isTouched &&
                                                    !field.state.meta.isValid;
                                                return (
                                                    <>
                                                        <select
                                                            required
                                                            value={field.state.value as string}
                                                            onChange={(e) =>
                                                                field.handleChange(e.target.value)
                                                            }
                                                            className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-start text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#00B5B5] appearance-none cursor-pointer"
                                                        >
                                                            <option value="">
                                                                {t("auth.register.stepTwo.issuingCountryPlaceholder")}
                                                            </option>
                                                            {COUNTRIES.map((c) => (
                                                                <option key={c.iso2} value={c.iso2}>
                                                                    {c.flag}{" "}
                                                                    {locale === "ar" ? c.nameAr : c.nameEn}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <div className="absolute start-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#00B5B5]">
                                                            <ChevronDownIcon className="w-4 h-4" />
                                                        </div>
                                                        {invalid && (
                                                            <p className="text-red-500 text-sm mt-1 text-start">
                                                                {field.state.meta.errors[0]?.message ?? ""}
                                                            </p>
                                                        )}
                                                    </>
                                                );
                                            }}
                                        </form.Field>
                                    </div>
                                </div>
                            )}

                            {/* Identity File Upload */}
                            <form.Field name="identityDocumentFile">
                                {(field) => {
                                    const invalid =
                                        field.state.meta.isTouched &&
                                        !field.state.meta.isValid;
                                    const file = field.state.value as File | null;
                                    return (
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="block text-start text-sm font-bold text-[#003049] dark:text-slate-200">
                                                    {t("auth.register.stepTwo.identityFile")}
                                                </label>
                                                <span className="text-[10px] sm:text-xs text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                                                    {identityReq.maxFileSizeBytes
                                                        ? t("auth.register.stepTwo.requirements.maxFileSize", {
                                                            size: formatBytes(identityReq.maxFileSizeBytes),
                                                        })
                                                        : t("auth.register.stepTwo.maxFileSize")}
                                                </span>
                                            </div>
                                            <div
                                                onClick={() => idFileInputRef.current?.click()}
                                                className="relative w-full bg-white dark:bg-slate-900 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl py-6 px-4 flex flex-col items-center justify-center cursor-pointer hover:border-[#00B5B5] hover:bg-[#00B5B5]/5 transition-all group"
                                            >
                                                {file?.name ? (
                                                    <div className="flex flex-col items-center gap-2">
                                                        <div className="w-12 h-12 bg-[#00B5B5]/10 rounded-full flex items-center justify-center text-[#00B5B5]">
                                                            <FileIcon />
                                                        </div>
                                                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate max-w-[250px]">
                                                            {file.name}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            className="text-red-500 text-xs font-bold hover:underline"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (idFileInputRef.current) {
                                                                    idFileInputRef.current.value = "";
                                                                }
                                                                field.handleChange(null);
                                                            }}
                                                        >
                                                            {t("auth.register.stepTwo.deleteFile")}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="w-12 h-12 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-gray-400 group-hover:text-[#00B5B5] group-hover:bg-[#00B5B5]/10 transition-all mb-3">
                                                            <UploadIcon />
                                                        </div>
                                                        <span className="text-sm font-bold text-gray-500 dark:text-slate-400">
                                                            {t("auth.register.stepTwo.uploadIdentity")}
                                                        </span>
                                                    </>
                                                )}

                                                <input
                                                    type="file"
                                                    ref={idFileInputRef}
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const selected = e.target.files?.[0];
                                                        if (selected) field.handleChange(selected);
                                                    }}
                                                    accept={
                                                        acceptAttribute(identityReq.allowedExtensions) ??
                                                        ".jpg,.jpeg,.png,.pdf"
                                                    }
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
                            </form.Field>
                        </div>
                    )}

                    {/* Certificates */}
                    {certificateReq && (
                        <div className="space-y-6 pt-6 border-t border-gray-100 dark:border-slate-800">
                            <form.Field name="certificates" mode="array">
                                {(field) => {
                                    const certs = field.state.value as RequirementsFormValues["certificates"];
                                    const maxCount = certificateReq.maxCount ?? 5;
                                    return (
                                        <>
                                            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditing(certs.length, true);
                                                        field.pushValue({
                                                            file: null,
                                                            title: "",
                                                            issuer: "",
                                                            issueDate: "",
                                                        });
                                                    }}
                                                    disabled={certs.length >= maxCount}
                                                    className="text-[#00B5B5] font-bold text-sm flex items-center gap-2 hover:opacity-80 transition-opacity disabled:opacity-50 w-full md:w-auto justify-center bg-[#00B5B5]/10 px-4 py-2 rounded-lg"
                                                >
                                                    <PlusIcon />
                                                    {t("auth.register.stepTwo.addCertificate")}
                                                </button>
                                                <div className="flex flex-col items-start gap-1 w-full md:w-auto">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="text-[#003049] dark:text-slate-100 font-bold text-lg leading-none">
                                                            {sectionLabel(
                                                                certificateReq,
                                                                t("auth.register.stepTwo.certificatesTitle"),
                                                            )}
                                                        </h3>
                                                        <RequiredBadge required={certificateReq.isRequired} />
                                                    </div>
                                                    <span className="text-[10px] text-gray-400 dark:text-slate-500 font-medium">
                                                        {sectionDescription(certificateReq) ??
                                                            t("auth.register.stepTwo.certificatesHint")}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full col-span-full">
                                                {certs.map((cert, index) => {
                                                    const editing = editingCerts.has(index);
                                                    const removeCert = () => {
                                                        field.removeValue(index);
                                                        remapAfterRemove(index);
                                                    };
                                                    return (
                                                    <div
                                                        key={index}
                                                        className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm relative space-y-4 hover:shadow-md transition-all border-b-4 border-b-[#00B5B5]/20"
                                                    >
                                                        <div className="flex items-center justify-between gap-2">
                                                            <div className="inline-block bg-[#00B5B5]/10 text-[#00B5B5] px-3 py-1 rounded-full text-[10px] font-bold">
                                                                {t("auth.register.stepTwo.documentNumberLabel", {
                                                                    number: index + 1,
                                                                })}
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                {!editing && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setEditing(index, true)}
                                                                        className="text-gray-400 hover:text-[#00B5B5] transition-colors p-1"
                                                                        aria-label={t("auth.register.stepTwo.editCertificate")}
                                                                    >
                                                                        <PencilIcon className="w-4 h-4" />
                                                                    </button>
                                                                )}
                                                                <button
                                                                    type="button"
                                                                    onClick={removeCert}
                                                                    className="text-gray-300 hover:text-red-500 transition-colors p-1"
                                                                    aria-label={t("auth.register.stepTwo.deleteFile")}
                                                                >
                                                                    <XIcon className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Collapsed summary */}
                                                        {!editing && (
                                                            <div
                                                                role="button"
                                                                tabIndex={0}
                                                                onClick={() => setEditing(index, true)}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === "Enter" || e.key === " ") {
                                                                        e.preventDefault();
                                                                        setEditing(index, true);
                                                                    }
                                                                }}
                                                                className="w-full text-start space-y-2 cursor-pointer"
                                                            >
                                                                <p className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                                                                    {cert.title}
                                                                </p>
                                                                <p className="text-xs text-gray-500 dark:text-slate-400 truncate">
                                                                    {cert.issuer}
                                                                </p>
                                                                <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-slate-500">
                                                                    <CalendarIcon className="w-3.5 h-3.5 shrink-0" />
                                                                    <span>{cert.issueDate}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2 text-xs text-[#00B5B5]">
                                                                    <FileIcon className="w-3.5 h-3.5 shrink-0" />
                                                                    <span className="truncate">
                                                                        {cert.file?.name ??
                                                                            t("auth.register.stepTwo.noFileAttached")}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Edit form — kept mounted so the date picker state survives a collapse */}
                                                        <div className={editing ? "space-y-4" : "hidden"}>
                                                        <div className="space-y-3">
                                                            <form.Field name={`certificates[${index}].title`}>
                                                                {(subField) => {
                                                                    const invalid =
                                                                        subField.state.meta.isTouched &&
                                                                        !subField.state.meta.isValid;
                                                                    return (
                                                                        <>
                                                                            <input
                                                                                type="text"
                                                                                placeholder={t("auth.register.stepTwo.certificateTitlePlaceholder")}
                                                                                required
                                                                                value={subField.state.value as string}
                                                                                onChange={(e) =>
                                                                                    subField.handleChange(e.target.value)
                                                                                }
                                                                                className="w-full bg-gray-50/50 dark:bg-slate-950 px-3 py-2.5 rounded-xl text-start text-sm text-slate-900 dark:text-slate-100 border border-transparent focus:border-[#00B5B5] outline-none transition-all"
                                                                            />
                                                                            {invalid && (
                                                                                <p className="text-red-500 text-sm mt-1 text-start">
                                                                                    {subField.state.meta.errors?.[0]?.message ?? ""}
                                                                                </p>
                                                                            )}
                                                                        </>
                                                                    );
                                                                }}
                                                            </form.Field>

                                                            <form.Field name={`certificates[${index}].issuer`}>
                                                                {(subField) => {
                                                                    const invalid =
                                                                        subField.state.meta.isTouched &&
                                                                        !subField.state.meta.isValid;
                                                                    return (
                                                                        <>
                                                                            <input
                                                                                type="text"
                                                                                placeholder={t("auth.register.stepTwo.issuerPlaceholder")}
                                                                                required
                                                                                value={subField.state.value as string}
                                                                                onChange={(e) =>
                                                                                    subField.handleChange(e.target.value)
                                                                                }
                                                                                className="w-full bg-gray-50/50 dark:bg-slate-950 px-3 py-2.5 rounded-xl text-start text-sm text-slate-900 dark:text-slate-100 border border-transparent focus:border-[#00B5B5] outline-none transition-all"
                                                                            />
                                                                            {invalid && (
                                                                                <p className="text-red-500 text-sm mt-1 text-start">
                                                                                    {subField.state.meta.errors?.[0]?.message ?? ""}
                                                                                </p>
                                                                            )}
                                                                        </>
                                                                    );
                                                                }}
                                                            </form.Field>

                                                            <form.Field name={`certificates[${index}].issueDate`}>
                                                                {(subField) => {
                                                                    const invalid =
                                                                        subField.state.meta.isTouched &&
                                                                        !subField.state.meta.isValid;
                                                                    return (
                                                                        <>
                                                                            <DatePicker
                                                                                label={t("auth.register.stepTwo.issueDateLabel")}
                                                                                placeholder={t("auth.register.stepTwo.issueDatePlaceholder")}
                                                                                initialType="hijri"
                                                                                onChange={(date) =>
                                                                                    subField.handleChange(
                                                                                        date.toISOString().split("T")[0],
                                                                                    )
                                                                                }
                                                                            />
                                                                            {invalid && (
                                                                                <p className="text-red-500 text-sm mt-1 text-start">
                                                                                    {subField.state.meta.errors?.[0]?.message ?? ""}
                                                                                </p>
                                                                            )}
                                                                        </>
                                                                    );
                                                                }}
                                                            </form.Field>
                                                        </div>

                                                        <form.Field name={`certificates[${index}].file`}>
                                                            {(subField) => {
                                                                const invalid =
                                                                    subField.state.meta.isTouched &&
                                                                    !subField.state.meta.isValid;
                                                                const certFile = subField.state.value as File | null;
                                                                return (
                                                                    <div className="relative pt-2">
                                                                        <input
                                                                            type="file"
                                                                            id={`file-${index}`}
                                                                            className="hidden"
                                                                            onChange={(e) => {
                                                                                const selected = e.target.files?.[0];
                                                                                if (selected) subField.handleChange(selected);
                                                                            }}
                                                                            accept={
                                                                                acceptAttribute(certificateReq.allowedExtensions) ??
                                                                                ".jpg,.jpeg,.png,.pdf"
                                                                            }
                                                                        />
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                document
                                                                                    .getElementById(`file-${index}`)
                                                                                    ?.click()
                                                                            }
                                                                            className={`w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all border-2 ${certFile?.name ? "border-[#00B5B5] bg-white dark:bg-slate-900 text-[#00B5B5]" : "border-dashed border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-950 text-gray-500"}`}
                                                                        >
                                                                            {certFile?.name ? <FileIcon /> : <UploadIcon />}
                                                                            {certFile?.name ||
                                                                                t("auth.register.stepTwo.uploadCertificateFile")}
                                                                        </button>
                                                                        {certFile?.name && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => subField.handleChange(null)}
                                                                                className="text-red-500 text-xs font-bold hover:underline mt-2 text-center block w-full"
                                                                            >
                                                                                {t("auth.register.stepTwo.deleteFile")}
                                                                            </button>
                                                                        )}
                                                                        {invalid && (
                                                                            <p className="text-red-500 text-sm mt-1 text-start">
                                                                                {subField.state.meta.errors?.[0]?.message ?? ""}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                );
                                                            }}
                                                        </form.Field>

                                                        <button
                                                            type="button"
                                                            onClick={() => saveCert(index)}
                                                            className="w-full bg-[#00B5B5] text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-[0.98]"
                                                        >
                                                            <CheckIcon className="w-4 h-4" />
                                                            {t("auth.register.stepTwo.saveCertificate")}
                                                        </button>
                                                        </div>
                                                    </div>
                                                    );
                                                })}
                                            </div>
                                        </>
                                    );
                                }}
                            </form.Field>
                        </div>
                    )}

                    {/* Bio (Text) */}
                    {bioReq && (
                        <div className="space-y-2 pt-6 border-t border-gray-100 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <label className="block text-start text-sm font-bold text-[#003049] dark:text-slate-200">
                                    {sectionLabel(
                                        bioReq,
                                        t("auth.register.stepTwo.requirements.bioLabel"),
                                    )}
                                </label>
                                <RequiredBadge required={bioReq.isRequired} />
                            </div>
                            {sectionDescription(bioReq) && (
                                <p className="text-xs text-gray-400 dark:text-slate-500">
                                    {sectionDescription(bioReq)}
                                </p>
                            )}
                            <form.Field name="bio">
                                {(field) => {
                                    const invalid =
                                        field.state.meta.isTouched &&
                                        !field.state.meta.isValid;
                                    const value = field.state.value as string;
                                    return (
                                        <>
                                            <textarea
                                                rows={4}
                                                value={value}
                                                maxLength={bioReq.maxLength ?? undefined}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                placeholder={t("auth.register.stepTwo.requirements.bioPlaceholder")}
                                                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-start text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#00B5B5] transition-all resize-none"
                                            />
                                            <div className="flex justify-between items-center">
                                                {invalid ? (
                                                    <p className="text-red-500 text-sm text-start">
                                                        {field.state.meta.errors?.[0]?.message ?? ""}
                                                    </p>
                                                ) : (
                                                    <span />
                                                )}
                                                {bioReq.maxLength && (
                                                    <span className="text-[10px] text-gray-400 dark:text-slate-500">
                                                        {value.length}/{bioReq.maxLength}
                                                    </span>
                                                )}
                                            </div>
                                        </>
                                    );
                                }}
                            </form.Field>
                        </div>
                    )}

                    {/* Custom file requirements */}
                    {customFileReqs.map((req) => (
                        <CustomFileSection
                            key={req.code}
                            req={req}
                            form={form}
                            label={sectionLabel(req, req.code)}
                            description={sectionDescription(req)}
                            renderBadge={(required) => <RequiredBadge required={required} />}
                        />
                    ))}

                    {/* Custom text requirements */}
                    {customTextReqs.map((req) => (
                        <CustomTextSection
                            key={req.code}
                            req={req}
                            form={form}
                            label={sectionLabel(req, req.code)}
                            description={sectionDescription(req)}
                            renderBadge={(required) => <RequiredBadge required={required} />}
                        />
                    ))}

                    {/* Custom boolean requirements */}
                    {customBoolReqs.map((req) => (
                        <CustomBooleanSection
                            key={req.code}
                            req={req}
                            form={form}
                            label={sectionLabel(req, req.code)}
                            description={sectionDescription(req)}
                            renderBadge={(required) => <RequiredBadge required={required} />}
                        />
                    ))}

                    {/* Selection requirements */}
                    {selectionReqs.map((req) => (
                        <SelectionSection
                            key={req.code}
                            req={req}
                            form={form}
                            locale={locale}
                            label={sectionLabel(req, req.code)}
                            description={sectionDescription(req)}
                            renderBadge={(required) => <RequiredBadge required={required} />}
                        />
                    ))}
                </div>
            </div>

            <div className="pt-6 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800">
                <form.Subscribe
                    selector={(state) => [state.canSubmit, state.isSubmitting]}
                >
                    {([canSubmit, isSubmitting]) => (
                        <button
                            type="submit"
                            disabled={!canSubmit || isSubmitting}
                            className="w-full bg-[#003049] dark:bg-[#00B5B5] text-white py-3 rounded-2xl font-bold hover:opacity-90 transition-all shadow-xl shadow-[#003049]/10 dark:shadow-[#00B5B5]/20 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98]"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    {t("auth.register.stepTwo.submitting")}
                                </>
                            ) : (
                                t("auth.register.stepTwo.submit")
                            )}
                        </button>
                    )}
                </form.Subscribe>
            </div>
        </form>
    );
};

interface CustomFileSectionProps {
    req: RegistrationRequirement;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: any;
    label: string;
    description?: string | null;
    renderBadge: (required: boolean) => React.ReactNode;
}

const CustomFileSection: React.FC<CustomFileSectionProps> = ({
    req,
    form,
    label,
    description,
    renderBadge,
}) => {
    const { t } = useTranslation("teacher");
    const inputRef = useRef<HTMLInputElement>(null);
    const maxCount = req.maxCount ?? 1;

    return (
        <div className="space-y-2 pt-6 border-t border-gray-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <label className="block text-start text-sm font-bold text-[#003049] dark:text-slate-200">
                        {label}
                    </label>
                    {renderBadge(req.isRequired)}
                </div>
                <span className="text-[10px] text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                    {req.maxFileSizeBytes
                        ? t("auth.register.stepTwo.requirements.maxFileSize", {
                            size: formatBytes(req.maxFileSizeBytes),
                        })
                        : ""}
                </span>
            </div>
            {description && (
                <p className="text-xs text-gray-400 dark:text-slate-500">{description}</p>
            )}
            <form.Field name={`customFiles.${req.code}`} mode="array">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(field: any) => {
                    const files = (field.state.value as File[]) ?? [];
                    const invalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;
                    const addFiles = (fileList: FileList | null) => {
                        if (!fileList) return;
                        const remaining = maxCount - files.length;
                        Array.from(fileList)
                            .slice(0, Math.max(0, remaining))
                            .forEach((file) => {
                                if (!isAllowedExtension(file.name, req.allowedExtensions)) {
                                    showToast({
                                        type: "validation",
                                        message: t(
                                            "auth.register.stepTwo.requirements.validation.fileWrongType",
                                            { exts: (req.allowedExtensions ?? []).join(", ") },
                                        ),
                                    });
                                    return;
                                }
                                field.pushValue(file);
                            });
                        if (inputRef.current) inputRef.current.value = "";
                    };
                    return (
                        <>
                            <input
                                ref={inputRef}
                                type="file"
                                className="hidden"
                                multiple={maxCount > 1}
                                accept={acceptAttribute(req.allowedExtensions)}
                                onChange={(e) => addFiles(e.target.files)}
                            />
                            <button
                                type="button"
                                onClick={() => inputRef.current?.click()}
                                disabled={files.length >= maxCount}
                                className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all border-2 border-dashed border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-950 text-gray-500 hover:border-[#00B5B5] disabled:opacity-50"
                            >
                                <UploadIcon className="w-4 h-4" />
                                {maxCount > 1
                                    ? t("auth.register.stepTwo.requirements.addFiles", {
                                        current: files.length,
                                        max: maxCount,
                                    })
                                    : t("auth.register.stepTwo.requirements.chooseFile")}
                            </button>
                            <div className="space-y-2 mt-2">
                                {files.map((file, index) => (
                                    <div
                                        key={`${file.name}-${index}`}
                                        className="flex items-center justify-between bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl px-3 py-2"
                                    >
                                        <span className="flex items-center gap-2 text-sm text-slate-900 dark:text-slate-100 truncate max-w-[80%]">
                                            <FileIcon className="w-4 h-4 text-[#00B5B5] shrink-0" />
                                            <span className="truncate">{file.name}</span>
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => field.removeValue(index)}
                                            className="text-gray-300 hover:text-red-500 transition-colors"
                                        >
                                            <XIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            {invalid && (
                                <p className="text-red-500 text-sm mt-1 text-start">
                                    {field.state.meta.errors?.[0]?.message ?? ""}
                                </p>
                            )}
                        </>
                    );
                }}
            </form.Field>
        </div>
    );
};

interface GenericSectionProps {
    req: RegistrationRequirement;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: any;
    label: string;
    description?: string | null;
    renderBadge: (required: boolean) => React.ReactNode;
}

const CustomTextSection: React.FC<GenericSectionProps> = ({
    req,
    form,
    label,
    description,
    renderBadge,
}) => {
    return (
        <div className="space-y-2 pt-6 border-t border-gray-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
                <label className="block text-start text-sm font-bold text-[#003049] dark:text-slate-200">
                    {label}
                </label>
                {renderBadge(req.isRequired)}
            </div>
            {description && (
                <p className="text-xs text-gray-400 dark:text-slate-500">{description}</p>
            )}
            <form.Field name={`customTexts.${req.code}`}>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(field: any) => {
                    const invalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;
                    const value = (field.state.value as string) ?? "";
                    return (
                        <>
                            <textarea
                                rows={3}
                                value={value}
                                maxLength={req.maxLength ?? undefined}
                                onChange={(e) => field.handleChange(e.target.value)}
                                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-start text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#00B5B5] transition-all resize-none"
                            />
                            <div className="flex justify-between items-center">
                                {invalid ? (
                                    <p className="text-red-500 text-sm text-start">
                                        {field.state.meta.errors?.[0]?.message ?? ""}
                                    </p>
                                ) : (
                                    <span />
                                )}
                                {req.maxLength && (
                                    <span className="text-[10px] text-gray-400 dark:text-slate-500">
                                        {value.length}/{req.maxLength}
                                    </span>
                                )}
                            </div>
                        </>
                    );
                }}
            </form.Field>
        </div>
    );
};

const CustomBooleanSection: React.FC<GenericSectionProps> = ({
    req,
    form,
    label,
    description,
    renderBadge,
}) => {
    const { t } = useTranslation("teacher");
    return (
        <div className="space-y-2 pt-6 border-t border-gray-100 dark:border-slate-800">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex flex-col items-start gap-1 w-full md:w-auto">
                    <div className="flex items-center gap-2">
                        <h3 className="text-[#003049] dark:text-slate-100 font-bold text-base text-start">
                            {label}
                        </h3>
                        {renderBadge(req.isRequired)}
                    </div>
                    {description && (
                        <p className="text-xs text-gray-400 dark:text-slate-500 text-start">
                            {description}
                        </p>
                    )}
                </div>
                <form.Field name={`customBools.${req.code}`}>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {(field: any) => {
                        const current = field.state.value as boolean;
                        return (
                            <div className="flex gap-2 w-full md:w-auto">
                                <button
                                    type="button"
                                    onClick={() => field.handleChange(true)}
                                    className={`flex-1 md:w-28 py-1.5 rounded-xl border-2 transition-all font-bold ${current ? "bg-[#00B5B5] border-[#00B5B5] text-white shadow-lg shadow-[#00B5B5]/20" : "border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-800"}`}
                                >
                                    {t("auth.register.stepTwo.yes")}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => field.handleChange(false)}
                                    className={`flex-1 md:w-28 py-1.5 rounded-xl border-2 transition-all font-bold ${!current ? "bg-[#00B5B5] border-[#00B5B5] text-white shadow-lg shadow-[#00B5B5]/20" : "border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-800"}`}
                                >
                                    {t("auth.register.stepTwo.no")}
                                </button>
                            </div>
                        );
                    }}
                </form.Field>
            </div>
        </div>
    );
};

interface SelectionSectionProps extends GenericSectionProps {
    locale: string;
}

const SelectionSection: React.FC<SelectionSectionProps> = ({
    req,
    form,
    locale,
    label,
    description,
    renderBadge,
}) => {
    const { t } = useTranslation("teacher");
    const options = req.options ?? [];
    const isMulti = (req.maxCount ?? 1) > 1;

    return (
        <div className="space-y-2 pt-6 border-t border-gray-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
                <label className="block text-start text-sm font-bold text-[#003049] dark:text-slate-200">
                    {label}
                </label>
                {renderBadge(req.isRequired)}
            </div>
            {description && (
                <p className="text-xs text-gray-400 dark:text-slate-500">{description}</p>
            )}
            <form.Field name={`customSelections.${req.code}`} mode="array">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(field: any) => {
                    const selected = (field.state.value as string[]) ?? [];
                    const invalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;

                    if (isMulti) {
                        const maxCount = req.maxCount ?? options.length;
                        const toggle = (value: string) => {
                            if (selected.includes(value)) {
                                field.handleChange(selected.filter((v) => v !== value));
                            } else if (selected.length < maxCount) {
                                field.handleChange([...selected, value]);
                            }
                        };
                        return (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                    {options.map((opt) => {
                                        const checked = selected.includes(opt.value);
                                        const atLimit =
                                            !checked && selected.length >= maxCount;
                                        return (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => toggle(opt.value)}
                                                disabled={atLimit}
                                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-start text-sm font-bold transition-all disabled:opacity-50 ${checked ? "bg-[#00B5B5]/10 border-[#00B5B5] text-[#00B5B5]" : "border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 bg-white dark:bg-slate-900"}`}
                                            >
                                                <span
                                                    className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${checked ? "bg-[#00B5B5] border-[#00B5B5]" : "border-gray-300 dark:border-slate-600"}`}
                                                >
                                                    {checked && (
                                                        <CheckIcon className="w-3 h-3 text-white" />
                                                    )}
                                                </span>
                                                {optionLabel(opt, locale)}
                                            </button>
                                        );
                                    })}
                                </div>
                                {invalid && (
                                    <p className="text-red-500 text-sm mt-1 text-start">
                                        {field.state.meta.errors?.[0]?.message ?? ""}
                                    </p>
                                )}
                            </>
                        );
                    }

                    // Single selection → dropdown; stored as a 0/1-element array.
                    return (
                        <>
                            <div className="relative">
                                <select
                                    value={selected[0] ?? ""}
                                    onChange={(e) =>
                                        field.handleChange(
                                            e.target.value ? [e.target.value] : [],
                                        )
                                    }
                                    className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-start text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#00B5B5] appearance-none cursor-pointer"
                                >
                                    <option value="">
                                        {t("auth.register.stepTwo.requirements.selectPlaceholder")}
                                    </option>
                                    {options.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {optionLabel(opt, locale)}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute start-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#00B5B5]">
                                    <ChevronDownIcon className="w-4 h-4" />
                                </div>
                            </div>
                            {invalid && (
                                <p className="text-red-500 text-sm mt-1 text-start">
                                    {field.state.meta.errors?.[0]?.message ?? ""}
                                </p>
                            )}
                        </>
                    );
                }}
            </form.Field>
        </div>
    );
};

export default StepTwo;

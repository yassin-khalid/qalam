import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLiveQuery } from "@tanstack/react-db";
import { localStorageCollection } from "@/lib/db/localStorageCollection";
import ThemeToggleButton from "@/lib/components/ThemeToggleButton";
import QalamLogo from "@/lib/components/QalamLogo";
import {
    AlertTriangle,
    FileIcon,
    Loader2,
    UploadIcon,
} from "lucide-react";
import {
    getTeacherDocumentsStatus,
    reuploadDocument,
    LegacyDocument,
    RequirementStatus,
    TeacherDocumentsError,
} from "../register/-api/teacherDocuments";
import { showToast } from "@/lib/utils/toast";
import { useLocale } from "@/lib/hooks/useLocale";

export const Route = createFileRoute("/teacher/reupload")({
    ssr: false,
    beforeLoad: () => {
        const token = localStorage.getItem("token");
        if (!token) {
            throw redirect({
                to: "/teacher/register",
                search: { step: 0, authSubStep: "phone" },
            });
        }
    },
    component: ReuploadRoute,
});

function ReuploadRoute() {
    const { t } = useTranslation("teacher");
    const locale = useLocale();
    const navigate = useNavigate();
    const { data: sessionData } = useLiveQuery((q) =>
        q.from({ session: localStorageCollection })
    );
    const token = sessionData?.[0]?.token ?? "";

    const [documents, setDocuments] = useState<RequirementStatus[]>([]);
    const [legacyDocuments, setLegacyDocuments] = useState<LegacyDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploadingId, setUploadingId] = useState<number | null>(null);

    const fetchStatus = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const status = await getTeacherDocumentsStatus(token);
            setDocuments(status.requirements);
            setLegacyDocuments(status.legacyDocuments);
            const stillRejected = status.requirements.some(
                (r) => r.verificationStatus === "Rejected"
            );
            if (!stillRejected && status.requirements.length > 0) {
                // All cleared; send the teacher back to the await screen — admin will re-review.
                navigate({ to: "/teacher/await" });
            }
        } catch (error) {
            showToast({
                type: "server",
                message:
                    error instanceof Error
                        ? error.message
                        : t("auth.reupload.toasts.fetchError"),
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, [token]);

    // System File requirement codes → the `documentType` they surface as in
    // `legacyDocuments`. Used to recover a `teacherDocumentId` the backend
    // leaves null on a rejected requirement (the document id lives only on the
    // matching legacy document — e.g. a rejected `certificate` ↔ legacy doc
    // with documentType "Certificate").
    const codeToLegacyType: Record<string, string> = {
        identity_document: "IdentityDocument",
        certificate: "Certificate",
    };

    const rejectedDocuments = useMemo(
        () =>
            documents
                .filter((r) => r.verificationStatus === "Rejected")
                .map((r) => {
                    if (r.teacherDocumentId != null) return r;
                    const legacyType = codeToLegacyType[r.code];
                    if (!legacyType) return r;
                    const match = legacyDocuments.find(
                        (d) =>
                            d.documentType === legacyType &&
                            d.verificationStatus === "Rejected"
                    );
                    return match
                        ? { ...r, teacherDocumentId: match.id }
                        : r;
                })
                .filter((r) => r.teacherDocumentId != null),
        [documents, legacyDocuments]
    );

    const handleReupload = async (doc: RequirementStatus, file: File) => {
        if (doc.teacherDocumentId == null) return;
        setUploadingId(doc.teacherDocumentId);
        try {
            const result = await reuploadDocument({
                teacherDocumentId: doc.teacherDocumentId,
                file,
                token,
            });
            showToast({
                type: "success",
                message: result.message ?? t("auth.reupload.toasts.success"),
            });
            await fetchStatus();
        } catch (error) {
            if (error instanceof TeacherDocumentsError) {
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
                        : t("auth.reupload.toasts.unexpected"),
            });
        } finally {
            setUploadingId(null);
        }
    };

    const requirementLabel = (doc: RequirementStatus): string => {
        const apiLabel = locale === "ar" ? doc.nameAr : doc.nameEn;
        if (apiLabel) return apiLabel;
        switch (doc.code) {
            case "identity_document":
                return t("auth.reupload.types.identityDocument");
            case "certificate":
                return t("auth.reupload.types.certificate");
            default:
                return t("auth.reupload.types.other");
        }
    };

    return (
        <>
            <ThemeToggleButton className="fixed top-6 left-6 w-fit z-50 p-3 rounded-full bg-white dark:bg-[#112240] shadow-lg border border-gray-200 dark:border-[#233554] text-[#003555] dark:text-[#64ffda] hover:scale-110 active:scale-95 transition-all" />
            <div className="min-h-screen flex items-center justify-center bg-primary p-4">
                <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 md:p-10">
                    <div className="flex flex-col items-center mb-6">
                        <QalamLogo className="w-24 mb-3" />
                        <div className="w-14 h-14 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mb-4">
                            <AlertTriangle className="w-7 h-7" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-[#003049] dark:text-slate-100 mb-2 text-center">
                            {t("auth.reupload.title")}
                        </h1>
                        <p className="text-gray-500 dark:text-slate-400 text-center max-w-md">
                            {t("auth.reupload.subtitle")}
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="w-8 h-8 text-[#00B5B5] animate-spin" />
                        </div>
                    ) : rejectedDocuments.length === 0 ? (
                        <div className="py-12 text-center text-gray-400 dark:text-slate-500">
                            {t("auth.reupload.empty")}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {rejectedDocuments.map((doc) => {
                                const isUploading = uploadingId === doc.teacherDocumentId;
                                const inputId = `reupload-${doc.teacherDocumentId}`;
                                return (
                                    <div
                                        key={doc.teacherDocumentId ?? doc.code}
                                        className="border-2 border-red-100 dark:border-red-900/40 bg-red-50/30 dark:bg-red-900/10 rounded-2xl p-5"
                                    >
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center text-[#00B5B5]">
                                                    <FileIcon className="w-5 h-5" />
                                                </div>
                                                <div className="text-start">
                                                    <h3 className="font-bold text-[#003049] dark:text-slate-100">
                                                        {requirementLabel(doc)}
                                                    </h3>
                                                </div>
                                            </div>
                                            <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 text-[10px] font-bold px-2 py-1 rounded-full">
                                                {t("auth.reupload.statusRejected")}
                                            </span>
                                        </div>

                                        {doc.rejectionReason && (
                                            <div className="bg-white dark:bg-slate-800/50 border border-red-100 dark:border-red-900/30 rounded-xl px-4 py-3 mb-4">
                                                <p className="text-[11px] font-bold text-red-500 mb-1">
                                                    {t("auth.reupload.reasonLabel")}
                                                </p>
                                                <p className="text-sm text-[#003049] dark:text-slate-200">
                                                    {doc.rejectionReason}
                                                </p>
                                            </div>
                                        )}

                                        <input
                                            type="file"
                                            id={inputId}
                                            className="hidden"
                                            accept=".jpg,.jpeg,.png,.pdf"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) handleReupload(doc, file);
                                                e.target.value = "";
                                            }}
                                        />
                                        <label
                                            htmlFor={inputId}
                                            className={`w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                                                isUploading
                                                    ? "bg-gray-200 dark:bg-slate-700 text-gray-500 cursor-not-allowed"
                                                    : "bg-[#003049] dark:bg-[#00B5B5] text-white hover:opacity-90"
                                            }`}
                                        >
                                            {isUploading ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    {t("auth.reupload.uploading")}
                                                </>
                                            ) : (
                                                <>
                                                    <UploadIcon className="w-4 h-4" />
                                                    {t("auth.reupload.chooseFile")}
                                                </>
                                            )}
                                        </label>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

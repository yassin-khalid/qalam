import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLiveQuery } from "@tanstack/react-db";
import { localStorageCollection } from "@/lib/db/localStorageCollection";
import { upsertSession } from "@/lib/utils/sessionHelpers";
import ThemeToggleButton from "@/lib/components/ThemeToggleButton";
import QalamLogo from "@/lib/components/QalamLogo";
import { Loader2, RefreshCcw } from "lucide-react";
import { getTeacherDocumentsStatus, TeacherDocumentReview } from "../register/-api/teacherDocuments";
import { DocumentVerificationStatus } from "../register/-types/IdentityData";
import { showToast } from "@/lib/utils/toast";
import { nextStepToNavigateOptions, NextStepName } from "@/lib/utils/teacherAuthRouting";

export const Route = createFileRoute("/teacher/await")({
    ssr: false,
    beforeLoad: () => {
        const token = localStorage.getItem("token");
        if (!token) {
            throw redirect({ to: "/teacher/register", search: { step: 0, authSubStep: "phone" } });
        }
    },
    component: AwaitRoute,
});

const POLL_INTERVAL_MS = 15_000;

function deriveNextDestinationFromDocuments(docs: TeacherDocumentReview[]) {
    if (docs.length === 0) return null;
    const hasRejected = docs.some((d) => d.status === DocumentVerificationStatus.REJECTED);
    if (hasRejected) return NextStepName.ReuploadRejectedDocuments;
    const allApproved = docs.every((d) => d.status === DocumentVerificationStatus.APPROVED);
    if (allApproved) return NextStepName.AddTeachingSubjects;
    return null;
}

function AwaitRoute() {
    const { t } = useTranslation("teacher");
    const navigate = useNavigate();
    const { data: sessionData } = useLiveQuery((q) => q.from({ session: localStorageCollection }));
    const token = sessionData?.[0]?.token ?? "";
    const [isChecking, setIsChecking] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const checkStatus = async (showToastOnNoChange = false) => {
        if (!token) return;
        setIsChecking(true);
        try {
            const docs = await getTeacherDocumentsStatus(token);
            const next = deriveNextDestinationFromDocuments(docs);
            if (next === NextStepName.ReuploadRejectedDocuments) {
                upsertSession({
                    registrationStep: {
                        currentStep: 4,
                        nextStep: 4,
                        nextStepName: NextStepName.ReuploadRejectedDocuments,
                        isRegistrationComplete: false,
                        message: null,
                    },
                });
                navigate(nextStepToNavigateOptions({
                    currentStep: 4,
                    nextStep: 4,
                    nextStepName: NextStepName.ReuploadRejectedDocuments,
                    isRegistrationComplete: false,
                    message: null,
                    rejectedDocuments: null,
                }));
                return;
            }
            if (next === NextStepName.AddTeachingSubjects) {
                upsertSession({
                    registrationStep: {
                        currentStep: 4,
                        nextStep: 5,
                        nextStepName: NextStepName.AddTeachingSubjects,
                        isRegistrationComplete: false,
                        message: null,
                    },
                });
                navigate(nextStepToNavigateOptions({
                    currentStep: 4,
                    nextStep: 5,
                    nextStepName: NextStepName.AddTeachingSubjects,
                    isRegistrationComplete: false,
                    message: null,
                    rejectedDocuments: null,
                }));
                return;
            }
            if (showToastOnNoChange) {
                showToast({ type: "warning", message: t("auth.await.toasts.stillPending") });
            }
        } catch (error) {
            if (showToastOnNoChange) {
                showToast({
                    type: "server",
                    message: error instanceof Error ? error.message : t("auth.await.toasts.unexpected"),
                });
            }
        } finally {
            setIsChecking(false);
        }
    };

    useEffect(() => {
        if (!token) return;
        // initial check
        checkStatus(false);
        intervalRef.current = setInterval(() => checkStatus(false), POLL_INTERVAL_MS);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [token]);

    return (
        <>
            <ThemeToggleButton className="fixed top-6 left-6 w-fit z-50 p-3 rounded-full bg-white dark:bg-[#112240] shadow-lg border border-gray-200 dark:border-[#233554] text-[#003555] dark:text-[#64ffda] hover:scale-110 active:scale-95 transition-all" />
            <div className="min-h-screen flex items-center justify-center bg-primary p-4">
                <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 md:p-12 flex flex-col items-center text-center">
                    <div className="mb-6">
                        <QalamLogo className="w-24" />
                    </div>

                    <img
                        src="/teacher-await-approve.gif"
                        alt={t("auth.await.gifAlt")}
                        className="w-56 h-56 mb-6 object-contain"
                    />
                    {isChecking && (
                        <div className="flex items-center gap-2 text-[11px] text-[#00B5B5] mb-3">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>{t("auth.await.refreshing")}</span>
                        </div>
                    )}

                    <h1 className="text-2xl md:text-3xl font-bold text-[#003049] dark:text-slate-100 mb-3">
                        {t("auth.await.title")}
                    </h1>
                    <p className="text-gray-500 dark:text-slate-400 mb-2 leading-relaxed">
                        {t("auth.await.subtitle")}
                    </p>
                    <p className="text-sm text-gray-400 dark:text-slate-500 mb-8">
                        {t("auth.await.hint")}
                    </p>

                    <button
                        type="button"
                        onClick={() => checkStatus(true)}
                        disabled={isChecking}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#003049] dark:bg-[#00B5B5] text-white font-bold transition-all hover:opacity-90 disabled:opacity-50 shadow-lg"
                    >
                        {isChecking ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <RefreshCcw className="w-5 h-5" />
                        )}
                        <span>{t("auth.await.refresh")}</span>
                    </button>
                </div>
            </div>
        </>
    );
}

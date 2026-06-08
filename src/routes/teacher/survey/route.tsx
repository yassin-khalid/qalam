import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react';
import { AppStep, DayAvailability, Exception, Group, SurveyQuestion } from './types/types';
import { upsertSession } from '@/lib/utils/sessionHelpers';
import { NextStepName } from '@/lib/utils/teacherAuthRouting';
import DomainSelection from './-components/DomainSelection';
import SubjectSelection from './-components/SubjectSelection';
import AvailabilitySelection from './-components/AvailabilitySelection';
import ExceptionsSelection from './-components/ExceptionsSelection';
import { updateTheme } from '@/lib/utils/sessionHelpers';
import { useTheme } from '@/lib/hooks/useTheme';
import ThemeToggleButton from '@/lib/components/ThemeToggleButton';
import { useLiveQuery } from '@tanstack/react-db';
import { localStorageCollection } from '@/lib/db/localStorageCollection';

export const Route = createFileRoute('/teacher/survey')({
    component: RouteComponent,
})

function RouteComponent() {
    const navigate = useNavigate();
    const [step, setStep] = useState<AppStep>(AppStep.DOMAIN_SELECTION);
    const [selectedDomainId, setSelectedDomainId] = useState<number | null>(null);
    const [selectedDomainCode, setSelectedDomainCode] = useState<string | null>(null);
    const [groups, setGroups] = useState<Group[]>([]);
    const [selectedDays, setSelectedDays] = useState<number[]>([]);
    const [dayDetails, setDayDetails] = useState<Record<number, DayAvailability>>({});
    const [exceptions, setExceptions] = useState<Exception[]>([]);

    const handleSelectDomain = (id: number, code: string) => {
        setSelectedDomainId(id);
        setSelectedDomainCode(code);
    };

    // Final survey step done → registration is complete; persist the step and
    // send the teacher to the dashboard (there is no SURVEY_GENERATION screen).
    const handleSurveyComplete = () => {
        upsertSession({
            registrationStep: {
                currentStep: 5,
                nextStep: 5,
                nextStepName: NextStepName.RegistrationComplete,
                isRegistrationComplete: true,
                message: null,
            },
        });
        navigate({ to: '/teacher/dashboard' });
    };



    return (
        <div className="min-h-screen flex items-center justify-center p-4 md:p-8 transition-colors duration-500">
            {/* Theme Toggle Button */}
            <ThemeToggleButton className="fixed top-6 left-6 z-50 p-3 rounded-full bg-white dark:bg-[#112240] shadow-lg border border-gray-200 dark:border-[#233554] text-[#003555] dark:text-[#64ffda] hover:scale-110 active:scale-95 transition-all" />


            <div className="w-full max-w-7xl flex items-center justify-center">
                {step === AppStep.DOMAIN_SELECTION && (
                    <DomainSelection
                        selectedDomainId={selectedDomainId}
                        onSelectDomain={handleSelectDomain}
                        onContinue={() => setStep(AppStep.SUBJECT_SELECTION)}
                    />
                )}

                {step === AppStep.SUBJECT_SELECTION && (
                    <SubjectSelection
                        domainId={selectedDomainId}
                        domainCode={selectedDomainCode}
                        groups={groups}
                        onSetGroups={setGroups}
                        onContinue={() => setStep(AppStep.AVAILABILITY_SELECTION)}
                    />
                )}

                {step === AppStep.AVAILABILITY_SELECTION && (
                    <AvailabilitySelection
                        selectedDays={selectedDays}
                        dayDetails={dayDetails}
                        onSetSelectedDays={setSelectedDays}
                        onSetDayDetails={setDayDetails}
                        onContinue={() => setStep(AppStep.EXCEPTIONS_SELECTION)}
                    />
                )}

                {step === AppStep.EXCEPTIONS_SELECTION && (
                    <ExceptionsSelection
                        exceptions={exceptions}
                        onSetExceptions={setExceptions}
                        onContinue={handleSurveyComplete}
                    />
                )}

            </div>
        </div>
    )
}

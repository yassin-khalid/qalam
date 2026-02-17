import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react';
import { AppStep, DayAvailability, Exception, Group, SurveyQuestion } from './types/types';
import DomainSelection from './-components/DomainSelection';
import SubjectSelection from './-components/SubjectSelection';
import AvailabilitySelection from './-components/AvailabilitySelection';
import ExceptionsSelection from './-components/ExceptionsSelection';

export const Route = createFileRoute('/teacher/survey')({
    component: RouteComponent,
})

function RouteComponent() {
    const [step, setStep] = useState<AppStep>(AppStep.DOMAIN_SELECTION);
    const [selectedDomainId, setSelectedDomainId] = useState<number | null>(null);
    // const [selectedDomainName, setSelectedDomainName] = useState<string>('');
    // const [surveyTopic, setSurveyTopic] = useState('');
    // const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
    // const [isGenerating, setIsGenerating] = useState(false);
    const [groups, setGroups] = useState<Group[]>([]);
    const [selectedDays, setSelectedDays] = useState<string[]>([]);
    const [dayDetails, setDayDetails] = useState<Record<string, DayAvailability>>({});
    const [exceptions, setExceptions] = useState<Exception[]>([]);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return document.documentElement.classList.contains('dark');
    });

    const toggleTheme = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        if (newMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    const handleSelectDomain = (id: number, name: string) => {
        setSelectedDomainId(id);
        // setSelectedDomainName(name);
    };

    // const handleGenerateSurvey = async () => {
    //     if (selectedDomainId === null || !surveyTopic) return;
    //     setIsGenerating(true);
    //     try {
    //         const generated = await generateSurveyQuestions(selectedDomainId, selectedDomainName || 'مجال تعليمي', surveyTopic);
    //         setQuestions(generated);
    //         setStep(AppStep.SURVEY_EDITOR);
    //     } catch (err) {
    //         alert("حدث خطأ أثناء إنشاء الأسئلة. يرجى المحاولة مرة أخرى.");
    //     } finally {
    //         setIsGenerating(false);
    //     }
    // };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 md:p-8 transition-colors duration-500">
            {/* Theme Toggle Button */}
            <button
                onClick={toggleTheme}
                className="fixed top-6 left-6 bg-white/10 hover:bg-white/20 dark:bg-slate-800/50 dark:hover:bg-slate-700/50 backdrop-blur-md p-3 rounded-full transition-all border border-white/20 z-50 shadow-lg"
                title={isDarkMode ? "الوضع المضيء" : "الوضع المظلم"}
            >
                {isDarkMode ? (
                    <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" /></svg>
                ) : (
                    <svg className="w-6 h-6 text-slate-100" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
                )}
            </button>

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
                        onContinue={() => setStep(AppStep.SURVEY_GENERATION)}
                    />
                )}

                {/* {step === AppStep.SURVEY_GENERATION && (
                    <SurveyGeneration
                        surveyTopic={surveyTopic}
                        isGenerating={isGenerating}
                        onSetSurveyTopic={setSurveyTopic}
                        onGenerate={handleGenerateSurvey}
                        onBack={() => setStep(AppStep.EXCEPTIONS_SELECTION)}
                    />
                )}

                {step === AppStep.SURVEY_EDITOR && (
                    <SurveyEditor
                        questions={questions}
                        onSetQuestions={setQuestions}
                        onRegenerate={() => setStep(AppStep.SURVEY_GENERATION)}
                    />
                )}
            </div> */}
            </div>
        </div>
    )
}

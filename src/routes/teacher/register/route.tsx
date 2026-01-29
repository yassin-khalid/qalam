import ThemeToggleButton from "@/lib/components/ThemeToggleButton";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  createStandardSchemaV1,
  parseAsJson,
  parseAsNumberLiteral,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";
import RegisterForm from "./-components/RegisterForm";
import z from "zod";
import { StepOneDataOmitPassword } from "./-types/StepOneData";
import { upsertSession } from "@/lib/utils/sessionHelpers";
import { StepTwoData, StepTwoDataOmitIssuingCountryCodeAndIdentityDocumentFileAndCertificates } from "./-types/StepTwoData";
import { VerifyOtpSuccessResponseData } from "./-types/VerifyOtpSuccessResponseData";
import { PersonalInfoSuccessResponseData } from "./-api/personalInfo";

const stepOneDataSchema = z.object({
  userId: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
});

const stepTwoDataSchema = z.object({
  isInSaudiArabia: z.boolean(),
  identityType: z.number(),
  documentNumber: z.string(),
});

const searchParams = {
  step: parseAsNumberLiteral([0, 1, 2] as const).withDefault(0),
  authSubStep: parseAsStringLiteral([
    "phone",
    "otp",
    "none",
  ] as const).withDefault("none"),
  phoneNumber: parseAsString.withDefault(""),
  stepOneData: parseAsJson(stepOneDataSchema).withDefault({
    userId: 0,
    firstName: "",
    lastName: "",
    email: "",
  }),
  stepTwoData: parseAsJson(stepTwoDataSchema).withDefault({
    isInSaudiArabia: true,
    identityType: 1,
    documentNumber: "",
  }),
};
export const Route = createFileRoute("/teacher/register")({
  component: RouteComponent,
  validateSearch: createStandardSchemaV1(searchParams, { partialOutput: true }),
  errorComponent: ({ error }) => (
    <div className="text-red-500">{error.message}</div>
  ),
});

function RouteComponent() {
  const navigate = useNavigate();
  const [{ step, authSubStep, phoneNumber, stepOneData, stepTwoData }, setSearchParams] =
    useQueryStates(searchParams);

  const handlePhoneChanges = (phone: string) => {
    setSearchParams((prev) => ({ ...prev, phoneNumber: phone }));
  };
  const handleStepOneDataChanges = (stepOneData: StepOneDataOmitPassword) => {
    setSearchParams((prev) => ({ ...prev, stepOneData }));
  };
  const handleStepTwoDataChanges = (stepTwoData: StepTwoDataOmitIssuingCountryCodeAndIdentityDocumentFileAndCertificates) => {
    setSearchParams((prev) => ({ ...prev, stepTwoData }));
  };
  const handleStepTwoSuccess = (stepTwoData: StepTwoData) => {
    navigate({ to: '/teacher' })
  }
  const handleNoTokenFound = () => {
    navigate({ to: '/teacher/register', search: { step: 0, authSubStep: 'phone' } })
  }
  const handlePhoneRegistered = (phoneNumber: string) => {
    navigate({
      to: "/teacher/register",
      search: { step: 0, authSubStep: "otp", phoneNumber },
    });
  }
  const handleBackToPhoneStep = () => navigate({
    to: "/teacher/register",
    search: { step: 0, authSubStep: "phone" },
  });

  const handleOtpSuccess = (data: VerifyOtpSuccessResponseData) => {
    upsertSession({ token: data.token })
    if (data.nextStep.nextStep === 3) {
      navigate({
        to: "/teacher/register",
        search: { step: 1, stepOneData },
      });
    }
    if (data.nextStep.nextStep === 4) {
      navigate({
        to: "/teacher/register",
        search: { step: 2 },
      });
    }
  }

  const handlePersonalInfoSuccess = (data: PersonalInfoSuccessResponseData) => {
    upsertSession({ token: data.account.token })
    navigate({ to: '/teacher/register', search: { step: 2 } })
  }


  return (
    <>
      <ThemeToggleButton className="fixed top-6 left-6 w-fit z-50 p-3 rounded-full bg-white dark:bg-[#112240] shadow-lg border border-gray-200 dark:border-[#233554] text-[#003555] dark:text-[#64ffda] hover:scale-110 active:scale-95 transition-all" />
      <div className="flex flex-col md:flex-row justify-center min-h-screen h-full bg-primary">
        <div className={`relative flex justify-center items-center ${step > 0 ? 'md:flex-3' : 'md:flex-1'}`}>
          <img
            src="/login/qalam-login-shadow.svg"
            alt="Qalam Login Shadow"
            className="absolute top-0 right-0 w-full h-full z-0"
          />
          <div className={`w-full relative z-10 mx-2 md:mx-0 px-0 md:px-8`}>
            {/* <RegisterForm onNavigateToOTP={(phone) => { navigate({ to: '/teacher/otp', search: { phone } }) }} onNavigateToBack={() => { navigate({ to: '/teacher/login' }) }} onLogoClick={() => { navigate({ to: '/' }) }} /> */}
            <RegisterForm
              step={step}
              authSubStep={authSubStep}
              phoneNumber={phoneNumber ?? undefined}
              onPhoneRegistered={handlePhoneRegistered}
              onBackToPhoneStep={handleBackToPhoneStep}
              onOtpSuccess={handleOtpSuccess}
              onPhoneChanges={handlePhoneChanges}
              onStepOneDataChanges={handleStepOneDataChanges}
              stepOneData={stepOneData}
              stepTwoData={stepTwoData}
              onStepTwoDataChanges={handleStepTwoDataChanges}
              onPersonalInfoSuccess={handlePersonalInfoSuccess}
              onNoTokenFound={handleNoTokenFound}
              onStepTwoSuccess={handleStepTwoSuccess}
            />
          </div>
        </div>
        <div className={`${step > 0 ? 'flex-2' : 'flex-1'} h-screen hidden md:block`}>
          <img
            src="/login/qalam-login.svg"
            alt="Qalam Login"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import Hero from "./-components/Hero";
import HowItWorks from "./-components/HowItWorks";
import WhyQalam from "./-components/WhyQalam";
import TeacherBenefits from "./-components/TeacherBenefits";
import AppPromotion from "./-components/AppPromotion";
import Testimonials from "./-components/Testimonials";
import FAQSection from "./-components/FAQ";

export const Route = createFileRoute("/_landing/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Hero />
      <WhyQalam />
      <TeacherBenefits />
      <HowItWorks />
      <AppPromotion />
      <FAQSection />
      <Testimonials />
    </>
  );
}

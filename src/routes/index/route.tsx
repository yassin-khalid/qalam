import { createFileRoute } from "@tanstack/react-router";
import Navbar from "./-components/Navbar";
import Hero from "./-components/Hero";
import HowItWorks from "./-components/HowItWorks";
import WhyQalam from "./-components/WhyQalam";
import TeacherBenefits from "./-components/TeacherBenefits";
import AppPromotion from "./-components/AppPromotion";
import Testimonials from "./-components/Testimonials";
import Footer from "./-components/Footer";
import FAQSection from "./-components/FAQ";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-500">
      <Navbar />
      <main>
        <Hero />
        <WhyQalam />
        <TeacherBenefits />
        <HowItWorks />
        <AppPromotion />
        <FAQSection />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}

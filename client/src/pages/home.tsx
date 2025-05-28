import Navigation from "@/components/navigation";
import HeroSection from "@/components/hero-section";
import ApplicationSteps from "@/components/application-steps";
import LoanCalculator from "@/components/loan-calculator";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <HeroSection />
      <ApplicationSteps />
      <LoanCalculator />
      <Footer />
    </div>
  );
}

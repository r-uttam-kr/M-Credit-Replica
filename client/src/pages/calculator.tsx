import Navigation from "@/components/navigation";
import LoanCalculator from "@/components/loan-calculator";
import Footer from "@/components/footer";

export default function Calculator() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-poppins font-bold text-text mb-6">
              EMI Calculator
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Calculate your monthly EMI and plan your loan repayment with our easy-to-use calculator.
            </p>
          </div>
          
          <LoanCalculator />
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

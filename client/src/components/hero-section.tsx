import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="gradient-primary text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl lg:text-5xl font-poppins font-bold mb-6 leading-tight">
              Get Personal Loans up to <span className="text-accent">₹5 Lakhs</span>
            </h1>
            <p className="text-xl mb-8 opacity-90 font-opensans">
              Quick approval, competitive rates, and flexible repayment options. Apply in minutes and get funds within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link href="/apply">
                <Button className="bg-accent text-text px-8 py-4 rounded-xl font-semibold text-lg hover:bg-yellow-400 transition-colors">
                  Apply for Loan
                </Button>
              </Link>
              <Link href="/calculator">
                <Button className="bg-white/10 backdrop-blur text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/20 transition-colors">
                  Calculate EMI
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-accent" />
                <span>No hidden charges</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-accent" />
                <span>Quick approval</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-accent" />
                <span>Flexible terms</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <img 
              src="@assets/business-people-shaking-hands-finishing-up-meeting.jpg" 
              alt="Business professionals shaking hands after successful loan agreement" 
              className="rounded-2xl shadow-2xl w-full h-auto"
            />
            <div className="absolute -bottom-6 -left-6 bg-white rounded-xl p-6 shadow-xl">
              <div className="text-text">
                <div className="text-2xl font-bold text-primary">₹5L</div>
                <div className="text-sm">Max Loan Amount</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

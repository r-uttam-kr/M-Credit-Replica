import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Calculator, Clock, Banknote, Receipt } from "lucide-react";

export default function LoanCalculator() {
  const [loanAmount, setLoanAmount] = useState(100000);
  const [purpose, setPurpose] = useState("");
  const [dailyCollection, setDailyCollection] = useState(0);
  const [processingFees, setProcessingFees] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const tenure = 120; // Fixed 120 days

  const loanPurposes = [
    { value: "home-renovation", label: "Home Renovation" },
    { value: "medical-emergency", label: "Medical Emergency" },
    { value: "education", label: "Education" },
    { value: "wedding", label: "Wedding" },
    { value: "travel", label: "Travel" },
    { value: "business", label: "Business" },
    { value: "other", label: "Other" }
  ];

  useEffect(() => {
    if (loanAmount > 0) {
      // Daily collection calculation based on your exact model
      let dailyCollectionCalculated = 0;
      let processingFeesCalculated = 0;
      
      if (loanAmount === 10000) {
        dailyCollectionCalculated = 110;
        processingFeesCalculated = 290;
      } else if (loanAmount === 20000) {
        dailyCollectionCalculated = 220;
        processingFeesCalculated = 580;
      } else {
        // Linear calculation for other amounts
        dailyCollectionCalculated = Math.round((loanAmount / 10000) * 110);
        processingFeesCalculated = Math.round((loanAmount / 10000) * 290);
      }
      
      const totalAmountCalculated = dailyCollectionCalculated * tenure + processingFeesCalculated;
      
      setDailyCollection(dailyCollectionCalculated);
      setProcessingFees(processingFeesCalculated);
      setTotalAmount(totalAmountCalculated);
    }
  }, [loanAmount]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleApplyNow = () => {
    const queryParams = new URLSearchParams({
      amount: loanAmount.toString(),
      purpose: purpose,
      dailyCollection: dailyCollection.toString(),
      processingFees: processingFees.toString(),
      totalAmount: totalAmount.toString()
    });
    
    window.location.href = `/apply?${queryParams.toString()}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-all duration-300">
                <Calculator className="w-8 h-8 text-white" />
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-xl opacity-0 hover:opacity-30 blur-lg transition-all duration-300"></div>
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Daily Collection Calculator
              </h1>
              <p className="text-gray-600 mt-2">Calculate your daily payment for instant loans up to ₹5,00,000</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calculator Input Section */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                <Banknote className="w-6 h-6 mr-2 text-primary" />
                Loan Details
              </h2>
              
              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Loan Amount
                  </label>
                  <Slider
                    value={[loanAmount]}
                    onValueChange={(value) => setLoanAmount(value[0])}
                    max={500000}
                    min={10000}
                    step={10000}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <span>₹10,000</span>
                    <span className="font-bold text-primary text-lg">{formatCurrency(loanAmount)}</span>
                    <span>₹5,00,000</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Loan Purpose
                  </label>
                  <Select value={purpose} onValueChange={setPurpose}>
                    <SelectTrigger className="w-full h-12">
                      <SelectValue placeholder="Select loan purpose" />
                    </SelectTrigger>
                    <SelectContent>
                      {loanPurposes.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border-2 border-primary/20">
                  <div className="flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary mr-2" />
                    <span className="text-lg font-semibold text-gray-800">
                      Fixed Tenure: {tenure} Days
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 text-center mt-1">
                    All loans have a standard 120-day collection period
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card className="shadow-xl border-0 bg-gradient-to-br from-primary to-secondary text-white">
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold mb-6 flex items-center">
                <Receipt className="w-6 h-6 mr-2" />
                Payment Breakdown
              </h2>
              
              <div className="space-y-6">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6">
                  <div className="text-center">
                    <p className="text-sm opacity-90 mb-2">Daily Collection Amount</p>
                    <p className="text-4xl font-bold">{formatCurrency(dailyCollection)}</p>
                    <p className="text-sm opacity-90 mt-2">per day for {tenure} days</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <p className="text-sm opacity-90 mb-1">Loan Amount</p>
                    <p className="text-xl font-semibold">{formatCurrency(loanAmount)}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <p className="text-sm opacity-90 mb-1">Processing Fees</p>
                    <p className="text-xl font-semibold">{formatCurrency(processingFees)}</p>
                  </div>
                </div>

                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg">Total Amount to Repay</span>
                    <span className="text-2xl font-bold">{formatCurrency(totalAmount)}</span>
                  </div>
                </div>

                <div className="space-y-3 text-sm opacity-90">
                  <div className="flex justify-between">
                    <span>Collection starts:</span>
                    <span>Next day after disbursement</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Collection method:</span>
                    <span>Daily at your doorstep</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Approval time:</span>
                    <span>Within 24 hours</span>
                  </div>
                </div>

                <Button 
                  onClick={handleApplyNow}
                  className="w-full h-12 bg-white text-primary hover:bg-gray-100 font-semibold text-lg transition-all duration-300 transform hover:scale-105"
                  disabled={!purpose}
                >
                  Apply for Loan Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <Card className="text-center p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Quick Approval</h3>
            <p className="text-gray-600 text-sm">Get approved within 24 hours with minimal documentation</p>
          </Card>

          <Card className="text-center p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Banknote className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Daily Collection</h3>
            <p className="text-gray-600 text-sm">Convenient daily payment collection at your doorstep</p>
          </Card>

          <Card className="text-center p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Receipt className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Transparent Pricing</h3>
            <p className="text-gray-600 text-sm">No hidden charges, clear processing fees upfront</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
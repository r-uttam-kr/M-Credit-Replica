import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CheckCircle, ArrowLeft, Calculator, Clock, Banknote } from "lucide-react";
import { insertLoanApplicationSchema, type InsertLoanApplication } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/navigation";

const EMPLOYMENT_TYPES = [
  { value: "salaried", label: "Salaried" },
  { value: "self-employed", label: "Self Employed" },
  { value: "business", label: "Business Owner" },
  { value: "freelancer", label: "Freelancer" },
  { value: "retired", label: "Retired" },
  { value: "other", label: "Other" }
];

const INCOME_RANGES = [
  { value: "below-25000", label: "Below ₹25,000" },
  { value: "25000-50000", label: "₹25,000 - ₹50,000" },
  { value: "50000-100000", label: "₹50,000 - ₹1,00,000" },
  { value: "100000-200000", label: "₹1,00,000 - ₹2,00,000" },
  { value: "200000-500000", label: "₹2,00,000 - ₹5,00,000" },
  { value: "above-500000", label: "Above ₹5,00,000" }
];

const LOAN_PURPOSES = [
  { value: "home-renovation", label: "Home Renovation" },
  { value: "medical-emergency", label: "Medical Emergency" },
  { value: "education", label: "Education" },
  { value: "wedding", label: "Wedding" },
  { value: "travel", label: "Travel" },
  { value: "business", label: "Business" },
  { value: "debt-consolidation", label: "Debt Consolidation" },
  { value: "other", label: "Other" }
];

export default function Apply() {
  const [step, setStep] = useState(1);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<InsertLoanApplication>({
    resolver: zodResolver(insertLoanApplicationSchema),
    defaultValues: {
      fullName: "",
      mobile: "",
      email: "",
      dateOfBirth: "",
      address: "",
      monthlyIncome: "",
      employmentType: "",
      loanAmount: 100000,
      loanTenure: 120,
      processingFees: 0,
      purpose: "",
      dailyCollection: 0,
      totalAmount: 0,
    }
  });

  const createApplicationMutation = useMutation({
    mutationFn: async (data: InsertLoanApplication) => {
      const response = await apiRequest("POST", "/api/loan-applications", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loan-applications"] });
      toast({
        title: "Application Submitted!",
        description: "Your loan application has been submitted successfully. You'll receive updates via email and SMS.",
      });
      setStep(4); // Success step
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Watch for changes in loan amount and calculate daily collection
  const watchedLoanAmount = form.watch("loanAmount");

  useEffect(() => {
    if (watchedLoanAmount > 0) {
      // Daily collection calculation based on your exact model
      let dailyCollectionCalculated = 0;
      let processingFeesCalculated = 0;
      
      if (watchedLoanAmount === 10000) {
        dailyCollectionCalculated = 110;
        processingFeesCalculated = 290;
      } else if (watchedLoanAmount === 20000) {
        dailyCollectionCalculated = 220;
        processingFeesCalculated = 580;
      } else {
        // Linear calculation for other amounts
        dailyCollectionCalculated = Math.round((watchedLoanAmount / 10000) * 110);
        processingFeesCalculated = Math.round((watchedLoanAmount / 10000) * 290);
      }
      
      const totalAmountCalculated = dailyCollectionCalculated * 120 + processingFeesCalculated;
      
      form.setValue("dailyCollection", dailyCollectionCalculated);
      form.setValue("processingFees", processingFeesCalculated);
      form.setValue("totalAmount", totalAmountCalculated);
    }
  }, [watchedLoanAmount, form]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const onSubmit = (data: InsertLoanApplication) => {
    createApplicationMutation.mutate(data);
  };

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-primary hover:text-primary/80 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Apply for Personal Loan</h1>
          <p className="text-gray-600 mt-2">Quick approval with daily collection system</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  step >= stepNumber 
                    ? 'bg-primary border-primary text-white' 
                    : 'bg-white border-gray-300 text-gray-500'
                }`}>
                  {step > stepNumber ? <CheckCircle className="w-5 h-5" /> : stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-full h-1 mx-4 ${
                    step > stepNumber ? 'bg-primary' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-sm text-gray-600">Personal Details</span>
            <span className="text-sm text-gray-600">Loan Details</span>
            <span className="text-sm text-gray-600">Review & Submit</span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Step 1: Personal Information */}
            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Please provide your personal details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="mobile"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mobile Number *</FormLabel>
                          <FormControl>
                            <Input placeholder="9876543210" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="your.email@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter your complete address"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="monthlyIncome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monthly Income *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your monthly income" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {INCOME_RANGES.map((range) => (
                                <SelectItem key={range.value} value={range.value}>
                                  {range.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="employmentType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Employment Type *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select employment type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {EMPLOYMENT_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button type="button" onClick={nextStep}>
                      Next Step
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Loan Details */}
            {step === 2 && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Loan Requirements</CardTitle>
                    <CardDescription>Specify your loan amount and purpose</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="loanAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Loan Amount *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="10000"
                              max="500000"
                              step="10000"
                              placeholder="100000"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="purpose"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Loan Purpose *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select loan purpose" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {LOAN_PURPOSES.map((purpose) => (
                                <SelectItem key={purpose.value} value={purpose.value}>
                                  {purpose.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Daily Collection Summary */}
                <Card className="bg-gradient-to-br from-primary to-secondary text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calculator className="w-5 h-5 mr-2" />
                      Daily Collection Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <Banknote className="w-4 h-4 mr-2" />
                          <span className="text-sm opacity-90">Daily Payment</span>
                        </div>
                        <p className="text-2xl font-bold">{formatCurrency(form.watch("dailyCollection"))}</p>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <Clock className="w-4 h-4 mr-2" />
                          <span className="text-sm opacity-90">Tenure</span>
                        </div>
                        <p className="text-2xl font-bold">120 Days</p>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <Calculator className="w-4 h-4 mr-2" />
                          <span className="text-sm opacity-90">Processing Fee</span>
                        </div>
                        <p className="text-2xl font-bold">{formatCurrency(form.watch("processingFees"))}</p>
                      </div>
                    </div>
                    <div className="mt-4 p-4 bg-white/10 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-lg">Total Amount to Repay:</span>
                        <span className="text-2xl font-bold">{formatCurrency(form.watch("totalAmount"))}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Previous
                  </Button>
                  <Button type="button" onClick={nextStep}>
                    Review Application
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Review and Submit */}
            {step === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Review Your Application</CardTitle>
                  <CardDescription>Please review all details before submitting</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Personal Information</h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Name:</span> {form.watch("fullName")}</p>
                        <p><span className="font-medium">Mobile:</span> {form.watch("mobile")}</p>
                        <p><span className="font-medium">Email:</span> {form.watch("email")}</p>
                        <p><span className="font-medium">Employment:</span> {form.watch("employmentType")}</p>
                        <p><span className="font-medium">Income:</span> {form.watch("monthlyIncome")}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Loan Details</h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Amount:</span> {formatCurrency(form.watch("loanAmount"))}</p>
                        <p><span className="font-medium">Purpose:</span> {form.watch("purpose")}</p>
                        <p><span className="font-medium">Daily Collection:</span> {formatCurrency(form.watch("dailyCollection"))}</p>
                        <p><span className="font-medium">Processing Fee:</span> {formatCurrency(form.watch("processingFees"))}</p>
                        <p><span className="font-medium">Total Repayment:</span> {formatCurrency(form.watch("totalAmount"))}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={prevStep}>
                      Previous
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createApplicationMutation.isPending}
                      className="min-w-[120px]"
                    >
                      {createApplicationMutation.isPending ? "Submitting..." : "Submit Application"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Success */}
            {step === 4 && (
              <Card className="text-center">
                <CardContent className="pt-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted Successfully!</h2>
                  <p className="text-gray-600 mb-6">
                    Your loan application has been received. You'll receive updates via email and SMS.
                  </p>
                  <div className="space-y-2 mb-6">
                    <p className="text-sm text-gray-500">What's next?</p>
                    <ul className="text-sm text-left max-w-md mx-auto space-y-1">
                      <li>• Document verification within 24 hours</li>
                      <li>• Credit assessment and approval</li>
                      <li>• Loan disbursement to your account</li>
                      <li>• Daily collection starts next day</li>
                    </ul>
                  </div>
                  <div className="space-x-4">
                    <Link href="/track-status">
                      <Button>Track Application Status</Button>
                    </Link>
                    <Link href="/">
                      <Button variant="outline">Back to Home</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </form>
        </Form>
      </div>
    </div>
  );
}
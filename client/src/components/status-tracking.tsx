import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Download, MessageCircle } from "lucide-react";
import type { LoanApplication } from "@shared/schema";

interface StatusTrackingProps {
  application: LoanApplication;
}

const statusSteps = [
  {
    id: "pending",
    title: "Application Submitted",
    description: "Your loan application has been successfully submitted and received."
  },
  {
    id: "document_verification",
    title: "Document Verification",
    description: "All submitted documents have been verified and approved."
  },
  {
    id: "credit_assessment",
    title: "Credit Assessment",
    description: "Our team is evaluating your creditworthiness and loan eligibility."
  },
  {
    id: "approved",
    title: "Final Approval",
    description: "Final loan approval and disbursement processing."
  },
  {
    id: "disbursed",
    title: "Fund Disbursement",
    description: "Loan amount will be transferred to your bank account."
  }
];

const getStatusIndex = (status: string) => {
  const statusOrder = ["pending", "under_review", "document_verification", "credit_assessment", "approved", "disbursed"];
  return statusOrder.indexOf(status);
};

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "pending":
    case "under_review":
      return "secondary";
    case "document_verification":
    case "credit_assessment":
      return "default";
    case "approved":
    case "disbursed":
      return "default";
    case "rejected":
      return "destructive";
    default:
      return "secondary";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
    case "under_review":
      return "status-pending";
    case "document_verification":
      return "status-document_verification";
    case "credit_assessment":
      return "status-credit_assessment";
    case "approved":
      return "status-approved";
    case "disbursed":
      return "status-disbursed";
    case "rejected":
      return "status-rejected";
    default:
      return "status-pending";
  }
};

const formatStatus = (status: string) => {
  switch (status) {
    case "under_review":
      return "Under Review";
    case "document_verification":
      return "Document Verification";
    case "credit_assessment":
      return "Credit Assessment";
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
};

export default function StatusTracking({ application }: StatusTrackingProps) {
  const currentStatusIndex = getStatusIndex(application.status);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getExpectedDate = () => {
    const submittedDate = new Date(application.createdAt!);
    const expectedDate = new Date(submittedDate);
    expectedDate.setDate(expectedDate.getDate() + 3); // 3 days from submission
    return expectedDate;
  };

  return (
    <div className="space-y-8">
      {/* Application Status Card */}
      <Card className="gradient-primary text-white">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Application #{application.applicationId}</h3>
              <p className="opacity-90">Submitted on: {formatDate(application.createdAt!)}</p>
            </div>
            <Badge className={`${getStatusColor(application.status)} text-text`}>
              {formatStatus(application.status)}
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm opacity-75 mb-1">Loan Amount</div>
              <div className="text-2xl font-bold">{formatCurrency(application.loanAmount)}</div>
            </div>
            <div>
              <div className="text-sm opacity-75 mb-1">Purpose</div>
              <div className="text-lg font-semibold capitalize">{application.purpose.replace('-', ' ')}</div>
            </div>
            <div>
              <div className="text-sm opacity-75 mb-1">Expected Approval</div>
              <div className="text-lg font-semibold">{formatDate(getExpectedDate())}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Progress */}
      <Card>
        <CardContent className="p-8">
          <div className="space-y-8">
            {statusSteps.map((step, index) => {
              const isCompleted = index <= currentStatusIndex;
              const isCurrent = index === currentStatusIndex;
              const isRejected = application.status === "rejected";
              
              return (
                <div key={step.id} className="flex items-start">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 mt-1 ${
                    isCompleted && !isRejected ? 'bg-green-500' : 
                    isCurrent && !isRejected ? 'bg-accent' : 
                    isRejected && isCurrent ? 'bg-red-500' :
                    'bg-gray-300'
                  }`}>
                    {isCompleted && !isRejected ? (
                      <CheckCircle className="w-4 h-4 text-white" />
                    ) : isCurrent ? (
                      <Clock className="w-4 h-4 text-white" />
                    ) : (
                      <span className="text-gray-600 text-sm font-semibold">{index + 1}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-semibold mb-1 ${
                      isCompleted && !isRejected ? 'text-text' : 
                      isCurrent ? 'text-text' : 
                      'text-gray-400'
                    }`}>
                      {step.title}
                    </h4>
                    <p className={`text-sm ${
                      isCompleted && !isRejected ? 'text-gray-600' : 
                      isCurrent ? 'text-gray-600' : 
                      'text-gray-400'
                    }`}>
                      {step.description}
                    </p>
                    {isCompleted && !isRejected && (
                      <span className="text-xs text-green-600 font-medium">
                        Completed - {formatDate(application.updatedAt!)}
                      </span>
                    )}
                    {isCurrent && !isRejected && (
                      <span className="text-xs text-accent font-medium">
                        {application.status === "pending" ? "Submitted" : "In Progress"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {application.status === "rejected" && (
            <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-semibold text-red-800 mb-2">Application Rejected</h4>
              <p className="text-sm text-red-600">
                Unfortunately, your loan application has been rejected. Please contact our support team for more information.
              </p>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="flex-1 bg-primary text-white hover:bg-primary-light">
                <MessageCircle className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
              <Button variant="outline" className="flex-1 border-primary text-primary hover:bg-primary/5">
                <Download className="w-4 h-4 mr-2" />
                Download Status Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

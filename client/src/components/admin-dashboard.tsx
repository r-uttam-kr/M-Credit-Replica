import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  FileText, 
  CheckCircle, 
  DollarSign, 
  Clock, 
  Eye, 
  Check, 
  X, 
  Download,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import type { LoanApplication } from "@shared/schema";

interface ApplicationStats {
  totalApplications: number;
  approvedLoans: number;
  disbursedAmount: number;
  pendingReview: number;
}

export default function AdminDashboard() {
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  const { data: stats, isLoading: statsLoading } = useQuery<ApplicationStats>({
    queryKey: ["/api/admin/stats"],
  });

  const { data: applications, isLoading: applicationsLoading } = useQuery<LoanApplication[]>({
    queryKey: ["/api/loan-applications"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest("PATCH", `/api/loan-applications/${id}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Status Updated",
        description: "Application status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/loan-applications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    }
  });

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "status-pending";
      case "under_review":
        return "status-under_review";
      case "document_verification":
        return "status-document_verification";
      case "credit_assessment":
        return "status-credit_assessment";
      case "approved":
        return "status-approved";
      case "rejected":
        return "status-rejected";
      case "disbursed":
        return "status-disbursed";
      default:
        return "status-pending";
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const filteredApplications = applications?.filter(app => 
    statusFilter === "all" || app.status === statusFilter
  ) || [];

  const handleStatusUpdate = (id: number, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  const statsCards = [
    {
      title: "Total Applications",
      value: stats?.totalApplications || 0,
      change: "+12%",
      changeType: "increase" as const,
      icon: FileText,
      color: "primary"
    },
    {
      title: "Approved Loans",
      value: stats?.approvedLoans || 0,
      change: "+8%",
      changeType: "increase" as const,
      icon: CheckCircle,
      color: "secondary"
    },
    {
      title: "Disbursed Amount",
      value: formatCurrency(stats?.disbursedAmount || 0),
      change: "+15%",
      changeType: "increase" as const,
      icon: DollarSign,
      color: "accent"
    },
    {
      title: "Pending Review",
      value: stats?.pendingReview || 0,
      change: "-5%",
      changeType: "decrease" as const,
      icon: Clock,
      color: "orange"
    }
  ];

  if (statsLoading || applicationsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-64 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-text">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    stat.color === 'primary' ? 'bg-primary/10' :
                    stat.color === 'secondary' ? 'bg-secondary/10' :
                    stat.color === 'accent' ? 'bg-accent/10' :
                    'bg-orange-100'
                  }`}>
                    <Icon className={`w-6 h-6 ${
                      stat.color === 'primary' ? 'text-primary' :
                      stat.color === 'secondary' ? 'text-secondary' :
                      stat.color === 'accent' ? 'text-accent' :
                      'text-orange-600'
                    }`} />
                  </div>
                </div>
                <div className="flex items-center mt-4">
                  {stat.changeType === 'increase' ? (
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${
                    stat.changeType === 'increase' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {stat.change}
                  </span>
                  <span className="text-gray-500 text-sm ml-2">from last month</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-lg font-semibold text-text">Recent Applications</CardTitle>
            <div className="flex gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="document_verification">Document Verification</SelectItem>
                  <SelectItem value="credit_assessment">Credit Assessment</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="disbursed">Disbursed</SelectItem>
                </SelectContent>
              </Select>
              <Button className="bg-primary text-white hover:bg-primary-light">
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Application ID
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applicant
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Purpose
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredApplications.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">
                      No applications found
                    </td>
                  </tr>
                ) : (
                  filteredApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50">
                      <td className="py-4 px-4 text-sm font-medium text-text">
                        #{app.applicationId}
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <div className="text-sm font-medium text-text">{app.fullName}</div>
                          <div className="text-sm text-gray-500">{app.email}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-text font-semibold">
                        {formatCurrency(app.loanAmount)}
                      </td>
                      <td className="py-4 px-4 text-sm text-text capitalize">
                        {app.purpose.replace('-', ' ')}
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={getStatusColor(app.status)}>
                          {formatStatus(app.status)}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-500">
                        {formatDate(app.createdAt!)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:text-primary-light p-1"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {app.status !== "approved" && app.status !== "disbursed" && app.status !== "rejected" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-secondary hover:text-secondary-light p-1"
                                onClick={() => handleStatusUpdate(app.id, "approved")}
                                disabled={updateStatusMutation.isPending}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 p-1"
                                onClick={() => handleStatusUpdate(app.id, "rejected")}
                                disabled={updateStatusMutation.isPending}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {filteredApplications.length > 0 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Showing 1 to {filteredApplications.length} of {applications?.length || 0} results
              </p>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm" className="bg-primary text-white">
                  1
                </Button>
                <Button variant="outline" size="sm" disabled>
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

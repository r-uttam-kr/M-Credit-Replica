import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import StatusTracking from "@/components/status-tracking";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";
import type { LoanApplication } from "@shared/schema";

export default function TrackStatus() {
  const [applicationId, setApplicationId] = useState("");
  const [searchedId, setSearchedId] = useState("");

  const { data: application, isLoading, error } = useQuery<LoanApplication>({
    queryKey: ["/api/loan-applications/by-application-id", searchedId],
    enabled: !!searchedId,
  });

  const handleSearch = () => {
    if (applicationId.trim()) {
      setSearchedId(applicationId.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-poppins font-bold text-text mb-6">
              Track Your Application
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Enter your application ID to check the current status of your loan application.
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-center">Enter Application ID</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Input
                  placeholder="e.g., LA202412001"
                  value={applicationId}
                  onChange={(e) => setApplicationId(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSearch}
                  className="bg-primary hover:bg-primary-light text-white"
                  disabled={!applicationId.trim() || isLoading}
                >
                  <Search className="w-4 h-4 mr-2" />
                  {isLoading ? "Searching..." : "Search"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {error && (
            <Card className="mb-8">
              <CardContent className="pt-6">
                <div className="text-center text-red-600">
                  <p>Application not found. Please check your application ID and try again.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {application && (
            <StatusTracking application={application} />
          )}

          {!searchedId && !error && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-gray-600">
                  <p className="mb-4">
                    Enter your application ID above to track your loan application status.
                  </p>
                  <p className="text-sm">
                    You can find your application ID in the confirmation email sent after submitting your application.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

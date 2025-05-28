import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Image, CheckCircle, XCircle, Clock, Camera } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface DocumentUploadProps {
  applicationId: number;
  onUploadComplete?: () => void;
}

interface UploadedDocument {
  type: string;
  fileName: string;
  status: 'uploading' | 'success' | 'error';
  progress?: number;
}

const DOCUMENT_TYPES = [
  { 
    value: "photo", 
    label: "Personal Photo", 
    icon: Camera,
    description: "Clear passport-size photo",
    accept: "image/*"
  },
  { 
    value: "aadhar_card", 
    label: "Aadhar Card", 
    icon: FileText,
    description: "Front and back of Aadhar card",
    accept: "image/*,.pdf"
  },
  { 
    value: "pan_card", 
    label: "PAN Card", 
    icon: FileText,
    description: "Clear copy of PAN card",
    accept: "image/*,.pdf"
  },
  { 
    value: "address_proof", 
    label: "Address Proof", 
    icon: FileText,
    description: "Utility bill, bank statement, or rent agreement",
    accept: "image/*,.pdf"
  },
  { 
    value: "income_proof", 
    label: "Income Proof", 
    icon: FileText,
    description: "Salary slip, ITR, or business income proof",
    accept: "image/*,.pdf"
  },
  { 
    value: "bank_statement", 
    label: "Bank Statement", 
    icon: FileText,
    description: "Last 3 months bank statement",
    accept: "image/*,.pdf"
  },
  { 
    value: "signature", 
    label: "Signature", 
    icon: Image,
    description: "Your signature on white paper",
    accept: "image/*"
  },
];

export default function DocumentUpload({ applicationId, onUploadComplete }: DocumentUploadProps) {
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([]);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async ({ file, documentType }: { file: File; documentType: string }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);
      formData.append('applicationId', applicationId.toString());

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      setUploadedDocs(prev => 
        prev.map(doc => 
          doc.type === variables.documentType 
            ? { ...doc, status: 'success' }
            : doc
        )
      );
      
      toast({
        title: "Document Uploaded!",
        description: `${variables.file.name} has been uploaded successfully.`,
      });

      queryClient.invalidateQueries({ queryKey: ['/api/documents', applicationId] });
      onUploadComplete?.();
    },
    onError: (error, variables) => {
      setUploadedDocs(prev => 
        prev.map(doc => 
          doc.type === variables.documentType 
            ? { ...doc, status: 'error' }
            : doc
        )
      );
      
      toast({
        title: "Upload Failed",
        description: "Failed to upload document. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (file: File, documentType: string) => {
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "File Too Large",
        description: "Please select a file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setUploadedDocs(prev => [
      ...prev.filter(doc => doc.type !== documentType),
      {
        type: documentType,
        fileName: file.name,
        status: 'uploading',
        progress: 0,
      }
    ]);

    uploadMutation.mutate({ file, documentType });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Upload className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'uploading':
        return <Badge variant="outline" className="text-blue-600">Uploading</Badge>;
      case 'success':
        return <Badge variant="outline" className="text-green-600">Uploaded</Badge>;
      case 'error':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="w-5 h-5 mr-2" />
            Document Upload
          </CardTitle>
          <CardDescription>
            Please upload all required documents for KYC verification. All documents should be clear and readable.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DOCUMENT_TYPES.map((docType) => {
              const uploadedDoc = uploadedDocs.find(doc => doc.type === docType.value);
              const Icon = docType.icon;
              
              return (
                <div key={docType.value} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">{docType.label}</h3>
                        <p className="text-xs text-gray-500 mt-1">{docType.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(uploadedDoc?.status || 'pending')}
                      {getStatusBadge(uploadedDoc?.status || 'pending')}
                    </div>
                  </div>

                  {uploadedDoc?.status === 'uploading' && (
                    <div className="mb-3">
                      <Progress value={uploadedDoc.progress || 0} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">Uploading {uploadedDoc.fileName}...</p>
                    </div>
                  )}

                  {uploadedDoc?.status === 'success' && (
                    <div className="mb-3">
                      <p className="text-xs text-green-600">✓ {uploadedDoc.fileName}</p>
                    </div>
                  )}

                  <div className="relative">
                    <input
                      type="file"
                      accept={docType.accept}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileSelect(file, docType.value);
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={uploadMutation.isPending && uploadedDoc?.status === 'uploading'}
                    />
                    <Button 
                      variant={uploadedDoc?.status === 'success' ? "outline" : "default"}
                      size="sm" 
                      className="w-full"
                      disabled={uploadMutation.isPending && uploadedDoc?.status === 'uploading'}
                    >
                      {uploadedDoc?.status === 'success' ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Replace Document
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Choose File
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Upload Guidelines:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Documents should be clear and readable</li>
              <li>• Supported formats: JPG, PNG, PDF</li>
              <li>• Maximum file size: 10MB per document</li>
              <li>• Ensure all text and details are visible</li>
              <li>• Upload original documents only</li>
            </ul>
          </div>

          {uploadedDocs.filter(doc => doc.status === 'success').length === DOCUMENT_TYPES.length && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <div>
                  <h4 className="font-medium text-green-900">All Documents Uploaded!</h4>
                  <p className="text-sm text-green-800 mt-1">
                    Your documents have been submitted for verification. You'll be notified once the review is complete.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
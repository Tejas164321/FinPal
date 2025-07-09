import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AppLayout from "@/components/layout/AppLayout";
import { useFileUpload } from "@/hooks/useFileUpload";
import { debugPDF } from "@/lib/api";
import {
  Upload as UploadIcon,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  Download,
  Eye,
  Trash2,
  Smartphone,
  Bug,
} from "lucide-react";

const Upload = () => {
  const [isDragActive, setIsDragActive] = useState(false);
  const {
    uploadedFiles,
    isUploading,
    processFile,
    removeFile,
    clearAllFiles,
    getAllTransactions,
  } = useFileUpload();

  // Helper function to safely format dates
  const formatDate = (dateString: string | Date) => {
    try {
      const date =
        typeof dateString === "string" ? new Date(dateString) : dateString;
      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      console.warn("Invalid date:", dateString);
      return "Invalid Date";
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      processFile(file);
    });
    setIsDragActive(false);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    accept: {
      "text/csv": [".csv"],
      "application/pdf": [".pdf"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-400" />;
      default:
        return <FileText className="h-5 w-5 text-purple-400" />;
    }
  };

  const getSourceIcon = (source: string) => {
    return <Smartphone className="h-4 w-4" />;
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Upload Transactions</h1>
          <p className="text-foreground/70">
            Upload your UPI transaction history from GPay, PhonePe, bank
            statements, or CSV files
          </p>
        </div>

        {/* Upload Area */}
        <Card className="glass-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <UploadIcon className="h-5 w-5 mr-2 text-purple-400" />
              File Upload
            </CardTitle>
          </CardHeader>
          <CardContent>
            <motion.div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                isDragActive
                  ? "border-purple-400 bg-purple-400/5 scale-105"
                  : "border-white/20 hover:border-purple-400/50 hover:bg-white/5"
              }`}
              whileHover={{ scale: isDragActive ? 1.05 : 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <input {...getInputProps()} />
              <motion.div
                initial={{ scale: 1 }}
                animate={{ scale: isDragActive ? 1.1 : 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <UploadIcon className="h-16 w-16 text-purple-400 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-xl font-semibold mb-2">
                {isDragActive ? "Drop files here" : "Upload Transaction Files"}
              </h3>
              <p className="text-foreground/60 mb-6">
                Drag & drop your files here, or click to browse
              </p>
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                <Badge variant="outline" className="border-purple-500/50">
                  .CSV
                </Badge>
                <Badge variant="outline" className="border-purple-500/50">
                  .PDF
                </Badge>
                <Badge variant="outline" className="border-purple-500/50">
                  .XLS
                </Badge>
                <Badge variant="outline" className="border-purple-500/50">
                  .XLSX
                </Badge>
              </div>
              <p className="text-sm text-foreground/40">
                Maximum file size: 10MB
              </p>
            </motion.div>

            {/* Supported Apps */}
            <div className="mt-6 p-4 glass rounded-lg">
              <h4 className="font-medium mb-3 text-sm text-purple-400">
                Supported Apps & Sources
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { name: "Google Pay", icon: "💳" },
                  { name: "PhonePe", icon: "📱" },
                  { name: "Paytm", icon: "🏦" },
                  { name: "Bank Statements", icon: "🏛️" },
                ].map((app) => (
                  <div
                    key={app.name}
                    className="flex items-center space-x-2 p-2 rounded-lg glass-strong"
                  >
                    <span className="text-lg">{app.icon}</span>
                    <span className="text-sm">{app.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* File Processing Status */}
        {uploadedFiles.length > 0 && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Processing Files</span>
                <Badge variant="outline" className="border-purple-500/50">
                  {uploadedFiles.length} file(s)
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {uploadedFiles.map((uploadedFile) => (
                <motion.div
                  key={uploadedFile.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 glass rounded-lg"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(uploadedFile.status)}
                      <div>
                        <div className="font-medium text-sm">
                          {uploadedFile.file.name}
                        </div>
                        <div className="text-xs text-foreground/60">
                          {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {uploadedFile.result?.source && (
                        <Badge
                          variant="outline"
                          className="border-purple-500/50 text-xs"
                        >
                          {getSourceIcon(uploadedFile.result.source)}
                          <span className="ml-1">
                            {uploadedFile.result.source}
                          </span>
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(uploadedFile.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {(uploadedFile.status === "uploading" ||
                    uploadedFile.status === "processing") && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span>
                          {uploadedFile.status === "uploading"
                            ? "Uploading..."
                            : "Processing..."}
                        </span>
                        <span>{uploadedFile.progress}%</span>
                      </div>
                      <Progress value={uploadedFile.progress} className="h-2" />
                    </div>
                  )}

                  {/* Success Details */}
                  {uploadedFile.status === "completed" &&
                    uploadedFile.result && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-400" />
                          <span className="text-sm">
                            {uploadedFile.result.summary.totalTransactions}{" "}
                            transactions found
                          </span>
                        </div>
                        <div className="text-sm text-foreground/70">
                          {formatDate(
                            uploadedFile.result.summary.dateRange.from,
                          )}{" "}
                          -{" "}
                          {formatDate(uploadedFile.result.summary.dateRange.to)}
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="glass border-purple-500/50"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Preview
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="glass border-purple-500/50"
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Export
                          </Button>
                        </div>
                      </div>
                    )}

                  {/* Error State */}
                  {uploadedFile.status === "error" && (
                    <Alert className="glass border-red-500/50">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {uploadedFile.error || "Failed to process file"}
                      </AlertDescription>
                    </Alert>
                  )}
                </motion.div>
              ))}

              {/* Action Buttons */}
              {uploadedFiles.some((f) => f.status === "completed") && (
                <div className="flex space-x-4 pt-4 border-t border-white/10">
                  <Button className="bg-purple-gradient">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Import All Transactions
                  </Button>
                  <Button
                    variant="outline"
                    className="glass border-purple-500/50"
                    onClick={clearAllFiles}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <Card className="glass-card mt-8">
          <CardHeader>
            <CardTitle className="text-lg">
              How to Export Transaction Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-purple-400 mb-2">Google Pay</h4>
                <ol className="text-sm text-foreground/70 space-y-1 list-decimal list-inside">
                  <li>Open Google Pay app</li>
                  <li>Go to Profile → Transaction History</li>
                  <li>Tap the download icon</li>
                  <li>Select date range and download CSV</li>
                </ol>
              </div>
              <div>
                <h4 className="font-medium text-purple-400 mb-2">PhonePe</h4>
                <ol className="text-sm text-foreground/70 space-y-1 list-decimal list-inside">
                  <li>Open PhonePe app</li>
                  <li>Go to History tab</li>
                  <li>Tap Export → Download Statement</li>
                  <li>Choose format and download</li>
                </ol>
              </div>
              <div>
                <h4 className="font-medium text-purple-400 mb-2">
                  Bank Statements
                </h4>
                <ol className="text-sm text-foreground/70 space-y-1 list-decimal list-inside">
                  <li>Login to your bank's website</li>
                  <li>Navigate to Account Statements</li>
                  <li>Select date range</li>
                  <li>Download as PDF or Excel</li>
                </ol>
              </div>
              <div>
                <h4 className="font-medium text-purple-400 mb-2">Paytm</h4>
                <ol className="text-sm text-foreground/70 space-y-1 list-decimal list-inside">
                  <li>Open Paytm app</li>
                  <li>Go to Passbook</li>
                  <li>Tap on Export Statement</li>
                  <li>Download the file</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Upload;

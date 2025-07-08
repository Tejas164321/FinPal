import { useState, useCallback } from "react";
import { uploadFile, checkHealth } from "@/lib/api";
import { type Transaction, type ProcessingResult } from "@/lib/fileProcessing";

export interface UploadedFile {
  file: File;
  id: string;
  status: "uploading" | "processing" | "completed" | "error";
  progress: number;
  result?: ProcessingResult;
  error?: string;
}

export const useFileUpload = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const processFile = useCallback(async (file: File): Promise<void> => {
    const fileId = Math.random().toString(36).substr(2, 9);

    const newFile: UploadedFile = {
      file,
      id: fileId,
      status: "uploading",
      progress: 0,
    };

    setUploadedFiles((prev) => [...prev, newFile]);
    setIsUploading(true);

    try {
      // Simulate upload progress
      setUploadedFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, progress: 30 } : f)),
      );

      // Call backend API
      const apiResult = await uploadFile(file);

      if (!apiResult.success) {
        throw new Error(apiResult.error || "Processing failed");
      }

      // Update to processing status
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === fileId ? { ...f, status: "processing", progress: 70 } : f,
        ),
      );

      // Convert backend response to our frontend format
      const result: ProcessingResult = {
        transactions: apiResult.data.transactions,
        summary: apiResult.data.summary,
        source: apiResult.data.source as any,
        errors: [],
      };

      // Update to completed status
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? {
                ...f,
                status: "completed",
                progress: 100,
                result,
              }
            : f,
        ),
      );

      // Save transactions to store for persistence across pages
      transactionStore.addTransactions(result.transactions);

      console.log("✅ File processed successfully:", apiResult.data.fileName);
      console.log(
        `💾 Added ${result.transactions.length} transactions to store`,
      );
    } catch (error) {
      console.error("❌ Upload error:", error);
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? {
                ...f,
                status: "error",
                error:
                  error instanceof Error
                    ? error.message
                    : "Failed to process file",
              }
            : f,
        ),
      );
    } finally {
      setIsUploading(false);
    }
  }, []);

  const removeFile = useCallback((fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  }, []);

  const clearAllFiles = useCallback(() => {
    setUploadedFiles([]);
  }, []);

  const getAllTransactions = useCallback((): Transaction[] => {
    return uploadedFiles
      .filter((f) => f.status === "completed" && f.result)
      .flatMap((f) => f.result!.transactions);
  }, [uploadedFiles]);

  return {
    uploadedFiles,
    isUploading,
    processFile,
    removeFile,
    clearAllFiles,
    getAllTransactions,
  };
};

import { useState, useCallback } from "react";
import {
  parseCSV,
  detectFileSource,
  generateSummary,
  type Transaction,
  type ProcessingResult,
} from "@/lib/fileProcessing";

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
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        setUploadedFiles((prev) =>
          prev.map((f) => (f.id === fileId ? { ...f, progress } : f)),
        );
      }

      // Update to processing status
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === fileId ? { ...f, status: "processing", progress: 0 } : f,
        ),
      );

      // Read file content
      const content = await readFileContent(file);
      const source = detectFileSource(file.name, content);

      // Process based on file type
      let transactions: Transaction[] = [];

      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        transactions = parseCSV(content);
      } else if (file.type === "application/pdf") {
        // PDF processing would go here - for now, mock data
        transactions = generateMockTransactions(source);
      } else {
        throw new Error("Unsupported file format");
      }

      // Update source for all transactions
      transactions = transactions.map((t) => ({ ...t, source }));

      // Simulate processing progress
      for (let progress = 0; progress <= 100; progress += 20) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        setUploadedFiles((prev) =>
          prev.map((f) => (f.id === fileId ? { ...f, progress } : f)),
        );
      }

      const summary = generateSummary(transactions);
      const result: ProcessingResult = {
        transactions,
        summary,
        source,
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
    } catch (error) {
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

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  };

  const generateMockTransactions = (source: string): Transaction[] => {
    // Mock data generator for PDF files or unsupported formats
    const transactions: Transaction[] = [];
    const transactionCount = Math.floor(Math.random() * 100) + 50;

    const mockMerchants = [
      "Zomato",
      "Swiggy",
      "Amazon",
      "Flipkart",
      "Uber",
      "Ola",
      "Netflix",
      "Spotify",
      "Electricity Bill",
      "Mobile Recharge",
    ];

    for (let i = 0; i < transactionCount; i++) {
      const merchant =
        mockMerchants[Math.floor(Math.random() * mockMerchants.length)];
      const amount = Math.floor(Math.random() * 2000) + 50;
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 90));

      transactions.push({
        id: Math.random().toString(36).substr(2, 9),
        date,
        description: merchant,
        amount,
        type: "debit",
        category: "Others",
        source: source as any,
        confidence: "Medium",
        categorizedBy: "Rule",
        merchant,
      });
    }

    return transactions;
  };

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

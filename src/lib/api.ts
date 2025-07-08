// API service for backend communication

const API_BASE_URL =
  process.env.NODE_ENV === "production" ? "/api" : "http://localhost:3002/api";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface UploadResponse {
  transactions: any[];
  summary: {
    totalTransactions: number;
    totalDebits: number;
    totalCredits: number;
    dateRange: { from: string; to: string };
    categories: { [key: string]: number };
  };
  source: string;
  fileName: string;
  processedAt: string;
}

// Health check
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    return data.status === "OK";
  } catch (error) {
    console.error("Health check failed:", error);
    return false;
  }
}

// Upload file
export async function uploadFile(
  file: File,
): Promise<ApiResponse<UploadResponse>> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || "Upload failed" };
    }

    return data;
  } catch (error) {
    console.error("Upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

// Get processing status (for future async processing)
export async function getProcessingStatus(
  jobId: string,
): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${API_BASE_URL}/status/${jobId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Status check error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

// API service for backend communication

const API_BASE_URL = "/api";

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
    console.log(`🏥 Checking API health at: ${API_BASE_URL}/health`);
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    const isHealthy = data.status === "OK";
    console.log(`💚 API Health: ${isHealthy ? "OK" : "Failed"}`, data);
    return isHealthy;
  } catch (error) {
    console.error("❌ Health check failed:", error);
    return false;
  }
}

// Test API connectivity
export async function testConnection(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const isHealthy = await checkHealth();
    if (isHealthy) {
      return { success: true, message: "API connection successful" };
    } else {
      return { success: false, message: "API is not responding correctly" };
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Connection failed",
    };
  }
}

// Upload file
export async function uploadFile(
  file: File,
): Promise<ApiResponse<UploadResponse>> {
  try {
    console.log(`🔄 Uploading file: ${file.name} (${file.size} bytes)`);

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: "POST",
      body: formData,
      headers: {
        // Don't set Content-Type for FormData, let browser set it with boundary
      },
    });

    console.log(
      `📡 Response status: ${response.status} ${response.statusText}`,
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Upload failed:", errorText);
      return {
        success: false,
        error: `Upload failed: ${response.status} ${response.statusText}`,
      };
    }

    const data = await response.json();
    console.log("✅ Upload successful:", data.success);

    return data;
  } catch (error) {
    console.error("❌ Upload error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Network connection error",
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

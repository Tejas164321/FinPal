const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

// Import our processing modules
const { processCSV } = require("./processors/csvProcessor");
const { processPDF } = require("./processors/pdfProcessor");
const { processExcel } = require("./processors/excelProcessor");
const {
  categorizeTransactions,
} = require("./processors/transactionCategorizer");

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename with timestamp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Check file types
    const allowedTypes = [".csv", ".pdf", ".xls", ".xlsx"];
    const fileExt = path.extname(file.originalname).toLowerCase();

    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only CSV, PDF, XLS, and XLSX files are allowed.",
        ),
      );
    }
  },
});

// API Routes

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "FinPal Backend API is running",
    timestamp: new Date().toISOString(),
  });
});

// File upload endpoint
app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    console.log("📁 File upload started:", req.file?.originalname);

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();

    console.log("🔍 Processing file type:", fileExtension);

    let transactions = [];
    let source = "Unknown";

    // Process file based on type
    switch (fileExtension) {
      case ".csv":
        const csvResult = await processCSV(filePath, req.file.originalname);
        transactions = csvResult.transactions;
        source = csvResult.source;
        break;

      case ".pdf":
        const pdfResult = await processPDF(filePath, req.file.originalname);
        transactions = pdfResult.transactions;
        source = pdfResult.source;
        break;

      case ".xls":
      case ".xlsx":
        const excelResult = await processExcel(filePath, req.file.originalname);
        transactions = excelResult.transactions;
        source = excelResult.source;
        break;

      default:
        throw new Error("Unsupported file type");
    }

    console.log("🔄 Categorizing transactions...");

    // Categorize transactions using our AI/Rule system
    const categorizedTransactions = await categorizeTransactions(transactions);

    // Generate summary
    const summary = generateSummary(categorizedTransactions);

    console.log(
      `✅ Processing complete: ${categorizedTransactions.length} transactions found`,
    );

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    // Return processed data
    res.json({
      success: true,
      data: {
        transactions: categorizedTransactions,
        summary,
        source,
        fileName: req.file.originalname,
        processedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ Error processing file:", error.message);

    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      error: "Failed to process file",
      message: error.message,
    });
  }
});

// Get processing status (for future use with async processing)
app.get("/api/status/:jobId", (req, res) => {
  // This would track processing jobs in a real implementation
  res.json({
    jobId: req.params.jobId,
    status: "completed",
    message: "File processing completed",
  });
});

// Helper function to generate summary
function generateSummary(transactions) {
  const totalTransactions = transactions.length;
  const debits = transactions.filter((t) => t.type === "debit");
  const credits = transactions.filter((t) => t.type === "credit");

  const totalDebits = debits.reduce((sum, t) => sum + t.amount, 0);
  const totalCredits = credits.reduce((sum, t) => sum + t.amount, 0);

  // Get date range
  const dates = transactions.map((t) => new Date(t.date)).sort();
  const dateRange = {
    from: dates[0] || new Date(),
    to: dates[dates.length - 1] || new Date(),
  };

  // Category breakdown
  const categories = {};
  debits.forEach((t) => {
    categories[t.category] = (categories[t.category] || 0) + t.amount;
  });

  return {
    totalTransactions,
    totalDebits,
    totalCredits,
    dateRange,
    categories,
  };
}

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ error: "File too large. Maximum size is 10MB." });
    }
  }

  res.status(500).json({ error: error.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 FinPal Backend API running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
});

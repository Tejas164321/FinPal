const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

// Import our processing modules
const {
  UniversalTransactionProcessor,
} = require("./processors/universalProcessor");
const {
  categorizeTransactions,
} = require("./processors/transactionCategorizer");

const app = express();
const PORT = process.env.PORT || 3003;

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
    console.log("���� File upload started:", req.file?.originalname);

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();

    console.log("🔍 Processing file type:", fileExtension);

    console.log("🚀 Using Universal Transaction Processor...");

    // Create universal processor instance
    const processor = new UniversalTransactionProcessor();

    // Process file with universal system
    const result = await processor.processFile(filePath, req.file.originalname);

    let transactions = result.transactions;
    const source = result.source;
    const strategy = result.strategy;
    const confidence = result.confidence;

    console.log(`📊 Universal Processing Results:`);
    console.log(`   - Transactions found: ${transactions.length}`);
    console.log(`   - Source detected: ${source}`);
    console.log(`   - Strategy used: ${strategy}`);
    console.log(`   - Confidence: ${confidence}`);

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

// Debug endpoint to examine PDF content
app.post("/api/debug-pdf", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path;
    const pdfParse = require("pdf-parse");
    const fs = require("fs");

    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    const content = pdfData.text;

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      data: {
        totalPages: pdfData.numpages,
        textLength: content.length,
        first1000chars: content.substring(0, 1000),
        lines: content.split("\n").slice(0, 50), // First 50 lines
        hasRupeeSymbol: content.includes("₹"),
        hasDatePattern: /\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}/.test(content),
        hasAmountPattern: /\d+\.\d{2}|\d+,\d+/.test(content),
        fileName: req.file.originalname,
      },
    });
  } catch (error) {
    console.error("Debug PDF error:", error);
    res.status(500).json({ error: error.message });
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
  console.log(`���� Health check: http://localhost:${PORT}/api/health`);
});

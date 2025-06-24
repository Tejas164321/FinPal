const XLSX = require("xlsx");
const { detectSource } = require("./sourceDetector");

async function processExcel(filePath, fileName) {
  try {
    console.log(`📊 Processing Excel file: ${fileName}`);

    const workbook = XLSX.readFile(filePath);
    const source = detectSource(fileName);

    let transactions = [];

    // Process all worksheets
    for (const sheetName of workbook.SheetNames) {
      console.log(`📋 Processing worksheet: ${sheetName}`);
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      const sheetTransactions = parseWorksheet(data, source);
      transactions = transactions.concat(sheetTransactions);
    }

    console.log(
      `✅ Excel processed: ${transactions.length} transactions found`,
    );

    return { transactions, source };
  } catch (error) {
    console.error("❌ Excel processing error:", error);
    throw new Error("Failed to process Excel file: " + error.message);
  }
}

function parseWorksheet(data, source) {
  if (!data || data.length < 2) {
    return []; // Need at least header and one data row
  }

  const transactions = [];
  const headers = data[0].map((header) =>
    header ? header.toString().toLowerCase().trim() : "",
  );

  // Find column indices
  const columnMapping = findColumns(headers);

  console.log("📍 Column mapping:", columnMapping);

  // Process data rows
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    try {
      const transaction = parseExcelRow(row, columnMapping, source);
      if (transaction) {
        transactions.push(transaction);
      }
    } catch (error) {
      console.warn(`⚠️ Skipping row ${i + 1}:`, error.message);
    }
  }

  return transactions;
}

function findColumns(headers) {
  const mapping = {
    date: -1,
    description: -1,
    amount: -1,
    debit: -1,
    credit: -1,
    type: -1,
  };

  headers.forEach((header, index) => {
    const h = header.toLowerCase();

    // Date columns
    if (
      h.includes("date") ||
      h.includes("transaction date") ||
      h.includes("posting date") ||
      h.includes("value date")
    ) {
      mapping.date = index;
    }

    // Description columns
    if (
      h.includes("description") ||
      h.includes("particulars") ||
      h.includes("details") ||
      h.includes("transaction details") ||
      h.includes("merchant") ||
      h.includes("activity")
    ) {
      mapping.description = index;
    }

    // Amount columns
    if (h.includes("amount") && !h.includes("balance")) {
      mapping.amount = index;
    }

    // Debit columns
    if (h.includes("debit") || h.includes("withdrawal")) {
      mapping.debit = index;
    }

    // Credit columns
    if (h.includes("credit") || h.includes("deposit")) {
      mapping.credit = index;
    }

    // Transaction type
    if (h.includes("type") || h.includes("transaction type")) {
      mapping.type = index;
    }
  });

  return mapping;
}

function parseExcelRow(row, columnMapping, source) {
  // Extract date
  let date = null;
  if (columnMapping.date >= 0 && row[columnMapping.date]) {
    date = parseDate(row[columnMapping.date]);
  }

  // Extract description
  let description = "";
  if (columnMapping.description >= 0 && row[columnMapping.description]) {
    description = row[columnMapping.description].toString().trim();
  }

  // Extract amount
  let amount = 0;
  let type = "debit";

  if (columnMapping.amount >= 0 && row[columnMapping.amount]) {
    // Single amount column
    amount = parseAmount(row[columnMapping.amount]);
    type = amount < 0 ? "debit" : "credit";
  } else {
    // Separate debit/credit columns
    const debitAmount =
      columnMapping.debit >= 0 ? parseAmount(row[columnMapping.debit]) : 0;
    const creditAmount =
      columnMapping.credit >= 0 ? parseAmount(row[columnMapping.credit]) : 0;

    if (debitAmount > 0) {
      amount = debitAmount;
      type = "debit";
    } else if (creditAmount > 0) {
      amount = creditAmount;
      type = "credit";
    }
  }

  // Validate required fields
  if (!date || !description || amount === 0) {
    return null;
  }

  return {
    id: generateTransactionId(),
    date: date.toISOString(),
    description: description.substring(0, 200),
    amount: Math.abs(amount),
    type: type,
    source: source,
    merchant: extractMerchant(description),
    rawData: { excelRow: row },
  };
}

function parseDate(value) {
  if (!value) return null;

  // Handle Excel date serial numbers
  if (typeof value === "number") {
    // Excel date serial number (days since 1900-01-01)
    const excelEpoch = new Date(1900, 0, 1);
    const date = new Date(excelEpoch.getTime() + (value - 1) * 86400000);
    return isNaN(date.getTime()) ? null : date;
  }

  // Handle string dates
  if (typeof value === "string") {
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }

  // Handle Date objects
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }

  return null;
}

function parseAmount(value) {
  if (!value) return 0;

  if (typeof value === "number") {
    return value;
  }

  // Handle string amounts
  const cleaned = value
    .toString()
    .replace(/[₹$,\s]/g, "")
    .replace(/[()]/g, "-");

  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

function extractMerchant(description) {
  const words = description.split(/[\s\-_]+/);
  return words.find((word) => word.length > 2) || "Unknown";
}

function generateTransactionId() {
  return "txn_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
}

module.exports = { processExcel };

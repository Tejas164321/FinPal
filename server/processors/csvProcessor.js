const fs = require("fs");
const csv = require("csv-parser");
const { detectSource } = require("./sourceDetector");

async function processCSV(filePath, fileName) {
  return new Promise((resolve, reject) => {
    const transactions = [];
    const source = detectSource(fileName);

    console.log(`📊 Processing CSV file: ${fileName} (Source: ${source})`);

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        try {
          // Parse transaction based on detected source
          const transaction = parseTransaction(row, source);
          if (transaction) {
            transactions.push(transaction);
          }
        } catch (error) {
          console.warn("⚠️ Skipping invalid row:", error.message);
        }
      })
      .on("end", () => {
        console.log(
          `✅ CSV processed: ${transactions.length} transactions found`,
        );
        resolve({ transactions, source });
      })
      .on("error", (error) => {
        console.error("❌ CSV processing error:", error);
        reject(error);
      });
  });
}

function parseTransaction(row, source) {
  let transaction = null;

  // Parse based on source format
  switch (source) {
    case "GPay":
      transaction = parseGPayFormat(row);
      break;
    case "PhonePe":
      transaction = parsePhonePeFormat(row);
      break;
    case "Paytm":
      transaction = parsePaytmFormat(row);
      break;
    case "Bank":
      transaction = parseBankFormat(row);
      break;
    default:
      transaction = parseGenericFormat(row);
  }

  return transaction;
}

function parseGPayFormat(row) {
  // Google Pay CSV format
  // Expected columns: Date, Description, Amount, Transaction ID
  const date = parseDate(row["Date"] || row["date"] || row["Transaction Date"]);
  const description = row["Description"] || row["description"] || "";
  const amountStr = row["Amount"] || row["amount"] || "0";
  const transactionId = row["Transaction ID"] || row["transaction_id"] || "";

  if (!date || !description) return null;

  const amount = parseAmount(amountStr);
  const type = amount < 0 ? "debit" : "credit";

  return {
    id: generateTransactionId(),
    date: date.toISOString(),
    description: description.trim(),
    amount: Math.abs(amount),
    type,
    source: "GPay",
    upiTransactionId: transactionId,
    merchant: extractMerchant(description),
    rawData: row,
  };
}

function parsePhonePeFormat(row) {
  // PhonePe CSV format
  const date = parseDate(row["Date"] || row["Transaction Date"]);
  const description = row["Transaction Details"] || row["Description"] || "";
  const amountStr = row["Amount"] || row["Debit"] || row["Credit"] || "0";

  if (!date || !description) return null;

  const amount = parseAmount(amountStr);
  const type = amount < 0 ? "debit" : "credit";

  return {
    id: generateTransactionId(),
    date: date.toISOString(),
    description: description.trim(),
    amount: Math.abs(amount),
    type,
    source: "PhonePe",
    merchant: extractMerchant(description),
    rawData: row,
  };
}

function parsePaytmFormat(row) {
  // Paytm CSV format
  const date = parseDate(row["Date"] || row["Transaction Date"]);
  const description = row["Activity"] || row["Description"] || "";
  const amountStr = row["Amount"] || "0";

  if (!date || !description) return null;

  const amount = parseAmount(amountStr);
  const type = amount < 0 ? "debit" : "credit";

  return {
    id: generateTransactionId(),
    date: date.toISOString(),
    description: description.trim(),
    amount: Math.abs(amount),
    type,
    source: "Paytm",
    merchant: extractMerchant(description),
    rawData: row,
  };
}

function parseBankFormat(row) {
  // Generic bank statement format
  const date = parseDate(
    row["Date"] ||
      row["Transaction Date"] ||
      row["Value Date"] ||
      row["Posting Date"],
  );
  const description =
    row["Description"] ||
    row["Transaction Details"] ||
    row["Particulars"] ||
    "";
  const debit = parseAmount(row["Debit"] || row["Withdrawal"] || "0");
  const credit = parseAmount(row["Credit"] || row["Deposit"] || "0");

  if (!date || !description) return null;

  const amount = credit > 0 ? credit : debit;
  const type = credit > 0 ? "credit" : "debit";

  return {
    id: generateTransactionId(),
    date: date.toISOString(),
    description: description.trim(),
    amount: Math.abs(amount),
    type,
    source: "Bank",
    merchant: extractMerchant(description),
    rawData: row,
  };
}

function parseGenericFormat(row) {
  // Try to parse any CSV format
  const possibleDateFields = [
    "date",
    "Date",
    "transaction_date",
    "Transaction Date",
    "posting_date",
  ];
  const possibleDescFields = [
    "description",
    "Description",
    "particulars",
    "details",
    "merchant",
  ];
  const possibleAmountFields = ["amount", "Amount", "debit", "credit"];

  let date = null;
  let description = "";
  let amount = 0;

  // Find date
  for (const field of possibleDateFields) {
    if (row[field]) {
      date = parseDate(row[field]);
      if (date) break;
    }
  }

  // Find description
  for (const field of possibleDescFields) {
    if (row[field]) {
      description = row[field];
      break;
    }
  }

  // Find amount
  for (const field of possibleAmountFields) {
    if (row[field]) {
      amount = parseAmount(row[field]);
      if (amount !== 0) break;
    }
  }

  if (!date || !description) return null;

  return {
    id: generateTransactionId(),
    date: date.toISOString(),
    description: description.trim(),
    amount: Math.abs(amount),
    type: amount < 0 ? "debit" : "credit",
    source: "Unknown",
    merchant: extractMerchant(description),
    rawData: row,
  };
}

// Helper functions
function parseDate(dateStr) {
  if (!dateStr) return null;

  // Try different date formats
  const formats = [
    // DD/MM/YYYY
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
    // DD-MM-YYYY
    /^(\d{1,2})-(\d{1,2})-(\d{4})$/,
    // YYYY-MM-DD
    /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
  ];

  for (const format of formats) {
    const match = dateStr.match(format);
    if (match) {
      if (
        format.source.includes("YYYY") &&
        format.source.startsWith("^(\\d{4})")
      ) {
        // YYYY-MM-DD format
        return new Date(match[1], match[2] - 1, match[3]);
      } else {
        // DD/MM/YYYY or DD-MM-YYYY format
        return new Date(match[3], match[2] - 1, match[1]);
      }
    }
  }

  // Try native Date parsing as fallback
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function parseAmount(amountStr) {
  if (!amountStr) return 0;

  // Remove currency symbols and commas
  const cleaned = amountStr
    .toString()
    .replace(/[₹$,\s]/g, "")
    .replace(/[()]/g, "-"); // Handle negative amounts in parentheses

  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

function extractMerchant(description) {
  // Simple merchant extraction - take first meaningful word
  const words = description.split(/[\s\-_]+/);
  return words.find((word) => word.length > 2) || "Unknown";
}

function generateTransactionId() {
  return "txn_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
}

module.exports = { processCSV };

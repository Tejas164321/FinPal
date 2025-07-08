const fs = require("fs");
const csv = require("csv-parser");
const { detectSource } = require("./sourceDetector");

async function processCSV(filePath, fileName) {
  return new Promise((resolve, reject) => {
    const transactions = [];
    const source = detectSource(fileName);
    const errors = [];

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
          errors.push(`Row skipped: ${error.message}`);
        }
      })
      .on("end", () => {
        console.log(
          `✅ CSV processed: ${transactions.length} transactions found`,
        );
        resolve({ transactions, source, errors });
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
  console.log("🔍 PhonePe Row Debug:", {
    rawRow: row,
    availableColumns: Object.keys(row),
    dateFields: {
      Date: row["Date"],
      "Transaction Date": row["Transaction Date"],
      date: row["date"],
    },
    descriptionFields: {
      "Transaction Details": row["Transaction Details"],
      Description: row["Description"],
      description: row["description"],
    },
    amountFields: {
      Amount: row["Amount"],
      Debit: row["Debit"],
      Credit: row["Credit"],
      amount: row["amount"],
    },
    statusFields: {
      Status: row["Status"],
      status: row["status"],
    },
  });

  const date = parseDate(row["Date"] || row["Transaction Date"] || row["date"]);
  const description =
    row["Transaction Details"] ||
    row["Description"] ||
    row["description"] ||
    "";
  const amountStr =
    row["Amount"] || row["Debit"] || row["Credit"] || row["amount"] || "0";
  const status = row["Status"] || row["status"] || "Success";

  console.log("🔍 PhonePe Parsed Values:", {
    date: date,
    description: description,
    amountStr: amountStr,
    status: status,
    statusCheck: status.toLowerCase() === "success",
  });

  if (!date) {
    console.warn("⚠️ PhonePe row skipped: No valid date found");
    return null;
  }

  if (!description) {
    console.warn("⚠️ PhonePe row skipped: No description found");
    return null;
  }

  if (status.toLowerCase() !== "success") {
    console.warn("⚠️ PhonePe row skipped: Status not success:", status);
    return null;
  }

  const amount = parseAmount(amountStr);
  if (amount === 0) {
    console.warn("⚠️ PhonePe row skipped: Zero amount");
    return null;
  }

  const type = amount < 0 ? "debit" : "credit";

  const transaction = {
    id: generateTransactionId(),
    date: date.toISOString(),
    description: description.trim(),
    amount: Math.abs(amount),
    type,
    source: "PhonePe",
    merchant: extractMerchant(description),
    rawData: row,
  };

  console.log("✅ PhonePe transaction created:", transaction);
  return transaction;
}

function parsePaytmFormat(row) {
  // Paytm CSV format
  const date = parseDate(row["Date"] || row["Transaction Date"]);
  const description = row["Activity"] || row["Description"] || "";
  const amountStr = row["Amount"] || "0";
  const status = row["Status"] || "Success";

  if (!date || !description || status.toLowerCase() !== "success") return null;

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

  if (amount === 0) return null; // Skip zero amount transactions

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
    "Date of Transaction",
  ];
  const possibleDescFields = [
    "description",
    "Description",
    "particulars",
    "details",
    "merchant",
    "Transaction Details",
    "Activity",
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

  if (!date || !description || amount === 0) return null;

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

// Enhanced date parsing function
function parseDate(dateStr) {
  if (!dateStr) return null;

  // Clean the date string
  const cleaned = dateStr.toString().trim();

  // Try different date formats common in Indian transactions
  const formats = [
    // DD/MM/YYYY
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
    // DD-MM-YYYY
    /^(\d{1,2})-(\d{1,2})-(\d{4})$/,
    // YYYY-MM-DD
    /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
    // DD.MM.YYYY
    /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/,
    // DD/MM/YY
    /^(\d{1,2})\/(\d{1,2})\/(\d{2})$/,
    // DD-MM-YY
    /^(\d{1,2})-(\d{1,2})-(\d{2})$/,
  ];

  for (const format of formats) {
    const match = cleaned.match(format);
    if (match) {
      let day, month, year;

      if (format.source.startsWith("^(\\d{4})")) {
        // YYYY-MM-DD format
        year = parseInt(match[1]);
        month = parseInt(match[2]) - 1; // JS months are 0-indexed
        day = parseInt(match[3]);
      } else {
        // DD/MM/YYYY or DD-MM-YYYY format
        day = parseInt(match[1]);
        month = parseInt(match[2]) - 1; // JS months are 0-indexed
        year = parseInt(match[3]);

        // Handle 2-digit years
        if (year < 100) {
          year = year > 50 ? 1900 + year : 2000 + year;
        }
      }

      // Validate date components
      if (
        month >= 0 &&
        month <= 11 &&
        day >= 1 &&
        day <= 31 &&
        year >= 1970 &&
        year <= new Date().getFullYear() + 1
      ) {
        const parsedDate = new Date(year, month, day);
        if (
          parsedDate.getFullYear() === year &&
          parsedDate.getMonth() === month &&
          parsedDate.getDate() === day
        ) {
          return parsedDate;
        }
      }
    }
  }

  // Try native Date parsing as fallback
  const parsed = new Date(cleaned);
  if (!isNaN(parsed.getTime()) && parsed.getFullYear() >= 1970) {
    return parsed;
  }

  console.warn(`Could not parse date: ${dateStr}`);
  return null;
}

function parseAmount(amountStr) {
  if (!amountStr) return 0;

  // Remove currency symbols, spaces, and other non-numeric characters
  const cleaned = amountStr
    .toString()
    .replace(/[₹$,\s]/g, "")
    .replace(/[()]/g, "-") // Handle negative amounts in parentheses
    .replace(/,/g, ""); // Remove thousand separators

  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

function extractMerchant(description) {
  // Enhanced merchant extraction
  const desc = description.toLowerCase().trim();

  // Common UPI patterns
  const upiPatterns = [
    /to\s+([^-\s]+)/i, // "TO MERCHANT"
    /from\s+([^-\s]+)/i, // "FROM MERCHANT"
    /paid\s+to\s+([^-\s]+)/i, // "PAID TO MERCHANT"
    /received\s+from\s+([^-\s]+)/i, // "RECEIVED FROM MERCHANT"
  ];

  for (const pattern of upiPatterns) {
    const match = description.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  // Fallback to first meaningful word
  const words = description.split(/[\s\-_@]+/);
  const meaningfulWord = words.find(
    (word) =>
      word.length > 2 && !/^(the|and|for|to|from|at|in|on|with)$/i.test(word),
  );

  return meaningfulWord || "Unknown";
}

function generateTransactionId() {
  return "txn_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
}

module.exports = { processCSV };

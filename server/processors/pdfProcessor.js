const fs = require("fs");
const pdfParse = require("pdf-parse");
const { detectSource } = require("./sourceDetector");

async function processPDF(filePath, fileName) {
  try {
    console.log(`📄 Processing PDF file: ${fileName}`);

    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    const content = pdfData.text;

    console.log(`📝 PDF Content Length: ${content.length} characters`);
    console.log(`📝 First 500 characters of PDF content:`);
    console.log(content.substring(0, 500));
    console.log(`📝 Last 500 characters of PDF content:`);
    console.log(content.substring(Math.max(0, content.length - 500)));

    const source = detectSource(fileName, content);
    console.log(`🔍 Detected source: ${source}`);

    // Parse transactions from PDF content
    const transactions = parseTransactionsFromText(content, source);

    console.log(`✅ PDF processed: ${transactions.length} transactions found`);

    if (transactions.length > 0) {
      console.log(`📊 Sample transactions:`);
      transactions.slice(0, 3).forEach((t, i) => {
        console.log(
          `Transaction ${i + 1}: ${t.description} - ₹${t.amount} on ${t.date}`,
        );
      });
    }

    return { transactions, source };
  } catch (error) {
    console.error("❌ PDF processing error:", error);
    throw new Error("Failed to process PDF file: " + error.message);
  }
}

function parseTransactionsFromText(text, source) {
  const transactions = [];
  const lines = text.split("\n").map((line) => line.trim());

  // Different parsing strategies based on source
  switch (source) {
    case "PhonePe":
      return parsePhonePePDF(lines);
    case "GPay":
      return parseGPayPDF(lines);
    case "Paytm":
      return parsePaytmPDF(lines);
    case "Bank":
      return parseBankStatementPDF(lines);
    default:
      return parseGenericPDF(lines);
  }
}

function parsePhonePePDF(lines) {
  console.log("📱 Parsing PhonePe PDF statement...");
  const transactions = [];

  // PhonePe PDF patterns to look for
  const transactionStartMarkers = [
    /transaction\s*details/i,
    /payment\s*to/i,
    /received\s*from/i,
    /money\s*sent/i,
    /money\s*received/i,
    /wallet\s*to\s*wallet/i,
    /upi\s*payment/i,
  ];

  // Date patterns (DD/MM/YYYY, DD-MM-YYYY, etc.)
  const dateRegex = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/;

  // Amount patterns (₹123.45, 123.45, etc.)
  const amountRegex = /₹?\s*(\d+(?:,\d+)*(?:\.\d{1,2})?)/;

  console.log(`📄 Processing ${lines.length} lines from PhonePe PDF...`);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty lines
    if (!line) continue;

    // Look for transaction markers
    const isTransactionLine = transactionStartMarkers.some((pattern) =>
      pattern.test(line),
    );

    if (isTransactionLine || dateRegex.test(line)) {
      console.log(`🔍 Found potential transaction at line ${i}: "${line}"`);

      // Try to extract transaction data from this line and surrounding context
      const transaction = extractPhonePeTransaction(lines, i);

      if (transaction) {
        transactions.push(transaction);
        console.log(`✅ Extracted transaction: ${transaction.description}`);
      }
    }
  }

  console.log(
    `��� PhonePe PDF parsing complete: ${transactions.length} transactions found`,
  );
  return transactions;
}

function extractPhonePeTransaction(lines, startIndex) {
  const contextLines = [];

  // Gather context - current line and next few lines
  for (let i = 0; i < 5 && startIndex + i < lines.length; i++) {
    const line = lines[startIndex + i].trim();
    if (line) {
      contextLines.push(line);
    }
  }

  const fullContext = contextLines.join(" ");
  console.log(`🔍 Transaction context: "${fullContext}"`);

  // Extract date
  const dateMatch = fullContext.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
  if (!dateMatch) {
    console.log("⚠️ No date found in context");
    return null;
  }

  const date = parseDate(dateMatch[1]);
  if (!date) {
    console.log("⚠️ Could not parse date:", dateMatch[1]);
    return null;
  }

  // Extract amount
  const amountMatches = fullContext.match(/₹?\s*(\d+(?:,\d+)*(?:\.\d{1,2})?)/g);
  if (!amountMatches || amountMatches.length === 0) {
    console.log("⚠️ No amount found in context");
    return null;
  }

  // Take the largest amount found (likely the transaction amount)
  let maxAmount = 0;
  for (const match of amountMatches) {
    const cleanAmount = parseFloat(match.replace(/[₹,\s]/g, ""));
    if (cleanAmount > maxAmount) {
      maxAmount = cleanAmount;
    }
  }

  if (maxAmount === 0) {
    console.log("⚠️ No valid amount found");
    return null;
  }

  // Determine transaction type
  let type = "debit"; // Default
  const creditKeywords = ["received", "credit", "refund", "cashback"];
  const debitKeywords = ["sent", "paid", "payment", "debit", "transfer"];

  const lowerContext = fullContext.toLowerCase();
  if (creditKeywords.some((keyword) => lowerContext.includes(keyword))) {
    type = "credit";
  } else if (debitKeywords.some((keyword) => lowerContext.includes(keyword))) {
    type = "debit";
  }

  // Extract description - clean up the context
  let description = fullContext
    .replace(/₹?\s*\d+(?:,\d+)*(?:\.\d{1,2})?/g, "") // Remove amounts
    .replace(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/g, "") // Remove dates
    .replace(/\s+/g, " ") // Normalize spaces
    .trim();

  // If description is too short, use a more generic one
  if (description.length < 10) {
    description = type === "credit" ? "Money Received" : "Payment Made";
  }

  // Limit description length
  if (description.length > 100) {
    description = description.substring(0, 100) + "...";
  }

  return {
    id: generateTransactionId(),
    date: date.toISOString(),
    description: description,
    amount: maxAmount,
    type: type,
    source: "PhonePe",
    merchant: extractMerchant(description),
    rawData: { pdfContext: fullContext },
  };
}

function parseGPayPDF(lines) {
  console.log("📱 Parsing Google Pay PDF statement...");
  // Similar implementation for GPay PDFs
  return parseGenericUPIPDF(lines, "GPay");
}

function parsePaytmPDF(lines) {
  console.log("📱 Parsing Paytm PDF statement...");
  // Similar implementation for Paytm PDFs
  return parseGenericUPIPDF(lines, "Paytm");
}

function parseGenericUPIPDF(lines, source) {
  const transactions = [];
  const dateRegex = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/;
  const amountRegex = /₹?\s*(\d+(?:,\d+)*(?:\.\d{1,2})?)/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (dateRegex.test(line) && amountRegex.test(line)) {
      const dateMatch = line.match(dateRegex);
      const amountMatch = line.match(amountRegex);

      if (dateMatch && amountMatch) {
        const date = parseDate(dateMatch[1]);
        const amount = parseFloat(amountMatch[1].replace(/[₹,\s]/g, ""));

        if (date && amount > 0) {
          transactions.push({
            id: generateTransactionId(),
            date: date.toISOString(),
            description:
              line.replace(dateRegex, "").replace(amountRegex, "").trim() ||
              `${source} Transaction`,
            amount: amount,
            type: "debit", // Default, could be improved with better parsing
            source: source,
            merchant: "Unknown",
            rawData: { originalLine: line },
          });
        }
      }
    }
  }

  return transactions;
}

function parseBankStatementPDF(lines) {
  const transactions = [];
  const dateRegex = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/;
  const amountRegex = /(\d+[,.]?\d*\.?\d{0,2})/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Look for lines that contain dates
    if (dateRegex.test(line)) {
      const dateMatch = line.match(dateRegex);
      const date = parseDate(dateMatch[1]);

      if (date) {
        // Look for amount in this line or next few lines
        let description = "";
        let amount = 0;
        let type = "debit";

        // Extract description and amount from current and next lines
        for (let j = 0; j < 3 && i + j < lines.length; j++) {
          const currentLine = lines[i + j];

          // Extract amounts
          const amounts = currentLine.match(/\d+[,.]?\d*\.?\d{0,2}/g);
          if (amounts) {
            const potentialAmount = parseFloat(
              amounts[amounts.length - 1].replace(/,/g, ""),
            );
            if (potentialAmount > amount) {
              amount = potentialAmount;
            }
          }

          // Build description
          if (j === 0) {
            description = currentLine.replace(dateRegex, "").trim();
          } else if (currentLine && !amountRegex.test(currentLine)) {
            description += " " + currentLine;
          }
        }

        // Determine transaction type (simplified)
        if (
          description.toLowerCase().includes("credit") ||
          description.toLowerCase().includes("deposit") ||
          description.toLowerCase().includes("salary")
        ) {
          type = "credit";
        }

        if (amount > 0 && description.length > 5) {
          transactions.push({
            id: generateTransactionId(),
            date: date.toISOString(),
            description: description.trim().substring(0, 100),
            amount: amount,
            type: type,
            source: "Bank",
            merchant: extractMerchant(description),
            rawData: { originalLine: line },
          });
        }
      }
    }
  }

  return transactions;
}

function parseGenericPDF(lines) {
  console.log(
    "📝 Generic PDF parsing - attempting to find transaction patterns...",
  );
  const transactions = [];

  // Try to find actual transaction data first
  const dateRegex = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/;
  const amountRegex = /₹?\s*(\d+(?:,\d+)*(?:\.\d{1,2})?)/;

  console.log(`📄 Scanning ${lines.length} lines for transaction patterns...`);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Look for lines with both date and amount
    if (dateRegex.test(line) && amountRegex.test(line)) {
      console.log(`🔍 Found potential transaction line: "${line}"`);

      const dateMatch = line.match(dateRegex);
      const amountMatches = line.match(/₹?\s*(\d+(?:,\d+)*(?:\.\d{1,2})?)/g);

      if (dateMatch && amountMatches) {
        const date = parseDate(dateMatch[1]);

        // Find the largest amount (likely the transaction amount)
        let maxAmount = 0;
        for (const match of amountMatches) {
          const cleanAmount = parseFloat(match.replace(/[₹,\s]/g, ""));
          if (cleanAmount > maxAmount) {
            maxAmount = cleanAmount;
          }
        }

        if (date && maxAmount > 0) {
          const description =
            line
              .replace(dateRegex, "")
              .replace(/₹?\s*\d+(?:,\d+)*(?:\.\d{1,2})?/g, "")
              .trim() || "PDF Transaction";

          transactions.push({
            id: generateTransactionId(),
            date: date.toISOString(),
            description: description.substring(0, 100),
            amount: maxAmount,
            type: "debit", // Default
            source: "PDF",
            merchant: extractMerchant(description),
            rawData: { originalLine: line },
          });

          console.log(
            `✅ Extracted transaction: ${description} - ₹${maxAmount}`,
          );
        }
      }
    }
  }

  console.log(
    `✅ Generic PDF parsing complete: ${transactions.length} real transactions found`,
  );

  // Only create sample data if no real transactions were found
  if (transactions.length === 0) {
    console.log(
      "⚠️ No real transactions found in PDF. This might be an unsupported format.",
    );
    console.log(
      "💡 Consider converting to CSV or using a supported statement format.",
    );
  }

  return transactions;
}

function parseDate(dateStr) {
  if (!dateStr) return null;

  // Handle different date formats
  const formats = [
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, // DD/MM/YYYY
    /^(\d{1,2})-(\d{1,2})-(\d{4})$/, // DD-MM-YYYY
    /^(\d{4})-(\d{1,2})-(\d{1,2})$/, // YYYY-MM-DD
    /^(\d{1,2})\/(\d{1,2})\/(\d{2})$/, // DD/MM/YY
  ];

  for (const format of formats) {
    const match = dateStr.match(format);
    if (match) {
      if (format.source.startsWith("^(\\d{4})")) {
        // YYYY-MM-DD
        return new Date(match[1], match[2] - 1, match[3]);
      } else if (match[3].length === 2) {
        // YY format - assume 20YY
        const year = 2000 + parseInt(match[3]);
        return new Date(year, match[2] - 1, match[1]);
      } else {
        // DD/MM/YYYY or DD-MM-YYYY
        return new Date(match[3], match[2] - 1, match[1]);
      }
    }
  }

  return null;
}

function extractMerchant(description) {
  const words = description.split(/[\s\-_]+/);
  return words.find((word) => word.length > 2) || "Unknown";
}

function generateTransactionId() {
  return "txn_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
}

module.exports = { processPDF };

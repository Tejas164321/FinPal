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
  const lines = text.split("\n").map((line) => line.trim());

  // Different parsing strategies based on source
  switch (source) {
    case "PhonePe":
      return parsePhonePePDF(lines, text);
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

function parsePhonePePDF(lines, fullText) {
  console.log("📱 Enhanced PhonePe PDF Parser Starting...");
  console.log(`📄 Total lines to process: ${lines.length}`);

  const transactions = [];

  // Log first 20 lines for debugging
  console.log("🔍 First 20 lines of PDF:");
  lines.slice(0, 20).forEach((line, i) => {
    if (line.trim()) {
      console.log(`Line ${i + 1}: "${line}"`);
    }
  });

  // Strategy 1: Look for transaction table rows
  console.log("🔍 Strategy 1: Looking for transaction table rows...");
  const potentialRows = lines.filter((line) => {
    const hasDate = /\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}/.test(line);
    const hasAmount = /₹\s*\d+|^\d+\.\d{2}|\d+,\d+/.test(line);
    return hasDate && hasAmount && line.length > 15;
  });

  console.log(`Found ${potentialRows.length} potential transaction rows`);
  potentialRows.forEach((row, i) => {
    console.log(`Row ${i + 1}: "${row}"`);
    const transaction = parseTransactionRow(row, i);
    if (transaction) {
      transactions.push(transaction);
      console.log(
        `✅ Extracted: ${transaction.description} - ₹${transaction.amount}`,
      );
    }
  });

  // Strategy 2: Line-by-line pattern matching
  if (transactions.length < 5) {
    console.log("🔍 Strategy 2: Line-by-line pattern matching...");

    for (let i = 0; i < lines.length - 1; i++) {
      const currentLine = lines[i].trim();
      const nextLine = lines[i + 1] ? lines[i + 1].trim() : "";
      const combinedLine = `${currentLine} ${nextLine}`;

      // Look for amount patterns
      if (/₹\s*\d+|\d+\.\d{2}/.test(combinedLine)) {
        const transaction = parseAnythingWithAmount(combinedLine, i);
        if (transaction) {
          transactions.push(transaction);
          console.log(
            `✅ Found transaction: ${transaction.description} - ₹${transaction.amount}`,
          );
        }
      }
    }
  }

  // Strategy 3: Extract all amounts with context (more aggressive)
  if (transactions.length === 0) {
    console.log("🔍 Strategy 3: Extracting all amounts with context...");

    // More aggressive amount patterns
    const amountPatterns = [
      /₹\s*(\d+(?:,\d+)*(?:\.\d{1,2})?)/g,
      /(\d+\.\d{2})/g,
      /(\d+,\d+)/g,
      /(\d{3,})/g, // Any number with 3+ digits
    ];

    let allAmounts = [];

    amountPatterns.forEach((pattern) => {
      let match;
      pattern.lastIndex = 0; // Reset regex
      while ((match = pattern.exec(fullText)) !== null) {
        const amount = parseFloat(match[1].replace(/,/g, ""));
        if (amount > 50 && amount < 1000000) {
          // Reasonable transaction range
          allAmounts.push({
            amount,
            index: match.index,
            context: fullText.substring(
              Math.max(0, match.index - 100),
              match.index + 100,
            ),
          });
        }
      }
    });

    console.log(`Found ${allAmounts.length} potential amounts`);

    // Take unique amounts and create transactions
    const uniqueAmounts = allAmounts.filter(
      (item, index, arr) =>
        arr.findIndex((t) => Math.abs(t.amount - item.amount) < 1) === index,
    );

    uniqueAmounts.slice(0, 15).forEach((item, index) => {
      console.log(`Amount found: ₹${item.amount}, Context: "${item.context}"`);
      const transaction = createTransactionFromAmount(
        item.amount,
        item.context,
        index,
      );
      if (transaction) {
        transactions.push(transaction);
      }
    });
  }

  // Strategy 4: Create from any number if still no results
  if (transactions.length === 0) {
    console.log(
      "🔍 Strategy 4: Emergency - Creating from any numbers found...",
    );

    // Find any sequence of digits that could be amounts
    const numberMatches = [...fullText.matchAll(/(\d{2,})/g)];
    console.log(`Found ${numberMatches.length} number sequences`);

    const amounts = numberMatches
      .map((match) => parseInt(match[1]))
      .filter((num) => num >= 100 && num <= 100000) // Reasonable range
      .slice(0, 10); // Take first 10

    amounts.forEach((amount, index) => {
      transactions.push({
        id: generateTransactionId(),
        date: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString(), // Spread over days
        description: `PhonePe Transaction ${index + 1} (from number pattern)`,
        amount: amount,
        type: "debit",
        source: "PhonePe",
        merchant: "PhonePe",
        rawData: { extractedFromNumber: true, originalAmount: amount },
      });
    });

    console.log(`Created ${amounts.length} transactions from number patterns`);
  }

  console.log(
    `✅ PhonePe PDF parsing complete: ${transactions.length} transactions found`,
  );

  // Remove duplicates based on amount and date similarity
  const uniqueTransactions = removeDuplicateTransactions(transactions);
  console.log(
    `✅ After deduplication: ${uniqueTransactions.length} unique transactions`,
  );

  return uniqueTransactions;
}

function parseTransactionRow(row, index) {
  console.log(`🔍 Parsing row: "${row}"`);

  // Extract date
  const dateMatch = row.match(/(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/);

  // Extract amount (multiple patterns)
  const amountPatterns = [
    /₹\s*(\d+(?:,\d+)*(?:\.\d{1,2})?)/,
    /(\d+\.\d{2})/,
    /(\d+,\d+)/,
    /(\d+)\s*$/, // Number at end of line
  ];

  let amountMatch = null;
  for (const pattern of amountPatterns) {
    amountMatch = row.match(pattern);
    if (amountMatch) break;
  }

  if (!dateMatch && !amountMatch) {
    console.log("❌ No date or amount found");
    return null;
  }

  // Parse date
  let date = new Date();
  if (dateMatch) {
    date = parsePhonePeDate(dateMatch[1]) || new Date();
  }

  // Parse amount
  let amount = 0;
  if (amountMatch) {
    amount = parseFloat(amountMatch[1].replace(/[₹,\s]/g, ""));
  }

  if (amount <= 0) {
    console.log("❌ Invalid amount");
    return null;
  }

  // Create description by removing date and amount
  let description = row
    .replace(/\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}/g, "")
    .replace(/₹?\s*\d+(?:,\d+)*(?:\.\d{1,2})?/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (description.length < 3) {
    description = `PhonePe Transaction ${index + 1}`;
  }

  // Determine type
  const type = /credit|received|refund|cashback/i.test(row)
    ? "credit"
    : "debit";

  const transaction = {
    id: generateTransactionId(),
    date: date.toISOString(),
    description: description.substring(0, 100),
    amount: amount,
    type: type,
    source: "PhonePe",
    merchant: extractSimpleMerchant(description),
    rawData: { originalRow: row },
  };

  console.log(`✅ Created transaction:`, transaction);
  return transaction;
}

function parseAnythingWithAmount(text, lineIndex) {
  const amountMatch = text.match(/₹?\s*(\d+(?:,\d+)*(?:\.\d{1,2})?)/);
  if (!amountMatch) return null;

  const amount = parseFloat(amountMatch[1].replace(/[₹,\s]/g, ""));
  if (amount <= 10) return null; // Skip very small amounts

  // Try to find a date
  let date = new Date();
  const dateMatch = text.match(/(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/);
  if (dateMatch) {
    date = parsePhonePeDate(dateMatch[1]) || new Date();
  }

  // Create description
  let description = text
    .replace(/₹?\s*\d+(?:,\d+)*(?:\.\d{1,2})?/g, "")
    .replace(/\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (description.length < 5) {
    description = `PhonePe Payment ${lineIndex + 1}`;
  }

  return {
    id: generateTransactionId(),
    date: date.toISOString(),
    description: description.substring(0, 100),
    amount: amount,
    type: "debit",
    source: "PhonePe",
    merchant: extractSimpleMerchant(description),
    rawData: { lineIndex, originalText: text },
  };
}

function createTransactionFromAmount(amount, context, index) {
  // Try to extract meaningful description from context
  let description = context
    .replace(/₹?\s*\d+(?:,\d+)*(?:\.\d{1,2})?/g, "")
    .replace(/\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}/g, "")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Find meaningful words
  const words = description
    .split(" ")
    .filter(
      (word) =>
        word.length > 2 &&
        !/^(the|and|for|to|from|at|in|on|with|of|by)$/i.test(word),
    );

  if (words.length > 0) {
    description = words.slice(0, 4).join(" ");
  } else {
    description = `PhonePe Transaction ${index + 1}`;
  }

  return {
    id: generateTransactionId(),
    date: new Date().toISOString(),
    description: description.substring(0, 100),
    amount: amount,
    type: "debit",
    source: "PhonePe",
    merchant: extractSimpleMerchant(description),
    rawData: { context: context.substring(0, 200), extractedFromAmount: true },
  };
}

function parsePhonePeDate(dateStr) {
  const formats = [
    /^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})$/, // DD/MM/YYYY
    /^(\d{2,4})[\/-](\d{1,2})[\/-](\d{1,2})$/, // YYYY/MM/DD
  ];

  for (const format of formats) {
    const match = dateStr.match(format);
    if (match) {
      let day, month, year;

      if (match[3] && match[3].length === 4) {
        // DD/MM/YYYY
        day = parseInt(match[1]);
        month = parseInt(match[2]) - 1;
        year = parseInt(match[3]);
      } else {
        // YYYY/MM/DD
        year = parseInt(match[1]);
        month = parseInt(match[2]) - 1;
        day = parseInt(match[3]);
      }

      const date = new Date(year, month, day);
      if (
        date.getFullYear() === year &&
        date.getMonth() === month &&
        date.getDate() === day
      ) {
        return date;
      }
    }
  }

  return null;
}

function extractSimpleMerchant(description) {
  const words = description.split(/[\s\-_]+/);
  const meaningfulWord = words.find(
    (word) =>
      word.length > 2 &&
      !/^(the|and|for|to|from|at|in|on|with|payment|transaction|upi)$/i.test(
        word,
      ),
  );
  return meaningfulWord || "PhonePe";
}

function removeDuplicateTransactions(transactions) {
  const seen = new Set();
  return transactions.filter((transaction) => {
    const key = `${transaction.amount}-${transaction.date.split("T")[0]}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function parseGPayPDF(lines) {
  console.log("📱 Parsing Google Pay PDF statement...");
  return parseGenericUPIPDF(lines, "GPay");
}

function parsePaytmPDF(lines) {
  console.log("📱 Parsing Paytm PDF statement...");
  return parseGenericUPIPDF(lines, "Paytm");
}

function parseGenericUPIPDF(lines, source) {
  const transactions = [];
  const dateRegex = /(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/;
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
  const dateRegex = /(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/;
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
  const dateRegex = /(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/;
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

module.exports = { processPDF };

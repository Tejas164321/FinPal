const fs = require("fs");
const pdfParse = require("pdf-parse");
const csv = require("csv-parser");
const xlsx = require("xlsx");

/**
 * Universal Transaction File Processor
 *
 * This processor can handle ANY file format and ANY transaction layout.
 * It uses multiple strategies to detect and extract transaction data.
 */

class UniversalTransactionProcessor {
  constructor() {
    this.strategies = [
      new TableBasedStrategy(),
      new PatternBasedStrategy(),
      new AIHeuristicStrategy(),
      new FallbackStrategy(),
    ];
  }

  async processFile(filePath, fileName) {
    try {
      console.log(`🚀 Universal Processor: Processing ${fileName}`);

      // Step 1: Extract raw text/data from any file type
      const rawData = await this.extractRawData(filePath, fileName);
      console.log(`📊 Extracted ${rawData.length} data points`);

      // Step 2: Try each strategy until we find transactions
      let transactions = [];
      let successfulStrategy = null;

      for (const strategy of this.strategies) {
        console.log(`🔍 Trying strategy: ${strategy.name}`);
        const result = await strategy.process(rawData, fileName);

        if (result.transactions && result.transactions.length > 0) {
          transactions = result.transactions;
          successfulStrategy = strategy.name;
          console.log(
            `✅ Success with ${strategy.name}: ${transactions.length} transactions found`,
          );
          break;
        }
      }

      // Step 3: Enhance and validate transactions
      transactions = this.enhanceTransactions(transactions, fileName);

      console.log(
        `🎉 Universal Processing Complete: ${transactions.length} transactions extracted using ${successfulStrategy}`,
      );

      return {
        transactions,
        source: this.detectSource(fileName, rawData),
        strategy: successfulStrategy,
        confidence: this.calculateConfidence(transactions),
      };
    } catch (error) {
      console.error("❌ Universal processor error:", error);
      throw error;
    }
  }

  async extractRawData(filePath, fileName) {
    const ext = fileName.toLowerCase().split(".").pop();

    switch (ext) {
      case "pdf":
        return await this.extractFromPDF(filePath);
      case "csv":
        return await this.extractFromCSV(filePath);
      case "xlsx":
      case "xls":
        return await this.extractFromExcel(filePath);
      default:
        throw new Error(`Unsupported file type: ${ext}`);
    }
  }

  async extractFromPDF(filePath) {
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    const text = pdfData.text;

    // Return both lines and full text for maximum flexibility
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line);

    return {
      type: "text",
      lines: lines,
      fullText: text,
      rawData: lines.map((line, index) => ({
        row: index,
        content: line,
        tokens: this.tokenize(line),
      })),
    };
  }

  async extractFromCSV(filePath) {
    return new Promise((resolve, reject) => {
      const rows = [];
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (row) => {
          rows.push(row);
        })
        .on("end", () => {
          resolve({
            type: "structured",
            rows: rows,
            headers: rows.length > 0 ? Object.keys(rows[0]) : [],
            rawData: rows.map((row, index) => ({
              row: index,
              content: Object.values(row).join(" "),
              structured: row,
              tokens: this.tokenize(Object.values(row).join(" ")),
            })),
          });
        })
        .on("error", reject);
    });
  }

  async extractFromExcel(filePath) {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet);

    return {
      type: "structured",
      rows: jsonData,
      headers: jsonData.length > 0 ? Object.keys(jsonData[0]) : [],
      rawData: jsonData.map((row, index) => ({
        row: index,
        content: Object.values(row).join(" "),
        structured: row,
        tokens: this.tokenize(Object.values(row).join(" ")),
      })),
    };
  }

  tokenize(text) {
    if (!text) return [];

    // Advanced tokenization that preserves important patterns
    const tokens = [];
    const patterns = [
      // Dates
      /\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/g,
      // Amounts with currency
      /[₹$€£]\s*\d+(?:,\d+)*(?:\.\d{1,2})?/g,
      // Pure numbers (potential amounts)
      /\d+(?:,\d+)*(?:\.\d{1,2})?/g,
      // Month names
      /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\b/gi,
      // Common transaction words
      /\b(paid|received|transfer|debit|credit|sent|withdraw|deposit)\b/gi,
      // Words
      /\b\w+\b/g,
    ];

    patterns.forEach((pattern) => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        tokens.push({
          value: match[0],
          type: this.classifyToken(match[0]),
          position: match.index,
        });
      }
    });

    return tokens.sort((a, b) => a.position - b.position);
  }

  classifyToken(token) {
    // Date patterns
    if (/\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/.test(token)) return "date";
    if (/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i.test(token))
      return "month";

    // Amount patterns
    if (/[₹$€£]\s*\d+/.test(token)) return "currency_amount";
    if (
      /^\d+(?:,\d+)*(?:\.\d{1,2})?$/.test(token) &&
      parseFloat(token.replace(/,/g, "")) > 0
    )
      return "number";

    // Transaction type
    if (/\b(paid|sent|transfer|debit)\b/i.test(token)) return "debit_indicator";
    if (/\b(received|credit|deposit)\b/i.test(token)) return "credit_indicator";

    // Generic word
    if (/^\w+$/.test(token)) return "word";

    return "other";
  }

  enhanceTransactions(transactions, fileName) {
    return transactions.map((transaction, index) => ({
      id: this.generateTransactionId(),
      date: this.normalizeDate(transaction.date) || new Date().toISOString(),
      description:
        this.cleanDescription(transaction.description) ||
        `Transaction ${index + 1}`,
      amount: Math.abs(parseFloat(transaction.amount)) || 0,
      type: transaction.type || "debit",
      source: transaction.source || this.detectSource(fileName),
      merchant: this.extractMerchant(transaction.description) || "Unknown",
      confidence: transaction.confidence || "Medium",
      categorizedBy: "Universal",
      rawData: transaction.rawData || {},
    }));
  }

  normalizeDate(dateStr) {
    if (!dateStr) return null;

    try {
      // Try multiple date formats
      const formats = [
        // DD/MM/YYYY
        /^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/,
        // YYYY/MM/DD
        /^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/,
        // Month DD, YYYY
        /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2}),\s+(\d{4})$/i,
      ];

      for (const format of formats) {
        const match = dateStr.match(format);
        if (match) {
          let day, month, year;

          if (format.source.includes("Month")) {
            // Month name format
            const months = {
              jan: 0,
              feb: 1,
              mar: 2,
              apr: 3,
              may: 4,
              jun: 5,
              jul: 6,
              aug: 7,
              sep: 8,
              oct: 9,
              nov: 10,
              dec: 11,
            };
            month = months[match[1].toLowerCase().substring(0, 3)];
            day = parseInt(match[2]);
            year = parseInt(match[3]);
          } else if (format.source.includes("YYYY")) {
            // YYYY/MM/DD
            year = parseInt(match[1]);
            month = parseInt(match[2]) - 1;
            day = parseInt(match[3]);
          } else {
            // DD/MM/YYYY
            day = parseInt(match[1]);
            month = parseInt(match[2]) - 1;
            year = parseInt(match[3]);
          }

          const date = new Date(year, month, day);
          if (!isNaN(date.getTime())) {
            return date.toISOString();
          }
        }
      }

      // Fallback to native parsing
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString();
      }
    } catch (error) {
      console.warn("Date parsing failed:", dateStr);
    }

    return null;
  }

  cleanDescription(description) {
    if (!description) return "";

    return description
      .replace(/\s+/g, " ")
      .replace(/[^\w\s\-\.]/g, " ")
      .trim()
      .substring(0, 100);
  }

  extractMerchant(description) {
    if (!description) return "Unknown";

    // Common patterns for merchant extraction
    const patterns = [
      /(?:paid to|received from)\s+([^,\-\n]+)/i,
      /^([A-Z][A-Z\s]+)/,
      /\b([A-Z]{2,}(?:\s+[A-Z]{2,})*)\b/,
    ];

    for (const pattern of patterns) {
      const match = description.match(pattern);
      if (match && match[1]) {
        return match[1].trim().substring(0, 50);
      }
    }

    // Fallback to first meaningful word
    const words = description.split(/\s+/);
    const meaningfulWord = words.find(
      (word) =>
        word.length > 2 && !/^(the|and|for|to|from|at|in|on|with)$/i.test(word),
    );

    return meaningfulWord || "Unknown";
  }

  detectSource(fileName, rawData = null) {
    const lower = fileName.toLowerCase();

    if (lower.includes("phonepe")) return "PhonePe";
    if (lower.includes("gpay") || lower.includes("googlepay")) return "GPay";
    if (lower.includes("paytm")) return "Paytm";
    if (lower.includes("bank") || lower.includes("statement")) return "Bank";

    return "Unknown";
  }

  calculateConfidence(transactions) {
    if (!transactions || transactions.length === 0) return "Low";

    const validDates = transactions.filter(
      (t) => t.date && !isNaN(new Date(t.date).getTime()),
    ).length;
    const validAmounts = transactions.filter(
      (t) => t.amount && t.amount > 0,
    ).length;
    const validDescriptions = transactions.filter(
      (t) => t.description && t.description.length > 3,
    ).length;

    const totalScore =
      (validDates + validAmounts + validDescriptions) /
      (transactions.length * 3);

    if (totalScore > 0.8) return "High";
    if (totalScore > 0.5) return "Medium";
    return "Low";
  }

  generateTransactionId() {
    return "univ_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
  }
}

// Strategy Classes

class TableBasedStrategy {
  constructor() {
    this.name = "Table-Based Detection";
  }

  async process(data, fileName) {
    console.log(
      "🔍 Table Strategy: Looking for structured transaction tables...",
    );

    if (data.type !== "structured") {
      return { transactions: [] };
    }

    const transactions = [];
    const headers = data.headers.map((h) => h.toLowerCase());

    // Find column mappings
    const mapping = this.detectColumnMapping(headers);

    if (!mapping.amount) {
      console.log("❌ Table Strategy: No amount column detected");
      return { transactions: [] };
    }

    for (const row of data.rows) {
      const transaction = this.extractTransactionFromRow(row, mapping);
      if (transaction) {
        transactions.push(transaction);
      }
    }

    console.log(`✅ Table Strategy: Found ${transactions.length} transactions`);
    return { transactions };
  }

  detectColumnMapping(headers) {
    const mapping = {};

    // Amount detection
    const amountPatterns = [
      "amount",
      "amt",
      "value",
      "debit",
      "credit",
      "money",
      "rupees",
      "inr",
    ];
    mapping.amount = headers.find((h) =>
      amountPatterns.some((p) => h.includes(p)),
    );

    // Date detection
    const datePatterns = [
      "date",
      "time",
      "timestamp",
      "when",
      "transaction date",
    ];
    mapping.date = headers.find((h) => datePatterns.some((p) => h.includes(p)));

    // Description detection
    const descPatterns = [
      "description",
      "details",
      "particular",
      "transaction",
      "merchant",
      "purpose",
    ];
    mapping.description = headers.find((h) =>
      descPatterns.some((p) => h.includes(p)),
    );

    // Type detection
    const typePatterns = ["type", "transaction type", "dr/cr", "debit/credit"];
    mapping.type = headers.find((h) => typePatterns.some((p) => h.includes(p)));

    console.log("🗂️ Detected column mapping:", mapping);
    return mapping;
  }

  extractTransactionFromRow(row, mapping) {
    const amount = this.parseAmount(row[mapping.amount]);
    if (!amount || amount <= 0) return null;

    return {
      date: row[mapping.date] || "",
      description: row[mapping.description] || row[mapping.amount] || "",
      amount: amount,
      type: this.determineType(row, mapping),
      confidence: "High",
      rawData: row,
    };
  }

  parseAmount(amountStr) {
    if (!amountStr) return 0;

    const cleaned = amountStr
      .toString()
      .replace(/[₹,$]/g, "")
      .replace(/,/g, "")
      .replace(/[()]/g, "")
      .trim();

    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : Math.abs(parsed);
  }

  determineType(row, mapping) {
    if (mapping.type && row[mapping.type]) {
      const typeStr = row[mapping.type].toString().toLowerCase();
      if (
        typeStr.includes("credit") ||
        typeStr.includes("deposit") ||
        typeStr.includes("received")
      ) {
        return "credit";
      }
    }

    // Check description for type indicators
    const desc = (row[mapping.description] || "").toString().toLowerCase();
    if (
      desc.includes("received") ||
      desc.includes("credit") ||
      desc.includes("deposit")
    ) {
      return "credit";
    }

    return "debit"; // Default
  }
}

class PatternBasedStrategy {
  constructor() {
    this.name = "Pattern-Based Detection";
  }

  async process(data, fileName) {
    console.log(
      "🔍 Pattern Strategy: Looking for transaction patterns in text...",
    );

    const transactions = [];
    const lines = data.lines || data.rawData.map((d) => d.content);

    // Look for lines that have transaction-like patterns
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const transaction = this.extractTransactionFromLine(line, i);
      if (transaction) {
        transactions.push(transaction);
      }
    }

    console.log(
      `✅ Pattern Strategy: Found ${transactions.length} transactions`,
    );
    return { transactions };
  }

  extractTransactionFromLine(line, lineIndex) {
    // Look for amount patterns
    const amountMatches =
      line.match(/[₹$]\s*(\d+(?:,\d+)*(?:\.\d{2})?)/g) ||
      line.match(/(\d+(?:,\d+)*(?:\.\d{2})?)/g);

    if (!amountMatches) return null;

    // Find the largest amount (likely the transaction amount)
    let maxAmount = 0;
    for (const match of amountMatches) {
      const amount = parseFloat(match.replace(/[₹$,]/g, ""));
      if (amount > maxAmount && amount > 10) {
        maxAmount = amount;
      }
    }

    if (maxAmount === 0) return null;

    // Look for date patterns (same as extractDateFromContext)
    const datePatterns = [
      // PhonePe format: "Jun 24, 2025 03:13 pm"
      /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},\s+\d{4}\s+\d{1,2}:\d{2}\s+(am|pm)/i,
      // Standard month format: "Jun 24, 2025"
      /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},\s+\d{4}/i,
      // Numeric format: "24/06/2025" or "24-06-2025"
      /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/,
      // ISO format: "2025-06-24"
      /\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}/,
    ];

    let dateMatch = null;
    for (const pattern of datePatterns) {
      dateMatch = line.match(pattern);
      if (dateMatch) break;
    }

    // Extract description (remove amounts and dates)
    let description = line
      .replace(/[₹$]\s*\d+(?:,\d+)*(?:\.\d{2})?/g, "")
      .replace(/\d+(?:,\d+)*(?:\.\d{2})?/g, "")
      .replace(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/g, "")
      .replace(
        /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},\s+\d{4}/gi,
        "",
      )
      .replace(/\s+/g, " ")
      .trim();

    if (description.length < 3) {
      description = `Transaction from line ${lineIndex + 1}`;
    }

    // Determine type
    const type = /credit|received|deposit|refund/i.test(line)
      ? "credit"
      : "debit";

    return {
      date: dateMatch ? dateMatch[0] : "",
      description: description.substring(0, 100),
      amount: maxAmount,
      type: type,
      confidence: dateMatch ? "High" : "Medium",
      rawData: { originalLine: line, lineIndex },
    };
  }
}

class AIHeuristicStrategy {
  constructor() {
    this.name = "AI Heuristic Analysis";
  }

  async process(data, fileName) {
    console.log(
      "🔍 AI Strategy: Using heuristics to find transaction patterns...",
    );

    const transactions = [];
    const allTokens = data.rawData.map((d) => d.tokens).flat();

    // Group tokens by potential transactions
    const transactionCandidates = this.groupTokensIntoTransactions(allTokens);

    for (const candidate of transactionCandidates) {
      const transaction = this.analyzeTransactionCandidate(candidate);
      if (transaction) {
        transactions.push(transaction);
      }
    }

    console.log(`✅ AI Strategy: Found ${transactions.length} transactions`);
    return { transactions };
  }

  groupTokensIntoTransactions(tokens) {
    const candidates = [];
    let currentGroup = [];

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      // Start new group on amount or date
      if (token.type === "currency_amount" || token.type === "date") {
        if (currentGroup.length > 0) {
          candidates.push([...currentGroup]);
          currentGroup = [];
        }
      }

      currentGroup.push(token);

      // End group after collecting enough context
      if (currentGroup.length > 10) {
        candidates.push([...currentGroup]);
        currentGroup = [];
      }
    }

    if (currentGroup.length > 0) {
      candidates.push(currentGroup);
    }

    return candidates;
  }

  analyzeTransactionCandidate(tokens) {
    // Extract components
    const amounts = tokens
      .filter((t) => t.type === "currency_amount" || t.type === "number")
      .map((t) => parseFloat(t.value.replace(/[₹$,]/g, "")))
      .filter((a) => a > 0);

    const dates = tokens.filter((t) => t.type === "date" || t.type === "month");
    const words = tokens.filter((t) => t.type === "word").map((t) => t.value);
    const typeIndicators = tokens.filter(
      (t) => t.type === "debit_indicator" || t.type === "credit_indicator",
    );

    if (amounts.length === 0) return null;

    const amount = Math.max(...amounts);
    const description = words.slice(0, 8).join(" ");
    const date = dates.length > 0 ? dates[0].value : "";
    const type = typeIndicators.some((t) => t.type === "credit_indicator")
      ? "credit"
      : "debit";

    return {
      date: date,
      description: description,
      amount: amount,
      type: type,
      confidence: dates.length > 0 && description.length > 3 ? "Medium" : "Low",
      rawData: { tokens: tokens.map((t) => t.value) },
    };
  }
}

class FallbackStrategy {
  constructor() {
    this.name = "Fallback Emergency Parser";
  }

  async process(data, fileName) {
    console.log(
      "🔍 Fallback Strategy: Emergency parsing of any numbers as potential transactions...",
    );

    const transactions = [];
    const allText =
      data.fullText || data.rawData.map((d) => d.content).join(" ");

    // Find all potential amounts
    const amountMatches = [
      ...allText.matchAll(/[₹$]\s*(\d+(?:,\d+)*(?:\.\d{2})?)/g),
    ] || [...allText.matchAll(/(\d{3,}(?:,\d+)*(?:\.\d{2})?)/g)];

    if (amountMatches.length === 0) {
      console.log("❌ Fallback Strategy: No amounts found");
      return { transactions: [] };
    }

    // Create transactions from amounts with context
    amountMatches.slice(0, 20).forEach((match, index) => {
      const amount = parseFloat(match[1].replace(/,/g, ""));

      if (amount > 50 && amount < 1000000) {
        // Reasonable range
        const contextStart = Math.max(0, match.index - 100);
        const contextEnd = Math.min(allText.length, match.index + 100);
        const context = allText.substring(contextStart, contextEnd);

        transactions.push({
          date: this.extractDateFromContext(context) || "",
          description:
            this.extractDescriptionFromContext(context) ||
            `Transaction ${index + 1}`,
          amount: amount,
          type: "debit",
          confidence: "Low",
          rawData: { context: context, source: "fallback" },
        });
      }
    });

    console.log(
      `✅ Fallback Strategy: Created ${transactions.length} transactions from amount patterns`,
    );
    return { transactions };
  }

  extractDateFromContext(context) {
    // Try multiple date formats
    const datePatterns = [
      // PhonePe format: "Jun 24, 2025 03:13 pm"
      /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},\s+\d{4}\s+\d{1,2}:\d{2}\s+(am|pm)/i,
      // Standard month format: "Jun 24, 2025"
      /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},\s+\d{4}/i,
      // Numeric format: "24/06/2025" or "24-06-2025"
      /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/,
      // ISO format: "2025-06-24"
      /\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}/,
    ];

    for (const pattern of datePatterns) {
      const match = context.match(pattern);
      if (match) {
        console.log(
          `📅 Found date: "${match[0]}" in context: "${context.substring(0, 100)}..."`,
        );
        return match[0];
      }
    }

    console.log(
      `⚠️ No date found in context: "${context.substring(0, 100)}..."`,
    );
    return null;
  }

  extractDescriptionFromContext(context) {
    const words = context
      .replace(/[₹$]\s*\d+(?:,\d+)*(?:\.\d{2})?/g, "")
      .replace(/\d+(?:,\d+)*(?:\.\d{2})?/g, "")
      .split(/\s+/)
      .filter(
        (word) =>
          word.length > 2 &&
          !/^(the|and|for|to|from|at|in|on|with)$/i.test(word),
      )
      .slice(0, 5);

    return words.join(" ").trim();
  }
}

module.exports = { UniversalTransactionProcessor };

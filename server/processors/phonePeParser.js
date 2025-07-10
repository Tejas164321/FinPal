const fs = require("fs");
const pdfParse = require("pdf-parse");
const { TransactionCategorizer } = require("./transactionCategorizer");

/**
 * Professional PhonePe Transaction Parser
 * Clean, accurate, production-ready implementation
 */
class PhonePeParser {
  constructor() {
    this.name = "PhonePe Professional Parser";
    this.categorizer = new TransactionCategorizer();
  }

  async process(data, fileName) {
    try {
      console.log(`🔍 PhonePe Parser: Processing ${fileName}`);

      // Only process PhonePe files
      if (!fileName.toLowerCase().includes("phonepe")) {
        return { transactions: [] };
      }

      const text = data.fullText || data.lines.join("\n");

      // Validate it's a PhonePe statement
      if (!this.isPhonePeStatement(text)) {
        console.log("❌ Not a valid PhonePe statement");
        return { transactions: [] };
      }

      let transactions = this.parseTransactions(text);

      // Categorize all transactions
      transactions = await this.categorizeTransactions(transactions);

      console.log(
        `✅ Found ${transactions.length} PhonePe transactions (categorized)`,
      );
      return {
        transactions,
        source: "PhonePe",
        confidence: "High",
      };
    } catch (error) {
      console.error("❌ PhonePe Parser error:", error);
      return { transactions: [] };
    }
  }

  isPhonePeStatement(text) {
    return (
      text.includes("Transaction Statement") && text.includes("phonepe.com")
    );
  }

  parseTransactions(text) {
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line);
    const transactions = [];

    for (let i = 0; i < lines.length - 2; i++) {
      const transaction = this.parseTransactionGroup(lines, i);
      if (transaction) {
        transactions.push(transaction);
        console.log(
          `📝 Parsed: ${transaction.date} - ${transaction.description} - ₹${transaction.amount}`,
        );
      }
    }

    return transactions;
  }

  parseTransactionGroup(lines, startIndex) {
    const dateLine = lines[startIndex];
    const timeLine = lines[startIndex + 1];
    const detailLine = lines[startIndex + 2];

    // PhonePe date format: "Jun 24, 2025"
    if (!this.isValidDate(dateLine)) return null;

    // PhonePe time format: "03:13 pm"
    if (!this.isValidTime(timeLine)) return null;

    // PhonePe transaction format: "Paid to MERCHANT DEBIT ₹amount" or "DEBIT₹amount Paid to MERCHANT"
    const transactionData = this.parseTransactionLine(detailLine);
    if (!transactionData) return null;

    return {
      id: this.generateId(),
      date: this.formatDate(dateLine),
      description: transactionData.description,
      merchant: transactionData.merchant,
      amount: transactionData.amount,
      type: transactionData.type,
      confidence: "High",
      source: "PhonePe",
      rawData: {
        dateLine,
        timeLine,
        detailLine,
        lineIndex: startIndex,
      },
    };
  }

  isValidDate(line) {
    // Match: "Jun 24, 2025", "Mar 26, 2025", etc.
    return /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},\s+\d{4}$/.test(
      line,
    );
  }

  isValidTime(line) {
    // Match: "03:13 pm", "11:30 am", etc.
    return /^\d{1,2}:\d{2}\s+(am|pm)$/.test(line);
  }

  parseTransactionLine(line) {
    // Skip non-transaction lines
    if (this.isNonTransactionLine(line)) return null;

    // Pattern 1: "DEBIT₹20,000Paid to RAHIM KUTUBUDDIN PINJARI"
    let match = line.match(/^(DEBIT|CREDIT)₹([\d,]+(?:\.\d{2})?)(.*)/);
    if (match) {
      const [, type, amountStr, description] = match;
      return this.buildTransactionData(type, amountStr, description.trim());
    }

    // Pattern 2: "Paid to RAHIM KUTUBUDDIN PINJARI DEBIT ₹20,000"
    match = line.match(
      /^(Paid to|Received from)\s+(.+?)\s+(DEBIT|CREDIT)\s+₹([\d,]+(?:\.\d{2})?)/,
    );
    if (match) {
      const [, prefix, merchant, type, amountStr] = match;
      return this.buildTransactionData(
        type,
        amountStr,
        `${prefix} ${merchant}`,
      );
    }

    return null;
  }

  isNonTransactionLine(line) {
    const skipPatterns = [
      /^Transaction ID/,
      /^UTR No\./,
      /^Paid by/,
      /^Credited to/,
      /^XXXXXX/,
      /^Page \d+ of \d+$/,
      /^Transaction Statement/,
      /^For any queries/,
      /^This is a system/,
    ];

    return skipPatterns.some((pattern) => pattern.test(line));
  }

  buildTransactionData(type, amountStr, description) {
    const amount = parseFloat(amountStr.replace(/,/g, ""));

    // Validate amount
    if (amount <= 0 || amount > 10000000) return null;

    // Extract merchant
    let merchant = "Unknown";
    if (description.startsWith("Paid to ")) {
      merchant = description.replace("Paid to ", "").trim();
    } else if (description.startsWith("Received from ")) {
      merchant = description.replace("Received from ", "").trim();
    }

    return {
      type: type.toLowerCase(),
      amount,
      description: description.substring(0, 100),
      merchant: merchant.substring(0, 50),
    };
  }

  formatDate(dateString) {
    // Convert "Jun 24, 2025" to "2025-06-24"
    const months = {
      Jan: "01",
      Feb: "02",
      Mar: "03",
      Apr: "04",
      May: "05",
      Jun: "06",
      Jul: "07",
      Aug: "08",
      Sep: "09",
      Oct: "10",
      Nov: "11",
      Dec: "12",
    };

    const match = dateString.match(/^(\w{3})\s+(\d{1,2}),\s+(\d{4})$/);
    if (!match) return new Date().toISOString().split("T")[0];

    const [, monthName, day, year] = match;
    const month = months[monthName];

    return `${year}-${month}-${day.padStart(2, "0")}`;
  }

  generateId() {
    return (
      "phonepe_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)
    );
  }

  /**
   * Categorize all transactions
   */
  async categorizeTransactions(transactions) {
    console.log(`🏷️ Categorizing ${transactions.length} transactions...`);

    const categorizedTransactions = [];

    for (const transaction of transactions) {
      const categoryInfo =
        await this.categorizer.categorizeTransaction(transaction);

      categorizedTransactions.push({
        ...transaction,
        category: categoryInfo.category,
        categoryIcon: categoryInfo.icon,
        categoryColor: categoryInfo.color,
        categoryConfidence: categoryInfo.confidence,
        categoryMethod: categoryInfo.method,
      });
    }

    return categorizedTransactions;
  }
}

module.exports = { PhonePeParser };

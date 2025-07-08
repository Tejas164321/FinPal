export interface Transaction {
  id: string;
  date: Date;
  description: string;
  amount: number;
  type: "debit" | "credit";
  category: string;
  source: "GPay" | "PhonePe" | "Paytm" | "Bank" | "Unknown";
  confidence: "High" | "Medium" | "Low";
  categorizedBy: "Rule" | "AI";
  merchant?: string;
  upiTransactionId?: string;
}

export interface ProcessingResult {
  transactions: Transaction[];
  summary: {
    totalTransactions: number;
    totalCredits: number;
    totalDebits: number;
    dateRange: { from: Date; to: Date };
    categories: { [key: string]: number };
  };
  source: "GPay" | "PhonePe" | "Paytm" | "Bank" | "Unknown";
  errors: string[];
}

// Mock categorization rules
const MERCHANT_CATEGORIES: { [key: string]: string } = {
  // Food & Dining
  zomato: "Food & Dining",
  swiggy: "Food & Dining",
  dominos: "Food & Dining",
  mcdonalds: "Food & Dining",
  kfc: "Food & Dining",
  "pizza hut": "Food & Dining",
  starbucks: "Food & Dining",
  "cafe coffee day": "Food & Dining",

  // Transportation
  uber: "Transportation",
  ola: "Transportation",
  irctc: "Transportation",
  rapido: "Transportation",
  metro: "Transportation",
  petrol: "Transportation",
  "hp petrol": "Transportation",
  "bharat petroleum": "Transportation",

  // Shopping
  amazon: "Shopping",
  flipkart: "Shopping",
  myntra: "Shopping",
  ajio: "Shopping",
  nykaa: "Shopping",
  bigbasket: "Shopping",
  grofers: "Shopping",
  blinkit: "Shopping",

  // Entertainment
  netflix: "Entertainment",
  "prime video": "Entertainment",
  hotstar: "Entertainment",
  spotify: "Entertainment",
  youtube: "Entertainment",
  bookmyshow: "Entertainment",

  // Bills & Utilities
  electricity: "Bills & Utilities",
  gas: "Bills & Utilities",
  water: "Bills & Utilities",
  wifi: "Bills & Utilities",
  broadband: "Bills & Utilities",
  mobile: "Bills & Utilities",
  airtel: "Bills & Utilities",
  jio: "Bills & Utilities",
  vodafone: "Bills & Utilities",

  // Investment & Finance
  sip: "Investment",
  "mutual fund": "Investment",
  insurance: "Investment",
  lic: "Investment",
  zerodha: "Investment",
  groww: "Investment",
};

// Rule-based categorization
export const categorizeTransaction = (
  description: string,
): {
  category: string;
  confidence: "High" | "Medium" | "Low";
  source: "Rule" | "AI";
} => {
  const desc = description.toLowerCase();

  // Check exact merchant matches
  for (const [merchant, category] of Object.entries(MERCHANT_CATEGORIES)) {
    if (desc.includes(merchant)) {
      return { category, confidence: "High", source: "Rule" };
    }
  }

  // Fallback to keyword-based categorization
  if (
    desc.includes("food") ||
    desc.includes("restaurant") ||
    desc.includes("cafe")
  ) {
    return { category: "Food & Dining", confidence: "Medium", source: "Rule" };
  }

  if (
    desc.includes("fuel") ||
    desc.includes("petrol") ||
    desc.includes("diesel") ||
    desc.includes("cab") ||
    desc.includes("taxi")
  ) {
    return { category: "Transportation", confidence: "Medium", source: "Rule" };
  }

  if (
    desc.includes("shopping") ||
    desc.includes("mart") ||
    desc.includes("store")
  ) {
    return { category: "Shopping", confidence: "Medium", source: "Rule" };
  }

  if (
    desc.includes("movie") ||
    desc.includes("entertainment") ||
    desc.includes("game")
  ) {
    return { category: "Entertainment", confidence: "Medium", source: "Rule" };
  }

  if (
    desc.includes("bill") ||
    desc.includes("recharge") ||
    desc.includes("utility")
  ) {
    return {
      category: "Bills & Utilities",
      confidence: "Medium",
      source: "Rule",
    };
  }

  if (
    desc.includes("salary") ||
    desc.includes("income") ||
    desc.includes("credit")
  ) {
    return { category: "Income", confidence: "High", source: "Rule" };
  }

  // Default fallback - would be replaced by AI in real implementation
  return { category: "Others", confidence: "Low", source: "AI" };
};

// Detect file source based on content patterns
export const detectFileSource = (
  fileName: string,
  content?: string,
): "GPay" | "PhonePe" | "Paytm" | "Bank" | "Unknown" => {
  const name = fileName.toLowerCase();

  if (
    name.includes("gpay") ||
    name.includes("google pay") ||
    (content && content.includes("Google Pay"))
  ) {
    return "GPay";
  }

  if (
    name.includes("phonepe") ||
    name.includes("phone pe") ||
    (content && content.includes("PhonePe"))
  ) {
    return "PhonePe";
  }

  if (name.includes("paytm") || (content && content.includes("Paytm"))) {
    return "Paytm";
  }

  if (
    name.includes("bank") ||
    name.includes("statement") ||
    (content && content.includes("Account Statement"))
  ) {
    return "Bank";
  }

  return "Unknown";
};

// Parse CSV content
export const parseCSV = (content: string): Transaction[] => {
  const lines = content.trim().split("\n");
  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
  const transactions: Transaction[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""));
    const row: { [key: string]: string } = {};

    headers.forEach((header, index) => {
      row[header] = values[index] || "";
    });

    // Extract transaction data (this would need to be customized based on actual CSV format)
    const amount = parseFloat(row["Amount"] || row["amount"] || "0");
    const description =
      row["Description"] || row["description"] || row["Merchant"] || "";
    const dateStr = row["Date"] || row["date"] || row["Transaction Date"] || "";

    if (amount && description && dateStr) {
      const categorization = categorizeTransaction(description);

      transactions.push({
        id: Math.random().toString(36).substr(2, 9),
        date: new Date(dateStr),
        description,
        amount: Math.abs(amount),
        type: amount < 0 ? "debit" : "credit",
        category: categorization.category,
        source: "Unknown", // Will be set by the calling function
        confidence: categorization.confidence,
        categorizedBy: categorization.source,
        merchant: description.split(" ")[0], // Simple merchant extraction
      });
    }
  }

  return transactions;
};

// Mock AI categorization (would integrate with Gemini AI in real implementation)
export const aiCategorizeTransaction = async (
  description: string,
): Promise<{ category: string; confidence: "High" | "Medium" | "Low" }> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Mock AI response based on keywords
  const desc = description.toLowerCase();

  if (desc.includes("unknown") || desc.includes("transfer")) {
    return { category: "Others", confidence: "Low" };
  }

  // Default AI categorization logic would go here
  return { category: "Others", confidence: "Medium" };
};

// Generate processing summary
export const generateSummary = (transactions: Transaction[]) => {
  const totalTransactions = transactions.length;
  const totalDebits = transactions
    .filter((t) => t.type === "debit")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalCredits = transactions
    .filter((t) => t.type === "credit")
    .reduce((sum, t) => sum + t.amount, 0);

  const dates = transactions
    .map((t) => t.date)
    .sort((a, b) => a.getTime() - b.getTime());
  const dateRange = {
    from: dates[0] || new Date(),
    to: dates[dates.length - 1] || new Date(),
  };

  const categories: { [key: string]: number } = {};
  transactions.forEach((t) => {
    if (t.type === "debit") {
      categories[t.category] = (categories[t.category] || 0) + t.amount;
    }
  });

  return {
    totalTransactions,
    totalCredits,
    totalDebits,
    dateRange,
    categories,
  };
};

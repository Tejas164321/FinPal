/**
 * Professional Transaction Categorizer
 * Hardcoded keywords first, Gemini AI fallback
 */
class TransactionCategorizer {
  constructor() {
    this.categories = {
      // Essential Categories
      food: {
        name: "Food & Dining",
        icon: "🍽️",
        color: "#f59e0b",
        keywords: [
          "zomato",
          "swiggy",
          "uber eats",
          "food",
          "restaurant",
          "pizza",
          "burger",
          "coffee",
          "starbucks",
          "cafe",
          "dominos",
          "kfc",
          "mcdonalds",
          "subway",
          "dining",
          "meal",
          "lunch",
          "dinner",
          "breakfast",
          "snacks",
          "biryani",
          "chinese",
          "hotel",
          "dhaba",
        ],
      },

      groceries: {
        name: "Groceries",
        icon: "🛒",
        color: "#10b981",
        keywords: [
          "grocery",
          "supermarket",
          "bigbasket",
          "grofers",
          "zepto",
          "dunzo",
          "milk",
          "vegetables",
          "fruits",
          "rice",
          "dal",
          "oil",
          "sugar",
          "flour",
          "atta",
          "provisions",
          "kirana",
          "store",
          "mart",
          "fresh",
          "organic",
          "amazon fresh",
        ],
      },

      transport: {
        name: "Transport",
        icon: "🚗",
        color: "#3b82f6",
        keywords: [
          "uber",
          "ola",
          "rapido",
          "auto",
          "taxi",
          "cab",
          "metro",
          "bus",
          "train",
          "railway",
          "irctc",
          "fuel",
          "petrol",
          "diesel",
          "parking",
          "toll",
          "fastag",
          "transport",
          "travel",
          "ride",
        ],
      },

      shopping: {
        name: "Shopping",
        icon: "🛍️",
        color: "#8b5cf6",
        keywords: [
          "amazon",
          "flipkart",
          "myntra",
          "ajio",
          "nykaa",
          "meesho",
          "shopping",
          "clothes",
          "shoes",
          "electronics",
          "mobile",
          "laptop",
          "headphones",
          "fashion",
          "beauty",
          "cosmetics",
          "online",
          "ecommerce",
          "retail",
          "store",
          "mall",
        ],
      },

      entertainment: {
        name: "Entertainment",
        icon: "🎬",
        color: "#ef4444",
        keywords: [
          "netflix",
          "amazon prime",
          "hotstar",
          "youtube",
          "spotify",
          "movie",
          "cinema",
          "pvr",
          "inox",
          "bookmyshow",
          "paytm movies",
          "games",
          "gaming",
          "subscription",
          "music",
          "streaming",
          "entertainment",
          "theater",
          "concert",
          "show",
        ],
      },

      bills: {
        name: "Bills & Utilities",
        icon: "⚡",
        color: "#f97316",
        keywords: [
          "electricity",
          "electric",
          "power",
          "bill",
          "water",
          "gas",
          "internet",
          "wifi",
          "broadband",
          "jio",
          "airtel",
          "vodafone",
          "bsnl",
          "mobile",
          "recharge",
          "postpaid",
          "prepaid",
          "utility",
          "municipal",
          "corporation",
          "board",
          "department",
        ],
      },

      health: {
        name: "Health & Medical",
        icon: "🏥",
        color: "#06b6d4",
        keywords: [
          "doctor",
          "hospital",
          "clinic",
          "medical",
          "medicine",
          "pharmacy",
          "apollo",
          "fortis",
          "max",
          "medanta",
          "netmeds",
          "1mg",
          "pharmeasy",
          "health",
          "treatment",
          "checkup",
          "surgery",
          "dental",
          "eye",
          "lab",
          "test",
          "scan",
          "x-ray",
        ],
      },

      transfer: {
        name: "Money Transfer",
        icon: "💸",
        color: "#84cc16",
        keywords: [
          "transfer",
          "sent",
          "received",
          "upi",
          "imps",
          "neft",
          "rtgs",
          "bank transfer",
          "payment",
          "fund transfer",
          "remittance",
          "western union",
          "money",
          "cash",
          "wallet",
          "paytm",
          "phonepe",
          "googlepay",
          "bhim",
        ],
      },

      investment: {
        name: "Investment",
        icon: "📈",
        color: "#6366f1",
        keywords: [
          "mutual fund",
          "sip",
          "investment",
          "trading",
          "zerodha",
          "groww",
          "paytm money",
          "upstox",
          "angel",
          "icicidirect",
          "stocks",
          "shares",
          "equity",
          "bond",
          "fd",
          "deposit",
          "insurance",
          "lic",
          "policy",
          "premium",
        ],
      },

      education: {
        name: "Education",
        icon: "📚",
        color: "#d946ef",
        keywords: [
          "education",
          "school",
          "college",
          "university",
          "course",
          "fees",
          "tuition",
          "coaching",
          "online course",
          "udemy",
          "coursera",
          "byju",
          "unacademy",
          "books",
          "stationery",
          "exam",
          "test",
          "certification",
          "training",
        ],
      },
    };
  }

  getCategoryNames() {
    return Object.values(this.categories).map((cat) => cat.name);
  }

  /**
   * Main categorization method
   */
  async categorizeTransaction(transaction) {
    try {
      // Step 1: Try keyword-based categorization
      const keywordCategory = this.categorizeByKeywords(transaction);
      if (keywordCategory) {
        console.log(
          `🏷️ Keyword match: ${transaction.description} → ${keywordCategory.name}`,
        );
        return {
          category: keywordCategory.name,
          icon: keywordCategory.icon,
          color: keywordCategory.color,
          confidence: "High",
          method: "Keywords",
        };
      }

      // Step 2: Try AI categorization as fallback
      const aiCategory = await this.categorizeWithAI(transaction);
      if (aiCategory) {
        console.log(
          `🤖 AI categorized: ${transaction.description} → ${aiCategory.category}`,
        );
        return {
          category: aiCategory.category,
          icon: aiCategory.icon || "📄",
          color: aiCategory.color || "#6b7280",
          confidence: "Medium",
          method: "AI",
        };
      }

      // Step 3: Default fallback
      return {
        category: "Other",
        icon: "📄",
        color: "#6b7280",
        confidence: "Low",
        method: "Default",
      };
    } catch (error) {
      console.error("❌ Categorization error:", error);
      return {
        category: "Other",
        icon: "📄",
        color: "#6b7280",
        confidence: "Low",
        method: "Error",
      };
    }
  }

  /**
   * Keyword-based categorization
   */
  categorizeByKeywords(transaction) {
    const text = [
      transaction?.description,
      transaction?.merchant,
      transaction?.notes,
      transaction?.type,
      transaction?.rawData?.detailLine,
    ]
      .flat()
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    if (!text) {
      return null;
    }

    for (const category of Object.values(this.categories)) {
      const hasMatch = category.keywords.some((keyword) =>
        text.includes(keyword.toLowerCase()),
      );

      if (hasMatch) {
        return category;
      }
    }

    return null;
  }

  /**
   * AI-based categorization using Gemini
   */
  async categorizeWithAI(transaction) {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.warn("⚠️ Gemini API key not found, skipping AI categorization");
        return null;
      }

      const prompt = this.buildAIPrompt(transaction);
      const response = await this.callGeminiAPI(prompt, apiKey);

      return this.parseAIResponse(response);
    } catch (error) {
      console.error("❌ AI categorization failed:", error);
      return null;
    }
  }

  /**
   * Build AI prompt for categorization
   */
  buildAIPrompt(transaction) {
    const availableCategories = this.getCategoryNames().join(", ");

    const amountValue = Number(transaction?.amount);
    const formattedAmount = Number.isFinite(amountValue)
      ? amountValue.toFixed(2)
      : String(transaction?.amount ?? "");

    return `Categorize this transaction into one of these categories: ${availableCategories}

Transaction Details:
- Description: ${transaction.description ?? ""}
- Merchant: ${transaction.merchant ?? ""}
- Amount: ₹${formattedAmount}
- Type: ${transaction.type ?? ""}

Respond with ONLY the category name from the list above. If none fit perfectly, choose the closest match.`;
  }

  /**
   * Call Gemini API
   */
  async callGeminiAPI(prompt, apiKey) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0]?.content?.parts[0]?.text || "";
  }

  /**
   * Parse AI response to get category info
   */
  parseAIResponse(response) {
    const categoryName = response.trim();

    // Find matching category from our predefined list
    const matchedCategory = Object.values(this.categories).find(
      (cat) => cat.name.toLowerCase() === categoryName.toLowerCase(),
    );

    if (matchedCategory) {
      return {
        category: matchedCategory.name,
        icon: matchedCategory.icon,
        color: matchedCategory.color,
      };
    }

    // If AI suggested a category not in our list, create a basic one
    return {
      category: categoryName,
      icon: "📄",
      color: "#6b7280",
    };
  }

  /**
   * Get all available categories
   */
  getAllCategories() {
    return Object.values(this.categories);
  }

  /**
   * Get category by name
   */
  getCategoryByName(name) {
    return Object.values(this.categories).find(
      (cat) => cat.name.toLowerCase() === name.toLowerCase(),
    );
  }
}

async function categorizeTransactions(transactions) {
  if (!Array.isArray(transactions) || transactions.length === 0) {
    return [];
  }

  const categorizer = new TransactionCategorizer();
  const categorized = [];

  for (const transaction of transactions) {
    if (transaction?.category && transaction?.categoryConfidence) {
      categorized.push({
        ...transaction,
        source: transaction?.source || "Unknown",
        confidence: transaction?.confidence || transaction.categoryConfidence,
        categorizedBy:
          transaction?.categorizedBy || transaction.categoryMethod || "Default",
      });
      continue;
    }

    const categoryInfo = await categorizer.categorizeTransaction(transaction);

    const confidence =
      transaction?.confidence || categoryInfo.confidence || "Medium";
    const categorizedBy =
      transaction?.categorizedBy || categoryInfo.method || "Default";
    const source = transaction?.source || "Unknown";

    categorized.push({
      ...transaction,
      source,
      category: categoryInfo.category,
      categoryIcon: categoryInfo.icon,
      categoryColor: categoryInfo.color,
      categoryConfidence: categoryInfo.confidence,
      categoryMethod: categoryInfo.method,
      confidence,
      categorizedBy,
    });
  }

  return categorized;
}

module.exports = { TransactionCategorizer, categorizeTransactions };

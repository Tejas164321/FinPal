// Transaction categorizer with rule-based and AI fallback logic

const MERCHANT_CATEGORIES = {
  // Food & Dining
  zomato: "Food & Dining",
  swiggy: "Food & Dining",
  dominos: "Food & Dining",
  "domino's": "Food & Dining",
  mcdonalds: "Food & Dining",
  "mcdonald's": "Food & Dining",
  kfc: "Food & Dining",
  "pizza hut": "Food & Dining",
  starbucks: "Food & Dining",
  "cafe coffee day": "Food & Dining",
  ccd: "Food & Dining",
  "burger king": "Food & Dining",
  subway: "Food & Dining",
  haldirams: "Food & Dining",
  bikanervala: "Food & Dining",

  // Transportation
  uber: "Transportation",
  ola: "Transportation",
  irctc: "Transportation",
  "indian railway": "Transportation",
  rapido: "Transportation",
  metro: "Transportation",
  petrol: "Transportation",
  "hp petrol": "Transportation",
  "bharat petroleum": "Transportation",
  "indian oil": "Transportation",
  bpcl: "Transportation",
  hpcl: "Transportation",
  shell: "Transportation",

  // Shopping
  amazon: "Shopping",
  flipkart: "Shopping",
  myntra: "Shopping",
  ajio: "Shopping",
  nykaa: "Shopping",
  bigbasket: "Shopping",
  grofers: "Shopping",
  blinkit: "Shopping",
  "nature's basket": "Shopping",
  "spencer's": "Shopping",
  reliance: "Shopping",
  "big bazaar": "Shopping",
  "more supermarket": "Shopping",

  // Entertainment
  netflix: "Entertainment",
  "prime video": "Entertainment",
  "amazon prime": "Entertainment",
  hotstar: "Entertainment",
  "disney hotstar": "Entertainment",
  spotify: "Entertainment",
  "youtube premium": "Entertainment",
  youtube: "Entertainment",
  bookmyshow: "Entertainment",
  "paytm movies": "Entertainment",
  "pvr cinemas": "Entertainment",
  inox: "Entertainment",

  // Bills & Utilities
  electricity: "Bills & Utilities",
  "electricity bill": "Bills & Utilities",
  gas: "Bills & Utilities",
  "lpg gas": "Bills & Utilities",
  water: "Bills & Utilities",
  "water bill": "Bills & Utilities",
  wifi: "Bills & Utilities",
  broadband: "Bills & Utilities",
  mobile: "Bills & Utilities",
  "mobile recharge": "Bills & Utilities",
  airtel: "Bills & Utilities",
  jio: "Bills & Utilities",
  "reliance jio": "Bills & Utilities",
  vodafone: "Bills & Utilities",
  "vi recharge": "Bills & Utilities",
  bsnl: "Bills & Utilities",

  // Investment & Finance
  sip: "Investment",
  "mutual fund": "Investment",
  "sbi mutual": "Investment",
  "hdfc mutual": "Investment",
  insurance: "Investment",
  lic: "Investment",
  "life insurance": "Investment",
  zerodha: "Investment",
  groww: "Investment",
  "angel broking": "Investment",
  icicidirect: "Investment",

  // Healthcare
  "apollo pharmacy": "Healthcare",
  medplus: "Healthcare",
  "1mg": "Healthcare",
  pharmeasy: "Healthcare",
  netmeds: "Healthcare",
  hospital: "Healthcare",
  clinic: "Healthcare",
  doctor: "Healthcare",

  // Education
  "byju's": "Education",
  byjus: "Education",
  unacademy: "Education",
  vedantu: "Education",
  "white hat jr": "Education",
  school: "Education",
  college: "Education",
  university: "Education",
};

const KEYWORD_CATEGORIES = {
  "Food & Dining": [
    "restaurant",
    "cafe",
    "food",
    "dining",
    "meal",
    "lunch",
    "dinner",
    "breakfast",
    "pizza",
    "burger",
    "biryani",
    "chinese",
    "ice cream",
  ],
  Transportation: [
    "cab",
    "taxi",
    "bus",
    "train",
    "metro",
    "auto",
    "rickshaw",
    "fuel",
    "petrol",
    "diesel",
    "parking",
    "toll",
    "transport",
  ],
  Shopping: [
    "shopping",
    "mart",
    "store",
    "supermarket",
    "mall",
    "retail",
    "clothes",
    "fashion",
    "electronics",
    "mobile",
    "laptop",
    "book",
  ],
  Entertainment: [
    "movie",
    "cinema",
    "theatre",
    "entertainment",
    "game",
    "music",
    "streaming",
    "subscription",
    "ticket",
    "event",
  ],
  "Bills & Utilities": [
    "bill",
    "utility",
    "recharge",
    "electricity",
    "gas",
    "water",
    "internet",
    "broadband",
    "wifi",
    "mobile",
    "phone",
  ],
  Healthcare: [
    "medical",
    "medicine",
    "pharmacy",
    "hospital",
    "clinic",
    "doctor",
    "health",
    "dental",
    "lab test",
  ],
  Investment: [
    "mutual fund",
    "sip",
    "insurance",
    "investment",
    "trading",
    "stock",
    "bond",
    "fd",
    "fixed deposit",
  ],
  Education: [
    "education",
    "school",
    "college",
    "university",
    "course",
    "tuition",
    "training",
    "learning",
    "book",
  ],
};

async function categorizeTransactions(transactions) {
  console.log(`🔄 Categorizing ${transactions.length} transactions...`);

  const categorizedTransactions = [];

  for (const transaction of transactions) {
    const categorization = await categorizeTransaction(transaction.description);

    categorizedTransactions.push({
      ...transaction,
      category: categorization.category,
      confidence: categorization.confidence,
      categorizedBy: categorization.source,
    });
  }

  console.log("✅ Transaction categorization complete");
  return categorizedTransactions;
}

async function categorizeTransaction(description) {
  const desc = description.toLowerCase().trim();

  console.log(`🔍 Categorizing: "${description}"`);

  // Step 1: Try exact merchant match
  for (const [merchant, category] of Object.entries(MERCHANT_CATEGORIES)) {
    if (desc.includes(merchant.toLowerCase())) {
      console.log(`✅ Rule match: ${merchant} → ${category}`);
      return { category, confidence: "High", source: "Rule" };
    }
  }

  // Step 2: Try keyword-based categorization
  for (const [category, keywords] of Object.entries(KEYWORD_CATEGORIES)) {
    for (const keyword of keywords) {
      if (desc.includes(keyword.toLowerCase())) {
        console.log(`✅ Keyword match: ${keyword} → ${category}`);
        return { category, confidence: "Medium", source: "Rule" };
      }
    }
  }

  // Step 3: Special pattern matching
  const specialCategory = checkSpecialPatterns(desc);
  if (specialCategory) {
    console.log(`✅ Pattern match: ${specialCategory.category}`);
    return specialCategory;
  }

  // Step 4: Fallback to AI categorization (simulated)
  console.log(`🤖 Using AI fallback for: "${description}"`);
  const aiCategory = await simulateAICategorization(desc);
  return aiCategory;
}

function checkSpecialPatterns(description) {
  // Income patterns
  if (
    description.includes("salary") ||
    description.includes("income") ||
    description.includes("credit interest") ||
    description.includes("dividend") ||
    description.includes("bonus")
  ) {
    return { category: "Income", confidence: "High", source: "Rule" };
  }

  // Transfer patterns
  if (
    description.includes("transfer") ||
    description.includes("fund transfer") ||
    description.includes("neft") ||
    description.includes("imps") ||
    description.includes("rtgs")
  ) {
    return { category: "Transfer", confidence: "High", source: "Rule" };
  }

  // ATM patterns
  if (description.includes("atm") || description.includes("cash withdrawal")) {
    return { category: "ATM Withdrawal", confidence: "High", source: "Rule" };
  }

  // Bank charges
  if (
    description.includes("charges") ||
    description.includes("fee") ||
    description.includes("service charge") ||
    description.includes("annual fee")
  ) {
    return { category: "Bank Charges", confidence: "High", source: "Rule" };
  }

  return null;
}

async function simulateAICategorization(description) {
  // Simulate AI processing delay
  await new Promise((resolve) => setTimeout(resolve, 50));

  // Simple AI simulation based on common patterns
  const desc = description.toLowerCase();

  // Shopping patterns
  if (
    desc.includes("purchase") ||
    desc.includes("buy") ||
    desc.includes("order") ||
    desc.includes("payment")
  ) {
    return { category: "Shopping", confidence: "Medium", source: "AI" };
  }

  // Service patterns
  if (desc.includes("service") || desc.includes("repair")) {
    return { category: "Services", confidence: "Medium", source: "AI" };
  }

  // Travel patterns
  if (
    desc.includes("hotel") ||
    desc.includes("booking") ||
    desc.includes("travel") ||
    desc.includes("flight")
  ) {
    return { category: "Travel", confidence: "Medium", source: "AI" };
  }

  // Default category
  return { category: "Others", confidence: "Low", source: "AI" };
}

// Export functions
module.exports = {
  categorizeTransactions,
  categorizeTransaction,
};

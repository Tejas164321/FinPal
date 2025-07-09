// Enhanced transaction categorizer with comprehensive Indian merchant database

const MERCHANT_CATEGORIES = {
  // Food & Dining - Major platforms and restaurants
  zomato: "Food & Dining",
  swiggy: "Food & Dining",
  dominos: "Food & Dining",
  "domino's": "Food & Dining",
  "dominos pizza": "Food & Dining",
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
  "taco bell": "Food & Dining",
  "dunkin donuts": "Food & Dining",
  "baskin robbins": "Food & Dining",
  "fresh menu": "Food & Dining",
  freshmenu: "Food & Dining",
  box8: "Food & Dining",
  "behrouz biryani": "Food & Dining",
  "oven story": "Food & Dining",
  faasos: "Food & Dining",
  restaurant: "Food & Dining",
  hotel: "Food & Dining",
  "food court": "Food & Dining",
  canteen: "Food & Dining",
  dhaba: "Food & Dining",

  // Transportation - Ride sharing, fuel, travel
  uber: "Transportation",
  ola: "Transportation",
  "ola cabs": "Transportation",
  irctc: "Transportation",
  "indian railway": "Transportation",
  "indian railways": "Transportation",
  rapido: "Transportation",
  metro: "Transportation",
  "delhi metro": "Transportation",
  "mumbai metro": "Transportation",
  "bangalore metro": "Transportation",
  petrol: "Transportation",
  "hp petrol": "Transportation",
  "bharat petroleum": "Transportation",
  "indian oil": "Transportation",
  bpcl: "Transportation",
  hpcl: "Transportation",
  shell: "Transportation",
  "reliance petrol": "Transportation",
  "auto rickshaw": "Transportation",
  taxi: "Transportation",
  bus: "Transportation",
  train: "Transportation",
  flight: "Transportation",
  "parking fee": "Transportation",
  toll: "Transportation",
  fastag: "Transportation",
  "make my trip": "Transportation",
  makemytrip: "Transportation",
  "trip advisor": "Transportation",
  goibibo: "Transportation",
  "clear trip": "Transportation",
  redbus: "Transportation",

  // Shopping - E-commerce and retail
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
  "d mart": "Shopping",
  dmart: "Shopping",
  lifestyle: "Shopping",
  "max fashion": "Shopping",
  westside: "Shopping",
  croma: "Shopping",
  "vijay sales": "Shopping",
  "reliance digital": "Shopping",
  samsung: "Shopping",
  apple: "Shopping",
  oneplus: "Shopping",
  "mi store": "Shopping",
  realme: "Shopping",
  snapdeal: "Shopping",
  paytmmall: "Shopping",
  "paytm mall": "Shopping",
  meesho: "Shopping",
  mart: "Shopping",
  store: "Shopping",
  market: "Shopping",
  bazaar: "Shopping",
  mall: "Shopping",
  showroom: "Shopping",

  // Entertainment - Streaming, movies, games
  netflix: "Entertainment",
  "prime video": "Entertainment",
  "amazon prime": "Entertainment",
  hotstar: "Entertainment",
  "disney hotstar": "Entertainment",
  "disney+ hotstar": "Entertainment",
  spotify: "Entertainment",
  "youtube premium": "Entertainment",
  youtube: "Entertainment",
  "youtube music": "Entertainment",
  bookmyshow: "Entertainment",
  "paytm movies": "Entertainment",
  "pvr cinemas": "Entertainment",
  pvr: "Entertainment",
  inox: "Entertainment",
  cinepolis: "Entertainment",
  "carnival cinemas": "Entertainment",
  "sony liv": "Entertainment",
  zee5: "Entertainment",
  "alt balaji": "Entertainment",
  voot: "Entertainment",
  "mx player": "Entertainment",
  "jio cinema": "Entertainment",
  "jio saavn": "Entertainment",
  saavn: "Entertainment",
  gaana: "Entertainment",
  wynk: "Entertainment",
  playstation: "Entertainment",
  xbox: "Entertainment",
  steam: "Entertainment",
  "google play": "Entertainment",
  "app store": "Entertainment",

  // Bills & Utilities - Telecom, electricity, internet
  electricity: "Bills & Utilities",
  "electricity bill": "Bills & Utilities",
  "power bill": "Bills & Utilities",
  gas: "Bills & Utilities",
  "lpg gas": "Bills & Utilities",
  "lpg booking": "Bills & Utilities",
  water: "Bills & Utilities",
  "water bill": "Bills & Utilities",
  wifi: "Bills & Utilities",
  broadband: "Bills & Utilities",
  internet: "Bills & Utilities",
  mobile: "Bills & Utilities",
  "mobile recharge": "Bills & Utilities",
  recharge: "Bills & Utilities",
  airtel: "Bills & Utilities",
  jio: "Bills & Utilities",
  "reliance jio": "Bills & Utilities",
  vodafone: "Bills & Utilities",
  "vi recharge": "Bills & Utilities",
  "idea recharge": "Bills & Utilities",
  bsnl: "Bills & Utilities",
  "dtv recharge": "Bills & Utilities",
  "dth recharge": "Bills & Utilities",
  "tata sky": "Bills & Utilities",
  "dish tv": "Bills & Utilities",
  "sun direct": "Bills & Utilities",
  "videocon d2h": "Bills & Utilities",
  "postpaid bill": "Bills & Utilities",

  // Investment & Finance - Trading, insurance, banking
  sip: "Investment",
  "mutual fund": "Investment",
  "sbi mutual": "Investment",
  "hdfc mutual": "Investment",
  "icici mutual": "Investment",
  "axis mutual": "Investment",
  insurance: "Investment",
  lic: "Investment",
  "life insurance": "Investment",
  "term insurance": "Investment",
  "health insurance": "Investment",
  zerodha: "Investment",
  groww: "Investment",
  "angel broking": "Investment",
  "angel one": "Investment",
  icicidirect: "Investment",
  "hdfc securities": "Investment",
  "axis securities": "Investment",
  "kotak securities": "Investment",
  "5paisa": "Investment",
  upstox: "Investment",
  "motilal oswal": "Investment",
  sharekhan: "Investment",
  edelweiss: "Investment",

  // Healthcare - Pharmacy, hospitals, health apps
  "apollo pharmacy": "Healthcare",
  "apollo 24/7": "Healthcare",
  medplus: "Healthcare",
  "1mg": "Healthcare",
  pharmeasy: "Healthcare",
  netmeds: "Healthcare",
  "fortis hospital": "Healthcare",
  "apollo hospital": "Healthcare",
  "max healthcare": "Healthcare",
  hospital: "Healthcare",
  clinic: "Healthcare",
  doctor: "Healthcare",
  practo: "Healthcare",
  lybrate: "Healthcare",
  mfine: "Healthcare",

  // Education - Online learning, schools
  "byju's": "Education",
  byjus: "Education",
  unacademy: "Education",
  vedantu: "Education",
  "white hat jr": "Education",
  "whitehat jr": "Education",
  toppr: "Education",
  "khan academy": "Education",
  coursera: "Education",
  udemy: "Education",
  "skill share": "Education",
  skillshare: "Education",
  school: "Education",
  college: "Education",
  university: "Education",
  "exam fee": "Education",
  "tuition fee": "Education",

  // Government & Official
  "income tax": "Government & Tax",
  "gst payment": "Government & Tax",
  "property tax": "Government & Tax",
  "vehicle tax": "Government & Tax",
  "passport fee": "Government & Tax",
  "driving license": "Government & Tax",
  challan: "Government & Tax",
  "traffic fine": "Government & Tax",
  "court fee": "Government & Tax",
  registration: "Government & Tax",
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
    "coffee",
    "tea",
    "snacks",
    "delivery",
    "takeaway",
    "dine in",
    "order",
    "food delivery",
    "restaurant bill",
    "canteen",
    "hotel",
    "dhaba",
    "tiffin",
    "catering",
    "buffet",
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
    "ride",
    "trip",
    "travel",
    "flight",
    "ticket",
    "booking",
    "fare",
    "fastag",
    "vehicle",
    "car",
    "bike",
    "railway",
    "airport",
    "station",
  ],
  "Personal Care": [
    "salon",
    "spa",
    "beauty",
    "haircut",
    "massage",
    "facial",
    "parlour",
    "cosmetics",
    "grooming",
    "barbershop",
    "nail",
    "skincare",
  ],
  Groceries: [
    "grocery",
    "vegetables",
    "fruits",
    "milk",
    "bread",
    "rice",
    "dal",
    "oil",
    "sugar",
    "flour",
    "supermarket",
    "kirana",
    "provision",
    "general store",
  ],
  Medical: [
    "doctor",
    "hospital",
    "clinic",
    "pharmacy",
    "medicine",
    "medical",
    "health",
    "treatment",
    "checkup",
    "consultation",
    "lab test",
    "pathology",
    "diagnostic",
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
    "purchase",
    "buy",
    "order",
    "delivery",
    "product",
    "item",
    "grocery",
    "vegetable",
    "fruits",
    "clothing",
    "shoes",
    "accessories",
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
    "show",
    "concert",
    "sports",
    "match",
    "tournament",
    "premium",
    "membership",
    "netflix",
    "prime",
    "hotstar",
    "spotify",
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
    "postpaid",
    "prepaid",
    "dth",
    "cable",
    "connection",
    "service charge",
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
    "checkup",
    "consultation",
    "prescription",
    "treatment",
    "surgery",
    "emergency",
    "ambulance",
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
    "savings",
    "portfolio",
    "equity",
    "premium",
    "policy",
    "brokerage",
    "demat",
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
    "exam",
    "fee",
    "admission",
    "library",
    "coaching",
    "class",
    "study",
    "online course",
  ],
  "Government & Tax": [
    "tax",
    "government",
    "gst",
    "income tax",
    "tds",
    "challan",
    "fine",
    "license",
    "passport",
    "registration",
    "court",
    "legal",
    "official",
    "municipal",
    "corporation",
    "panchayat",
    "electricity board",
  ],
};

async function categorizeTransactions(transactions) {
  console.log(`🔄 Categorizing ${transactions.length} transactions...`);

  const categorizedTransactions = [];
  const categoryStats = {};

  for (const transaction of transactions) {
    const categorization = await categorizeTransaction(transaction.description);

    // Track category statistics
    if (!categoryStats[categorization.category]) {
      categoryStats[categorization.category] = { count: 0, amount: 0 };
    }
    categoryStats[categorization.category].count++;
    categoryStats[categorization.category].amount += transaction.amount;

    categorizedTransactions.push({
      ...transaction,
      category: categorization.category,
      confidence: categorization.confidence,
      categorizedBy: categorization.source,
    });
  }

  console.log("📊 Categorization Statistics:");
  Object.entries(categoryStats).forEach(([category, stats]) => {
    console.log(
      `  ${category}: ${stats.count} transactions, ₹${stats.amount.toFixed(2)}`,
    );
  });

  console.log("✅ Transaction categorization complete");
  return categorizedTransactions;
}

async function categorizeTransaction(description) {
  const desc = description.toLowerCase().trim();

  console.log(`🔍 Categorizing: "${description}"`);

  // Step 1: Try exact merchant match (highest confidence)
  for (const [merchant, category] of Object.entries(MERCHANT_CATEGORIES)) {
    if (desc.includes(merchant.toLowerCase())) {
      console.log(`✅ Exact merchant match: ${merchant} → ${category}`);
      return { category, confidence: "High", source: "Rule" };
    }
  }

  // Step 2: Try keyword-based categorization (medium confidence)
  for (const [category, keywords] of Object.entries(KEYWORD_CATEGORIES)) {
    for (const keyword of keywords) {
      if (desc.includes(keyword.toLowerCase())) {
        console.log(`✅ Keyword match: ${keyword} → ${category}`);
        return { category, confidence: "Medium", source: "Rule" };
      }
    }
  }

  // Step 3: Special pattern matching (high confidence for specific patterns)
  const specialCategory = checkSpecialPatterns(desc);
  if (specialCategory) {
    console.log(`✅ Pattern match: ${specialCategory.category}`);
    return specialCategory;
  }

  // Step 4: Amount-based categorization hints
  const amountCategory = categorizeByAmount(description);
  if (amountCategory) {
    console.log(`✅ Amount-based categorization: ${amountCategory.category}`);
    return amountCategory;
  }

  // Step 5: Fallback to AI categorization (simulated)
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
    description.includes("bonus") ||
    description.includes("refund") ||
    description.includes("cashback") ||
    description.includes("reward")
  ) {
    return { category: "Income", confidence: "High", source: "Rule" };
  }

  // Transfer patterns
  if (
    description.includes("transfer") ||
    description.includes("fund transfer") ||
    description.includes("neft") ||
    description.includes("imps") ||
    description.includes("rtgs") ||
    description.includes("upi transfer") ||
    description.includes("to bank account")
  ) {
    return { category: "Transfer", confidence: "High", source: "Rule" };
  }

  // ATM patterns
  if (
    description.includes("atm") ||
    description.includes("cash withdrawal") ||
    description.includes("withdrawal")
  ) {
    return { category: "ATM Withdrawal", confidence: "High", source: "Rule" };
  }

  // Bank charges
  if (
    description.includes("charges") ||
    description.includes("fee") ||
    description.includes("service charge") ||
    description.includes("annual fee") ||
    description.includes("maintenance") ||
    description.includes("penalty") ||
    description.includes("late fee")
  ) {
    return { category: "Bank Charges", confidence: "High", source: "Rule" };
  }

  // Loan/EMI patterns
  if (
    description.includes("emi") ||
    description.includes("loan") ||
    description.includes("installment") ||
    description.includes("credit card bill")
  ) {
    return { category: "Loan & EMI", confidence: "High", source: "Rule" };
  }

  return null;
}

function categorizeByAmount(description) {
  // This is a simplified amount-based categorization
  // In a real scenario, you might use more sophisticated amount patterns

  const desc = description.toLowerCase();

  // Small amounts often indicate quick payments
  if (
    desc.includes("quick") ||
    desc.includes("small") ||
    desc.includes("minor")
  ) {
    if (
      desc.includes("food") ||
      desc.includes("snack") ||
      desc.includes("tea") ||
      desc.includes("coffee")
    ) {
      return {
        category: "Food & Dining",
        confidence: "Medium",
        source: "Rule",
      };
    }
  }

  return null;
}

async function simulateAICategorization(description) {
  // Simulate AI processing delay
  await new Promise((resolve) => setTimeout(resolve, 50));

  // Enhanced AI simulation based on common patterns
  const desc = description.toLowerCase();

  // Shopping patterns
  if (
    desc.includes("purchase") ||
    desc.includes("buy") ||
    desc.includes("order") ||
    desc.includes("payment to") ||
    desc.includes("paid to")
  ) {
    return { category: "Shopping", confidence: "Medium", source: "AI" };
  }

  // Service patterns
  if (
    desc.includes("service") ||
    desc.includes("repair") ||
    desc.includes("maintenance") ||
    desc.includes("consultation")
  ) {
    return { category: "Services", confidence: "Medium", source: "AI" };
  }

  // Travel patterns
  if (
    desc.includes("hotel") ||
    desc.includes("booking") ||
    desc.includes("travel") ||
    desc.includes("flight") ||
    desc.includes("accommodation") ||
    desc.includes("vacation")
  ) {
    return { category: "Travel", confidence: "Medium", source: "AI" };
  }

  // Personal care patterns
  if (
    desc.includes("salon") ||
    desc.includes("spa") ||
    desc.includes("grooming") ||
    desc.includes("beauty") ||
    desc.includes("parlour")
  ) {
    return { category: "Personal Care", confidence: "Medium", source: "AI" };
  }

  // Default category with low confidence
  return { category: "Others", confidence: "Low", source: "AI" };
}

// Export functions
module.exports = {
  categorizeTransactions,
  categorizeTransaction,
  MERCHANT_CATEGORIES,
  KEYWORD_CATEGORIES,
};

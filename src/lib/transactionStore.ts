import { type Transaction } from "./fileProcessing";

// Simple in-memory store (in production, this would be connected to a database)
class TransactionStore {
  private transactions: Transaction[] = [];
  private subscribers: ((transactions: Transaction[]) => void)[] = [];

  // Add transactions from uploaded files
  addTransactions(newTransactions: Transaction[]) {
    // Clear sample data when adding real uploaded data
    if (newTransactions.length > 0 && this.hasSampleData()) {
      this.clearSampleData();
    }
    this.transactions = [...this.transactions, ...newTransactions];
    this.notifySubscribers();
  }

  // Get all transactions
  getAllTransactions(): Transaction[] {
    return [...this.transactions];
  }

  // Get transactions by date range
  getTransactionsByDateRange(startDate: Date, endDate: Date): Transaction[] {
    return this.transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  }

  // Get transactions by category
  getTransactionsByCategory(category: string): Transaction[] {
    return this.transactions.filter(
      (transaction) => transaction.category === category,
    );
  }

  // Get unique categories
  getCategories(): string[] {
    return Array.from(new Set(this.transactions.map((t) => t.category)));
  }

  // Get transactions summary
  getSummary() {
    const totalTransactions = this.transactions.length;
    const debits = this.transactions.filter((t) => t.type === "debit");
    const credits = this.transactions.filter((t) => t.type === "credit");

    const totalDebits = debits.reduce((sum, t) => sum + t.amount, 0);
    const totalCredits = credits.reduce((sum, t) => sum + t.amount, 0);

    // Get date range
    const dates = this.transactions
      .map((t) => new Date(t.date))
      .sort((a, b) => a.getTime() - b.getTime());

    const dateRange = {
      from: dates[0] || new Date(),
      to: dates[dates.length - 1] || new Date(),
    };

    // Category breakdown
    const categories: { [key: string]: number } = {};
    debits.forEach((t) => {
      categories[t.category] = (categories[t.category] || 0) + t.amount;
    });

    // Top spending categories
    const topCategories = Object.entries(categories)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return {
      totalTransactions,
      totalDebits,
      totalCredits,
      netAmount: totalCredits - totalDebits,
      dateRange,
      categories,
      topCategories,
    };
  }

  // Get monthly breakdown
  getMonthlyBreakdown() {
    const monthlyData: {
      [key: string]: { debits: number; credits: number; count: number };
    } = {};

    this.transactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { debits: 0, credits: 0, count: 0 };
      }

      if (transaction.type === "debit") {
        monthlyData[monthKey].debits += transaction.amount;
      } else {
        monthlyData[monthKey].credits += transaction.amount;
      }
      monthlyData[monthKey].count++;
    });

    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        ...data,
        net: data.credits - data.debits,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  // Clear all transactions
  clearTransactions() {
    this.transactions = [];
    this.notifySubscribers();
  }

  // Check if current transactions are sample data
  private hasSampleData(): boolean {
    return this.transactions.some((t) => t.id.startsWith("sample_"));
  }

  // Clear only sample data
  private clearSampleData() {
    this.transactions = this.transactions.filter(
      (t) => !t.id.startsWith("sample_"),
    );
  }

  // Subscribe to transaction updates
  subscribe(callback: (transactions: Transaction[]) => void) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter((sub) => sub !== callback);
    };
  }

  private notifySubscribers() {
    this.subscribers.forEach((callback) => callback(this.transactions));
  }

  // Search transactions
  searchTransactions(query: string): Transaction[] {
    const searchTerm = query.toLowerCase();
    return this.transactions.filter(
      (transaction) =>
        transaction.description.toLowerCase().includes(searchTerm) ||
        transaction.merchant?.toLowerCase().includes(searchTerm) ||
        transaction.category.toLowerCase().includes(searchTerm),
    );
  }

  // Get spending by merchant
  getSpendingByMerchant() {
    const merchantSpending: { [key: string]: number } = {};

    this.transactions
      .filter((t) => t.type === "debit")
      .forEach((transaction) => {
        const merchant = transaction.merchant || "Unknown";
        merchantSpending[merchant] =
          (merchantSpending[merchant] || 0) + transaction.amount;
      });

    return Object.entries(merchantSpending)
      .map(([merchant, amount]) => ({ merchant, amount }))
      .sort((a, b) => b.amount - a.amount);
  }

  // Load sample data for demo
  loadSampleData() {
    const sampleTransactions: Transaction[] = [
      {
        id: "sample_001",
        date: new Date("2024-01-15").toISOString(),
        description: "Zomato Order - Biryani Paradise",
        amount: 450,
        type: "debit",
        category: "Food & Dining",
        source: "GPay",
        confidence: "High",
        categorizedBy: "Rule",
        merchant: "Zomato",
      },
      {
        id: "sample_002",
        date: new Date("2024-01-15").toISOString(),
        description: "NEFT Credit - Salary from TCS",
        amount: 75000,
        type: "credit",
        category: "Income",
        source: "Bank",
        confidence: "High",
        categorizedBy: "Rule",
        merchant: "TCS",
      },
      {
        id: "sample_003",
        date: new Date("2024-01-14").toISOString(),
        description: "Uber Ride - From Home to Office",
        amount: 180,
        type: "debit",
        category: "Transportation",
        source: "PhonePe",
        confidence: "High",
        categorizedBy: "Rule",
        merchant: "Uber",
      },
      {
        id: "sample_004",
        date: new Date("2024-01-14").toISOString(),
        description: "Amazon Pay - Electronics Purchase",
        amount: 15000,
        type: "debit",
        category: "Shopping",
        source: "GPay",
        confidence: "High",
        categorizedBy: "Rule",
        merchant: "Amazon",
      },
      {
        id: "sample_005",
        date: new Date("2024-01-13").toISOString(),
        description: "Netflix Monthly Subscription",
        amount: 649,
        type: "debit",
        category: "Entertainment",
        source: "GPay",
        confidence: "High",
        categorizedBy: "Rule",
        merchant: "Netflix",
      },
      {
        id: "sample_006",
        date: new Date("2024-01-12").toISOString(),
        description: "BigBasket Grocery Delivery",
        amount: 1200,
        type: "debit",
        category: "Shopping",
        source: "GPay",
        confidence: "High",
        categorizedBy: "Rule",
        merchant: "BigBasket",
      },
      {
        id: "sample_007",
        date: new Date("2024-01-11").toISOString(),
        description: "BPCL Petrol Payment",
        amount: 2800,
        type: "debit",
        category: "Transportation",
        source: "GPay",
        confidence: "High",
        categorizedBy: "Rule",
        merchant: "BPCL",
      },
      {
        id: "sample_008",
        date: new Date("2024-01-10").toISOString(),
        description: "Jio Mobile Recharge",
        amount: 299,
        type: "debit",
        category: "Bills & Utilities",
        source: "PhonePe",
        confidence: "High",
        categorizedBy: "Rule",
        merchant: "Jio",
      },
    ];

    this.addTransactions(sampleTransactions);
  }
}

// Create singleton instance
export const transactionStore = new TransactionStore();

// Load sample data for demo purposes
transactionStore.loadSampleData();

// Export types
export type { Transaction };

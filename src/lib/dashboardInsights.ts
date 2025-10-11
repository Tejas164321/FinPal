import type { Transaction } from "./fileProcessing";
import { getCategoryMeta } from "./categoryMeta";

export interface MonthlyTrendPoint {
  monthKey: string;
  label: string;
  income: number;
  expenses: number;
  savings: number;
  transactionCount: number;
}

export interface CategoryBreakdownItem {
  key: string;
  name: string;
  value: number;
  percentage: number;
  color: string;
  icon: string;
}

export interface BudgetInsight {
  category: string;
  icon: string;
  spent: number;
  allocated: number;
  percentage: number;
  color: string;
  exceeded: boolean;
}

export interface BudgetStatus {
  usagePercentage: number;
  exceededCount: number;
  totalAllocated: number;
  totalSpent: number;
}

export interface PeriodTotals {
  income: number;
  expenses: number;
  savings: number;
  savingsRate: number;
}

const MONTH_FORMATTER = new Intl.DateTimeFormat("en-IN", {
  month: "short",
  year: "2-digit",
});

export function sortTransactionsByDate(
  transactions: Transaction[],
): Transaction[] {
  return [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

function getAnchorDate(transactions: Transaction[]): Date {
  const [latest] = sortTransactionsByDate(transactions);
  return latest ? new Date(latest.date) : new Date();
}

export function filterTransactionsByMonths(
  transactions: Transaction[],
  months: number,
): Transaction[] {
  if (transactions.length === 0 || months <= 0) {
    return [];
  }

  const anchor = getAnchorDate(transactions);
  const periodStart = new Date(
    anchor.getFullYear(),
    anchor.getMonth() - months + 1,
    1,
  );
  const periodEnd = new Date(
    anchor.getFullYear(),
    anchor.getMonth() + 1,
    0,
    23,
    59,
    59,
    999,
  );

  return transactions.filter((transaction) => {
    const date = new Date(transaction.date);
    return date >= periodStart && date <= periodEnd;
  });
}

function buildMonthKey(date: Date) {
  return `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}`;
}

export function computeMonthlyTrends(
  transactions: Transaction[],
  monthsLimit = 6,
): MonthlyTrendPoint[] {
  if (transactions.length === 0) {
    return [];
  }

  const buckets = new Map<
    string,
    { income: number; expenses: number; transactionCount: number }
  >();

  transactions.forEach((transaction) => {
    const monthKey = buildMonthKey(new Date(transaction.date));
    const bucket = buckets.get(monthKey) ?? {
      income: 0,
      expenses: 0,
      transactionCount: 0,
    };

    if (transaction.type === "credit") {
      bucket.income += transaction.amount;
    } else {
      bucket.expenses += transaction.amount;
    }

    bucket.transactionCount += 1;
    buckets.set(monthKey, bucket);
  });

  const sorted = Array.from(buckets.entries()).sort((a, b) =>
    a[0].localeCompare(b[0]),
  );

  const trimmed = monthsLimit > 0 ? sorted.slice(-monthsLimit) : sorted;

  return trimmed.map(([monthKey, data]) => {
    const [year, month] = monthKey.split("-").map(Number);
    const date = new Date(year, (month ?? 1) - 1);

    return {
      monthKey,
      label: MONTH_FORMATTER.format(date),
      income: data.income,
      expenses: data.expenses,
      savings: data.income - data.expenses,
      transactionCount: data.transactionCount,
    };
  });
}

export function computeCategoryBreakdown(
  transactions: Transaction[],
  topCount = 6,
): CategoryBreakdownItem[] {
  if (transactions.length === 0) {
    return [];
  }

  const spendingByCategory = new Map<string, number>();

  transactions
    .filter((transaction) => transaction.type === "debit")
    .forEach((transaction) => {
      const current = spendingByCategory.get(transaction.category) ?? 0;
      spendingByCategory.set(
        transaction.category,
        current + transaction.amount,
      );
    });

  const sorted = Array.from(spendingByCategory.entries()).sort(
    (a, b) => b[1] - a[1],
  );

  if (sorted.length === 0) {
    return [];
  }

  const main = sorted.slice(0, topCount - 1);
  const remainder = sorted.slice(topCount - 1);
  const remainderTotal = remainder.reduce((acc, [, amount]) => acc + amount, 0);

  if (remainderTotal > 0) {
    main.push(["Others", remainderTotal]);
  }

  const totalSpent = sorted.reduce((acc, [, amount]) => acc + amount, 0);

  return main.map(([categoryKey, amount]) => {
    const meta = getCategoryMeta(categoryKey);
    const percentage = totalSpent > 0 ? (amount / totalSpent) * 100 : 0;

    return {
      key: categoryKey,
      name: meta.name,
      value: amount,
      percentage,
      color: meta.color,
      icon: meta.icon,
    };
  });
}

export function computeBudgetInsights(
  categoryBreakdown: CategoryBreakdownItem[],
): { budgets: BudgetInsight[]; status: BudgetStatus } {
  if (categoryBreakdown.length === 0) {
    return {
      budgets: [],
      status: {
        usagePercentage: 0,
        exceededCount: 0,
        totalAllocated: 0,
        totalSpent: 0,
      },
    };
  }

  const budgets = categoryBreakdown
    .filter((item) => item.value > 0)
    .map((item) => {
      const allocated = item.value * 1.2;
      const percentage = allocated > 0 ? (item.value / allocated) * 100 : 0;
      return {
        category: item.name,
        icon: item.icon,
        spent: item.value,
        allocated,
        percentage,
        color: item.color,
        exceeded: percentage >= 100,
      };
    });

  const totalAllocated = budgets.reduce((acc, item) => acc + item.allocated, 0);
  const totalSpent = budgets.reduce((acc, item) => acc + item.spent, 0);
  const usagePercentage =
    totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;
  const exceededCount = budgets.filter((item) => item.exceeded).length;

  return {
    budgets,
    status: {
      usagePercentage,
      exceededCount,
      totalAllocated,
      totalSpent,
    },
  };
}

export function computePeriodTotals(transactions: Transaction[]): PeriodTotals {
  if (transactions.length === 0) {
    return {
      income: 0,
      expenses: 0,
      savings: 0,
      savingsRate: 0,
    };
  }

  const income = transactions
    .filter((transaction) => transaction.type === "credit")
    .reduce((acc, transaction) => acc + transaction.amount, 0);

  const expenses = transactions
    .filter((transaction) => transaction.type === "debit")
    .reduce((acc, transaction) => acc + transaction.amount, 0);

  const savings = income - expenses;
  const savingsRate = income > 0 ? (savings / income) * 100 : 0;

  return { income, expenses, savings, savingsRate };
}

export function computeMonthOverMonthChange(
  monthlyTrends: MonthlyTrendPoint[],
): { incomeChange: number; expenseChange: number } {
  if (monthlyTrends.length < 2) {
    return { incomeChange: 0, expenseChange: 0 };
  }

  const latest = monthlyTrends[monthlyTrends.length - 1];
  const previous = monthlyTrends[monthlyTrends.length - 2];

  const incomeChange = previous.income
    ? ((latest.income - previous.income) / previous.income) * 100
    : 0;

  const expenseChange = previous.expenses
    ? ((latest.expenses - previous.expenses) / previous.expenses) * 100
    : 0;

  return { incomeChange, expenseChange };
}

export function computeRecentTransactions(
  transactions: Transaction[],
  limit = 5,
): Transaction[] {
  return sortTransactionsByDate(transactions).slice(0, limit);
}

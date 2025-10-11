import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import {
  AlertTriangle,
  Calendar,
  Check,
  Eye,
  EyeOff,
  PiggyBank,
  Target,
  TrendingDown,
  TrendingUp,
  Upload,
  Wallet,
} from "lucide-react";

import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { transactionStore } from "@/lib/transactionStore";
import type { Transaction } from "@/lib/transactionStore";
import {
  computeBudgetInsights,
  computeCategoryBreakdown,
  computeMonthOverMonthChange,
  computeMonthlyTrends,
  computePeriodTotals,
  computeRecentTransactions,
  filterTransactionsByMonths,
} from "@/lib/dashboardInsights";

const INR_FORMATTER = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const RELATIVE_TIME_FORMATTER = new Intl.RelativeTimeFormat("en", {
  numeric: "auto",
});

const periodOptions = [
  { label: "This Month", months: 1 },
  { label: "Last 3 Months", months: 3 },
  { label: "Last 6 Months", months: 6 },
  { label: "Last 12 Months", months: 12 },
] as const;

type PeriodOption = (typeof periodOptions)[number];

function formatCurrency(value: number) {
  const absolute = Math.abs(value);
  const formatted = INR_FORMATTER.format(absolute);
  return value < 0 ? `-₹${formatted}` : `₹${formatted}`;
}

function formatChangeText(value: number) {
  const absolute = Math.abs(value);
  if (!Number.isFinite(value) || absolute < 0.1) {
    return "No change vs last month";
  }
  const prefix = value > 0 ? "+" : "-";
  return `${prefix}${absolute.toFixed(1)}% vs last month`;
}

function formatRelativeTime(isoDate: string) {
  const timestamp = new Date(isoDate).getTime();
  if (Number.isNaN(timestamp)) {
    return "Unknown";
  }
  const now = Date.now();
  const diff = timestamp - now;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const month = 30 * day;

  if (Math.abs(diff) < hour) {
    return RELATIVE_TIME_FORMATTER.format(Math.round(diff / minute), "minute");
  }
  if (Math.abs(diff) < day) {
    return RELATIVE_TIME_FORMATTER.format(Math.round(diff / hour), "hour");
  }
  if (Math.abs(diff) < month) {
    return RELATIVE_TIME_FORMATTER.format(Math.round(diff / day), "day");
  }
  return RELATIVE_TIME_FORMATTER.format(Math.round(diff / month), "month");
}

const Dashboard = () => {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodOption>(
    periodOptions[0],
  );
  const [transactions, setTransactions] = useState<Transaction[]>(
    transactionStore.getAllTransactions(),
  );

  useEffect(() => {
    const unsubscribe = transactionStore.subscribe((updatedTransactions) => {
      setTransactions([...updatedTransactions]);
    });

    setTransactions(transactionStore.getAllTransactions());

    return unsubscribe;
  }, []);

  const monthlyTrends = useMemo(
    () => computeMonthlyTrends(transactions, 6),
    [transactions],
  );

  const { incomeChange, expenseChange } = useMemo(
    () => computeMonthOverMonthChange(monthlyTrends),
    [monthlyTrends],
  );

  const filteredTransactions = useMemo(
    () => filterTransactionsByMonths(transactions, selectedPeriod.months),
    [transactions, selectedPeriod],
  );

  const periodTotals = useMemo(
    () => computePeriodTotals(filteredTransactions),
    [filteredTransactions],
  );

  const categoryBreakdown = useMemo(
    () => computeCategoryBreakdown(filteredTransactions),
    [filteredTransactions],
  );

  const { budgets, status: budgetStatus } = useMemo(
    () => computeBudgetInsights(categoryBreakdown),
    [categoryBreakdown],
  );

  const recentTransactions = useMemo(
    () => computeRecentTransactions(transactions, 5),
    [transactions],
  );

  const monthlyChartData = useMemo(
    () =>
      monthlyTrends.map((trend) => ({
        month: trend.label,
        income: trend.income,
        expenses: trend.expenses,
        savings: trend.savings,
      })),
    [monthlyTrends],
  );

  const categoryChartData = useMemo(
    () =>
      categoryBreakdown.map((item) => ({
        name: item.name,
        value: item.value,
        color: item.color,
      })),
    [categoryBreakdown],
  );

  const totalIncome = periodTotals.income;
  const totalExpenses = periodTotals.expenses;
  const totalSavings = periodTotals.savings;
  const savingsPercentage = periodTotals.savingsRate;

  const budgetUsageDisplay = budgets.length
    ? `${Math.round(budgetStatus.usagePercentage)}%`
    : "--";
  const budgetStatusText = budgets.length
    ? `${budgetStatus.exceededCount} budget${
        budgetStatus.exceededCount === 1 ? "" : "s"
      } exceeded`
    : "No budgets yet";

  const hasTransactions = transactions.length > 0;

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-foreground/70">
            {hasTransactions
              ? "Your finances at a glance."
              : "Upload transactions to unlock personalized insights."}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="glass border-purple-500/50">
                <Calendar className="h-4 w-4 mr-2" />
                {selectedPeriod.label}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {periodOptions.map((option) => (
                <DropdownMenuItem
                  key={option.label}
                  onSelect={() => setSelectedPeriod(option)}
                  className={cn(
                    "flex items-center justify-between",
                    option.label === selectedPeriod.label &&
                      "text-purple-400 font-medium",
                  )}
                >
                  {option.label}
                  {option.label === selectedPeriod.label && (
                    <Check className="h-4 w-4" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Link to="/upload">
            <Button className="bg-purple-gradient">
              <Upload className="h-4 w-4 mr-2" />
              Upload Transactions
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="glass-card relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-green-600/10" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-foreground/70">
                Total Income
              </CardTitle>
              <button onClick={() => setBalanceVisible(!balanceVisible)}>
                {balanceVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-2xl font-bold text-green-400">
                {balanceVisible ? formatCurrency(totalIncome) : "₹••,•••"}
              </div>
              <div
                className={cn(
                  "flex items-center text-sm",
                  incomeChange >= 0 ? "text-green-400" : "text-red-400",
                )}
              >
                {incomeChange >= 0 ? (
                  <TrendingUp className="h-4 w-4 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 mr-1" />
                )}
                {formatChangeText(incomeChange)}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="glass-card relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-red-600/10" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-foreground/70">
                Total Expenses
              </CardTitle>
              <Wallet className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-2xl font-bold text-red-400">
                {balanceVisible ? formatCurrency(totalExpenses) : "₹••,•••"}
              </div>
              <div
                className={cn(
                  "flex items-center text-sm",
                  expenseChange >= 0 ? "text-red-400" : "text-green-400",
                )}
              >
                {expenseChange >= 0 ? (
                  <TrendingUp className="h-4 w-4 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 mr-1" />
                )}
                {formatChangeText(expenseChange)}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="glass-card relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-purple-600/10" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-foreground/70">
                Net Savings
              </CardTitle>
              <PiggyBank className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-2xl font-bold text-purple-400">
                {balanceVisible ? formatCurrency(totalSavings) : "₹••,•••"}
              </div>
              <div className="flex items-center text-sm text-purple-400">
                <TrendingUp className="h-4 w-4 mr-1" />
                {balanceVisible
                  ? `${savingsPercentage.toFixed(1)}% savings rate`
                  : "Savings hidden"}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="glass-card relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-yellow-600/10" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-foreground/70">
                Budget Status
              </CardTitle>
              <Target className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-2xl font-bold text-yellow-400">
                {budgetUsageDisplay}
              </div>
              <div className="flex items-center text-sm text-yellow-400">
                <AlertTriangle className="h-4 w-4 mr-1" />
                {budgetStatusText}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Monthly Trends
                <Badge className="bg-purple-gradient">
                  {monthlyChartData.length
                    ? `Last ${monthlyChartData.length} Month${
                        monthlyChartData.length === 1 ? "" : "s"
                      }`
                    : "Awaiting data"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {monthlyChartData.length ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="month"
                      stroke="#9CA3AF"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#9CA3AF"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(17, 24, 39, 0.8)",
                        border: "1px solid rgba(139, 92, 246, 0.3)",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number, name: string) => [
                        formatCurrency(value),
                        name.charAt(0).toUpperCase() + name.slice(1),
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="income"
                      stroke="#10b981"
                      fill="rgba(16, 185, 129, 0.1)"
                    />
                    <Area
                      type="monotone"
                      dataKey="expenses"
                      stroke="#ef4444"
                      fill="rgba(239, 68, 68, 0.1)"
                    />
                    <Area
                      type="monotone"
                      dataKey="savings"
                      stroke="#8b5cf6"
                      fill="rgba(139, 92, 246, 0.1)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[300px] items-center justify-center text-sm text-foreground/60">
                  No trend data for the selected period.
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Spending by Category</CardTitle>
            </CardHeader>
            <CardContent>
              {categoryChartData.length ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(17, 24, 39, 0.8)",
                        border: "1px solid rgba(139, 92, 246, 0.3)",
                        borderRadius: "8px",
                        color: "#ffffff",
                      }}
                      formatter={(value: number) => [
                        formatCurrency(value),
                        "Amount",
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[300px] items-center justify-center text-sm text-foreground/60">
                  No spending categories in the selected period.
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Budget Overview
                <Link to="/budgets">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-purple-400 border-purple-500/50"
                  >
                    Manage
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {budgets.length ? (
                budgets.map((budget) => (
                  <div key={budget.category} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <span className="text-purple-200">{budget.icon}</span>
                        {budget.category}
                      </span>
                      <span className="text-sm text-foreground/70">
                        {formatCurrency(budget.spent)} / {formatCurrency(budget.allocated)}
                      </span>
                    </div>
                    <Progress
                      value={Math.min(100, Number(budget.percentage.toFixed(1)))}
                      className={cn(
                        "h-2",
                        budget.exceeded ? "bg-red-900/20" : "bg-purple-900/20",
                      )}
                    />
                    {budget.exceeded ? (
                      <div className="flex items-center text-xs text-red-400">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Over allocated budget
                      </div>
                    ) : (
                      <div className="text-xs text-foreground/50">
                        {budget.percentage.toFixed(1)}% of smart budget used
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-sm text-foreground/60">
                  We generate dynamic category budgets once you have spending activity in the selected period.
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Recent Transactions
                <Link to="/transactions">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-purple-400 border-purple-500/50"
                  >
                    View All
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentTransactions.length ? (
                <div className="space-y-3">
                  {recentTransactions.map((transaction, index) => (
                    <motion.div
                      key={transaction.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-lg glass hover:bg-white/5 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="font-medium">
                          {transaction.description}
                        </div>
                        <div className="flex flex-wrap items-center text-xs text-foreground/60 mt-1 gap-2">
                          <Badge
                            variant="outline"
                            className="border-purple-500/40 text-purple-300"
                          >
                            {transaction.categorizedBy ?? "Unknown"}
                          </Badge>
                          {transaction.source && (
                            <Badge
                              variant="outline"
                              className="border-blue-500/40 text-blue-300"
                            >
                              {transaction.source}
                            </Badge>
                          )}
                          <span>·</span>
                          <span>{formatRelativeTime(transaction.date)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={cn(
                            "font-bold",
                            transaction.type === "credit"
                              ? "text-green-400"
                              : "text-red-400",
                          )}
                        >
                          {transaction.type === "credit" ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </div>
                        <div className="text-xs text-foreground/60">
                          {transaction.category}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-foreground/60">
                  No transactions available yet. Upload a statement to get started.
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Target,
  PiggyBank,
  AlertTriangle,
  Upload,
  Bot,
  Calendar,
  Filter,
  Download,
  Eye,
  EyeOff,
} from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";

// Mock data for demonstration
const monthlyData = [
  { month: "Jan", income: 85000, expenses: 62000, savings: 23000 },
  { month: "Feb", income: 85000, expenses: 58000, savings: 27000 },
  { month: "Mar", income: 90000, expenses: 65000, savings: 25000 },
  { month: "Apr", income: 85000, expenses: 70000, savings: 15000 },
  { month: "May", income: 95000, expenses: 68000, savings: 27000 },
  { month: "Jun", income: 85000, expenses: 72000, savings: 13000 },
];

const categoryData = [
  { name: "Food & Dining", value: 15000, color: "#8b5cf6" },
  { name: "Transportation", value: 8000, color: "#a855f7" },
  { name: "Shopping", value: 12000, color: "#9333ea" },
  { name: "Entertainment", value: 5000, color: "#7c3aed" },
  { name: "Bills & Utilities", value: 18000, color: "#6d28d9" },
  { name: "Others", value: 7000, color: "#5b21b6" },
];

const budgetData = [
  { category: "Food & Dining", allocated: 20000, spent: 15000, percentage: 75 },
  { category: "Transportation", allocated: 10000, spent: 8000, percentage: 80 },
  { category: "Shopping", allocated: 15000, spent: 12000, percentage: 80 },
  { category: "Entertainment", allocated: 8000, spent: 5000, percentage: 62.5 },
  { category: "Bills", allocated: 20000, spent: 18000, percentage: 90 },
];

const recentTransactions = [
  {
    id: 1,
    description: "Zomato Order",
    amount: -350,
    category: "Food",
    time: "2 hours ago",
    source: "AI",
  },
  {
    id: 2,
    description: "Salary Credit",
    amount: 85000,
    category: "Income",
    time: "Yesterday",
    source: "Rule",
  },
  {
    id: 3,
    description: "Uber Ride",
    amount: -180,
    category: "Transport",
    time: "Yesterday",
    source: "AI",
  },
  {
    id: 4,
    description: "Amazon Purchase",
    amount: -2500,
    category: "Shopping",
    time: "2 days ago",
    source: "Rule",
  },
  {
    id: 5,
    description: "Electricity Bill",
    amount: -1200,
    category: "Bills",
    time: "3 days ago",
    source: "AI",
  },
];

const Dashboard = () => {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("This Month");

  const totalIncome = 85000;
  const totalExpenses = 65000;
  const totalSavings = totalIncome - totalExpenses;
  const savingsPercentage = (totalSavings / totalIncome) * 100;

  return (
    <div className="min-h-screen bg-dark-gradient">
      <Sidebar />

      {/* Main Content */}
      <div className="ml-64 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-foreground/70">
              Welcome back! Here's your financial overview.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" className="glass border-purple-500/50">
              <Calendar className="h-4 w-4 mr-2" />
              {selectedPeriod}
            </Button>
            <Button className="bg-purple-gradient">
              <Upload className="h-4 w-4 mr-2" />
              Upload Transactions
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="glass-card relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-green-600/10"></div>
              <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-foreground/70">
                  Total Income
                </CardTitle>
                <button onClick={() => setBalanceVisible(!balanceVisible)}>
                  {balanceVisible ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </button>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-2xl font-bold text-green-400">
                  {balanceVisible
                    ? `₹${totalIncome.toLocaleString()}`
                    : "₹••,•••"}
                </div>
                <div className="flex items-center text-sm text-green-400">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +12% from last month
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
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-red-600/10"></div>
              <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-foreground/70">
                  Total Expenses
                </CardTitle>
                <Wallet className="h-4 w-4 text-red-400" />
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-2xl font-bold text-red-400">
                  {balanceVisible
                    ? `₹${totalExpenses.toLocaleString()}`
                    : "₹••,•••"}
                </div>
                <div className="flex items-center text-sm text-red-400">
                  <TrendingDown className="h-4 w-4 mr-1" />
                  -8% from last month
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
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-purple-600/10"></div>
              <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-foreground/70">
                  Net Savings
                </CardTitle>
                <PiggyBank className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-2xl font-bold text-purple-400">
                  {balanceVisible
                    ? `₹${totalSavings.toLocaleString()}`
                    : "₹••,•••"}
                </div>
                <div className="flex items-center text-sm text-purple-400">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  {savingsPercentage.toFixed(1)}% savings rate
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
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-yellow-600/10"></div>
              <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-foreground/70">
                  Budget Status
                </CardTitle>
                <Target className="h-4 w-4 text-yellow-400" />
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-2xl font-bold text-yellow-400">78%</div>
                <div className="flex items-center text-sm text-yellow-400">
                  <AlertTriangle className="h-4 w-4 mr-1" />2 budgets exceeded
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Spending Trends */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Monthly Trends
                  <Badge className="bg-purple-gradient">6 Months</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(17, 24, 39, 0.8)",
                        border: "1px solid rgba(139, 92, 246, 0.3)",
                        borderRadius: "8px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="income"
                      stackId="1"
                      stroke="#10b981"
                      fill="rgba(16, 185, 129, 0.1)"
                    />
                    <Area
                      type="monotone"
                      dataKey="expenses"
                      stackId="2"
                      stroke="#ef4444"
                      fill="rgba(239, 68, 68, 0.1)"
                    />
                    <Area
                      type="monotone"
                      dataKey="savings"
                      stackId="3"
                      stroke="#8b5cf6"
                      fill="rgba(139, 92, 246, 0.1)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Category Breakdown */}
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
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(17, 24, 39, 0.8)",
                        border: "1px solid rgba(139, 92, 246, 0.3)",
                        borderRadius: "8px",
                      }}
                      formatter={(value) => [
                        `₹${value.toLocaleString()}`,
                        "Amount",
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Budget Overview and Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Budget Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Budget Overview
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-purple-400 border-purple-500/50"
                  >
                    Manage
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {budgetData.map((budget, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        {budget.category}
                      </span>
                      <span className="text-sm text-foreground/70">
                        ₹{budget.spent.toLocaleString()} / ₹
                        {budget.allocated.toLocaleString()}
                      </span>
                    </div>
                    <Progress
                      value={budget.percentage}
                      className={`h-2 ${
                        budget.percentage > 85
                          ? "bg-red-900/20"
                          : "bg-purple-900/20"
                      }`}
                    />
                    {budget.percentage > 85 && (
                      <div className="flex items-center text-xs text-red-400">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Budget exceeded
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Transactions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Recent Transactions
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-purple-400 border-purple-500/50"
                  >
                    View All
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
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
                        <div className="flex items-center text-xs text-foreground/60 mt-1">
                          <Badge
                            variant="outline"
                            className={`mr-2 text-xs ${
                              transaction.source === "AI"
                                ? "border-purple-500/50 text-purple-400"
                                : "border-blue-500/50 text-blue-400"
                            }`}
                          >
                            {transaction.source}
                          </Badge>
                          {transaction.time}
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`font-bold ${
                            transaction.amount > 0
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {transaction.amount > 0 ? "+" : ""}₹
                          {Math.abs(transaction.amount).toLocaleString()}
                        </div>
                        <div className="text-xs text-foreground/60">
                          {transaction.category}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

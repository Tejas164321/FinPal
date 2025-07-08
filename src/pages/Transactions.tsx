import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AppLayout from "@/components/layout/AppLayout";
import { Link } from "react-router-dom";
import {
  Upload,
  Filter,
  Search,
  Download,
  Calendar,
  TrendingDown,
  TrendingUp,
  MoreHorizontal,
  Eye,
  FileText,
  ArrowUpDown,
} from "lucide-react";

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "debit" | "credit";
  category: string;
  source: string;
  confidence: string;
  categorizedBy: string;
  merchant?: string;
}

// Mock transaction data - this would come from uploaded files in real app
const mockTransactions: Transaction[] = [
  {
    id: "txn_001",
    date: "2024-01-15T00:00:00.000Z",
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
    id: "txn_002",
    date: "2024-01-15T00:00:00.000Z",
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
    id: "txn_003",
    date: "2024-01-14T00:00:00.000Z",
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
    id: "txn_004",
    date: "2024-01-14T00:00:00.000Z",
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
    id: "txn_005",
    date: "2024-01-13T00:00:00.000Z",
    description: "Netflix Monthly Subscription",
    amount: 649,
    type: "debit",
    category: "Entertainment",
    source: "GPay",
    confidence: "High",
    categorizedBy: "Rule",
    merchant: "Netflix",
  },
];

const Transactions = () => {
  const [transactions, setTransactions] =
    useState<Transaction[]>(mockTransactions);
  const [filteredTransactions, setFilteredTransactions] =
    useState<Transaction[]>(mockTransactions);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Get unique categories from transactions
  const categories = Array.from(new Set(transactions.map((t) => t.category)));

  // Filter and sort transactions
  useEffect(() => {
    let filtered = transactions.filter((transaction) => {
      const matchesSearch =
        transaction.description
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        transaction.merchant?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || transaction.category === selectedCategory;
      const matchesType =
        selectedType === "all" || transaction.type === selectedType;

      return matchesSearch && matchesCategory && matchesType;
    });

    // Sort transactions
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "amount":
          aValue = a.amount;
          bValue = b.amount;
          break;
        case "category":
          aValue = a.category;
          bValue = b.category;
          break;
        default: // date
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredTransactions(filtered);
  }, [
    transactions,
    searchTerm,
    selectedCategory,
    selectedType,
    sortBy,
    sortOrder,
  ]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatAmount = (amount: number, type: "debit" | "credit") => {
    const formatted = amount.toLocaleString("en-IN");
    return type === "credit" ? `+₹${formatted}` : `-₹${formatted}`;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      "Food & Dining": "bg-orange-500/10 text-orange-400 border-orange-500/20",
      Transportation: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      Shopping: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      Entertainment: "bg-pink-500/10 text-pink-400 border-pink-500/20",
      "Bills & Utilities":
        "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      Income: "bg-green-500/10 text-green-400 border-green-500/20",
      Healthcare: "bg-red-500/10 text-red-400 border-red-500/20",
      Investment: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    };
    return (
      colors[category as keyof typeof colors] ||
      "bg-gray-500/10 text-gray-400 border-gray-500/20"
    );
  };

  const getConfidenceColor = (confidence: string) => {
    const colors = {
      High: "bg-green-500/10 text-green-400 border-green-500/20",
      Medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      Low: "bg-red-500/10 text-red-400 border-red-500/20",
    };
    return (
      colors[confidence as keyof typeof colors] ||
      "bg-gray-500/10 text-gray-400 border-gray-500/20"
    );
  };

  const getTotalsByType = () => {
    const debits = filteredTransactions
      .filter((t) => t.type === "debit")
      .reduce((sum, t) => sum + t.amount, 0);
    const credits = filteredTransactions
      .filter((t) => t.type === "credit")
      .reduce((sum, t) => sum + t.amount, 0);
    return { debits, credits, net: credits - debits };
  };

  const totals = getTotalsByType();

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Transaction History</h1>
          <p className="text-foreground/70">
            View and analyze all your UPI transactions with AI-powered
            categorization
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground/60">
                    Total Transactions
                  </p>
                  <p className="text-2xl font-bold text-purple-400">
                    {filteredTransactions.length}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground/60">Total Credits</p>
                  <p className="text-2xl font-bold text-green-400">
                    ₹{totals.credits.toLocaleString("en-IN")}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground/60">Total Debits</p>
                  <p className="text-2xl font-bold text-red-400">
                    ₹{totals.debits.toLocaleString("en-IN")}
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground/60">Net Amount</p>
                  <p
                    className={`text-2xl font-bold ${totals.net >= 0 ? "text-green-400" : "text-red-400"}`}
                  >
                    {totals.net >= 0 ? "+" : ""}₹
                    {totals.net.toLocaleString("en-IN")}
                  </p>
                </div>
                <ArrowUpDown className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Controls */}
        <Card className="glass-card mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Filters & Search</span>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  className="glass border-purple-500/50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Link to="/upload">
                  <Button className="bg-purple-gradient">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload More Files
                  </Button>
                </Link>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-foreground/50" />
                  <Input
                    id="search"
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 glass border-white/10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="glass border-white/10">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent className="glass border-white/10">
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="glass border-white/10">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent className="glass border-white/10">
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="debit">Debit</SelectItem>
                    <SelectItem value="credit">Credit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="sort">Sort By</Label>
                <Select
                  value={`${sortBy}-${sortOrder}`}
                  onValueChange={(value) => {
                    const [field, order] = value.split("-");
                    setSortBy(field);
                    setSortOrder(order as "asc" | "desc");
                  }}
                >
                  <SelectTrigger className="glass border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass border-white/10">
                    <SelectItem value="date-desc">
                      Date (Newest First)
                    </SelectItem>
                    <SelectItem value="date-asc">
                      Date (Oldest First)
                    </SelectItem>
                    <SelectItem value="amount-desc">
                      Amount (High to Low)
                    </SelectItem>
                    <SelectItem value="amount-asc">
                      Amount (Low to High)
                    </SelectItem>
                    <SelectItem value="category-asc">Category (A-Z)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>
              Transaction Details ({filteredTransactions.length} transactions)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredTransactions.length === 0 ? (
              <Alert className="glass border-yellow-500/50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No transactions found matching your filters. Try adjusting
                  your search criteria or upload transaction files.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10">
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Confidence</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <motion.tr
                        key={transaction.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border-white/10 hover:bg-white/5 transition-colors"
                      >
                        <TableCell className="font-medium">
                          {formatDate(transaction.date)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {transaction.description}
                            </div>
                            {transaction.merchant && (
                              <div className="text-sm text-foreground/60">
                                via {transaction.merchant}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={getCategoryColor(transaction.category)}
                          >
                            {transaction.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="border-purple-500/50 text-purple-400"
                          >
                            {transaction.source}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={getConfidenceColor(
                              transaction.confidence,
                            )}
                          >
                            {transaction.confidence}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          <span
                            className={
                              transaction.type === "credit"
                                ? "text-green-400"
                                : "text-red-400"
                            }
                          >
                            {formatAmount(transaction.amount, transaction.type)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Empty State for New Users */}
        {transactions.length === 0 && (
          <Card className="glass-card">
            <CardContent className="text-center py-12">
              <Upload className="h-16 w-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                No Transactions Yet
              </h3>
              <p className="text-foreground/60 mb-6 max-w-md mx-auto">
                Upload your UPI transaction history from GPay, PhonePe, or bank
                statements to get started with AI-powered analysis.
              </p>
              <Link to="/upload">
                <Button className="bg-purple-gradient">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Your First File
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default Transactions;

import { useState, useEffect, useMemo, useCallback } from "react";
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
import { Progress } from "@/components/ui/progress";
import AppLayout from "@/components/layout/AppLayout";
import { transactionStore, type Transaction } from "@/lib/transactionStore";
import {
  getCategoryMeta,
  listKnownCategories,
  normalizeCategoryName,
} from "@/lib/categoryMeta";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  Upload,
  Search,
  Download,
  TrendingDown,
  TrendingUp,
  FileText,
  ArrowUpDown,
  AlertCircle,
  Filter,
  MoreHorizontal,
  Bot,
  Sparkles,
  UserCheck,
  HelpCircle,
} from "lucide-react";

import type { ConfidenceLevel } from "@/lib/fileProcessing";

const CONFIDENCE_LEVELS: ConfidenceLevel[] = ["High", "Medium", "Low"];

const SOURCE_BADGE_CLASSES: Record<string, string> = {
  GPay: "border-sky-500/30 text-sky-300",
  PhonePe: "border-purple-500/40 text-purple-300",
  Paytm: "border-blue-500/40 text-blue-300",
  Bank: "border-emerald-500/40 text-emerald-300",
  Wallet: "border-amber-500/40 text-amber-300",
  Unknown: "border-slate-500/40 text-slate-300",
};

interface MethodBadgeMeta {
  label: string;
  icon: LucideIcon;
  className: string;
}

const METHOD_META: Record<string, MethodBadgeMeta> = {
  ai: {
    label: "Gemini AI",
    icon: Bot,
    className: "bg-sky-500/10 text-sky-200 border-sky-500/30",
  },
  keywords: {
    label: "Smart Rules",
    icon: Sparkles,
    className: "bg-violet-500/10 text-violet-200 border-violet-500/30",
  },
  rule: {
    label: "Smart Rules",
    icon: Sparkles,
    className: "bg-violet-500/10 text-violet-200 border-violet-500/30",
  },
  manual: {
    label: "Manual Tag",
    icon: UserCheck,
    className: "bg-amber-500/10 text-amber-200 border-amber-500/30",
  },
  default: {
    label: "Auto",
    icon: HelpCircle,
    className: "bg-slate-500/10 text-slate-200 border-slate-500/30",
  },
};

const CONFIDENCE_BADGE_CLASS: Record<ConfidenceLevel, string> = {
  High: "bg-green-500/10 text-green-300 border-green-500/30",
  Medium: "bg-yellow-500/10 text-yellow-300 border-yellow-500/30",
  Low: "bg-red-500/10 text-red-300 border-red-500/30",
};

const toCsvValue = (value: string | number | null | undefined) =>
  `"${String(value ?? "").replace(/"/g, '""')}"`;

const formatMethodLabel = (value: string) =>
  value
    .split(/[\s_-]+/g)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");

const getMethodMeta = (rawMethod?: string): MethodBadgeMeta => {
  if (!rawMethod) {
    return METHOD_META.default;
  }

  const methodKey = rawMethod.toLowerCase();

  if (METHOD_META[methodKey]) {
    return METHOD_META[methodKey];
  }

  return {
    label: formatMethodLabel(rawMethod),
    icon: METHOD_META.default.icon,
    className: METHOD_META.default.className,
  };
};

const getSourceBadgeClass = (source: string) =>
  SOURCE_BADGE_CLASSES[source] ?? SOURCE_BADGE_CLASSES.Unknown;

const Transactions = () => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    const loadTransactions = () => {
      setTransactions(transactionStore.getAllTransactions());
    };

    loadTransactions();
    const unsubscribe = transactionStore.subscribe(loadTransactions);
    return unsubscribe;
  }, []);

  const categoryOptions = useMemo(() => {
    const categories = new Set<string>(listKnownCategories());
    transactions.forEach((transaction) => {
      categories.add(normalizeCategoryName(transaction.category));
    });
    return Array.from(categories).sort((a, b) => a.localeCompare(b));
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    const filtered = transactions.filter((transaction) => {
      const normalizedCategory = normalizeCategoryName(transaction.category);
      const matchesCategory =
        selectedCategory === "all" || normalizedCategory === selectedCategory;
      const matchesType =
        selectedType === "all" || transaction.type === selectedType;
      const matchesSearch =
        search.length === 0 ||
        transaction.description.toLowerCase().includes(search) ||
        transaction.merchant?.toLowerCase().includes(search);

      return matchesCategory && matchesType && matchesSearch;
    });

    const sorted = [...filtered];

    sorted.sort((a, b) => {
      switch (sortBy) {
        case "amount": {
          const aAmount = Number(a.amount) || 0;
          const bAmount = Number(b.amount) || 0;
          return sortOrder === "asc" ? aAmount - bAmount : bAmount - aAmount;
        }
        case "category": {
          const aCategory = normalizeCategoryName(a.category);
          const bCategory = normalizeCategoryName(b.category);
          return sortOrder === "asc"
            ? aCategory.localeCompare(bCategory)
            : bCategory.localeCompare(aCategory);
        }
        default: {
          const aTime = new Date(a.date).getTime();
          const bTime = new Date(b.date).getTime();
          return sortOrder === "asc" ? aTime - bTime : bTime - aTime;
        }
      }
    });

    return sorted;
  }, [transactions, searchTerm, selectedCategory, selectedType, sortBy, sortOrder]);

  const totals = useMemo(() => {
    const debits = filteredTransactions
      .filter((transaction) => transaction.type === "debit")
      .reduce((sum, transaction) => sum + transaction.amount, 0);
    const credits = filteredTransactions
      .filter((transaction) => transaction.type === "credit")
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    return {
      debits,
      credits,
      net: credits - debits,
    };
  }, [filteredTransactions]);

  const dateRange = useMemo(() => {
    if (filteredTransactions.length === 0) {
      return null;
    }

    const dates = filteredTransactions
      .map((transaction) => new Date(transaction.date))
      .filter((date) => !Number.isNaN(date.getTime()))
      .sort((a, b) => a.getTime() - b.getTime());

    if (dates.length === 0) {
      return null;
    }

    return {
      from: dates[0].toISOString(),
      to: dates[dates.length - 1].toISOString(),
    };
  }, [filteredTransactions]);

  const categoryInsights = useMemo(() => {
    const totalsByCategory = new Map<
      string,
      { amount: number; count: number }
    >();

    filteredTransactions
      .filter((transaction) => transaction.type === "debit")
      .forEach((transaction) => {
        const key = normalizeCategoryName(transaction.category);
        const entry = totalsByCategory.get(key) ?? { amount: 0, count: 0 };
        entry.amount += transaction.amount;
        entry.count += 1;
        totalsByCategory.set(key, entry);
      });

    return Array.from(totalsByCategory.entries())
      .map(([category, value]) => ({
        category,
        amount: value.amount,
        count: value.count,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions]);

  const topCategories = categoryInsights.slice(0, 3);

  const confidenceBreakdown = useMemo(() => {
    const counts: Record<ConfidenceLevel, number> = {
      High: 0,
      Medium: 0,
      Low: 0,
    };

    filteredTransactions.forEach((transaction) => {
      const level = (transaction.categoryConfidence ||
        transaction.confidence ||
        "Medium") as ConfidenceLevel;
      counts[level] = (counts[level] || 0) + 1;
    });

    const total = filteredTransactions.length || 1;

    return CONFIDENCE_LEVELS.map((level) => ({
      level,
      count: counts[level] || 0,
      percentage:
        filteredTransactions.length === 0
          ? 0
          : Math.round(((counts[level] || 0) / total) * 100),
    }));
  }, [filteredTransactions]);

  const formatDate = useCallback((value: string) => {
    if (!value) {
      return "—";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }, []);

  const formatAmount = useCallback((amount: number, type: "debit" | "credit") => {
    const normalizedAmount = Number.isFinite(amount)
      ? amount
      : Number(amount) || 0;
    const formatted = normalizedAmount.toLocaleString("en-IN");
    return type === "credit" ? `+₹${formatted}` : `-₹${formatted}`;
  }, []);

  const handleResetFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedType("all");
    setSortBy("date");
    setSortOrder("desc");
    toast({
      title: "Filters reset",
      description: "Showing all transactions again.",
    });
  }, [toast]);

  const handleExportCsv = useCallback(() => {
    if (filteredTransactions.length === 0) {
      toast({
        title: "No transactions to export",
        description: "Adjust your filters or upload files to export data.",
        variant: "destructive",
      });
      return;
    }

    const header = [
      "Date",
      "Description",
      "Merchant",
      "Category",
      "Type",
      "Amount",
      "Source",
      "Confidence",
      "Method",
    ];

    const rows = filteredTransactions.map((transaction) => {
      const method =
        transaction.categoryMethod || transaction.categorizedBy || "Auto";
      const confidence =
        transaction.categoryConfidence || transaction.confidence || "Medium";

      return [
        toCsvValue(new Date(transaction.date).toISOString()),
        toCsvValue(transaction.description),
        toCsvValue(transaction.merchant ?? ""),
        toCsvValue(transaction.category),
        toCsvValue(transaction.type),
        toCsvValue(transaction.amount),
        toCsvValue(transaction.source),
        toCsvValue(confidence),
        toCsvValue(method),
      ].join(",");
    });

    const csv = [header.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().split("T")[0];
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `finpal-transactions-${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Export complete",
      description: `Downloaded ${filteredTransactions.length} transactions as CSV.`,
    });
  }, [filteredTransactions, toast]);

  const hasSampleData = transactions.some((transaction) =>
    transaction.id.startsWith("sample_"),
  );
  const hasRealData = transactions.some((transaction) =>
    !transaction.id.startsWith("sample_"),
  );

  const handleClearSampleData = useCallback(() => {
    transactionStore.forceClearSampleData();
    toast({
      title: "Sample data cleared",
      description: "Only your uploaded transactions are visible now.",
    });
  }, [toast]);

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Transaction History</h1>
          <p className="text-foreground/70">
            Monitor every transaction with hybrid categorization powered by
            smart rules and Gemini AI.
          </p>
        </div>

        {hasSampleData && hasRealData && (
          <Alert className="glass border-yellow-500/50 mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex flex-wrap items-center justify-between gap-4">
              <span>
                Sample transactions are still visible alongside your uploads.
                Remove them for an accurate view.
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearSampleData}
                className="border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/10"
              >
                Clear sample data
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="glass-card">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground/60">
                    Total Transactions
                  </p>
                  <p className="text-2xl font-bold text-purple-300">
                    {filteredTransactions.length}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-purple-300" />
              </div>
              {dateRange && (
                <p className="text-xs text-foreground/50">
                  {formatDate(dateRange.from)} – {formatDate(dateRange.to)}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground/60">Total Credits</p>
                  <p className="text-2xl font-bold text-green-300">
                    ₹{totals.credits.toLocaleString("en-IN")}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-300" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground/60">Total Debits</p>
                  <p className="text-2xl font-bold text-red-300">
                    ₹{totals.debits.toLocaleString("en-IN")}
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-300" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground/60">Net Amount</p>
                  <p
                    className={cn(
                      "text-2xl font-bold",
                      totals.net >= 0 ? "text-green-300" : "text-red-300",
                    )}
                  >
                    {totals.net >= 0 ? "+" : "-"}₹
                    {Math.abs(totals.net).toLocaleString("en-IN")}
                  </p>
                </div>
                <ArrowUpDown className="h-8 w-8 text-purple-300" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <span>Top Spending Categories</span>
                <Badge variant="outline" className="border-purple-500/40">
                  {filteredTransactions.length} tx
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topCategories.length === 0 ? (
                <p className="text-sm text-foreground/60">
                  Upload transactions to see where your money goes.
                </p>
              ) : (
                <div className="space-y-4">
                  {topCategories.map((entry) => {
                    const meta = getCategoryMeta(entry.category);
                    return (
                      <div
                        key={entry.category}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{meta.icon}</span>
                          <div>
                            <p className="font-medium">{meta.name}</p>
                            <p className="text-xs text-foreground/50">
                              {entry.count} transaction{entry.count > 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                        <p className="font-mono text-sm text-foreground/70">
                          ₹{entry.amount.toLocaleString("en-IN")}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Categorization Confidence</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {confidenceBreakdown.map(({ level, count, percentage }) => (
                <div key={level} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge className={cn("gap-2", CONFIDENCE_BADGE_CLASS[level])}>
                      {level}
                    </Badge>
                    <span className="text-sm text-foreground/60">
                      {count} tx · {percentage}%
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2 bg-white/5" />
                </div>
              ))}
              {filteredTransactions.length === 0 && (
                <p className="text-sm text-foreground/60">
                  Confidence scores will appear once you upload transactions.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="glass-card mb-6">
          <CardHeader>
            <CardTitle className="flex flex-wrap items-center justify-between gap-3">
              <span>Filters &amp; Search</span>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  className="glass border-purple-500/40"
                  onClick={handleExportCsv}
                  disabled={filteredTransactions.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Button
                  variant="ghost"
                  className="glass border-white/10"
                  onClick={handleResetFilters}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Link to="/upload">
                  <Button className="bg-purple-gradient">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload more files
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
                    placeholder="Merchant, description, amount..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
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
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent className="glass border-white/10">
                    <SelectItem value="all">All categories</SelectItem>
                    {categoryOptions.map((category) => {
                      const meta = getCategoryMeta(category);
                      return (
                        <SelectItem key={category} value={category}>
                          <span className="flex items-center gap-2">
                            <span>{meta.icon}</span>
                            {meta.name}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="glass border-white/10">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent className="glass border-white/10">
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="debit">Debit</SelectItem>
                    <SelectItem value="credit">Credit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="sort">Sort by</Label>
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
                    <SelectItem value="date-desc">Date (newest first)</SelectItem>
                    <SelectItem value="date-asc">Date (oldest first)</SelectItem>
                    <SelectItem value="amount-desc">Amount (high to low)</SelectItem>
                    <SelectItem value="amount-asc">Amount (low to high)</SelectItem>
                    <SelectItem value="category-asc">Category (A–Z)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>
              Transaction Details ({filteredTransactions.length} transactions)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredTransactions.length === 0 ? (
              <Alert className="glass border-yellow-500/40">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
                  <span>
                    No transactions match your filters right now. Try uploading a
                    new file or reset the filters.
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-yellow-500/40 text-yellow-300 hover:bg-yellow-500/10"
                      onClick={handleResetFilters}
                    >
                      Reset filters
                    </Button>
                    <Link to="/upload">
                      <Button size="sm" className="bg-purple-gradient">
                        <Upload className="h-3 w-3 mr-2" />
                        Upload file
                      </Button>
                    </Link>
                  </div>
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
                      <TableHead>Method</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead aria-label="Actions" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => {
                      const categoryMeta = getCategoryMeta(transaction.category);
                      const methodMeta = getMethodMeta(
                        transaction.categoryMethod || transaction.categorizedBy,
                      );
                      const confidenceLevel = (
                        transaction.categoryConfidence ||
                        transaction.confidence ||
                        "Medium"
                      ) as ConfidenceLevel;

                      return (
                        <motion.tr
                          key={transaction.id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="border-white/10 hover:bg-white/5 transition-colors"
                        >
                          <TableCell className="font-medium">
                            {formatDate(transaction.date)}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-medium">
                                {transaction.description}
                              </p>
                              {transaction.merchant && (
                                <p className="text-xs text-foreground/60">
                                  via {transaction.merchant}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={cn(
                                "gap-2",
                                categoryMeta.badgeClass,
                                "border",
                              )}
                            >
                              <span>{categoryMeta.icon}</span>
                              {categoryMeta.name}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn(
                                "border px-3",
                                getSourceBadgeClass(transaction.source),
                              )}
                            >
                              {transaction.source}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={cn(
                                "gap-2",
                                CONFIDENCE_BADGE_CLASS[confidenceLevel],
                                "border",
                              )}
                            >
                              {confidenceLevel}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={cn("gap-2 border", methodMeta.className)}
                            >
                              <methodMeta.icon className="h-3.5 w-3.5" />
                              {methodMeta.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            <span
                              className={cn(
                                transaction.type === "credit"
                                  ? "text-green-300"
                                  : "text-red-300",
                              )}
                            >
                              {formatAmount(transaction.amount, transaction.type)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label="Transaction actions"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </motion.tr>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {transactions.length === 0 && (
          <Card className="glass-card mt-6">
            <CardContent className="text-center py-12 space-y-4">
              <Upload className="h-16 w-16 text-purple-300 mx-auto" />
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">No transactions yet</h3>
                <p className="text-foreground/60 max-w-md mx-auto">
                  Export your statements from GPay, PhonePe, Paytm, or your bank
                  and upload them to unlock spending insights instantly.
                </p>
              </div>
              <div className="grid gap-2 text-sm text-foreground/50">
                <span>Supported formats: CSV, PDF, XLS, XLSX (max 10 MB)</span>
                <span>We automatically categorize every line item for you.</span>
              </div>
              <Link to="/upload">
                <Button className="bg-purple-gradient">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload your first file
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

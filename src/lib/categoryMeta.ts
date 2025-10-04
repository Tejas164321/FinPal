export interface CategoryMeta {
  name: string;
  icon: string;
  color: string;
  badgeClass: string;
}

const CATEGORY_META: Record<string, CategoryMeta> = {
  "Food & Dining": {
    name: "Food & Dining",
    icon: "🍽️",
    color: "#f59e0b",
    badgeClass:
      "bg-amber-500/10 text-amber-300 border border-amber-500/20",
  },
  Groceries: {
    name: "Groceries",
    icon: "🛒",
    color: "#10b981",
    badgeClass:
      "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20",
  },
  Transport: {
    name: "Transport",
    icon: "🚗",
    color: "#3b82f6",
    badgeClass:
      "bg-sky-500/10 text-sky-300 border border-sky-500/20",
  },
  Shopping: {
    name: "Shopping",
    icon: "🛍️",
    color: "#8b5cf6",
    badgeClass:
      "bg-violet-500/10 text-violet-300 border border-violet-500/20",
  },
  Entertainment: {
    name: "Entertainment",
    icon: "🎬",
    color: "#ef4444",
    badgeClass:
      "bg-rose-500/10 text-rose-300 border border-rose-500/20",
  },
  "Bills & Utilities": {
    name: "Bills & Utilities",
    icon: "⚡",
    color: "#f97316",
    badgeClass:
      "bg-orange-500/10 text-orange-300 border border-orange-500/20",
  },
  "Health & Medical": {
    name: "Health & Medical",
    icon: "🏥",
    color: "#06b6d4",
    badgeClass:
      "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20",
  },
  "Money Transfer": {
    name: "Money Transfer",
    icon: "💸",
    color: "#84cc16",
    badgeClass:
      "bg-lime-500/10 text-lime-300 border border-lime-500/20",
  },
  Investment: {
    name: "Investment",
    icon: "📈",
    color: "#6366f1",
    badgeClass:
      "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20",
  },
  Education: {
    name: "Education",
    icon: "📚",
    color: "#d946ef",
    badgeClass:
      "bg-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-500/20",
  },
  Income: {
    name: "Income",
    icon: "💼",
    color: "#22c55e",
    badgeClass:
      "bg-green-500/10 text-green-300 border border-green-500/20",
  },
  Others: {
    name: "Others",
    icon: "📄",
    color: "#6b7280",
    badgeClass:
      "bg-slate-500/10 text-slate-300 border border-slate-500/20",
  },
};

const CATEGORY_ALIASES: Record<string, string> = {
  Transportation: "Transport",
  Transfer: "Money Transfer",
  "Bills": "Bills & Utilities",
  "Health": "Health & Medical",
};

export function getCategoryMeta(category: string): CategoryMeta {
  const normalized = CATEGORY_ALIASES[category] ?? category;
  return CATEGORY_META[normalized] ?? CATEGORY_META.Others;
}

export function listKnownCategories(): string[] {
  return Object.keys(CATEGORY_META);
}

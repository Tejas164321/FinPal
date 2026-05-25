export enum BudgetCategory {
  Food = "Food",
  Transport = "Transport",
  Shopping = "Shopping",
  Entertainment = "Entertainment",
  Bills = "Bills",
  Health = "Health",
  Education = "Education",
  Other = "Other",
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  month: string; // YYYY-MM
  color: string;
}

/**
 * Default categories seeded for every new user. Colors are assigned from the
 * fixed 8-slot categorical palette, in this fixed order, and reused (never
 * re-ordered) once a category passes slot 8 — those categories still carry a
 * unique name + icon, so color stops being the identity channel for them.
 */
export const CATEGORICAL_PALETTE = [
  "#2a78d6", // blue
  "#eb6834", // orange
  "#1baf7a", // aqua
  "#eda100", // yellow
  "#e87ba4", // magenta
  "#008300", // green
  "#4a3aa7", // violet
  "#e34948", // red
] as const;

export const CATEGORICAL_PALETTE_DARK = [
  "#3987e5",
  "#d95926",
  "#199e70",
  "#c98500",
  "#d55181",
  "#008300",
  "#9085e9",
  "#e66767",
] as const;

export interface DefaultCategorySeed {
  name: string;
  icon: string;
  type: "EXPENSE" | "INCOME";
}

export const DEFAULT_EXPENSE_CATEGORIES: DefaultCategorySeed[] = [
  { name: "Groceries", icon: "ShoppingCart", type: "EXPENSE" },
  { name: "Dining", icon: "Utensils", type: "EXPENSE" },
  { name: "Transportation", icon: "Car", type: "EXPENSE" },
  { name: "Shopping", icon: "ShoppingBag", type: "EXPENSE" },
  { name: "Clothing", icon: "Shirt", type: "EXPENSE" },
  { name: "Housing", icon: "Home", type: "EXPENSE" },
  { name: "Utilities", icon: "Zap", type: "EXPENSE" },
  { name: "Entertainment", icon: "Film", type: "EXPENSE" },
  { name: "Health", icon: "HeartPulse", type: "EXPENSE" },
  { name: "Education", icon: "GraduationCap", type: "EXPENSE" },
  { name: "Travel", icon: "Plane", type: "EXPENSE" },
  { name: "Subscriptions", icon: "Repeat", type: "EXPENSE" },
  { name: "Other", icon: "MoreHorizontal", type: "EXPENSE" },
];

export const DEFAULT_INCOME_CATEGORIES: DefaultCategorySeed[] = [
  { name: "Salary", icon: "Wallet", type: "INCOME" },
  { name: "Freelance", icon: "Briefcase", type: "INCOME" },
  { name: "Bonus", icon: "Gift", type: "INCOME" },
  { name: "Investment", icon: "TrendingUp", type: "INCOME" },
  { name: "Other Income", icon: "MoreHorizontal", type: "INCOME" },
];

export function assignPaletteColor(index: number, dark = false): string {
  const palette = dark ? CATEGORICAL_PALETTE_DARK : CATEGORICAL_PALETTE;
  return palette[index % palette.length];
}

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: "Cash",
  CREDIT_CARD: "Credit Card",
  DEBIT_CARD: "Debit Card",
  BANK_TRANSFER: "Bank Transfer",
  OTHER: "Other",
};

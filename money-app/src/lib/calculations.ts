/**
 * Pure financial calculation functions. All money values are integer minor
 * units (e.g. cents). None of these touch the database or the clock, so they
 * are fully unit-testable and reusable between server and client.
 */

export interface CalcTransaction {
  id: string;
  type: "INCOME" | "EXPENSE";
  amountMinor: number;
  date: Date;
  categoryId: string | null;
}

export interface CalcCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface CategoryBreakdownEntry {
  categoryId: string | null;
  name: string;
  icon: string;
  color: string;
  totalMinor: number;
  percent: number;
  count: number;
}

export interface MonthlyTotal {
  month: Date;
  incomeMinor: number;
  expenseMinor: number;
  remainingMinor: number;
}

/** Sum of expense transaction amounts, as a positive magnitude. */
export function calculateTotalExpenses(transactions: CalcTransaction[]): number {
  return transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + Math.abs(t.amountMinor), 0);
}

export function calculateTotalIncome(transactions: CalcTransaction[]): number {
  return transactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + Math.abs(t.amountMinor), 0);
}

export function calculateRemainingBalance(totalIncomeMinor: number, totalExpensesMinor: number): number {
  return totalIncomeMinor - totalExpensesMinor;
}

/** Returns a 0-100 percent. Zero or negative income is treated as an undefined rate (0). */
export function calculateSavingsRate(totalIncomeMinor: number, totalExpensesMinor: number): number {
  if (totalIncomeMinor <= 0) return 0;
  const rate = ((totalIncomeMinor - totalExpensesMinor) / totalIncomeMinor) * 100;
  return rate;
}

export function calculateCategoryBreakdown(
  transactions: CalcTransaction[],
  categories: CalcCategory[],
  type: "EXPENSE" | "INCOME" = "EXPENSE"
): CategoryBreakdownEntry[] {
  const filtered = transactions.filter((t) => t.type === type);
  const total = filtered.reduce((sum, t) => sum + Math.abs(t.amountMinor), 0);

  const byCategory = new Map<string | null, { totalMinor: number; count: number }>();
  for (const t of filtered) {
    const key = t.categoryId;
    const existing = byCategory.get(key) ?? { totalMinor: 0, count: 0 };
    existing.totalMinor += Math.abs(t.amountMinor);
    existing.count += 1;
    byCategory.set(key, existing);
  }

  const categoryLookup = new Map(categories.map((c) => [c.id, c]));

  const entries: CategoryBreakdownEntry[] = Array.from(byCategory.entries()).map(([categoryId, agg]) => {
    const category = categoryId ? categoryLookup.get(categoryId) : undefined;
    return {
      categoryId,
      name: category?.name ?? "Uncategorized",
      icon: category?.icon ?? "MoreHorizontal",
      color: category?.color ?? "#898781",
      totalMinor: agg.totalMinor,
      percent: total > 0 ? (agg.totalMinor / total) * 100 : 0,
      count: agg.count,
    };
  });

  return entries.sort((a, b) => b.totalMinor - a.totalMinor);
}

/** Buckets transactions into calendar months and sums income/expense per month. `months` must be sorted ascending. */
export function calculateMonthlyTotals(transactions: CalcTransaction[], months: Date[]): MonthlyTotal[] {
  return months.map((month) => {
    const year = month.getUTCFullYear();
    const monthIdx = month.getUTCMonth();
    const inMonth = transactions.filter(
      (t) => t.date.getUTCFullYear() === year && t.date.getUTCMonth() === monthIdx
    );
    const incomeMinor = calculateTotalIncome(inMonth);
    const expenseMinor = calculateTotalExpenses(inMonth);
    return {
      month,
      incomeMinor,
      expenseMinor,
      remainingMinor: calculateRemainingBalance(incomeMinor, expenseMinor),
    };
  });
}

export interface PeriodTotals {
  incomeMinor: number;
  expenseMinor: number;
  remainingMinor: number;
  savingsRate: number;
}

export function calculatePeriodTotals(transactions: CalcTransaction[]): PeriodTotals {
  const incomeMinor = calculateTotalIncome(transactions);
  const expenseMinor = calculateTotalExpenses(transactions);
  return {
    incomeMinor,
    expenseMinor,
    remainingMinor: calculateRemainingBalance(incomeMinor, expenseMinor),
    savingsRate: calculateSavingsRate(incomeMinor, expenseMinor),
  };
}

/**
 * Percent change from `previous` to `current`. Returns null when `previous`
 * is zero, since a percent change from zero is undefined (not infinite).
 */
export function calculateMonthOverMonthChange(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
}

export function calculateAverageMonthlySpending(monthlyTotals: MonthlyTotal[]): number {
  if (monthlyTotals.length === 0) return 0;
  const sum = monthlyTotals.reduce((acc, m) => acc + m.expenseMinor, 0);
  return sum / monthlyTotals.length;
}

export function calculateAverageDailySpending(totalExpenseMinor: number, dayCount: number): number {
  if (dayCount <= 0) return 0;
  return totalExpenseMinor / dayCount;
}

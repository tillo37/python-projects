import { describe, expect, it } from "vitest";
import {
  calculateAverageDailySpending,
  calculateAverageMonthlySpending,
  calculateCategoryBreakdown,
  calculateMonthlyTotals,
  calculateMonthOverMonthChange,
  calculatePeriodTotals,
  calculateRemainingBalance,
  calculateSavingsRate,
  calculateTotalExpenses,
  calculateTotalIncome,
  type CalcCategory,
  type CalcTransaction,
} from "./calculations";

function tx(overrides: Partial<CalcTransaction>): CalcTransaction {
  return {
    id: Math.random().toString(36),
    type: "EXPENSE",
    amountMinor: 1000,
    date: new Date("2026-01-15"),
    categoryId: "cat-1",
    ...overrides,
  };
}

describe("calculateTotalExpenses", () => {
  it("sums only expense transactions", () => {
    const transactions = [
      tx({ type: "EXPENSE", amountMinor: 1000 }),
      tx({ type: "INCOME", amountMinor: 5000 }),
      tx({ type: "EXPENSE", amountMinor: 2500 }),
    ];
    expect(calculateTotalExpenses(transactions)).toBe(3500);
  });

  it("returns 0 for no transactions", () => {
    expect(calculateTotalExpenses([])).toBe(0);
  });

  it("treats negative stored amounts as their magnitude", () => {
    const transactions = [tx({ type: "EXPENSE", amountMinor: -500 })];
    expect(calculateTotalExpenses(transactions)).toBe(500);
  });
});

describe("calculateTotalIncome", () => {
  it("sums only income transactions", () => {
    const transactions = [
      tx({ type: "INCOME", amountMinor: 420000 }),
      tx({ type: "EXPENSE", amountMinor: 1000 }),
    ];
    expect(calculateTotalIncome(transactions)).toBe(420000);
  });

  it("returns 0 when there is no income", () => {
    const transactions = [tx({ type: "EXPENSE", amountMinor: 1000 })];
    expect(calculateTotalIncome(transactions)).toBe(0);
  });
});

describe("calculateRemainingBalance", () => {
  it("is income minus expenses", () => {
    expect(calculateRemainingBalance(10000, 4000)).toBe(6000);
  });

  it("can be negative when overspent", () => {
    expect(calculateRemainingBalance(1000, 4000)).toBe(-3000);
  });
});

describe("calculateSavingsRate", () => {
  it("computes percent saved", () => {
    expect(calculateSavingsRate(10000, 6000)).toBeCloseTo(40, 5);
  });

  it("returns 0 for zero income instead of NaN or Infinity", () => {
    expect(calculateSavingsRate(0, 500)).toBe(0);
  });

  it("returns 0 for negative income", () => {
    expect(calculateSavingsRate(-100, 50)).toBe(0);
  });

  it("can exceed 100% when expenses are negative-adjusted (edge case) or be negative when overspent", () => {
    expect(calculateSavingsRate(1000, 2000)).toBeCloseTo(-100, 5);
  });
});

describe("calculateCategoryBreakdown", () => {
  const categories: CalcCategory[] = [
    { id: "cat-1", name: "Groceries", icon: "ShoppingCart", color: "#111" },
    { id: "cat-2", name: "Dining", icon: "Utensils", color: "#222" },
  ];

  it("groups by category, sorts descending, and computes percent + count", () => {
    const transactions = [
      tx({ categoryId: "cat-1", amountMinor: 3000 }),
      tx({ categoryId: "cat-1", amountMinor: 1000 }),
      tx({ categoryId: "cat-2", amountMinor: 6000 }),
      tx({ categoryId: "cat-2", type: "INCOME", amountMinor: 999999 }), // excluded (wrong type)
    ];

    const result = calculateCategoryBreakdown(transactions, categories, "EXPENSE");

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("Dining");
    expect(result[0].totalMinor).toBe(6000);
    expect(result[0].count).toBe(1);
    expect(result[0].percent).toBeCloseTo(60, 5);
    expect(result[1].name).toBe("Groceries");
    expect(result[1].totalMinor).toBe(4000);
    expect(result[1].percent).toBeCloseTo(40, 5);
  });

  it("falls back to Uncategorized for a null/unknown categoryId", () => {
    const transactions = [tx({ categoryId: null, amountMinor: 500 })];
    const result = calculateCategoryBreakdown(transactions, categories, "EXPENSE");
    expect(result[0].name).toBe("Uncategorized");
  });

  it("returns an empty array and never divides by zero when there are no transactions", () => {
    expect(calculateCategoryBreakdown([], categories, "EXPENSE")).toEqual([]);
  });
});

describe("calculateMonthlyTotals", () => {
  it("buckets transactions into the correct calendar month, handling a year boundary", () => {
    const months = [new Date(Date.UTC(2025, 11, 1)), new Date(Date.UTC(2026, 0, 1))];
    const transactions = [
      tx({ type: "EXPENSE", amountMinor: 1000, date: new Date(Date.UTC(2025, 11, 31)) }),
      tx({ type: "INCOME", amountMinor: 5000, date: new Date(Date.UTC(2026, 0, 1)) }),
      tx({ type: "EXPENSE", amountMinor: 2000, date: new Date(Date.UTC(2026, 0, 15)) }),
    ];

    const result = calculateMonthlyTotals(transactions, months);

    expect(result).toHaveLength(2);
    expect(result[0].expenseMinor).toBe(1000);
    expect(result[0].incomeMinor).toBe(0);
    expect(result[1].expenseMinor).toBe(2000);
    expect(result[1].incomeMinor).toBe(5000);
    expect(result[1].remainingMinor).toBe(3000);
  });

  it("handles the leap-day boundary (Feb 29) without leaking into March", () => {
    const months = [new Date(Date.UTC(2024, 1, 1)), new Date(Date.UTC(2024, 2, 1))];
    const transactions = [
      tx({ amountMinor: 100, date: new Date(Date.UTC(2024, 1, 29)) }), // Feb 29, leap year
      tx({ amountMinor: 200, date: new Date(Date.UTC(2024, 2, 1)) }),
    ];

    const result = calculateMonthlyTotals(transactions, months);
    expect(result[0].expenseMinor).toBe(100);
    expect(result[1].expenseMinor).toBe(200);
  });

  it("returns zeroed rows for months with no transactions", () => {
    const months = [new Date(Date.UTC(2026, 3, 1))];
    expect(calculateMonthlyTotals([], months)).toEqual([
      { month: months[0], incomeMinor: 0, expenseMinor: 0, remainingMinor: 0 },
    ]);
  });
});

describe("calculatePeriodTotals", () => {
  it("combines income, expenses, remaining, and savings rate", () => {
    const transactions = [
      tx({ type: "INCOME", amountMinor: 10000 }),
      tx({ type: "EXPENSE", amountMinor: 4000 }),
    ];
    const result = calculatePeriodTotals(transactions);
    expect(result).toEqual({
      incomeMinor: 10000,
      expenseMinor: 4000,
      remainingMinor: 6000,
      savingsRate: 60,
    });
  });

  it("is well-defined for an empty transaction list", () => {
    expect(calculatePeriodTotals([])).toEqual({
      incomeMinor: 0,
      expenseMinor: 0,
      remainingMinor: 0,
      savingsRate: 0,
    });
  });
});

describe("calculateMonthOverMonthChange", () => {
  it("computes a positive percent increase", () => {
    expect(calculateMonthOverMonthChange(150, 100)).toBeCloseTo(50, 5);
  });

  it("computes a negative percent decrease", () => {
    expect(calculateMonthOverMonthChange(50, 100)).toBeCloseTo(-50, 5);
  });

  it("returns null when the previous value is zero (undefined percent change)", () => {
    expect(calculateMonthOverMonthChange(100, 0)).toBeNull();
  });

  it("handles a negative previous value using its magnitude as the base", () => {
    // -100 -> -50 is a move toward zero, i.e. a 50% improvement relative to
    // the previous magnitude, so the signed result is positive.
    expect(calculateMonthOverMonthChange(-50, -100)).toBeCloseTo(50, 5);
  });
});

describe("calculateAverageMonthlySpending", () => {
  it("averages expense across months", () => {
    const monthlyTotals = calculateMonthlyTotals(
      [
        tx({ amountMinor: 1000, date: new Date(Date.UTC(2026, 0, 5)) }),
        tx({ amountMinor: 3000, date: new Date(Date.UTC(2026, 1, 5)) }),
      ],
      [new Date(Date.UTC(2026, 0, 1)), new Date(Date.UTC(2026, 1, 1))]
    );
    expect(calculateAverageMonthlySpending(monthlyTotals)).toBe(2000);
  });

  it("returns 0 for an empty list rather than dividing by zero", () => {
    expect(calculateAverageMonthlySpending([])).toBe(0);
  });
});

describe("calculateAverageDailySpending", () => {
  it("divides total spend by day count", () => {
    expect(calculateAverageDailySpending(3000, 30)).toBe(100);
  });

  it("returns 0 for a zero or negative day count instead of Infinity/NaN", () => {
    expect(calculateAverageDailySpending(3000, 0)).toBe(0);
    expect(calculateAverageDailySpending(3000, -5)).toBe(0);
  });
});

"use server";

import { getCurrentUser } from "@/lib/auth";
import { getCategories, getCategoryBreakdown, getPeriodTotals, getRecentTransactions, getTrend } from "@/db/queries";
import {
  getPeriodRange,
  getPreviousPeriodRange,
  getTrendGranularity,
  type Period,
} from "@/lib/dates";
import { calculateMonthOverMonthChange, calculateRemainingBalance, calculateSavingsRate } from "@/lib/calculations";
import type { CurrencyCode } from "@/lib/money";

export async function getDashboardData(period: Period) {
  const user = await getCurrentUser();
  const currency = user.currency as CurrencyCode;
  const range = getPeriodRange(period);
  const previousRange = getPreviousPeriodRange(period);
  const granularity = getTrendGranularity(period);

  const [totals, previousTotals, trend, categoryBreakdown, recentTransactions, categories] = await Promise.all([
    getPeriodTotals(user.id, range),
    getPeriodTotals(user.id, previousRange),
    getTrend(user.id, range, granularity),
    getCategoryBreakdown(user.id, range, "EXPENSE"),
    getRecentTransactions(user.id, 8),
    getCategories(user.id),
  ]);

  const remainingMinor = calculateRemainingBalance(totals.incomeMinor, totals.expenseMinor);
  const savingsRate = calculateSavingsRate(totals.incomeMinor, totals.expenseMinor);
  const previousRemainingMinor = calculateRemainingBalance(previousTotals.incomeMinor, previousTotals.expenseMinor);
  const previousSavingsRate = calculateSavingsRate(previousTotals.incomeMinor, previousTotals.expenseMinor);

  return {
    period,
    range,
    currency,
    totals: { ...totals, remainingMinor, savingsRate },
    previousTotals: {
      ...previousTotals,
      remainingMinor: previousRemainingMinor,
      savingsRate: previousSavingsRate,
    },
    changes: {
      expense: calculateMonthOverMonthChange(totals.expenseMinor, previousTotals.expenseMinor),
      income: calculateMonthOverMonthChange(totals.incomeMinor, previousTotals.incomeMinor),
      remaining: calculateMonthOverMonthChange(remainingMinor, previousRemainingMinor),
      savingsRate: calculateMonthOverMonthChange(savingsRate, previousSavingsRate),
    },
    trend,
    granularity,
    categoryBreakdown,
    recentTransactions,
    categories,
  };
}

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;

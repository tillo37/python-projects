"use server";

import { differenceInCalendarDays } from "date-fns";
import { prisma } from "@/db/client";
import { getCurrentUser } from "@/lib/auth";
import { getCategories, getCategoryBreakdown, getPeriodTotals, getTrend } from "@/db/queries";
import { getPeriodRange, getPreviousPeriodRange, getTrendGranularity, monthsInRange, type Period } from "@/lib/dates";
import {
  calculateAverageDailySpending,
  calculateMonthOverMonthChange,
  calculateRemainingBalance,
  calculateSavingsRate,
  type CategoryBreakdownEntry,
} from "@/lib/calculations";
import type { CurrencyCode } from "@/lib/money";

export interface Insight {
  text: string;
  tone: "positive" | "negative" | "neutral";
}

export async function getAnalyticsData(period: Period) {
  const user = await getCurrentUser();
  const currency = user.currency as CurrencyCode;
  const range = getPeriodRange(period);
  const previousRange = getPreviousPeriodRange(period);
  const granularity = getTrendGranularity(period);
  const sixMonthRange = getPeriodRange("6months");

  const [
    totals,
    previousTotals,
    trend,
    categoryBreakdown,
    previousCategoryBreakdown,
    monthlyComparisonRaw,
    largestExpense,
  ] = await Promise.all([
    getPeriodTotals(user.id, range),
    getPeriodTotals(user.id, previousRange),
    getTrend(user.id, range, granularity),
    getCategoryBreakdown(user.id, range, "EXPENSE"),
    getCategoryBreakdown(user.id, previousRange, "EXPENSE"),
    getTrend(user.id, sixMonthRange, "monthly"),
    prisma.transaction.findFirst({
      where: { userId: user.id, type: "EXPENSE", date: { gte: range.start, lte: range.end } },
      orderBy: { amountMinor: "desc" },
      include: { category: true },
    }),
  ]);

  const remainingMinor = calculateRemainingBalance(totals.incomeMinor, totals.expenseMinor);
  const savingsRate = calculateSavingsRate(totals.incomeMinor, totals.expenseMinor);
  const dayCount = differenceInCalendarDays(range.end, range.start) + 1;
  const monthCount = monthsInRange(range).length;
  const averageDailySpendingMinor = calculateAverageDailySpending(totals.expenseMinor, dayCount);
  const averageMonthlySpendingMinor = totals.expenseMinor / monthCount;

  const sixMonthAverageMinor =
    monthlyComparisonRaw.reduce((sum, m) => sum + m.expenseMinor, 0) / Math.max(1, monthlyComparisonRaw.length);

  const monthlyComparison = monthlyComparisonRaw.map((m) => ({
    month: m.bucket,
    incomeMinor: m.incomeMinor,
    expenseMinor: m.expenseMinor,
    remainingMinor: calculateRemainingBalance(m.incomeMinor, m.expenseMinor),
  }));

  const insights = buildInsights({
    period,
    categoryBreakdown,
    previousCategoryBreakdown,
    averageMonthlySpendingMinor,
    sixMonthAverageMinor,
  });

  return {
    period,
    range,
    currency,
    totals: { ...totals, remainingMinor, savingsRate },
    changes: {
      expense: calculateMonthOverMonthChange(totals.expenseMinor, previousTotals.expenseMinor),
      income: calculateMonthOverMonthChange(totals.incomeMinor, previousTotals.incomeMinor),
    },
    trend,
    granularity,
    categoryBreakdown,
    monthlyComparison,
    financialHealth: {
      savingsRate,
      averageMonthlySpendingMinor,
      averageDailySpendingMinor,
      largestExpense,
      mostExpensiveCategory: categoryBreakdown[0] ?? null,
    },
    insights,
    categories: await getCategories(user.id),
  };
}

export type AnalyticsData = Awaited<ReturnType<typeof getAnalyticsData>>;

function buildInsights({
  period,
  categoryBreakdown,
  previousCategoryBreakdown,
  averageMonthlySpendingMinor,
  sixMonthAverageMinor,
}: {
  period: Period;
  categoryBreakdown: CategoryBreakdownEntry[];
  previousCategoryBreakdown: CategoryBreakdownEntry[];
  averageMonthlySpendingMinor: number;
  sixMonthAverageMinor: number;
}): Insight[] {
  const insights: Insight[] = [];
  const periodLabel =
    period === "thisMonth" ? "month" : period === "lastMonth" ? "month" : period === "1year" ? "year" : "period";

  if (categoryBreakdown.length > 0) {
    const top = categoryBreakdown[0];
    insights.push({
      text: `${top.name} is your largest spending category this ${periodLabel}, at ${Math.round(top.percent)}% of total spending.`,
      tone: "neutral",
    });
  }

  const previousByCategory = new Map(previousCategoryBreakdown.map((c) => [c.categoryId, c]));
  let biggestChange: { name: string; change: number } | null = null;
  for (const entry of categoryBreakdown) {
    const previous = previousByCategory.get(entry.categoryId);
    if (!previous || previous.totalMinor === 0) continue;
    const change = calculateMonthOverMonthChange(entry.totalMinor, previous.totalMinor);
    if (change === null) continue;
    if (!biggestChange || Math.abs(change) > Math.abs(biggestChange.change)) {
      biggestChange = { name: entry.name, change };
    }
  }
  if (biggestChange && Math.abs(biggestChange.change) >= 5) {
    const direction = biggestChange.change > 0 ? "more" : "less";
    insights.push({
      text: `You spent ${Math.abs(Math.round(biggestChange.change))}% ${direction} on ${biggestChange.name} compared to the previous period.`,
      tone: biggestChange.change > 0 ? "negative" : "positive",
    });
  }

  if (sixMonthAverageMinor > 0) {
    const diff = calculateMonthOverMonthChange(averageMonthlySpendingMinor, sixMonthAverageMinor);
    if (diff !== null && Math.abs(diff) >= 3) {
      const direction = diff > 0 ? "above" : "below";
      insights.push({
        text: `Your average monthly spending is currently ${Math.abs(Math.round(diff))}% ${direction} your 6-month average.`,
        tone: diff > 0 ? "negative" : "positive",
      });
    }
  }

  if (insights.length === 0) {
    insights.push({ text: "Add a few more transactions to start seeing personalized insights here.", tone: "neutral" });
  }

  return insights;
}

"use client";

import { useState, useTransition } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getAnalyticsData, type AnalyticsData } from "@/app/actions/analytics";
import type { Period } from "@/lib/dates";
import { PeriodTabs } from "@/components/dashboard/period-tabs";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { CategoryBreakdownCard } from "@/components/dashboard/category-breakdown-card";
import { TopCategoriesCard } from "./top-categories-card";
import { InsightsCard } from "./insights-card";
import { FinancialHealthCard } from "./financial-health-card";
import { MonthlyComparisonTable } from "./monthly-comparison-table";

export function AnalyticsContent({ initialData }: { initialData: AnalyticsData }) {
  const [data, setData] = useState(initialData);
  const [period, setPeriod] = useState<Period>(initialData.period);
  const [pending, startTransition] = useTransition();

  // See DashboardContent for why this isn't a `useEffect`: it re-syncs to a
  // freshly server-fetched payload (e.g. after `router.refresh()` following
  // a mutation) without clobbering a period the user has since selected.
  const [lastSeenInitialData, setLastSeenInitialData] = useState(initialData);
  if (initialData !== lastSeenInitialData) {
    setLastSeenInitialData(initialData);
    if (initialData.period === period) {
      setData(initialData);
    }
  }

  function handlePeriodChange(next: Period) {
    setPeriod(next);
    startTransition(async () => {
      const fresh = await getAnalyticsData(next);
      setData(fresh);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <PeriodTabs value={period} onChange={handlePeriodChange} />

      <div className={cn("flex flex-col gap-6 transition-opacity duration-150", pending && "opacity-60")}>
        <Card>
          <CardHeader>
            <CardTitle>Spending over time</CardTitle>
          </CardHeader>
          <div className="p-5 pt-4">
            <TrendChart data={data.trend} granularity={data.granularity} currency={data.currency} />
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <CategoryBreakdownCard entries={data.categoryBreakdown} currency={data.currency} />
          <TopCategoriesCard entries={data.categoryBreakdown} currency={data.currency} />
        </div>

        <FinancialHealthCard
          savingsRate={data.financialHealth.savingsRate}
          averageMonthlySpendingMinor={data.financialHealth.averageMonthlySpendingMinor}
          averageDailySpendingMinor={data.financialHealth.averageDailySpendingMinor}
          largestExpense={data.financialHealth.largestExpense}
          mostExpensiveCategory={data.financialHealth.mostExpensiveCategory}
          currency={data.currency}
        />

        <InsightsCard insights={data.insights} />

        <MonthlyComparisonTable rows={data.monthlyComparison} currency={data.currency} />
      </div>
    </div>
  );
}

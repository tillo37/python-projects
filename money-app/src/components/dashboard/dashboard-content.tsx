"use client";

import { useState, useTransition } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getDashboardData, type DashboardData } from "@/app/actions/dashboard";
import type { Period } from "@/lib/dates";
import { PeriodTabs } from "./period-tabs";
import { SummaryCards } from "./summary-cards";
import { TrendChart } from "./trend-chart";
import { CategoryBreakdownCard } from "./category-breakdown-card";
import { RecentTransactionsCard } from "./recent-transactions-card";

export function DashboardContent({ initialData }: { initialData: DashboardData }) {
  const [data, setData] = useState(initialData);
  const [period, setPeriod] = useState<Period>(initialData.period);
  const [pending, startTransition] = useTransition();

  // `initialData` is refetched by the server on every navigation/refresh
  // (e.g. after a mutation elsewhere calls `router.refresh()`), but a plain
  // `useState(initialData)` only reads that value on the first mount. Adjust
  // state during render (React's documented escape hatch — cheaper than an
  // effect, no extra render pass) so a fresh server payload for the period
  // currently being viewed actually reaches the screen.
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
      const fresh = await getDashboardData(next);
      setData(fresh);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
        <PeriodTabs value={period} onChange={handlePeriodChange} />
      </div>

      <div className={cn("flex flex-col gap-6 transition-opacity duration-150", pending && "opacity-60")}>
        <SummaryCards currency={data.currency} period={data.period} totals={data.totals} changes={data.changes} />

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
          <RecentTransactionsCard transactions={data.recentTransactions} currency={data.currency} />
        </div>
      </div>
    </div>
  );
}

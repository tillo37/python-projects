import type { Category, Transaction } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryIcon } from "@/lib/icon-map";
import { formatMoney, formatPercent, type CurrencyCode } from "@/lib/money";
import type { CategoryBreakdownEntry } from "@/lib/calculations";

interface FinancialHealthProps {
  savingsRate: number;
  averageMonthlySpendingMinor: number;
  averageDailySpendingMinor: number;
  largestExpense: (Transaction & { category: Category | null }) | null;
  mostExpensiveCategory: CategoryBreakdownEntry | null;
  currency: CurrencyCode;
}

export function FinancialHealthCard({
  savingsRate,
  averageMonthlySpendingMinor,
  averageDailySpendingMinor,
  largestExpense,
  mostExpensiveCategory,
  currency,
}: FinancialHealthProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial health</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-5 sm:grid-cols-3">
        <div>
          <p className="text-xs text-text-muted">Savings rate</p>
          <p className="mt-1 text-lg font-semibold text-text-primary tabular-nums">{formatPercent(savingsRate)}</p>
        </div>
        <div>
          <p className="text-xs text-text-muted">Avg. monthly spending</p>
          <p className="mt-1 text-lg font-semibold text-text-primary tabular-nums">
            {formatMoney(averageMonthlySpendingMinor, currency)}
          </p>
        </div>
        <div>
          <p className="text-xs text-text-muted">Avg. daily spending</p>
          <p className="mt-1 text-lg font-semibold text-text-primary tabular-nums">
            {formatMoney(averageDailySpendingMinor, currency)}
          </p>
        </div>
        <div>
          <p className="text-xs text-text-muted">Largest expense</p>
          {largestExpense ? (
            <p className="mt-1 truncate text-lg font-semibold text-text-primary tabular-nums">
              {formatMoney(largestExpense.amountMinor, currency)}
            </p>
          ) : (
            <p className="mt-1 text-lg font-semibold text-text-muted">—</p>
          )}
          {largestExpense && (
            <p className="truncate text-xs text-text-muted">
              {largestExpense.merchant || largestExpense.category?.name}
            </p>
          )}
        </div>
        <div className="col-span-2 sm:col-span-1">
          <p className="text-xs text-text-muted">Most expensive category</p>
          {mostExpensiveCategory ? (
            <p className="mt-1 flex items-center gap-1.5 text-lg font-semibold text-text-primary">
              <CategoryIcon name={mostExpensiveCategory.icon} className="size-4" style={{ color: mostExpensiveCategory.color }} />
              {mostExpensiveCategory.name}
            </p>
          ) : (
            <p className="mt-1 text-lg font-semibold text-text-muted">—</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

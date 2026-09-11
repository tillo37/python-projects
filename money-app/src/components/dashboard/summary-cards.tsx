import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatMoney, formatPercent, type CurrencyCode } from "@/lib/money";
import { PERIOD_COMPARISON_LABELS, type Period } from "@/lib/dates";

interface SummaryCardProps {
  label: string;
  valueMinor: number;
  currency: CurrencyCode;
  change: number | null;
  lowerIsBetter?: boolean;
  period: Period;
  isPercent?: boolean;
  delay?: number;
}

function SummaryCard({ label, valueMinor, currency, change, lowerIsBetter, period, isPercent, delay = 0 }: SummaryCardProps) {
  // The arrow always reflects the actual direction the number moved;
  // color separately encodes whether that direction is good or bad news
  // (e.g. spending going up is a real increase — shown with an up arrow —
  // but colored red because more spending isn't good).
  let tone: "positive" | "negative" | "neutral" = "neutral";
  if (change !== null && change !== 0) {
    const isIncrease = change > 0;
    const good = lowerIsBetter ? !isIncrease : isIncrease;
    tone = good ? "positive" : "negative";
  }

  const Icon = change === null || change === 0 ? Minus : change > 0 ? ArrowUpRight : ArrowDownRight;

  return (
    <Card className="anim-card" style={{ animationDelay: `${delay}ms` }}>
      <CardContent className="p-5">
        <p className="text-[13px] font-medium text-text-secondary">{label}</p>
        <p className="mt-2 text-[28px] font-semibold tracking-tight text-text-primary tabular-nums">
          {isPercent ? formatPercent(valueMinor) : formatMoney(valueMinor, currency)}
        </p>
        <div className="mt-2.5 flex items-center gap-1.5 text-xs">
          {change !== null ? (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 font-medium",
                tone === "positive" && "text-positive",
                tone === "negative" && "text-negative",
                tone === "neutral" && "text-text-muted"
              )}
            >
              <Icon className="size-3" />
              {formatPercent(change, { signed: true })}
            </span>
          ) : (
            <span className="text-text-muted">No prior data</span>
          )}
          <span className="text-text-muted">{PERIOD_COMPARISON_LABELS[period]}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function SummaryCards({
  currency,
  period,
  totals,
  changes,
}: {
  currency: CurrencyCode;
  period: Period;
  totals: { incomeMinor: number; expenseMinor: number; remainingMinor: number; savingsRate: number };
  changes: { income: number | null; expense: number | null; remaining: number | null; savingsRate: number | null };
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <SummaryCard
        label="Total spent"
        valueMinor={totals.expenseMinor}
        currency={currency}
        change={changes.expense}
        lowerIsBetter
        period={period}
        delay={0}
      />
      <SummaryCard
        label="Income"
        valueMinor={totals.incomeMinor}
        currency={currency}
        change={changes.income}
        period={period}
        delay={40}
      />
      <SummaryCard
        label="Remaining"
        valueMinor={totals.remainingMinor}
        currency={currency}
        change={changes.remaining}
        period={period}
        delay={80}
      />
      <SummaryCard
        label="Savings rate"
        valueMinor={totals.savingsRate}
        currency={currency}
        change={changes.savingsRate}
        period={period}
        isPercent
        delay={120}
      />
    </div>
  );
}

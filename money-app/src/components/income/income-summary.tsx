import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatMoney, formatPercent, type CurrencyCode } from "@/lib/money";

export function IncomeSummary({
  salaryMinor,
  additionalMinor,
  totalMinor,
  momChange,
  currency,
}: {
  salaryMinor: number;
  additionalMinor: number;
  totalMinor: number;
  momChange: number | null;
  currency: CurrencyCode;
}) {
  const tone = momChange === null || momChange === 0 ? "neutral" : momChange > 0 ? "positive" : "negative";
  const Icon = tone === "positive" ? ArrowUpRight : tone === "negative" ? ArrowDownRight : Minus;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card>
        <CardContent className="p-5">
          <p className="text-[13px] font-medium text-text-secondary">Salary</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-text-primary tabular-nums">
            {formatMoney(salaryMinor, currency)}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-5">
          <p className="text-[13px] font-medium text-text-secondary">Additional income</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-text-primary tabular-nums">
            {formatMoney(additionalMinor, currency)}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-5">
          <p className="text-[13px] font-medium text-text-secondary">Total income</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-text-primary tabular-nums">
            {formatMoney(totalMinor, currency)}
          </p>
          <div className="mt-2.5 flex items-center gap-1.5 text-xs">
            {momChange !== null ? (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 font-medium",
                  tone === "positive" && "text-positive",
                  tone === "negative" && "text-negative",
                  tone === "neutral" && "text-text-muted"
                )}
              >
                <Icon className="size-3" />
                {formatPercent(momChange, { signed: true })}
              </span>
            ) : (
              <span className="text-text-muted">No prior data</span>
            )}
            <span className="text-text-muted">vs last month</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

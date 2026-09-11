import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMonthLabel } from "@/lib/dates";
import { formatMoney, type CurrencyCode } from "@/lib/money";
import { cn } from "@/lib/utils";

interface MonthRow {
  month: Date;
  incomeMinor: number;
  expenseMinor: number;
  remainingMinor: number;
}

export function MonthlyComparisonTable({ rows, currency }: { rows: MonthRow[]; currency: CurrencyCode }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Monthly comparison</CardTitle>
      </CardHeader>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full min-w-[420px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-text-muted">
              <th className="px-5 py-2.5 font-medium">Month</th>
              <th className="px-5 py-2.5 text-right font-medium">Income</th>
              <th className="px-5 py-2.5 text-right font-medium">Expenses</th>
              <th className="px-5 py-2.5 text-right font-medium">Remaining</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr key={row.month.toISOString()}>
                <td className="px-5 py-3 font-medium text-text-primary">{formatMonthLabel(row.month)}</td>
                <td className="px-5 py-3 text-right tabular-nums text-text-secondary">
                  {formatMoney(row.incomeMinor, currency)}
                </td>
                <td className="px-5 py-3 text-right tabular-nums text-text-secondary">
                  {formatMoney(row.expenseMinor, currency)}
                </td>
                <td
                  className={cn(
                    "px-5 py-3 text-right font-medium tabular-nums",
                    row.remainingMinor >= 0 ? "text-positive" : "text-negative"
                  )}
                >
                  {formatMoney(row.remainingMinor, currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

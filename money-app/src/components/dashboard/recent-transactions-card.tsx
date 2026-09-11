import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Category, Transaction } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CategoryIcon } from "@/lib/icon-map";
import { formatMoney, type CurrencyCode } from "@/lib/money";
import { formatDayLabel } from "@/lib/dates";

type TransactionWithCategory = Transaction & { category: Category | null };

function relativeDayLabel(date: Date): string {
  const today = new Date();
  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (isSameDay(date, today)) return "Today";
  if (isSameDay(date, yesterday)) return "Yesterday";
  return formatDayLabel(date);
}

export function RecentTransactionsCard({
  transactions,
  currency,
}: {
  transactions: TransactionWithCategory[];
  currency: CurrencyCode;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Recent activity</CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center gap-1 text-center">
            <p className="text-sm font-medium text-text-secondary">No transactions yet</p>
            <p className="text-xs text-text-muted">Your recent activity will show up here.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {transactions.map((t) => {
              const iconName = t.category?.icon ?? "MoreHorizontal";
              const color = t.category?.color ?? "#898781";
              return (
                <li key={t.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                  <span
                    className="flex size-9 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${color}1a`, color }}
                  >
                    <CategoryIcon name={iconName} className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text-primary">
                      {t.merchant || t.description || t.category?.name || "Transaction"}
                    </p>
                    <p className="truncate text-xs text-text-muted">
                      {relativeDayLabel(t.date)} · {t.category?.name ?? "Uncategorized"}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-sm font-semibold tabular-nums ${
                      t.type === "INCOME" ? "text-positive" : "text-text-primary"
                    }`}
                  >
                    {formatMoney(t.amountMinor, currency, { signed: t.type === "INCOME" })}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
      <div className="border-t border-border p-3">
        <Button variant="ghost" size="sm" asChild className="w-full">
          <Link href="/transactions">
            View all transactions
            <ArrowRight className="size-3.5" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}

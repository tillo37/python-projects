import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryIcon } from "@/lib/icon-map";
import { formatMoney, type CurrencyCode } from "@/lib/money";
import type { CategoryBreakdownEntry } from "@/lib/calculations";

export function TopCategoriesCard({
  entries,
  currency,
}: {
  entries: CategoryBreakdownEntry[];
  currency: CurrencyCode;
}) {
  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top spending categories</CardTitle>
        </CardHeader>
        <CardContent className="flex h-40 items-center justify-center text-sm text-text-muted">
          No expenses in this period yet.
        </CardContent>
      </Card>
    );
  }

  const max = entries[0].totalMinor;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top spending categories</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {entries.slice(0, 8).map((entry, i) => {
          return (
            <div key={entry.categoryId ?? "uncategorized"} className="flex items-center gap-3">
              <span className="w-4 shrink-0 text-xs font-medium text-text-muted tabular-nums">{i + 1}</span>
              <span
                className="flex size-8 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: `${entry.color}1a`, color: entry.color }}
              >
                <CategoryIcon name={entry.icon} className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium text-text-primary">{entry.name}</span>
                  <span className="shrink-0 text-sm font-medium text-text-primary tabular-nums">
                    {formatMoney(entry.totalMinor, currency)}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-raised">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${max > 0 ? (entry.totalMinor / max) * 100 : 0}%`, backgroundColor: entry.color }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

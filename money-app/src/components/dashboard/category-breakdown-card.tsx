"use client";

import Link from "next/link";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryIcon } from "@/lib/icon-map";
import { formatMoney, formatPercent, type CurrencyCode } from "@/lib/money";
import type { CategoryBreakdownEntry } from "@/lib/calculations";

const OTHER_COLOR = "#a6a49c";
const MAX_CHART_SLOTS = 7;

function buildChartData(entries: CategoryBreakdownEntry[]) {
  if (entries.length <= MAX_CHART_SLOTS) return entries.map((e) => ({ name: e.name, value: e.totalMinor, color: e.color }));

  const top = entries.slice(0, MAX_CHART_SLOTS);
  const restTotal = entries.slice(MAX_CHART_SLOTS).reduce((sum, e) => sum + e.totalMinor, 0);
  return [
    ...top.map((e) => ({ name: e.name, value: e.totalMinor, color: e.color })),
    { name: "Other", value: restTotal, color: OTHER_COLOR },
  ];
}

export function CategoryBreakdownCard({
  entries,
  currency,
}: {
  entries: CategoryBreakdownEntry[];
  currency: CurrencyCode;
}) {
  const totalMinor = entries.reduce((sum, e) => sum + e.totalMinor, 0);

  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Spending by category</CardTitle>
        </CardHeader>
        <CardContent className="flex h-56 flex-col items-center justify-center gap-1 text-center">
          <p className="text-sm font-medium text-text-secondary">No expenses yet</p>
          <p className="text-xs text-text-muted">Categories will show up here once you add spending.</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = buildChartData(entries);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending by category</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="relative mx-auto size-[168px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={56}
                outerRadius={80}
                paddingAngle={2}
                strokeWidth={0}
                isAnimationActive={false}
              >
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const p = payload[0];
                  return (
                    <div className="rounded-lg border border-border bg-surface px-3 py-2 shadow-lg">
                      <p className="text-xs text-text-muted">{p.name}</p>
                      <p className="text-sm font-semibold text-text-primary tabular-nums">
                        {formatMoney(p.value as number, currency)}
                      </p>
                    </div>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-semibold text-text-primary tabular-nums">
              {formatMoney(totalMinor, currency)}
            </span>
            <span className="text-[11px] text-text-muted">total spent</span>
          </div>
        </div>

        <div className="flex-1 divide-y divide-border">
          {entries.slice(0, 6).map((entry) => {
            return (
              <Link
                key={entry.categoryId ?? "uncategorized"}
                href={entry.categoryId ? `/transactions?categoryId=${entry.categoryId}` : "/transactions"}
                className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0 transition-colors hover:opacity-80"
              >
                <span
                  className="flex size-8 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${entry.color}1a`, color: entry.color }}
                >
                  <CategoryIcon name={entry.icon} className="size-4" />
                </span>
                <span className="flex-1 truncate text-sm font-medium text-text-primary">{entry.name}</span>
                <span className="text-right">
                  <span className="block text-sm font-medium text-text-primary tabular-nums">
                    {formatMoney(entry.totalMinor, currency)}
                  </span>
                  <span className="block text-[11px] text-text-muted tabular-nums">
                    {formatPercent(entry.percent, { decimals: 0 })}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

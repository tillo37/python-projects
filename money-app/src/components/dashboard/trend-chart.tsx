"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { format } from "date-fns";
import { formatMoney, type CurrencyCode } from "@/lib/money";
import type { TrendBucket } from "@/db/queries";

interface TrendChartProps {
  data: TrendBucket[];
  granularity: "daily" | "monthly";
  currency: CurrencyCode;
}

function CustomTooltip({
  active,
  payload,
  currency,
  granularity,
}: {
  active?: boolean;
  payload?: { payload: TrendBucket }[];
  currency: CurrencyCode;
  granularity: "daily" | "monthly";
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  const label = format(point.bucket, granularity === "daily" ? "EEEE, MMM d" : "MMMM yyyy");

  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 shadow-lg">
      <p className="text-xs text-text-muted">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-text-primary tabular-nums">
        {formatMoney(point.expenseMinor, currency)}
      </p>
      <p className="text-[11px] text-text-muted">spent</p>
    </div>
  );
}

export function TrendChart({ data, granularity, currency }: TrendChartProps) {
  const hasData = data.some((d) => d.expenseMinor > 0);

  if (!hasData) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-1 text-center">
        <p className="text-sm font-medium text-text-secondary">No spending in this period yet</p>
        <p className="text-xs text-text-muted">Your trend will appear here once you add expenses.</p>
      </div>
    );
  }

  return (
    <div className="h-64 w-full" role="img" aria-label="Spending over time chart">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.22} />
              <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--color-border)" strokeDasharray="3 3" />
          <XAxis
            dataKey="bucket"
            tickFormatter={(value: Date) => format(value, granularity === "daily" ? "d" : "MMM")}
            tick={{ fill: "var(--color-text-muted)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            interval={granularity === "daily" ? Math.ceil(data.length / 8) : 0}
            minTickGap={16}
          />
          <Tooltip
            content={<CustomTooltip currency={currency} granularity={granularity} />}
            cursor={{ stroke: "var(--color-border-strong)", strokeWidth: 1 }}
          />
          <Area
            type="monotone"
            dataKey="expenseMinor"
            stroke="var(--color-accent)"
            strokeWidth={2}
            fill="url(#expenseFill)"
            activeDot={{ r: 4, strokeWidth: 0, fill: "var(--color-accent)" }}
            dot={false}
            isAnimationActive={true}
            animationDuration={400}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

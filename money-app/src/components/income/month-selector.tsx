"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSearchParamsUpdater } from "@/hooks/use-search-params-updater";

export function MonthSelector({ monthLabel, monthISO }: { monthLabel: string; monthISO: string }) {
  const { update } = useSearchParamsUpdater();
  const [year, month] = monthISO.split("-").map(Number);

  function shift(delta: number) {
    const date = new Date(Date.UTC(year, month - 1 + delta, 1));
    const iso = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
    update({ month: iso }, { resetPage: false });
  }

  const isCurrentMonth = (() => {
    const now = new Date();
    return year === now.getFullYear() && month === now.getMonth() + 1;
  })();

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon-sm" onClick={() => shift(-1)} aria-label="Previous month">
        <ChevronLeft className="size-4" />
      </Button>
      <span className="min-w-[140px] text-center text-sm font-semibold text-text-primary">{monthLabel}</span>
      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => shift(1)}
        disabled={isCurrentMonth}
        aria-label="Next month"
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}

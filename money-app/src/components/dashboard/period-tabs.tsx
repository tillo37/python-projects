"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PERIOD_LABELS, PERIOD_ORDER, type Period } from "@/lib/dates";

export function PeriodTabs({ value, onChange }: { value: Period; onChange: (period: Period) => void }) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as Period)}>
      <div className="-mx-4 min-w-0 overflow-x-auto px-4 sm:mx-0 sm:overflow-visible sm:px-0">
        <TabsList className="w-max">
          {PERIOD_ORDER.map((period) => (
            <TabsTrigger key={period} value={period} className="shrink-0">
              {PERIOD_LABELS[period]}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
    </Tabs>
  );
}

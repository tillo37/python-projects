"use client";

import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSearchParamsUpdater } from "@/hooks/use-search-params-updater";
import { PAYMENT_METHOD_LABELS } from "@/lib/categories";

export function MoreFiltersSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { update, searchParams } = useSearchParamsUpdater();

  const [paymentMethod, setPaymentMethod] = useState(searchParams.get("paymentMethod") ?? "all");
  const [startDate, setStartDate] = useState(searchParams.get("startDate") ?? "");
  const [endDate, setEndDate] = useState(searchParams.get("endDate") ?? "");
  const [minAmount, setMinAmount] = useState(searchParams.get("minAmount") ?? "");
  const [maxAmount, setMaxAmount] = useState(searchParams.get("maxAmount") ?? "");

  function apply() {
    update({
      paymentMethod: paymentMethod === "all" ? undefined : paymentMethod,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      minAmount: minAmount || undefined,
      maxAmount: maxAmount || undefined,
    });
    onOpenChange(false);
  }

  function clear() {
    setPaymentMethod("all");
    setStartDate("");
    setEndDate("");
    setMinAmount("");
    setMaxAmount("");
    update({
      paymentMethod: undefined,
      startDate: undefined,
      endDate: undefined,
      minAmount: undefined,
      maxAmount: undefined,
    });
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="mx-auto max-w-md">
        <h2 className="text-base font-semibold text-text-primary">More filters</h2>
        <div className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Payment method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any payment method</SelectItem>
                {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>From date</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>To date</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Min amount</Label>
              <Input inputMode="decimal" placeholder="0.00" value={minAmount} onChange={(e) => setMinAmount(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Max amount</Label>
              <Input inputMode="decimal" placeholder="No limit" value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={clear}>
            Clear
          </Button>
          <Button onClick={apply}>Apply filters</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

"use client";

import { Sparkles, Plus, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuickAdd } from "@/components/transactions/quick-add-context";

export function DashboardEmptyState() {
  const { openAddExpense, openAddIncome } = useQuickAdd();

  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border-strong px-6 py-20 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-accent-soft text-accent">
        <Sparkles className="size-6" />
      </div>
      <div className="max-w-sm">
        <h2 className="text-lg font-semibold text-text-primary">Your financial picture starts here.</h2>
        <p className="mt-1.5 text-sm text-text-secondary">
          Add your first expense to start understanding where your money goes.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button onClick={openAddExpense}>
          <Plus className="size-4" />
          Add first expense
        </Button>
        <Button variant="secondary" onClick={openAddIncome}>
          <Wallet className="size-4" />
          Add income
        </Button>
      </div>
    </div>
  );
}

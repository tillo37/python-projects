"use client";

import { Plus } from "lucide-react";
import { useQuickAdd } from "@/components/transactions/quick-add-context";

export function MobileFab() {
  const { openAddExpense } = useQuickAdd();

  return (
    <button
      onClick={openAddExpense}
      aria-label="Add expense"
      className="fixed bottom-[calc(4.25rem+env(safe-area-inset-bottom))] right-4 z-40 flex size-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg transition-transform active:scale-95 md:hidden"
    >
      <Plus className="size-6" />
    </button>
  );
}

"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { Category } from "@prisma/client";
import type { CurrencyCode } from "@/lib/money";
import { TransactionFormDialog } from "./transaction-form-dialog";

interface QuickAddContextValue {
  openAddExpense: () => void;
  openAddIncome: () => void;
}

const QuickAddContext = createContext<QuickAddContextValue | null>(null);

export function QuickAddProvider({
  categories,
  currency,
  children,
}: {
  categories: Category[];
  currency: CurrencyCode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"EXPENSE" | "INCOME">("EXPENSE");

  const value = useMemo(
    () => ({
      openAddExpense: () => {
        setType("EXPENSE");
        setOpen(true);
      },
      openAddIncome: () => {
        setType("INCOME");
        setOpen(true);
      },
    }),
    []
  );

  return (
    <QuickAddContext.Provider value={value}>
      {children}
      <TransactionFormDialog
        open={open}
        onOpenChange={setOpen}
        type={type}
        categories={categories}
        currency={currency}
      />
    </QuickAddContext.Provider>
  );
}

export function useQuickAdd() {
  const ctx = useContext(QuickAddContext);
  if (!ctx) throw new Error("useQuickAdd must be used within QuickAddProvider");
  return ctx;
}

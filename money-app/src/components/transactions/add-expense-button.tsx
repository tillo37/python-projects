"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuickAdd } from "./quick-add-context";

export function AddExpenseButton({ label = "Add expense" }: { label?: string }) {
  const { openAddExpense } = useQuickAdd();
  return (
    <Button onClick={openAddExpense}>
      <Plus className="size-4" />
      {label}
    </Button>
  );
}

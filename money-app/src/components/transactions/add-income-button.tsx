"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuickAdd } from "./quick-add-context";

export function AddIncomeButton() {
  const { openAddIncome } = useQuickAdd();
  return (
    <Button onClick={openAddIncome}>
      <Plus className="size-4" />
      Add income
    </Button>
  );
}

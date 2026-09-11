import type { Category, Transaction } from "@prisma/client";
import { Card } from "@/components/ui/card";
import { TransactionItem } from "./transaction-item";
import type { CurrencyCode } from "@/lib/money";

type TransactionWithCategory = Transaction & { category: Category | null };

export function TransactionList({
  transactions,
  categories,
  currency,
}: {
  transactions: TransactionWithCategory[];
  categories: Category[];
  currency: CurrencyCode;
}) {
  if (transactions.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center gap-1 px-6 py-16 text-center">
        <p className="text-sm font-medium text-text-secondary">No transactions match your filters</p>
        <p className="text-xs text-text-muted">Try adjusting search, category, or date filters.</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      {/* Desktop table */}
      <div className="hidden md:block">
        <div className="grid grid-cols-[1fr_140px_140px_110px] gap-3 border-b border-border px-5 py-3 text-xs font-medium uppercase tracking-wide text-text-muted">
          <span>Description</span>
          <span>Category</span>
          <span>Payment method</span>
          <span>Date / Amount</span>
        </div>
        <div className="divide-y divide-border">
          {transactions.map((t) => (
            <TransactionItem key={t.id} transaction={t} categories={categories} currency={currency} variant="row" />
          ))}
        </div>
      </div>

      {/* Mobile cards */}
      <div className="divide-y divide-border md:hidden">
        {transactions.map((t) => (
          <TransactionItem key={t.id} transaction={t} categories={categories} currency={currency} variant="card" />
        ))}
      </div>
    </Card>
  );
}

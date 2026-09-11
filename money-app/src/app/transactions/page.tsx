// Live financial data must never be statically prerendered.
export const dynamic = "force-dynamic";

import { getCurrentUser } from "@/lib/auth";
import { getCategories, getTransactions } from "@/db/queries";
import { parseTransactionFilters, type TransactionsSearchParams } from "@/lib/query-params";
import type { CurrencyCode } from "@/lib/money";
import { TransactionsToolbar } from "@/components/transactions/transactions-toolbar";
import { TransactionList } from "@/components/transactions/transaction-list";
import { Pagination } from "@/components/transactions/pagination";
import { AddExpenseButton } from "@/components/transactions/add-expense-button";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<TransactionsSearchParams>;
}) {
  const params = await searchParams;
  const user = await getCurrentUser();
  const currency = user.currency as CurrencyCode;
  const categories = await getCategories(user.id);
  const filters = parseTransactionFilters(params, currency);
  const { items, total, page, pageCount } = await getTransactions(user.id, filters);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-10">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Transactions</h1>
          <p className="mt-1 text-sm text-text-secondary">Every expense and income entry, all in one place.</p>
        </div>
        <AddExpenseButton />
      </header>

      <div className="flex flex-col gap-4">
        <TransactionsToolbar categories={categories} />
        <TransactionList transactions={items} categories={categories} currency={currency} />
        <Pagination page={page} pageCount={pageCount} total={total} />
      </div>
    </div>
  );
}

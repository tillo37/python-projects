// Live financial data must never be statically prerendered.
export const dynamic = "force-dynamic";

import { Wallet } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getCategories, getIncomeTransactionCount, getPeriodTotals, getTransactions } from "@/db/queries";
import { currentMonthISO, formatFullMonth, getPreviousMonthRange, parseMonthISO, getMonthRange } from "@/lib/dates";
import { calculateMonthOverMonthChange, calculateTotalIncome } from "@/lib/calculations";
import type { CurrencyCode } from "@/lib/money";
import { MonthSelector } from "@/components/income/month-selector";
import { IncomeSummary } from "@/components/income/income-summary";
import { TransactionList } from "@/components/transactions/transaction-list";
import { AddIncomeButton } from "@/components/transactions/add-income-button";

export default async function IncomePage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
  const monthISO = params.month ?? currentMonthISO();
  const monthDate = parseMonthISO(monthISO);

  const user = await getCurrentUser();
  const currency = user.currency as CurrencyCode;
  const categories = await getCategories(user.id);

  const range = getMonthRange(monthDate);
  const previousRange = getPreviousMonthRange(monthDate);

  const [{ items: incomeTransactions }, previousTotals, incomeCount] = await Promise.all([
    getTransactions(user.id, { type: "INCOME", startDate: range.start, endDate: range.end, sort: "newest", pageSize: 200 }),
    getPeriodTotals(user.id, previousRange),
    getIncomeTransactionCount(user.id),
  ]);

  const salaryMinor = incomeTransactions
    .filter((t) => t.category?.name === "Salary")
    .reduce((sum, t) => sum + t.amountMinor, 0);
  const totalMinor = calculateTotalIncome(incomeTransactions);
  const additionalMinor = totalMinor - salaryMinor;
  const momChange = calculateMonthOverMonthChange(totalMinor, previousTotals.incomeMinor);

  const hasAnyIncomeEver = incomeCount > 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-10">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Income</h1>
          <p className="mt-1 text-sm text-text-secondary">Track salary and other income over time.</p>
        </div>
        <AddIncomeButton />
      </header>

      <div className="mb-6 flex items-center justify-between gap-3">
        <MonthSelector monthLabel={formatFullMonth(monthDate)} monthISO={monthISO} />
      </div>

      {!hasAnyIncomeEver ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border-strong px-6 py-20 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-accent-soft text-accent">
            <Wallet className="size-6" />
          </div>
          <div className="max-w-sm">
            <h2 className="text-lg font-semibold text-text-primary">No income added yet.</h2>
            <p className="mt-1.5 text-sm text-text-secondary">
              Add your monthly salary to see how much you have left after spending.
            </p>
          </div>
          <AddIncomeButton />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <IncomeSummary
            salaryMinor={salaryMinor}
            additionalMinor={additionalMinor}
            totalMinor={totalMinor}
            momChange={momChange}
            currency={currency}
          />
          <TransactionList transactions={incomeTransactions} categories={categories} currency={currency} />
        </div>
      )}
    </div>
  );
}

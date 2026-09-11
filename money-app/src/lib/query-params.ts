import type { PaymentMethod, TransactionType } from "@prisma/client";
import { parseDateInputValue } from "@/lib/dates";
import { toMinorUnits, type CurrencyCode } from "@/lib/money";
import type { TransactionFilters } from "@/db/queries";

export type TransactionsSearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function parseTransactionFilters(
  searchParams: TransactionsSearchParams,
  currency: CurrencyCode
): TransactionFilters {
  const q = first(searchParams.q);
  const categoryId = first(searchParams.categoryId);
  const type = first(searchParams.type);
  const paymentMethod = first(searchParams.paymentMethod);
  const startDate = first(searchParams.startDate);
  const endDate = first(searchParams.endDate);
  const minAmount = first(searchParams.minAmount);
  const maxAmount = first(searchParams.maxAmount);
  const sort = first(searchParams.sort);
  const page = first(searchParams.page);

  return {
    search: q || undefined,
    categoryId: categoryId || undefined,
    type: type ? (type as TransactionType) : undefined,
    paymentMethod: paymentMethod ? (paymentMethod as PaymentMethod) : undefined,
    startDate: startDate ? parseDateInputValue(startDate) : undefined,
    endDate: endDate ? parseDateInputValue(endDate) : undefined,
    minAmountMinor: minAmount ? toMinorUnits(Number.parseFloat(minAmount), currency) : undefined,
    maxAmountMinor: maxAmount ? toMinorUnits(Number.parseFloat(maxAmount), currency) : undefined,
    sort: sort === "oldest" || sort === "highest" || sort === "lowest" ? sort : "newest",
    page: page ? Number.parseInt(page, 10) || 1 : 1,
    pageSize: 25,
  };
}

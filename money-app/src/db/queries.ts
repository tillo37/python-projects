import { Prisma, type Category, type PaymentMethod, type TransactionType } from "@prisma/client";
import { prisma } from "@/db/client";
import type { DateRange } from "@/lib/dates";
import type { CategoryBreakdownEntry } from "@/lib/calculations";

export async function getCategories(userId: string): Promise<Category[]> {
  return prisma.category.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { name: "asc" }],
  });
}

/** Aggregate income/expense totals for a date range using a single grouped SQL query. */
export async function getPeriodTotals(userId: string, range: DateRange) {
  const grouped = await prisma.transaction.groupBy({
    by: ["type"],
    where: { userId, date: { gte: range.start, lte: range.end } },
    _sum: { amountMinor: true },
  });

  const incomeMinor = grouped.find((g) => g.type === "INCOME")?._sum.amountMinor ?? 0;
  const expenseMinor = grouped.find((g) => g.type === "EXPENSE")?._sum.amountMinor ?? 0;
  return { incomeMinor, expenseMinor };
}

/** Category breakdown for a date range, aggregated in SQL via groupBy then joined to category metadata. */
export async function getCategoryBreakdown(
  userId: string,
  range: DateRange,
  type: TransactionType = "EXPENSE"
): Promise<CategoryBreakdownEntry[]> {
  const [grouped, categories] = await Promise.all([
    prisma.transaction.groupBy({
      by: ["categoryId"],
      where: { userId, type, date: { gte: range.start, lte: range.end } },
      _sum: { amountMinor: true },
      _count: { _all: true },
    }),
    getCategories(userId),
  ]);

  const total = grouped.reduce((sum, g) => sum + (g._sum.amountMinor ?? 0), 0);
  const categoryLookup = new Map(categories.map((c) => [c.id, c]));

  const entries: CategoryBreakdownEntry[] = grouped.map((g) => {
    const category = g.categoryId ? categoryLookup.get(g.categoryId) : undefined;
    const totalMinor = g._sum.amountMinor ?? 0;
    return {
      categoryId: g.categoryId,
      name: category?.name ?? "Uncategorized",
      icon: category?.icon ?? "MoreHorizontal",
      color: category?.color ?? "#898781",
      totalMinor,
      percent: total > 0 ? (totalMinor / total) * 100 : 0,
      count: g._count._all,
    };
  });

  return entries.sort((a, b) => b.totalMinor - a.totalMinor);
}

export async function getRecentTransactions(userId: string, limit = 8) {
  return prisma.transaction.findMany({
    where: { userId },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take: limit,
    include: { category: true },
  });
}

export interface TrendBucket {
  bucket: Date;
  incomeMinor: number;
  expenseMinor: number;
}

/** Time-bucketed income/expense trend, aggregated with a single date_trunc SQL query. */
export async function getTrend(
  userId: string,
  range: DateRange,
  granularity: "daily" | "monthly"
): Promise<TrendBucket[]> {
  const truncUnit = granularity === "daily" ? "day" : "month";
  const rows = await prisma.$queryRaw<{ bucket: Date; type: TransactionType; total: bigint }[]>`
    SELECT date_trunc(${truncUnit}, "date") AS bucket, "type" AS type, SUM("amountMinor") AS total
    FROM "Transaction"
    WHERE "userId" = ${userId} AND "date" >= ${range.start} AND "date" <= ${range.end}
    GROUP BY 1, 2
    ORDER BY 1 ASC
  `;

  const byBucket = new Map<number, TrendBucket>();
  for (const row of rows) {
    const key = row.bucket.getTime();
    const existing = byBucket.get(key) ?? { bucket: row.bucket, incomeMinor: 0, expenseMinor: 0 };
    const total = Number(row.total);
    if (row.type === "INCOME") existing.incomeMinor = total;
    else existing.expenseMinor = total;
    byBucket.set(key, existing);
  }

  return Array.from(byBucket.values()).sort((a, b) => a.bucket.getTime() - b.bucket.getTime());
}

export interface TransactionFilters {
  search?: string;
  categoryId?: string;
  type?: TransactionType;
  paymentMethod?: PaymentMethod;
  startDate?: Date;
  endDate?: Date;
  minAmountMinor?: number;
  maxAmountMinor?: number;
  sort?: "newest" | "oldest" | "highest" | "lowest";
  page?: number;
  pageSize?: number;
}

export async function getTransactions(userId: string, filters: TransactionFilters) {
  const {
    search,
    categoryId,
    type,
    paymentMethod,
    startDate,
    endDate,
    minAmountMinor,
    maxAmountMinor,
    sort = "newest",
    page = 1,
    pageSize = 25,
  } = filters;

  const where: Prisma.TransactionWhereInput = {
    userId,
    ...(type ? { type } : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(paymentMethod ? { paymentMethod } : {}),
    ...(startDate || endDate
      ? { date: { ...(startDate ? { gte: startDate } : {}), ...(endDate ? { lte: endDate } : {}) } }
      : {}),
    ...(minAmountMinor !== undefined || maxAmountMinor !== undefined
      ? {
          amountMinor: {
            ...(minAmountMinor !== undefined ? { gte: minAmountMinor } : {}),
            ...(maxAmountMinor !== undefined ? { lte: maxAmountMinor } : {}),
          },
        }
      : {}),
    ...(search
      ? {
          OR: [
            { description: { contains: search, mode: "insensitive" } },
            { merchant: { contains: search, mode: "insensitive" } },
            { category: { name: { contains: search, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const orderBy: Prisma.TransactionOrderByWithRelationInput[] =
    sort === "newest"
      ? [{ date: "desc" }, { createdAt: "desc" }]
      : sort === "oldest"
        ? [{ date: "asc" }, { createdAt: "asc" }]
        : sort === "highest"
          ? [{ amountMinor: "desc" }]
          : [{ amountMinor: "asc" }];

  const [items, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { category: true },
    }),
    prisma.transaction.count({ where }),
  ]);

  return { items, total, page, pageSize, pageCount: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getTransactionById(userId: string, id: string) {
  return prisma.transaction.findFirst({ where: { id, userId }, include: { category: true } });
}

export async function getTotalTransactionCount(userId: string) {
  return prisma.transaction.count({ where: { userId } });
}

export async function getIncomeTransactionCount(userId: string) {
  return prisma.transaction.count({ where: { userId, type: "INCOME" } });
}

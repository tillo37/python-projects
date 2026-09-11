import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/db/client";
import { fromMinorUnits, type CurrencyCode } from "@/lib/money";
import { PAYMENT_METHOD_LABELS } from "@/lib/categories";
import { toDateInputValue } from "@/lib/dates";

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET() {
  const user = await getCurrentUser();
  const currency = user.currency as CurrencyCode;

  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
    include: { category: true },
  });

  const header = [
    "Date",
    "Type",
    "Amount",
    "Currency",
    "Category",
    "Description",
    "Merchant",
    "Payment Method",
    "Notes",
  ];

  const rows = transactions.map((t) =>
    [
      toDateInputValue(t.date),
      t.type,
      fromMinorUnits(t.amountMinor, currency).toFixed(2),
      t.currency,
      t.category?.name ?? "",
      t.description ?? "",
      t.merchant ?? "",
      t.paymentMethod ? PAYMENT_METHOD_LABELS[t.paymentMethod] : "",
      t.notes ?? "",
    ]
      .map((v) => csvEscape(String(v)))
      .join(",")
  );

  const csv = [header.join(","), ...rows].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="ledgr-transactions-${toDateInputValue(new Date())}.csv"`,
    },
  });
}

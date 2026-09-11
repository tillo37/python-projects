"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Category, Transaction } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { TransactionFormDialog } from "./transaction-form-dialog";
import { CategoryIcon } from "@/lib/icon-map";
import { formatMoney, type CurrencyCode } from "@/lib/money";
import { formatDayLabel } from "@/lib/dates";
import { PAYMENT_METHOD_LABELS } from "@/lib/categories";
import { deleteTransaction } from "@/app/actions/transactions";
import { Pencil, Trash2 } from "lucide-react";

type TransactionWithCategory = Transaction & { category: Category | null };

export function TransactionItem({
  transaction,
  categories,
  currency,
  variant,
}: {
  transaction: TransactionWithCategory;
  categories: Category[];
  currency: CurrencyCode;
  variant: "row" | "card";
}) {
  const router = useRouter();
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const iconName = transaction.category?.icon ?? "MoreHorizontal";
  const color = transaction.category?.color ?? "#898781";
  const title = transaction.merchant || transaction.description || transaction.category?.name || "Transaction";

  const amountEl = (
    <span
      className={`shrink-0 text-sm font-semibold tabular-nums ${
        transaction.type === "INCOME" ? "text-positive" : "text-text-primary"
      }`}
    >
      {formatMoney(transaction.amountMinor, currency, { signed: transaction.type === "INCOME" })}
    </span>
  );

  const content =
    variant === "row" ? (
      <button
        onClick={() => setDetailOpen(true)}
        className="grid w-full grid-cols-[1fr_140px_140px_110px] items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="flex items-center gap-3 truncate">
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: `${color}1a`, color }}
          >
            <CategoryIcon name={iconName} className="size-4" />
          </span>
          <span className="truncate">
            <span className="block truncate text-sm font-medium text-text-primary">{title}</span>
            {transaction.description && transaction.merchant && (
              <span className="block truncate text-xs text-text-muted">{transaction.description}</span>
            )}
          </span>
        </span>
        <span className="truncate text-sm text-text-secondary">{transaction.category?.name ?? "Uncategorized"}</span>
        <span className="truncate text-sm text-text-secondary">
          {transaction.paymentMethod ? PAYMENT_METHOD_LABELS[transaction.paymentMethod] : "—"}
        </span>
        <span className="flex items-center justify-between gap-2">
          <span className="text-xs text-text-muted">{formatDayLabel(transaction.date)}</span>
          {amountEl}
        </span>
      </button>
    ) : (
      <button
        onClick={() => setDetailOpen(true)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: `${color}1a`, color }}
        >
          <CategoryIcon name={iconName} className="size-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-text-primary">{title}</span>
          <span className="block truncate text-xs text-text-muted">
            {formatDayLabel(transaction.date)} · {transaction.category?.name ?? "Uncategorized"}
          </span>
        </span>
        {amountEl}
      </button>
    );

  return (
    <>
      {content}

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{transaction.type === "EXPENSE" ? "Expense" : "Income"} details</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs text-text-muted">Amount</p>
              <p
                className={`text-2xl font-semibold tabular-nums ${
                  transaction.type === "INCOME" ? "text-positive" : "text-text-primary"
                }`}
              >
                {formatMoney(transaction.amountMinor, currency, { signed: transaction.type === "INCOME" })}
              </p>
            </div>

            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs text-text-muted">Category</dt>
                <dd className="mt-0.5 flex items-center gap-1.5 text-text-primary">
                  <CategoryIcon name={iconName} className="size-3.5" style={{ color }} />
                  {transaction.category?.name ?? "Uncategorized"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-text-muted">Date</dt>
                <dd className="mt-0.5 text-text-primary">{formatDayLabel(transaction.date)}</dd>
              </div>
              <div>
                <dt className="text-xs text-text-muted">Payment method</dt>
                <dd className="mt-0.5 text-text-primary">
                  {transaction.paymentMethod ? PAYMENT_METHOD_LABELS[transaction.paymentMethod] : "Not set"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-text-muted">Created</dt>
                <dd className="mt-0.5 text-text-primary">{formatDayLabel(transaction.createdAt)}</dd>
              </div>
              {transaction.description && (
                <div className="col-span-2">
                  <dt className="text-xs text-text-muted">Description</dt>
                  <dd className="mt-0.5 text-text-primary">{transaction.description}</dd>
                </div>
              )}
              {transaction.notes && (
                <div className="col-span-2">
                  <dt className="text-xs text-text-muted">Notes</dt>
                  <dd className="mt-0.5 whitespace-pre-wrap text-text-primary">{transaction.notes}</dd>
                </div>
              )}
            </dl>
          </div>

          <DialogFooter className="justify-between sm:justify-between">
            <Button
              variant="ghost"
              className="text-negative hover:text-negative"
              onClick={() => {
                setDetailOpen(false);
                setDeleteOpen(true);
              }}
            >
              <Trash2 className="size-4" />
              Delete
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setDetailOpen(false);
                setEditOpen(true);
              }}
            >
              <Pencil className="size-4" />
              Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TransactionFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        type={transaction.type}
        categories={categories}
        currency={currency}
        transaction={transaction}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this transaction?"
        description="This action can't be undone."
        onConfirm={() => deleteTransaction(transaction.id)}
        onSuccess={() => {
          toast.success("Transaction deleted");
          router.refresh();
        }}
      />
    </>
  );
}

"use client";

import { useState, useTransition } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CategoryIcon } from "@/lib/icon-map";
import { currencySymbol, fromMinorUnits, type CurrencyCode } from "@/lib/money";
import { todayDateInputValue, toDateInputValue } from "@/lib/dates";
import { PAYMENT_METHOD_LABELS } from "@/lib/categories";
import { createTransaction, updateTransaction } from "@/app/actions/transactions";
import type { TransactionInput } from "@/lib/validations";

type TransactionType = "EXPENSE" | "INCOME";

interface TransactionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: TransactionType;
  categories: Category[];
  currency: CurrencyCode;
  transaction?: Transaction | null;
  onSaved?: () => void;
}

const PAYMENT_METHODS = Object.keys(PAYMENT_METHOD_LABELS) as (keyof typeof PAYMENT_METHOD_LABELS)[];

export function TransactionFormDialog({
  open,
  onOpenChange,
  type,
  categories,
  currency,
  transaction,
  onSaved,
}: TransactionFormDialogProps) {
  const isEdit = Boolean(transaction);
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const relevantCategories = categories.filter((c) => c.type === type || c.type === "BOTH");

  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [date, setDate] = useState(todayDateInputValue());
  const [merchant, setMerchant] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  // Re-seed the form fields the moment the dialog transitions to open,
  // rather than in an effect — this is React's documented "adjust state
  // during render" escape hatch, so the reset happens in the same commit
  // (no extra render pass) instead of after a mount-then-effect round trip.
  // For a brand-new (non-edit) entry, the category is deliberately left
  // untouched so the last-used category carries over, per the "fast entry"
  // requirement.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      if (transaction) {
        setAmount(String(fromMinorUnits(transaction.amountMinor, currency)));
        setCategoryId(transaction.categoryId ?? "");
        setDate(toDateInputValue(transaction.date));
        setMerchant(transaction.merchant ?? "");
        setDescription(transaction.description ?? "");
        setNotes(transaction.notes ?? "");
        setPaymentMethod(transaction.paymentMethod ?? "");
        setIsRecurring(transaction.isRecurring);
      } else {
        setAmount("");
        setDate(todayDateInputValue());
        setMerchant("");
        setDescription("");
        setNotes("");
        setPaymentMethod("");
        setIsRecurring(false);
      }
      setErrors({});
      setFormError(null);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const parsedAmount = Number.parseFloat(amount);
    const input: TransactionInput = {
      type,
      amount: parsedAmount,
      categoryId,
      date,
      merchant,
      description,
      notes,
      paymentMethod: (paymentMethod || undefined) as TransactionInput["paymentMethod"],
      isRecurring,
      recurrenceFrequency: isRecurring ? "MONTHLY" : "NONE",
    };

    startTransition(async () => {
      const result = isEdit
        ? await updateTransaction(transaction!.id, input)
        : await createTransaction(input);

      if (result.success) {
        toast.success(isEdit ? "Transaction updated" : type === "EXPENSE" ? "Expense added" : "Income added");
        onOpenChange(false);
        onSaved?.();
        router.refresh();
      } else {
        setErrors(result.fieldErrors ?? {});
        setFormError(result.error ?? "Something went wrong.");
      }
    });
  }

  const noun = type === "EXPENSE" ? "expense" : "income";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? `Edit ${noun}` : `Add ${noun}`}</DialogTitle>
          <DialogDescription>
            {isEdit ? `Update the details of this ${noun}.` : `Record a new ${noun} in a few seconds.`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-muted">
                  {currencySymbol(currency)}
                </span>
                <Input
                  id="amount"
                  inputMode="decimal"
                  autoFocus
                  placeholder="0.00"
                  className="pl-7 text-lg font-semibold tabular-nums"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  aria-invalid={Boolean(errors.amount)}
                />
              </div>
              {errors.amount && <p className="text-xs text-negative">{errors.amount}</p>}
            </div>

            <div className="col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="category">Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger id="category" aria-invalid={Boolean(errors.categoryId)}>
                  <SelectValue placeholder="Choose a category" />
                </SelectTrigger>
                <SelectContent>
                  {relevantCategories.map((c) => {
                    return (
                      <SelectItem key={c.id} value={c.id}>
                        <span className="flex items-center gap-2">
                          <CategoryIcon name={c.icon} className="size-3.5" style={{ color: c.color }} />
                          {c.name}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {errors.categoryId && <p className="text-xs text-negative">{errors.categoryId}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={todayDateInputValue()}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="paymentMethod">Payment method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger id="paymentMethod">
                  <SelectValue placeholder="Optional" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {PAYMENT_METHOD_LABELS[m]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="merchant">{type === "EXPENSE" ? "Merchant" : "Source"}</Label>
              <Input
                id="merchant"
                placeholder={type === "EXPENSE" ? "e.g. Costco" : "e.g. Acme Corp"}
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                maxLength={120}
              />
            </div>

            <div className="col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Optional"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={200}
              />
            </div>

            <div className="col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Optional"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={1000}
              />
            </div>

            <div className="col-span-2 flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
              <div>
                <p className="text-sm font-medium text-text-primary">Repeat monthly</p>
                <p className="text-xs text-text-muted">Mark this as a recurring {noun}</p>
              </div>
              <Switch checked={isRecurring} onCheckedChange={setIsRecurring} />
            </div>
          </div>

          {formError && <p className="text-sm text-negative">{formError}</p>}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : isEdit ? "Save changes" : `Add ${noun}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/db/client";
import { getCurrentUser } from "@/lib/auth";
import { parseDateInputValue } from "@/lib/dates";
import { toMinorUnits, type CurrencyCode } from "@/lib/money";
import { transactionInputSchema, type TransactionInput } from "@/lib/validations";

export interface ActionResult<T = undefined> {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  data?: T;
}

function fail<T = undefined>(error: string, fieldErrors?: Record<string, string>): ActionResult<T> {
  return { success: false, error, fieldErrors };
}

async function assertOwnedCategory(userId: string, categoryId: string) {
  const category = await prisma.category.findFirst({ where: { id: categoryId, userId } });
  if (!category) {
    throw new Error("CATEGORY_NOT_FOUND");
  }
  return category;
}

export async function createTransaction(input: TransactionInput): Promise<ActionResult<{ id: string }>> {
  const parsed = transactionInputSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString() ?? "form";
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return fail("Please fix the highlighted fields.", fieldErrors);
  }

  try {
    const user = await getCurrentUser();
    await assertOwnedCategory(user.id, parsed.data.categoryId);

    const created = await prisma.transaction.create({
      data: {
        userId: user.id,
        type: parsed.data.type,
        amountMinor: toMinorUnits(parsed.data.amount, user.currency as CurrencyCode),
        currency: user.currency,
        categoryId: parsed.data.categoryId,
        date: parseDateInputValue(parsed.data.date),
        description: parsed.data.description || null,
        merchant: parsed.data.merchant || null,
        notes: parsed.data.notes || null,
        paymentMethod: parsed.data.paymentMethod ?? null,
        isRecurring: parsed.data.isRecurring ?? false,
        recurrenceFrequency: parsed.data.isRecurring ? (parsed.data.recurrenceFrequency ?? "MONTHLY") : "NONE",
      },
    });

    revalidatePath("/", "layout");
    return { success: true, data: { id: created.id } };
  } catch (err) {
    if (err instanceof Error && err.message === "CATEGORY_NOT_FOUND") {
      return fail("That category could not be found.", { categoryId: "Choose a valid category" });
    }
    console.error("createTransaction failed", err);
    return fail("Something went wrong while saving. Please try again.");
  }
}

export async function updateTransaction(
  id: string,
  input: TransactionInput
): Promise<ActionResult<{ id: string }>> {
  const parsed = transactionInputSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString() ?? "form";
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return fail("Please fix the highlighted fields.", fieldErrors);
  }

  try {
    const user = await getCurrentUser();
    const existing = await prisma.transaction.findFirst({ where: { id, userId: user.id } });
    if (!existing) return fail("Transaction not found.");

    await assertOwnedCategory(user.id, parsed.data.categoryId);

    await prisma.transaction.update({
      where: { id },
      data: {
        type: parsed.data.type,
        amountMinor: toMinorUnits(parsed.data.amount, user.currency as CurrencyCode),
        categoryId: parsed.data.categoryId,
        date: parseDateInputValue(parsed.data.date),
        description: parsed.data.description || null,
        merchant: parsed.data.merchant || null,
        notes: parsed.data.notes || null,
        paymentMethod: parsed.data.paymentMethod ?? null,
        isRecurring: parsed.data.isRecurring ?? false,
        recurrenceFrequency: parsed.data.isRecurring ? (parsed.data.recurrenceFrequency ?? "MONTHLY") : "NONE",
      },
    });

    revalidatePath("/", "layout");
    return { success: true, data: { id } };
  } catch (err) {
    if (err instanceof Error && err.message === "CATEGORY_NOT_FOUND") {
      return fail("That category could not be found.", { categoryId: "Choose a valid category" });
    }
    console.error("updateTransaction failed", err);
    return fail("Something went wrong while saving. Please try again.");
  }
}

export async function deleteTransaction(id: string): Promise<ActionResult> {
  try {
    const user = await getCurrentUser();
    const existing = await prisma.transaction.findFirst({ where: { id, userId: user.id } });
    if (!existing) return fail("Transaction not found.");

    await prisma.transaction.delete({ where: { id } });
    revalidatePath("/", "layout");
    return { success: true };
  } catch (err) {
    console.error("deleteTransaction failed", err);
    return fail("Something went wrong while deleting. Please try again.");
  }
}

/**
 * Deletes every transaction for the current user, zeroing out all totals.
 * Categories and profile preferences are deliberately kept — resetting is
 * about clearing the ledger, not rebuilding the setup from scratch.
 */
export async function resetAllTransactions(): Promise<ActionResult<{ deleted: number }>> {
  try {
    const user = await getCurrentUser();
    const { count } = await prisma.transaction.deleteMany({ where: { userId: user.id } });

    revalidatePath("/", "layout");
    return { success: true, data: { deleted: count } };
  } catch (err) {
    console.error("resetAllTransactions failed", err);
    return fail("Something went wrong while resetting. Please try again.");
  }
}

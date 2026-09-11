import { z } from "zod";

export const paymentMethodSchema = z.enum(["CASH", "CREDIT_CARD", "DEBIT_CARD", "BANK_TRANSFER", "OTHER"]);
export const transactionTypeSchema = z.enum(["INCOME", "EXPENSE"]);
export const categoryTypeSchema = z.enum(["EXPENSE", "INCOME", "BOTH"]);
export const recurrenceFrequencySchema = z.enum(["NONE", "MONTHLY"]);

export const transactionInputSchema = z.object({
  type: transactionTypeSchema,
  amount: z
    .number({ error: "Enter an amount" })
    .positive("Amount must be greater than 0")
    .max(1_000_000_000, "That amount is too large"),
  categoryId: z.string().min(1, "Choose a category"),
  date: z.string().refine((v) => !Number.isNaN(Date.parse(v)), "Enter a valid date"),
  description: z.string().max(200, "Keep descriptions under 200 characters").optional().or(z.literal("")),
  merchant: z.string().max(120, "Keep merchant names under 120 characters").optional().or(z.literal("")),
  notes: z.string().max(1000, "Keep notes under 1000 characters").optional().or(z.literal("")),
  paymentMethod: paymentMethodSchema.optional(),
  isRecurring: z.boolean().optional(),
  recurrenceFrequency: recurrenceFrequencySchema.optional(),
});

export type TransactionInput = z.infer<typeof transactionInputSchema>;

export const categoryInputSchema = z.object({
  name: z.string().min(1, "Name is required").max(40, "Keep names under 40 characters"),
  icon: z.string().min(1, "Choose an icon"),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Choose a valid color"),
  type: categoryTypeSchema,
});

export type CategoryInput = z.infer<typeof categoryInputSchema>;

export const userPreferencesSchema = z.object({
  name: z.string().min(1, "Name is required").max(80),
  currency: z.enum(["USD", "KRW", "EUR", "GBP", "JPY"]),
  weekStartsOn: z.number().int().min(0).max(1),
});

export type UserPreferencesInput = z.infer<typeof userPreferencesSchema>;

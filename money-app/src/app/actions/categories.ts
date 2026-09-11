"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/db/client";
import { getCurrentUser } from "@/lib/auth";
import { categoryInputSchema, type CategoryInput } from "@/lib/validations";
import type { ActionResult } from "./transactions";

function fail<T = undefined>(error: string, fieldErrors?: Record<string, string>): ActionResult<T> {
  return { success: false, error, fieldErrors };
}

export async function createCategory(input: CategoryInput): Promise<ActionResult<{ id: string }>> {
  const parsed = categoryInputSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[issue.path[0]?.toString() ?? "form"] = issue.message;
    return fail("Please fix the highlighted fields.", fieldErrors);
  }

  try {
    const user = await getCurrentUser();
    const existing = await prisma.category.findFirst({
      where: { userId: user.id, name: { equals: parsed.data.name, mode: "insensitive" } },
    });
    if (existing) return fail("A category with this name already exists.", { name: "Already exists" });

    const created = await prisma.category.create({
      data: { userId: user.id, ...parsed.data, isDefault: false },
    });

    revalidatePath("/", "layout");
    return { success: true, data: { id: created.id } };
  } catch (err) {
    console.error("createCategory failed", err);
    return fail("Something went wrong while saving. Please try again.");
  }
}

export async function updateCategory(id: string, input: CategoryInput): Promise<ActionResult> {
  const parsed = categoryInputSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[issue.path[0]?.toString() ?? "form"] = issue.message;
    return fail("Please fix the highlighted fields.", fieldErrors);
  }

  try {
    const user = await getCurrentUser();
    const existing = await prisma.category.findFirst({ where: { id, userId: user.id } });
    if (!existing) return fail("Category not found.");

    await prisma.category.update({ where: { id }, data: parsed.data });
    revalidatePath("/", "layout");
    return { success: true };
  } catch (err) {
    console.error("updateCategory failed", err);
    return fail("Something went wrong while saving. Please try again.");
  }
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  try {
    const user = await getCurrentUser();
    const existing = await prisma.category.findFirst({ where: { id, userId: user.id } });
    if (!existing) return fail("Category not found.");
    if (existing.isDefault) return fail("Default categories can't be deleted.");

    const usageCount = await prisma.transaction.count({ where: { categoryId: id } });
    if (usageCount > 0) {
      return fail(
        `This category is used by ${usageCount} transaction${usageCount === 1 ? "" : "s"}. Reassign them first.`
      );
    }

    await prisma.category.delete({ where: { id } });
    revalidatePath("/", "layout");
    return { success: true };
  } catch (err) {
    console.error("deleteCategory failed", err);
    return fail("Something went wrong while deleting. Please try again.");
  }
}

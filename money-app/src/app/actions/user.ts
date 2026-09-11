"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/db/client";
import { getCurrentUser } from "@/lib/auth";
import { userPreferencesSchema, type UserPreferencesInput } from "@/lib/validations";
import type { ActionResult } from "./transactions";

function fail<T = undefined>(error: string, fieldErrors?: Record<string, string>): ActionResult<T> {
  return { success: false, error, fieldErrors };
}

export async function updateUserPreferences(input: UserPreferencesInput): Promise<ActionResult> {
  const parsed = userPreferencesSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[issue.path[0]?.toString() ?? "form"] = issue.message;
    return fail("Please fix the highlighted fields.", fieldErrors);
  }

  try {
    const user = await getCurrentUser();
    await prisma.user.update({ where: { id: user.id }, data: parsed.data });
    revalidatePath("/", "layout");
    return { success: true };
  } catch (err) {
    console.error("updateUserPreferences failed", err);
    return fail("Something went wrong while saving. Please try again.");
  }
}

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Category } from "@prisma/client";
import { Plus, Pencil, Trash2, Lock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CategoryIcon } from "@/lib/icon-map";
import { deleteCategory } from "@/app/actions/categories";
import { CategoryFormDialog } from "./category-form-dialog";

export function CategoryManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);

  const groups = useMemo(() => {
    const expense = categories.filter((c) => c.type === "EXPENSE");
    const income = categories.filter((c) => c.type === "INCOME");
    const both = categories.filter((c) => c.type === "BOTH");
    return [
      { label: "Expense categories", items: expense },
      { label: "Income categories", items: income },
      ...(both.length ? [{ label: "Used for both", items: both }] : []),
    ];
  }, [categories]);

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between">
        <div>
          <CardTitle>Categories</CardTitle>
          <CardDescription>Organize spending and income into categories you can filter and chart by.</CardDescription>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="size-4" />
          New category
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {groups.map((group) => (
          <div key={group.label}>
            <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-text-muted">{group.label}</h3>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {group.items.map((category) => {
                return (
                  <div
                    key={category.id}
                    className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5"
                  >
                    <span
                      className="flex size-8 shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: `${category.color}1a`, color: category.color }}
                    >
                      <CategoryIcon name={category.icon} className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-text-primary">
                      {category.name}
                    </span>
                    <button
                      onClick={() => {
                        setEditing(category);
                        setFormOpen(true);
                      }}
                      className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-surface-raised hover:text-text-primary"
                      aria-label={`Edit ${category.name}`}
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    {category.isDefault ? (
                      <span
                        className="rounded-md p-1.5 text-text-muted/50"
                        title="Default categories can't be deleted"
                      >
                        <Lock className="size-3.5" />
                      </span>
                    ) : (
                      <button
                        onClick={() => setDeleting(category)}
                        className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-negative-soft hover:text-negative"
                        aria-label={`Delete ${category.name}`}
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </CardContent>

      <CategoryFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        category={editing}
        onSaved={() => router.refresh()}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Delete "${deleting?.name}"?`}
        description="This can't be undone. Categories used by existing transactions can't be deleted."
        onConfirm={() => deleteCategory(deleting!.id)}
        onSuccess={() => {
          toast.success("Category deleted");
          router.refresh();
        }}
      />
    </Card>
  );
}

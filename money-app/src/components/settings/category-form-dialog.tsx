"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { Category } from "@prisma/client";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CategoryIcon, SELECTABLE_ICON_NAMES } from "@/lib/icon-map";
import { CATEGORICAL_PALETTE } from "@/lib/categories";
import { createCategory, updateCategory } from "@/app/actions/categories";
import { cn } from "@/lib/utils";

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
  onSaved?: () => void;
}

const OTHER_COLOR = "#a6a49c";
const COLOR_OPTIONS = [...CATEGORICAL_PALETTE, OTHER_COLOR];

export function CategoryFormDialog({ open, onOpenChange, category, onSaved }: CategoryFormDialogProps) {
  const isEdit = Boolean(category);
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [type, setType] = useState<"EXPENSE" | "INCOME" | "BOTH">("EXPENSE");
  const [icon, setIcon] = useState<string>(SELECTABLE_ICON_NAMES[0]);
  const [color, setColor] = useState<string>(COLOR_OPTIONS[0]);
  const [error, setError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);

  // Re-seed the form fields the moment the dialog transitions to open, rather
  // than in an effect — this is React's documented "adjust state during
  // render" escape hatch, so the reset happens in the same commit (no extra
  // render pass) instead of after a mount-then-effect round trip.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setName(category?.name ?? "");
      setType(category?.type ?? "EXPENSE");
      setIcon(category?.icon ?? SELECTABLE_ICON_NAMES[0]);
      setColor(category?.color ?? COLOR_OPTIONS[0]);
      setError(null);
      setNameError(null);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNameError(null);

    startTransition(async () => {
      const input = { name, type, icon, color };
      const result = isEdit ? await updateCategory(category!.id, input) : await createCategory(input);

      if (result.success) {
        toast.success(isEdit ? "Category updated" : "Category created");
        onOpenChange(false);
        onSaved?.();
      } else {
        setError(result.error ?? "Something went wrong.");
        setNameError(result.fieldErrors?.name ?? null);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit category" : "New category"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update this category's name, icon, or color." : "Create a custom category for your transactions."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="category-name">Name</Label>
            <Input id="category-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} aria-invalid={Boolean(nameError)} />
            {nameError && <p className="text-xs text-negative">{nameError}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="category-type">Applies to</Label>
            <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
              <SelectTrigger id="category-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EXPENSE">Expenses</SelectItem>
                <SelectItem value="INCOME">Income</SelectItem>
                <SelectItem value="BOTH">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full ring-offset-2 ring-offset-surface transition-shadow",
                    color === c && "ring-2 ring-text-primary"
                  )}
                  style={{ backgroundColor: c }}
                  aria-label={`Choose color ${c}`}
                  aria-pressed={color === c}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Icon</Label>
            <div className="grid grid-cols-8 gap-2 rounded-lg border border-border p-2">
              {SELECTABLE_ICON_NAMES.map((iconName) => {
                const active = icon === iconName;
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setIcon(iconName)}
                    className={cn(
                      "flex size-8 items-center justify-center rounded-lg transition-colors",
                      active ? "bg-accent text-accent-foreground" : "text-text-secondary hover:bg-surface-raised"
                    )}
                    aria-label={iconName}
                    aria-pressed={active}
                  >
                    <CategoryIcon name={iconName} className="size-4" />
                  </button>
                );
              })}
            </div>
          </div>

          {error && <p className="text-sm text-negative">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending || !name.trim()}>
              {pending ? "Saving…" : isEdit ? "Save changes" : "Create category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

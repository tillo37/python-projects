"use client";

import { useEffect, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { Category } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSearchParamsUpdater } from "@/hooks/use-search-params-updater";
import { MoreFiltersSheet } from "./more-filters-sheet";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "highest", label: "Highest amount" },
  { value: "lowest", label: "Lowest amount" },
];

export function TransactionsToolbar({ categories }: { categories: Category[] }) {
  const { update, searchParams } = useSearchParamsUpdater();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    const handle = setTimeout(() => {
      if (search !== (searchParams.get("q") ?? "")) update({ q: search || undefined });
    }, 350);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const activeSecondaryCount = ["paymentMethod", "startDate", "endDate", "minAmount", "maxAmount"].filter((k) =>
    searchParams.get(k)
  ).length;

  const type = searchParams.get("type") ?? "all";
  const categoryId = searchParams.get("categoryId") ?? "all";
  const sort = searchParams.get("sort") ?? "newest";

  const hasAnyFilter = search || type !== "all" || categoryId !== "all" || activeSecondaryCount > 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
          <Input
            placeholder="Search merchant, description, category…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select value={type} onValueChange={(v) => update({ type: v === "all" ? undefined : v })}>
          <SelectTrigger className="w-[132px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="EXPENSE">Expenses</SelectItem>
            <SelectItem value="INCOME">Income</SelectItem>
          </SelectContent>
        </Select>

        <Select value={categoryId} onValueChange={(v) => update({ categoryId: v === "all" ? undefined : v })}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={(v) => update({ sort: v }, { resetPage: false })}>
          <SelectTrigger className="w-[152px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={() => setFiltersOpen(true)} className="relative">
          <SlidersHorizontal className="size-4" />
          Filters
          {activeSecondaryCount > 0 && (
            <span className="ml-0.5 flex size-5 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-accent-foreground">
              {activeSecondaryCount}
            </span>
          )}
        </Button>

        {hasAnyFilter && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch("");
              update({
                q: undefined,
                type: undefined,
                categoryId: undefined,
                paymentMethod: undefined,
                startDate: undefined,
                endDate: undefined,
                minAmount: undefined,
                maxAmount: undefined,
              });
            }}
          >
            <X className="size-3.5" />
            Clear
          </Button>
        )}
      </div>

      <MoreFiltersSheet open={filtersOpen} onOpenChange={setFiltersOpen} />
    </div>
  );
}

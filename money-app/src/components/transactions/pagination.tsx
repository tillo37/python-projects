"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSearchParamsUpdater } from "@/hooks/use-search-params-updater";

export function Pagination({ page, pageCount, total }: { page: number; pageCount: number; total: number }) {
  const { update } = useSearchParamsUpdater();

  if (total === 0) return null;

  return (
    <div className="flex items-center justify-between px-1 py-2">
      <p className="text-xs text-text-muted">
        Page {page} of {pageCount} · {total} transaction{total === 1 ? "" : "s"}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => update({ page: String(page - 1) }, { resetPage: false })}
        >
          <ChevronLeft className="size-3.5" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= pageCount}
          onClick={() => update({ page: String(page + 1) }, { resetPage: false })}
        >
          Next
          <ChevronRight className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

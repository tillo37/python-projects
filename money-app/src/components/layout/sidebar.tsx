"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, Wallet2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./nav-items";
import { Button } from "@/components/ui/button";
import { useQuickAdd } from "@/components/transactions/quick-add-context";
import { ThemeToggle } from "./theme-toggle";

export function Sidebar({ userName }: { userName: string }) {
  const pathname = usePathname();
  const { openAddExpense } = useQuickAdd();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-surface md:flex">
      <div className="flex items-center gap-2 px-6 pt-6 pb-5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <Wallet2 className="size-4" />
        </div>
        <span className="text-[15px] font-semibold tracking-tight text-text-primary">Ledgr</span>
      </div>

      <div className="px-4">
        <Button className="w-full" onClick={openAddExpense}>
          <Plus className="size-4" />
          Add expense
        </Button>
      </div>

      <nav className="mt-6 flex flex-1 flex-col gap-0.5 px-3">
        {NAV_ITEMS.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-accent-soft text-accent"
                  : "text-text-secondary hover:bg-surface-raised hover:text-text-primary"
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="size-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center justify-between border-t border-border px-4 py-4">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-raised text-sm font-semibold text-text-secondary">
            {userName.charAt(0).toUpperCase()}
          </div>
          <span className="truncate text-sm font-medium text-text-primary">{userName}</span>
        </div>
        <ThemeToggle />
      </div>
    </aside>
  );
}

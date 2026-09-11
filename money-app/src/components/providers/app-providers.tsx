"use client";

import type { Category } from "@prisma/client";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { QuickAddProvider } from "@/components/transactions/quick-add-context";
import type { CurrencyCode } from "@/lib/money";

export function AppProviders({
  categories,
  currency,
  children,
}: {
  categories: Category[];
  currency: CurrencyCode;
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <QuickAddProvider categories={categories} currency={currency}>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "var(--color-surface)",
              color: "var(--color-text-primary)",
              border: "1px solid var(--color-border)",
            },
          }}
        />
      </QuickAddProvider>
    </ThemeProvider>
  );
}

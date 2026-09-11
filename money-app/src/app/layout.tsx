import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { getCurrentUser } from "@/lib/auth";
import { getCategories } from "@/db/queries";
import { AppProviders } from "@/components/providers/app-providers";
import { AppShell } from "@/components/layout/app-shell";
import type { CurrencyCode } from "@/lib/money";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ledgr — Personal Finance",
  description: "Track spending, income, and savings in one calm, clear place.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();
  const categories = await getCategories(user.id);

  return (
    <html lang="en" className={`${manrope.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full">
        <AppProviders categories={categories} currency={user.currency as CurrencyCode}>
          <AppShell userName={user.name}>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}

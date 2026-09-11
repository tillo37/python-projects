// Live financial data must never be statically prerendered.
export const dynamic = "force-dynamic";

import { getCurrentUser } from "@/lib/auth";
import { getCategories } from "@/db/queries";
import type { CurrencyCode } from "@/lib/money";
import { ProfileForm } from "@/components/settings/profile-form";
import { ThemeCard } from "@/components/settings/theme-card";
import { CategoryManager } from "@/components/settings/category-manager";
import { DataCard } from "@/components/settings/data-card";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  const categories = await getCategories(user.id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:px-8 md:py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Settings</h1>
        <p className="mt-1 text-sm text-text-secondary">Manage your profile, preferences, and categories.</p>
      </header>

      <div className="flex flex-col gap-6">
        <ProfileForm
          name={user.name}
          email={user.email}
          currency={user.currency as CurrencyCode}
          weekStartsOn={user.weekStartsOn}
        />
        <ThemeCard />
        <CategoryManager categories={categories} />
        <DataCard />
      </div>
    </div>
  );
}

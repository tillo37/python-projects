// Live financial data must never be statically prerendered.
export const dynamic = "force-dynamic";

import { getAnalyticsData } from "@/app/actions/analytics";
import { AnalyticsContent } from "@/components/analytics/analytics-content";

export default async function AnalyticsPage() {
  const data = await getAnalyticsData("thisMonth");

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Analytics</h1>
        <p className="mt-1 text-sm text-text-secondary">
          A closer look at your spending patterns and financial trends.
        </p>
      </header>

      <AnalyticsContent initialData={data} />
    </div>
  );
}

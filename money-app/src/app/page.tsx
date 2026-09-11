// Live financial data must never be statically prerendered.
export const dynamic = "force-dynamic";

import { getCurrentUser } from "@/lib/auth";
import { getTotalTransactionCount } from "@/db/queries";
import { getDashboardData } from "@/app/actions/dashboard";
import { getGreeting } from "@/lib/greeting";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { DashboardEmptyState } from "@/components/dashboard/empty-state";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const [transactionCount, data] = await Promise.all([
    getTotalTransactionCount(user.id),
    getDashboardData("thisMonth"),
  ]);

  const firstName = user.name.split(" ")[0];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
          {getGreeting()}, {firstName}
        </h1>
        <p className="mt-1 text-sm text-text-secondary">Here&apos;s your financial overview.</p>
      </header>

      {transactionCount === 0 ? <DashboardEmptyState /> : <DashboardContent initialData={data} />}
    </div>
  );
}

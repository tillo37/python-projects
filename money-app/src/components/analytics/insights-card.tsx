import { Lightbulb, TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Insight } from "@/app/actions/analytics";

export function InsightsCard({ insights }: { insights: Insight[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending insights</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {insights.map((insight, i) => {
          const Icon = insight.tone === "positive" ? TrendingDown : insight.tone === "negative" ? TrendingUp : Lightbulb;
          return (
            <div key={i} className="flex items-start gap-3 rounded-lg border border-border p-3">
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full",
                  insight.tone === "positive" && "bg-positive-soft text-positive",
                  insight.tone === "negative" && "bg-negative-soft text-negative",
                  insight.tone === "neutral" && "bg-accent-soft text-accent"
                )}
              >
                <Icon className="size-4" />
              </span>
              <p className="text-sm text-text-primary">{insight.text}</p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Download, RotateCcw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { resetAllTransactions } from "@/app/actions/transactions";

export function DataCard() {
  const router = useRouter();
  const [resetOpen, setResetOpen] = useState(false);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Your data</CardTitle>
          <CardDescription>Export your transactions, or start over from zero.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" asChild>
              <a href="/api/export">
                <Download className="size-4" />
                Export transactions (CSV)
              </a>
            </Button>
            <Button variant="destructive" onClick={() => setResetOpen(true)}>
              <RotateCcw className="size-4" />
              Reset all data
            </Button>
          </div>
          <p className="text-sm text-text-secondary">
            Resetting deletes every transaction, setting spending and income back to zero. Your categories and
            profile settings are kept. Export first if you want a copy.
          </p>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Reset all data?"
        description="Every transaction will be permanently deleted and all totals will return to zero. Your categories and profile settings are kept. This can't be undone."
        confirmLabel="Reset everything"
        onConfirm={resetAllTransactions}
        onSuccess={() => {
          toast.success("All data reset — you're starting from zero");
          router.refresh();
        }}
      />
    </>
  );
}

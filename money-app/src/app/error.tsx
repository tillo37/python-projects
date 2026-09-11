"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-[#f7f7f5] p-6">
        <div className="flex max-w-sm flex-col items-center gap-3 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-red-50 text-red-600">
            <AlertTriangle className="size-6" />
          </div>
          <h1 className="text-lg font-semibold text-[#0b0b0f]">Something went wrong</h1>
          <p className="text-sm text-[#55564f]">
            We ran into a problem loading your financial data. Please try again.
          </p>
          <Button onClick={reset} className="mt-2">
            Try again
          </Button>
        </div>
      </body>
    </html>
  );
}

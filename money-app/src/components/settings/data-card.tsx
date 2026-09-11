import { Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function DataCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your data</CardTitle>
        <CardDescription>Export every transaction as a CSV file.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="secondary" asChild>
          <a href="/api/export">
            <Download className="size-4" />
            Export transactions (CSV)
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}

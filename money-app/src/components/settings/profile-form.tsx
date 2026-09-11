"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateUserPreferences } from "@/app/actions/user";
import { CURRENCY_OPTIONS, type CurrencyCode } from "@/lib/money";

export function ProfileForm({
  name,
  email,
  currency,
  weekStartsOn,
}: {
  name: string;
  email: string;
  currency: CurrencyCode;
  weekStartsOn: number;
}) {
  const [nameValue, setNameValue] = useState(name);
  const [currencyValue, setCurrencyValue] = useState<CurrencyCode>(currency);
  const [weekValue, setWeekValue] = useState(String(weekStartsOn));
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const result = await updateUserPreferences({
        name: nameValue,
        currency: currencyValue,
        weekStartsOn: Number(weekValue),
      });
      if (result.success) {
        toast.success("Settings saved");
      } else {
        setError(result.error ?? "Something went wrong.");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile &amp; preferences</CardTitle>
        <CardDescription>Your account details and how the app should display money.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={nameValue} onChange={(e) => setNameValue(e.target.value)} maxLength={80} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={email} disabled />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="currency">Currency</Label>
            <Select value={currencyValue} onValueChange={(v) => setCurrencyValue(v as CurrencyCode)}>
              <SelectTrigger id="currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCY_OPTIONS.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="weekStart">Week starts on</Label>
            <Select value={weekValue} onValueChange={setWeekValue}>
              <SelectTrigger id="weekStart">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Sunday</SelectItem>
                <SelectItem value="1">Monday</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && <p className="text-sm text-negative">{error}</p>}

        <div>
          <Button onClick={handleSave} disabled={pending}>
            {pending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

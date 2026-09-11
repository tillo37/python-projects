import {
  eachMonthOfInterval,
  endOfDay,
  endOfMonth,
  format,
  isWithinInterval,
  startOfDay,
  startOfMonth,
  subMonths,
} from "date-fns";

export type Period = "thisMonth" | "lastMonth" | "3months" | "6months" | "1year";

export const PERIOD_LABELS: Record<Period, string> = {
  thisMonth: "This Month",
  lastMonth: "Last Month",
  "3months": "3 Months",
  "6months": "6 Months",
  "1year": "1 Year",
};

export const PERIOD_ORDER: Period[] = ["thisMonth", "lastMonth", "3months", "6months", "1year"];

export const PERIOD_COMPARISON_LABELS: Record<Period, string> = {
  thisMonth: "vs last month",
  lastMonth: "vs the month before",
  "3months": "vs previous 3 months",
  "6months": "vs previous 6 months",
  "1year": "vs previous year",
};

export interface DateRange {
  start: Date;
  end: Date;
}

/**
 * Centralized period math. All ranges are inclusive [start, end] calendar-day
 * windows, anchored to `reference` (defaults to now). "1year" is implemented
 * as a rolling 12-calendar-month window (current month + previous 11) rather
 * than a strict trailing-365-days window, so it lines up with how the
 * 3/6-month windows are defined (current month + N-1 previous months).
 */
export function getPeriodRange(period: Period, reference: Date = new Date()): DateRange {
  const monthsBack: Record<Period, number> = {
    thisMonth: 0,
    lastMonth: 1,
    "3months": 2,
    "6months": 5,
    "1year": 11,
  };

  if (period === "lastMonth") {
    const target = subMonths(reference, 1);
    return { start: startOfMonth(target), end: endOfMonth(target) };
  }

  const start = startOfMonth(subMonths(reference, monthsBack[period]));
  const end = endOfDay(reference);
  return { start, end };
}

export function getMonthRange(reference: Date = new Date()): DateRange {
  return { start: startOfMonth(reference), end: endOfMonth(reference) };
}

export function getPreviousMonthRange(reference: Date = new Date()): DateRange {
  const prev = subMonths(reference, 1);
  return { start: startOfMonth(prev), end: endOfMonth(prev) };
}

const PERIOD_COMPARISON_MONTHS_BACK: Record<Period, number> = {
  thisMonth: 1,
  lastMonth: 1,
  "3months": 3,
  "6months": 6,
  "1year": 12,
};

/**
 * The comparable prior period for a given period/reference, used for MoM-style
 * deltas. Shifts the reference date back by the period's span and re-derives the
 * range the same way `getPeriodRange` does, so a partial "this month so far"
 * range correctly compares against the *same* day-of-month slice of last month
 * (e.g. Sep 1-10 vs Aug 1-10) rather than an arbitrary trailing window.
 */
export function getPreviousPeriodRange(period: Period, reference: Date = new Date()): DateRange {
  const shiftedReference = subMonths(reference, PERIOD_COMPARISON_MONTHS_BACK[period]);
  return getPeriodRange(period, shiftedReference);
}

export function isDateInRange(date: Date, range: DateRange): boolean {
  return isWithinInterval(date, { start: startOfDay(range.start), end: endOfDay(range.end) });
}

export function monthsInRange(range: DateRange): Date[] {
  return eachMonthOfInterval({ start: range.start, end: range.end });
}

export function formatMonthLabel(date: Date): string {
  return format(date, "MMM yyyy");
}

export function formatShortMonthLabel(date: Date): string {
  return format(date, "MMM");
}

export function formatDayLabel(date: Date): string {
  return format(date, "MMM d");
}

export function formatFullMonth(date: Date): string {
  return format(date, "MMMM yyyy");
}

/**
 * Parses a "YYYY-MM-DD" date-only string (from an <input type="date">) as a
 * UTC midnight Date, so the stored calendar day never shifts due to local
 * timezone offsets. Always pair with `toDateInputValue` for round-tripping.
 */
export function parseDateInputValue(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function todayDateInputValue(): string {
  return toDateInputValue(new Date());
}

/** Parses a "YYYY-MM" month string into the first day of that month (UTC). */
export function parseMonthISO(monthISO: string): Date {
  const [year, month] = monthISO.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, 1));
}

export function toMonthISO(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function currentMonthISO(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/** Buckets to aggregate a spending trend chart by, chosen based on the period span. */
export function getTrendGranularity(period: Period): "daily" | "monthly" {
  if (period === "thisMonth" || period === "lastMonth") return "daily";
  return "monthly";
}

import { describe, expect, it } from "vitest";
import {
  getPeriodRange,
  getPreviousPeriodRange,
  isDateInRange,
  parseDateInputValue,
  toDateInputValue,
  toMonthISO,
  parseMonthISO,
} from "./dates";

describe("getPeriodRange", () => {
  it("'thisMonth' spans the 1st of the month through today", () => {
    const reference = new Date(2026, 8, 15); // Sep 15, 2026
    const { start, end } = getPeriodRange("thisMonth", reference);
    expect(start.getMonth()).toBe(8);
    expect(start.getDate()).toBe(1);
    expect(end.getDate()).toBe(15);
  });

  it("'lastMonth' is the full previous calendar month regardless of today's day", () => {
    const reference = new Date(2026, 8, 5); // Sep 5, 2026
    const { start, end } = getPeriodRange("lastMonth", reference);
    expect(start.getMonth()).toBe(7); // August
    expect(start.getDate()).toBe(1);
    expect(end.getMonth()).toBe(7);
    expect(end.getDate()).toBe(31); // August has 31 days
  });

  it("'lastMonth' correctly crosses a year boundary (Jan -> Dec of previous year)", () => {
    const reference = new Date(2026, 0, 10); // Jan 10, 2026
    const { start, end } = getPeriodRange("lastMonth", reference);
    expect(start.getFullYear()).toBe(2025);
    expect(start.getMonth()).toBe(11); // December
    expect(end.getMonth()).toBe(11);
    expect(end.getDate()).toBe(31);
  });

  it("'3months' includes the current month plus the previous two", () => {
    const reference = new Date(2026, 8, 15); // Sep 15, 2026
    const { start, end } = getPeriodRange("3months", reference);
    expect(start.getFullYear()).toBe(2026);
    expect(start.getMonth()).toBe(6); // July
    expect(start.getDate()).toBe(1);
    expect(end.getDate()).toBe(15);
    expect(end.getMonth()).toBe(8);
  });

  it("'6months' includes the current month plus the previous five", () => {
    const reference = new Date(2026, 2, 10); // Mar 10, 2026 -> back to Oct 2025
    const { start } = getPeriodRange("6months", reference);
    expect(start.getFullYear()).toBe(2025);
    expect(start.getMonth()).toBe(9); // October
  });

  it("'1year' is a rolling 12-calendar-month window ending today", () => {
    const reference = new Date(2026, 5, 1); // Jun 1, 2026
    const { start } = getPeriodRange("1year", reference);
    expect(start.getFullYear()).toBe(2025);
    expect(start.getMonth()).toBe(6); // July 2025 (current month + previous 11)
  });

  it("handles the leap-year February correctly for 'lastMonth'", () => {
    const reference = new Date(2024, 2, 5); // Mar 5, 2024 (2024 is a leap year)
    const { start, end } = getPeriodRange("lastMonth", reference);
    expect(start.getMonth()).toBe(1); // February
    expect(end.getDate()).toBe(29); // leap day included
  });
});

describe("getPreviousPeriodRange", () => {
  it("compares 'thisMonth' against the same day-of-month slice of last month", () => {
    const reference = new Date(2026, 8, 10); // Sep 10, 2026
    const current = getPeriodRange("thisMonth", reference);
    const previous = getPreviousPeriodRange("thisMonth", reference);

    expect(current.start.getDate()).toBe(1);
    expect(current.end.getDate()).toBe(10);
    expect(previous.start.getMonth()).toBe(7); // August
    expect(previous.start.getDate()).toBe(1);
    expect(previous.end.getDate()).toBe(10); // same day-of-month, not the trailing 10 days of August
  });

  it("shifts a full 12-month window back for the '1year' period", () => {
    // Current window: Oct 2025 - Sep 2026 (current month + previous 11).
    // Shifting the reference back 12 months gives the prior window:
    // Oct 2024 - Sep 2025, so it starts in 2024.
    const reference = new Date(2026, 8, 10);
    const previous = getPreviousPeriodRange("1year", reference);
    expect(previous.start.getFullYear()).toBe(2024);
    expect(previous.start.getMonth()).toBe(9); // October
  });
});

describe("isDateInRange", () => {
  it("is inclusive of both endpoints", () => {
    const range = { start: new Date(2026, 0, 1), end: new Date(2026, 0, 31) };
    expect(isDateInRange(new Date(2026, 0, 1, 0, 0, 0), range)).toBe(true);
    expect(isDateInRange(new Date(2026, 0, 31, 23, 59, 59), range)).toBe(true);
    expect(isDateInRange(new Date(2026, 1, 1), range)).toBe(false);
  });
});

describe("date input round-tripping", () => {
  it("parses and formats a YYYY-MM-DD string without a timezone-induced day shift", () => {
    const parsed = parseDateInputValue("2026-01-01");
    expect(toDateInputValue(parsed)).toBe("2026-01-01");
    expect(parsed.getUTCFullYear()).toBe(2026);
    expect(parsed.getUTCMonth()).toBe(0);
    expect(parsed.getUTCDate()).toBe(1);
  });
});

describe("month ISO helpers", () => {
  it("round-trips a month string", () => {
    const date = parseMonthISO("2026-09");
    expect(toMonthISO(date)).toBe("2026-09");
  });
});

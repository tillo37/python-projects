import { describe, expect, it } from "vitest";
import { formatMoney, formatPercent, fromMinorUnits, toMinorUnits } from "./money";

describe("toMinorUnits / fromMinorUnits", () => {
  it("converts USD major units to cents and back without float drift", () => {
    expect(toMinorUnits(12.5, "USD")).toBe(1250);
    expect(fromMinorUnits(1250, "USD")).toBe(12.5);
  });

  it("rounds to the nearest minor unit for imprecise float input", () => {
    expect(toMinorUnits(19.999, "USD")).toBe(2000);
    expect(toMinorUnits(0.1 + 0.2, "USD")).toBe(30); // classic float drift case
  });

  it("treats JPY and KRW as zero-decimal currencies", () => {
    expect(toMinorUnits(500, "JPY")).toBe(500);
    expect(fromMinorUnits(500, "JPY")).toBe(500);
    expect(toMinorUnits(1000, "KRW")).toBe(1000);
  });
});

describe("formatMoney", () => {
  it("formats USD with two decimals and a $ symbol", () => {
    expect(formatMoney(123456, "USD")).toBe("$1,234.56");
  });

  it("formats JPY with zero decimals", () => {
    expect(formatMoney(1500, "JPY")).toBe("¥1,500");
  });

  it("prefixes negative amounts with a minus sign", () => {
    expect(formatMoney(-500, "USD")).toBe("-$5.00");
  });

  it("adds an explicit plus sign for positive amounts when signed is requested", () => {
    expect(formatMoney(500, "USD", { signed: true })).toBe("+$5.00");
  });
});

describe("formatPercent", () => {
  it("formats with one decimal by default", () => {
    expect(formatPercent(42.567)).toBe("42.6%");
  });

  it("always shows a minus sign for negative values, even without signed", () => {
    // A negative percent (e.g. an overspent savings rate) must never render
    // as if it were positive just because `signed` wasn't requested.
    expect(formatPercent(-10)).toBe("-10.0%");
  });

  it("omits a plus sign for positive values unless signed is requested", () => {
    expect(formatPercent(10)).toBe("10.0%");
  });

  it("shows an explicit sign when requested", () => {
    expect(formatPercent(10, { signed: true })).toBe("+10.0%");
    expect(formatPercent(-10, { signed: true })).toBe("-10.0%");
    expect(formatPercent(0, { signed: true })).toBe("0.0%");
  });
});

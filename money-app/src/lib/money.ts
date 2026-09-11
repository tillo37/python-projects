export type CurrencyCode = "USD" | "KRW" | "EUR" | "GBP" | "JPY";

interface CurrencyMeta {
  symbol: string;
  /** Minor units per major unit, e.g. 100 cents per USD. Zero-decimal currencies use 1. */
  minorUnitScale: number;
  locale: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyMeta> = {
  USD: { symbol: "$", minorUnitScale: 100, locale: "en-US" },
  EUR: { symbol: "€", minorUnitScale: 100, locale: "de-DE" },
  GBP: { symbol: "£", minorUnitScale: 100, locale: "en-GB" },
  JPY: { symbol: "¥", minorUnitScale: 1, locale: "en-US" },
  KRW: { symbol: "₩", minorUnitScale: 1, locale: "en-US" },
};

export const CURRENCY_OPTIONS: { code: CurrencyCode; label: string }[] = [
  { code: "USD", label: "US Dollar ($)" },
  { code: "EUR", label: "Euro (€)" },
  { code: "GBP", label: "British Pound (£)" },
  { code: "JPY", label: "Japanese Yen (¥)" },
  { code: "KRW", label: "South Korean Won (₩)" },
];

/** Converts a user-entered major-unit amount (e.g. "12.50") into integer minor units (1250). */
export function toMinorUnits(amount: number, currency: CurrencyCode): number {
  const scale = CURRENCIES[currency].minorUnitScale;
  return Math.round(amount * scale);
}

export function fromMinorUnits(amountMinor: number, currency: CurrencyCode): number {
  const scale = CURRENCIES[currency].minorUnitScale;
  return amountMinor / scale;
}

/** Formats integer minor units as a localized currency string, e.g. "$1,234.50". */
export function formatMoney(amountMinor: number, currency: CurrencyCode, options?: { signed?: boolean }): string {
  const major = fromMinorUnits(amountMinor, currency);
  const formatted = new Intl.NumberFormat(CURRENCIES[currency].locale, {
    style: "currency",
    currency,
    currencyDisplay: "symbol",
    minimumFractionDigits: CURRENCIES[currency].minorUnitScale === 1 ? 0 : 2,
    maximumFractionDigits: CURRENCIES[currency].minorUnitScale === 1 ? 0 : 2,
  }).format(Math.abs(major));

  if (options?.signed) {
    const sign = amountMinor < 0 ? "-" : amountMinor > 0 ? "+" : "";
    return `${sign}${formatted}`;
  }
  return amountMinor < 0 ? `-${formatted}` : formatted;
}

export function formatCompactMoney(amountMinor: number, currency: CurrencyCode): string {
  const major = fromMinorUnits(amountMinor, currency);
  const formatted = new Intl.NumberFormat(CURRENCIES[currency].locale, {
    style: "currency",
    currency,
    currencyDisplay: "symbol",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Math.abs(major));
  return major < 0 ? `-${formatted}` : formatted;
}

/**
 * Formats a signed percent value. A negative value always renders with its
 * minus sign (never silently shown as a bare positive number, which would
 * be actively misleading for something like a negative savings rate).
 * `signed: true` additionally prefixes positive values with "+", for
 * explicit up/down deltas (e.g. "+12.4% vs last month").
 */
export function formatPercent(value: number, options?: { signed?: boolean; decimals?: number }): string {
  const decimals = options?.decimals ?? 1;
  const rounded = Math.abs(value).toFixed(decimals);
  const sign = value < 0 ? "-" : value > 0 && options?.signed ? "+" : "";
  return `${sign}${rounded}%`;
}

export function currencySymbol(currency: CurrencyCode): string {
  return CURRENCIES[currency].symbol;
}

export interface FormatTomanOptions {
  showUnit?: boolean;
  locale?: string;
}

export interface FormatPersianDateOptions {
  format?: "short" | "medium" | "long";
  timeZone?: string;
}

/**
 * Formats integers using Persian digits when locale === "fa", standard digits otherwise.
 */
export function formatLocaleInteger(value: number, locale = "fa"): string {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "";
  }
  const resolvedLocale = locale === "fa" || locale === "fa-IR" ? "fa-IR" : locale;
  return new Intl.NumberFormat(resolvedLocale, {
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Formats financial Toman amounts with grouping and Persian numerals.
 * If showUnit is true, appends " تومان" for fa or " Toman" for other locales.
 */
export function formatToman(amount: number, options?: FormatTomanOptions): string {
  if (typeof amount !== "number" || !Number.isFinite(amount)) {
    return "";
  }
  const { showUnit = false, locale = "fa" } = options ?? {};
  const isFa = locale === "fa" || locale === "fa-IR";
  const numLocale = isFa ? "fa-IR" : locale || "en-US";
  const formatted = new Intl.NumberFormat(numLocale).format(amount);
  if (showUnit) {
    return isFa ? `${formatted} تومان` : `${formatted} Toman`;
  }
  return formatted;
}

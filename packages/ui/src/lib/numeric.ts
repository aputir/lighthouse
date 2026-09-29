const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
const ARABIC_INDIC_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

/**
 * Converts Persian (۰-۹) and Arabic-Indic (٠-٩) digits to standard ASCII digits (0-9).
 * Also converts Persian decimal comma/momayyez (٫ and ،) to standard dot (.).
 */
export function toLatinDigits(value: string): string {
  if (!value) return "";
  let res = "";
  for (const ch of value) {
    const pIdx = PERSIAN_DIGITS.indexOf(ch);
    if (pIdx !== -1) {
      res += pIdx.toString();
      continue;
    }
    const aIdx = ARABIC_INDIC_DIGITS.indexOf(ch);
    if (aIdx !== -1) {
      res += aIdx.toString();
      continue;
    }
    if (ch === "٫" || ch === "،") {
      res += ".";
      continue;
    }
    res += ch;
  }
  return res;
}

/**
 * Converts ASCII digits 0-9 to Persian digits ۰-۹ for UI display.
 * Returns empty string if null or undefined.
 */
export function persianizeDigits(value: string | number | null | undefined): string {
  if (value == null) return "";
  const str = String(value);
  return str.replace(/[0-9]/g, (d) => PERSIAN_DIGITS[Number(d)] ?? d);
}

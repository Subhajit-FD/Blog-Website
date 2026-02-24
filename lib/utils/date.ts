/**
 * Formats a date string or Date object into a consistent format to prevent hydration mismatches.
 * Uses a fixed locale ('en-US') instead of 'undefined' to ensure server and client match.
 */
export function formatDate(
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  },
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  // Hardcoding 'en-US' ensures consistency between server (often UTC/en-US)
  // and various client browser locales which cause hydration errors otherwise.
  return new Intl.DateTimeFormat("en-US", options).format(dateObj);
}

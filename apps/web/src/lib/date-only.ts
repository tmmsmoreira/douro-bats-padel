/**
 * Helpers for calendar-only fields (e.g. date of birth) where the JS Date's
 * UTC offset must NOT shift the value.
 *
 * Pitfall this avoids: a Date created at "local midnight on 12 Apr 1988" by
 * react-day-picker is `1988-04-11T23:00:00Z` in UTC+1. Round-tripping through
 * `toISOString().split('T')[0]` then yields "1988-04-11", and reading it back
 * with `new Date(iso).toLocaleDateString()` shifts again. Use these helpers
 * at every API/display boundary for date-only fields.
 */

export function formatDateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateOnly(value: string | null | undefined): Date | undefined {
  if (!value) return undefined;
  const datePart = value.slice(0, 10);
  const match = datePart.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return undefined;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  return new Date(year, month - 1, day);
}

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string, locale?: string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale || 'en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatTime(date: Date | string, locale?: string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString(locale || 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateNumeric(date: Date | string, locale: string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  // MM/DD/YYYY for US locale, DD/MM/YYYY for everywhere else.
  return locale.startsWith('en-US') ? `${month}/${day}/${year}` : `${day}/${month}/${year}`;
}

/**
 * Log a route-level error with a consistent prefix. Used by App Router
 * `error.tsx` boundaries so logs are grep-able by scope.
 */
export function logRouteError(scope: string, error: Error & { digest?: string }): void {
  console.error(`[route:${scope}]`, error);
}

/**
 * Format a time slot string (HH:MM format) for display using the event's date
 * @param timeSlot - Time in HH:MM format (e.g., "20:00")
 * @param eventDate - The event date to use as the base date
 * @param locale - Optional locale for formatting
 * @returns Formatted time string
 */
const TIME_SLOT_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function formatTimeSlot(
  timeSlot: string,
  eventDate: Date | string,
  locale?: string
): string {
  if (!TIME_SLOT_REGEX.test(timeSlot)) {
    return timeSlot; // Return raw value if format is invalid
  }

  // Parse the HH:MM format
  const [hours, minutes] = timeSlot.split(':');

  // Use the event date as the base date
  const date = typeof eventDate === 'string' ? new Date(eventDate) : new Date(eventDate);
  date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

  return date.toLocaleTimeString(locale || 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

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

/**
 * Format a time slot string (HH:MM format) for display using the event's date
 * @param timeSlot - Time in HH:MM format (e.g., "20:00")
 * @param eventDate - The event date to use as the base date
 * @param locale - Optional locale for formatting
 * @returns Formatted time string
 */
export function formatTimeSlot(
  timeSlot: string,
  eventDate: Date | string,
  locale?: string
): string {
  // Parse the HH:MM format
  const [hours, minutes] = timeSlot.split(':');

  // Use the event date as the base date
  const date = typeof eventDate === 'string' ? new Date(eventDate) : new Date(eventDate);
  date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

  return date.toLocaleTimeString(locale || 'pt-PT', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

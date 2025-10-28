import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("pt-PT", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatDateTime(date: Date | string): string {
  return `${formatDate(date)} ${formatTime(date)}`
}

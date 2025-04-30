import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// formatiert Datum im Format DD.MM.YYYY
export function formatDate(dateStr?: string): string | undefined {
  if (!dateStr) return undefined;
  // Erwartetes Format: YYYY-MM-DD
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[2]}.${parts[1]}.${parts[0]}`;
  }
  return dateStr; // fallback
}
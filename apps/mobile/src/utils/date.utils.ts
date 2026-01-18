import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import isTodayPlugin from 'dayjs/plugin/isToday';
import isYesterdayPlugin from 'dayjs/plugin/isYesterday';
import isTomorrowPlugin from 'dayjs/plugin/isTomorrow';

// Configure dayjs plugins
dayjs.extend(relativeTime);
dayjs.extend(isTodayPlugin);
dayjs.extend(isYesterdayPlugin);
dayjs.extend(isTomorrowPlugin);

// Date input type - accepts Date, string (ISO), or number (timestamp)
type DateInput = Date | string | number;

// Format date for display
export function formatDate(date: DateInput, variant: 'default' | 'short' | 'long' = 'default'): string {
  if (variant === 'short') {
    return dayjs(date).format('MMM D');
  }
  if (variant === 'long') {
    return dayjs(date).format('MMMM D, YYYY');
  }
  return dayjs(date).format('MMM D, YYYY');
}

export function formatDateTime(date: DateInput): string {
  return dayjs(date).format('MMM D, YYYY h:mm A');
}

export function formatTime(date: DateInput): string {
  return dayjs(date).format('h:mm A');
}

// Relative date formatting
export function formatRelativeDate(date: DateInput): string {
  const d = dayjs(date);

  if (d.isToday()) return 'Today';
  if (d.isYesterday()) return 'Yesterday';
  if (d.isTomorrow()) return 'Tomorrow';

  const daysDiff = d.diff(dayjs(), 'day');
  if (daysDiff > 0 && daysDiff <= 7) {
    return d.format('dddd'); // Day name
  }

  return formatDate(date);
}

export function formatTimeAgo(date: DateInput): string {
  return dayjs(date).fromNow();
}

// Date utilities
export function getStartOfDay(date: Date = new Date()): Date {
  return dayjs(date).startOf('day').toDate();
}

export function getEndOfDay(date: Date = new Date()): Date {
  return dayjs(date).endOf('day').toDate();
}

export function addMinutesToDate(date: Date, minutes: number): Date {
  return dayjs(date).add(minutes, 'minute').toDate();
}

export function isExpired(date: DateInput): boolean {
  return dayjs(date).isBefore(dayjs());
}

export function isFutureDate(date: DateInput): boolean {
  return dayjs(date).isAfter(dayjs());
}

// Age calculation
export function calculateAge(birthdate: DateInput): number {
  const d = dayjs(birthdate);
  const today = dayjs();
  let age = today.year() - d.year();
  const monthDiff = today.month() - d.month();

  if (monthDiff < 0 || (monthDiff === 0 && today.date() < d.date())) {
    age--;
  }

  return age;
}

// Pregnancy-specific utilities

// Core function returns structured AOG data
export function calculateAOGParts(lmp: DateInput): { weeks: number; days: number } {
  const totalDays = dayjs().diff(dayjs(lmp), 'day');
  return {
    weeks: Math.floor(totalDays / 7),
    days: totalDays % 7,
  };
}

// Formatted AOG string (uses core function)
export function calculateAOG(lastMenstrualPeriod: DateInput): string {
  const { weeks, days } = calculateAOGParts(lastMenstrualPeriod);
  return `${weeks} weeks ${days} days`;
}

export function calculateDueDate(lastMenstrualPeriod: Date): Date {
  // Naegele's rule: LMP + 280 days (40 weeks)
  return dayjs(lastMenstrualPeriod).add(280, 'day').toDate();
}

/**
 * Get a date string in YYYY-MM-DD format for grouping/comparison.
 * Handles Date objects, ISO strings, and timestamps.
 */
export function getDateString(date: DateInput): string {
  if (typeof date === "string") {
    // If already a simple date string (YYYY-MM-DD), return as-is
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
  }
  return dayjs(date).format('YYYY-MM-DD');
}

// Helper functions for date comparisons
export function isToday(date: DateInput): boolean {
  return dayjs(date).isToday();
}

export function isYesterday(date: DateInput): boolean {
  return dayjs(date).isYesterday();
}

export function isTomorrow(date: DateInput): boolean {
  return dayjs(date).isTomorrow();
}

export function isBefore(date1: DateInput, date2: DateInput): boolean {
  return dayjs(date1).isBefore(date2);
}

export function isAfter(date1: DateInput, date2: DateInput): boolean {
  return dayjs(date1).isAfter(date2);
}

export function parseISO(dateString: string): Date {
  return dayjs(dateString).toDate();
}

/**
 * Format remaining days as a human-readable string
 */
export function formatDaysRemaining(days: number | null): string {
  if (days === null) return "no end date";
  if (days < 0) return "ended";
  if (days === 0) return "ends today";
  if (days === 1) return "1 day left";
  return `${days} days left`;
}

import {
  format,
  formatDistanceToNow,
  isToday,
  isYesterday,
  isTomorrow,
  startOfDay,
  endOfDay,
  addMinutes,
  isBefore,
  isAfter,
  differenceInDays,
  parseISO,
} from 'date-fns';

// Format date for display
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d, yyyy');
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d, yyyy h:mm a');
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'h:mm a');
}

// Relative date formatting
export function formatRelativeDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;

  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  if (isTomorrow(d)) return 'Tomorrow';

  const daysDiff = differenceInDays(d, new Date());
  if (daysDiff > 0 && daysDiff <= 7) {
    return format(d, 'EEEE'); // Day name
  }

  return formatDate(d);
}

export function formatTimeAgo(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

// Date utilities
export function getStartOfDay(date: Date = new Date()): Date {
  return startOfDay(date);
}

export function getEndOfDay(date: Date = new Date()): Date {
  return endOfDay(date);
}

export function addMinutesToDate(date: Date, minutes: number): Date {
  return addMinutes(date, minutes);
}

export function isExpired(date: Date | string): boolean {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isBefore(d, new Date());
}

export function isFutureDate(date: Date | string): boolean {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isAfter(d, new Date());
}

// Age calculation
export function calculateAge(birthdate: Date | string): number {
  const d = typeof birthdate === 'string' ? parseISO(birthdate) : birthdate;
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const monthDiff = today.getMonth() - d.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < d.getDate())) {
    age--;
  }

  return age;
}

// Pregnancy-specific utilities
export function calculateAOG(lastMenstrualPeriod: Date): string {
  const today = new Date();
  const days = differenceInDays(today, lastMenstrualPeriod);
  const weeks = Math.floor(days / 7);
  const remainingDays = days % 7;
  return `${weeks} weeks ${remainingDays} days`;
}

export function calculateDueDate(lastMenstrualPeriod: Date): Date {
  // Naegele's rule: LMP + 280 days (40 weeks)
  const dueDate = new Date(lastMenstrualPeriod);
  dueDate.setDate(dueDate.getDate() + 280);
  return dueDate;
}

// Export date-fns functions for convenience
export { isToday, isYesterday, isTomorrow, isBefore, isAfter, parseISO };

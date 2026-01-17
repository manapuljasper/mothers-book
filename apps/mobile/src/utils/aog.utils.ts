/**
 * Compute Age of Gestation (AOG) from expected due date
 *
 * Formula: AOG = 40 weeks - (weeks until due date)
 * Full term pregnancy = 40 weeks from LMP (Last Menstrual Period)
 */
export function computeAOG(
  expectedDueDate: Date | string | undefined | null,
  referenceDate: Date = new Date()
): string | null {
  if (!expectedDueDate) return null;

  const dueDate = new Date(expectedDueDate);
  const refDate = new Date(referenceDate);

  // Validate date
  if (isNaN(dueDate.getTime())) return null;

  const msPerDay = 24 * 60 * 60 * 1000;
  const msPerWeek = 7 * msPerDay;

  const weeksUntilDue = (dueDate.getTime() - refDate.getTime()) / msPerWeek;
  const aogWeeks = 40 - weeksUntilDue;

  // Validate range (0-45 weeks is reasonable for pregnancy tracking)
  if (aogWeeks < 0 || aogWeeks > 45) return null;

  const totalDays = Math.floor(aogWeeks * 7);
  const weeks = Math.floor(totalDays / 7);
  const days = totalDays % 7;

  if (days === 0) {
    return `${weeks} weeks`;
  }
  return `${weeks}w ${days}d`;
}

/**
 * Get AOG in weeks only (for display in badges)
 */
export function computeAOGWeeks(
  expectedDueDate: Date | string | undefined | null,
  referenceDate: Date = new Date()
): number | null {
  if (!expectedDueDate) return null;

  const dueDate = new Date(expectedDueDate);
  const refDate = new Date(referenceDate);

  if (isNaN(dueDate.getTime())) return null;

  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const weeksUntilDue = (dueDate.getTime() - refDate.getTime()) / msPerWeek;
  const aogWeeks = 40 - weeksUntilDue;

  if (aogWeeks < 0 || aogWeeks > 45) return null;

  return Math.floor(aogWeeks);
}

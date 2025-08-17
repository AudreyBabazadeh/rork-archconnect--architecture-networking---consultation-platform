/**
 * Utility functions for time formatting
 */

/**
 * Converts 24-hour time format to 12-hour format with AM/PM
 * @param time24 - Time in 24-hour format (e.g., "14:30", "09:15")
 * @returns Time in 12-hour format with AM/PM (e.g., "2:30 PM", "9:15 AM")
 */
export function formatTimeTo12Hour(time24: string): string {
  if (!time24 || !time24.includes(':')) {
    return time24; // Return as-is if invalid format
  }

  const [hoursStr, minutesStr] = time24.split(':');
  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);

  if (isNaN(hours) || isNaN(minutes)) {
    return time24; // Return as-is if invalid numbers
  }

  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  const displayMinutes = minutes.toString().padStart(2, '0');

  return `${displayHours}:${displayMinutes} ${period}`;
}

/**
 * Generates time slots in 12-hour format
 * @param startHour - Starting hour (24-hour format, default: 6)
 * @param endHour - Ending hour (24-hour format, default: 24)
 * @returns Array of time slots in 12-hour format
 */
export function generateTimeSlots12Hour(startHour: number = 6, endHour: number = 24): string[] {
  const slots: string[] = [];
  for (let hour = startHour; hour < endHour; hour++) {
    const time1 = `${hour.toString().padStart(2, '0')}:00`;
    const time2 = `${hour.toString().padStart(2, '0')}:30`;
    slots.push(formatTimeTo12Hour(time1));
    slots.push(formatTimeTo12Hour(time2));
  }
  return slots;
}

/**
 * Converts 12-hour time format to 24-hour format
 * @param time12 - Time in 12-hour format (e.g., "2:30 PM", "9:15 AM")
 * @returns Time in 24-hour format (e.g., "14:30", "09:15")
 */
export function formatTimeTo24Hour(time12: string): string {
  if (!time12 || !time12.includes(':')) {
    return time12; // Return as-is if invalid format
  }

  const [timePart, period] = time12.split(' ');
  if (!timePart || !period) {
    return time12; // Return as-is if no AM/PM found
  }

  const [hoursStr, minutesStr] = timePart.split(':');
  let hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);

  if (isNaN(hours) || isNaN(minutes)) {
    return time12; // Return as-is if invalid numbers
  }

  if (period.toUpperCase() === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period.toUpperCase() === 'AM' && hours === 12) {
    hours = 0;
  }

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}
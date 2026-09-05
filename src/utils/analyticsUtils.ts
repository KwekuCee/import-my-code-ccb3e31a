import { AttendanceRecord, Member } from '../types';

/**
 * Robustly checks if a given date of birth (DOB) string falls in the current calendar month.
 * Handles YYYY-MM-DD, DD-MM-YYYY, YYYY/MM/DD, DD/MM/YYYY, ISO strings, and textual formats (e.g. "August 15").
 */
export function isBirthdayInCurrentMonth(dob?: string): boolean {
  if (!dob || typeof dob !== 'string') return false;
  const cleanDob = dob.trim();
  if (!cleanDob) return false;

  const now = new Date();
  const currentMonthIndex = now.getMonth(); // 0-11
  const currentMonthNum = String(currentMonthIndex + 1).padStart(2, '0'); // '01' to '12'
  const currentMonthName = now.toLocaleString('en-US', { month: 'long' }).toLowerCase();
  const currentMonthShort = now.toLocaleString('en-US', { month: 'short' }).toLowerCase();

  const lower = cleanDob.toLowerCase();

  // 1. Check if textual month name is in the string (e.g. "August 15, 1996" or "15 Aug")
  if (lower.includes(currentMonthName) || lower.includes(currentMonthShort)) {
    return true;
  }

  // 2. YYYY-MM-DD or YYYY/MM/DD or YYYY.MM.DD
  const ymdMatch = cleanDob.match(/^\d{4}[-/.](\d{1,2})[-/.]\d{1,2}/);
  if (ymdMatch) {
    const month = String(parseInt(ymdMatch[1], 10)).padStart(2, '0');
    return month === currentMonthNum;
  }

  // 3. DD-MM-YYYY or DD/MM/YYYY or DD.MM.YYYY
  const dmyMatch = cleanDob.match(/^(\d{1,2})[-/.](\d{1,2})[-/.]\d{4}/);
  if (dmyMatch) {
    const month = String(parseInt(dmyMatch[2], 10)).padStart(2, '0');
    return month === currentMonthNum;
  }

  // 4. Fallback: standard Javascript Date parse
  const parsed = new Date(cleanDob);
  if (!isNaN(parsed.getTime())) {
    return parsed.getMonth() === currentMonthIndex;
  }

  return false;
}

/**
 * Extracts day of month for sorting birthdays chronologically.
 */
export function getBirthdayDayOfMonth(dob?: string): number {
  if (!dob) return 99;
  const cleanDob = dob.trim();

  // YYYY-MM-DD
  const ymdMatch = cleanDob.match(/^\d{4}[-/.]\d{1,2}[-/.](\d{1,2})/);
  if (ymdMatch) return parseInt(ymdMatch[1], 10);

  // DD-MM-YYYY
  const dmyMatch = cleanDob.match(/^(\d{1,2})[-/.]\d{1,2}[-/.]\d{4}/);
  if (dmyMatch) return parseInt(dmyMatch[1], 10);

  const parsed = new Date(cleanDob);
  if (!isNaN(parsed.getTime())) return parsed.getDate();

  return 99;
}

/**
 * Formats a birthday for display with ordinal suffixes (e.g., "August 14th").
 */
export function formatBirthdayDisplay(dob?: string): string {
  if (!dob) return 'Date unknown';
  const cleanDob = dob.trim();
  const day = getBirthdayDayOfMonth(cleanDob);
  const now = new Date();
  const monthName = now.toLocaleString('en-US', { month: 'long' });

  if (day === 99) return cleanDob;

  const suffix = (d: number) => {
    if (d > 3 && d < 21) return 'th';
    switch (d % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  return `${monthName} ${day}${suffix(day)}`;
}

/**
 * Computes peak arrival breakdown from attendance timestamp strings.
 */
export function calculatePeakArrivalStats(records: AttendanceRecord[]) {
  const total = records.length;
  let earlyArrivalCount = 0;
  let peakArrivalCount = 0;
  let lateArrivalCount = 0;

  records.forEach(att => {
    const timeStr = att.timestamp || '';
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (match) {
      let hour = parseInt(match[1], 10);
      const min = parseInt(match[2], 10);
      const meridiem = match[3]?.toUpperCase();

      if (meridiem === 'PM' && hour < 12) hour += 12;
      if (meridiem === 'AM' && hour === 12) hour = 0;

      const totalMinutes = hour * 60 + min;
      // Early: <= 8:15 AM (495 mins) or for evening <= 18:15 (1095 mins)
      if (totalMinutes <= 8 * 60 + 15 || (totalMinutes >= 17 * 60 && totalMinutes <= 18 * 60 + 15)) {
        earlyArrivalCount++;
      } else if (totalMinutes <= 8 * 60 + 45 || (totalMinutes >= 17 * 60 && totalMinutes <= 18 * 60 + 45)) {
        peakArrivalCount++;
      } else {
        lateArrivalCount++;
      }
    } else {
      peakArrivalCount++;
    }
  });

  const earlyPercent = total > 0 ? Math.round((earlyArrivalCount / total) * 100) : 0;
  const peakPercent = total > 0 ? Math.round((peakArrivalCount / total) * 100) : 0;
  const latePercent = total > 0 ? Math.max(0, 100 - earlyPercent - peakPercent) : 0;

  return {
    total,
    earlyArrivalCount,
    peakArrivalCount,
    lateArrivalCount,
    earlyPercent,
    peakPercent,
    latePercent
  };
}

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Extracts the birth month (0-11) from a loosely formatted date of birth string.
 * Returns null when no month can be determined.
 */
export function getBirthMonthIndex(dob?: string): number | null {
  if (!dob || typeof dob !== 'string') return null;
  const clean = dob.trim();
  if (!clean) return null;

  const lower = clean.toLowerCase();
  for (let i = 0; i < MONTH_NAMES.length; i++) {
    const full = MONTH_NAMES[i].toLowerCase();
    if (lower.includes(full) || lower.includes(full.slice(0, 3))) return i;
  }

  const ymd = clean.match(/^\d{4}[-/.](\d{1,2})[-/.]\d{1,2}/);
  if (ymd) {
    const m = parseInt(ymd[1], 10);
    if (m >= 1 && m <= 12) return m - 1;
  }

  const dmy = clean.match(/^(\d{1,2})[-/.](\d{1,2})[-/.]\d{4}/);
  if (dmy) {
    const m = parseInt(dmy[2], 10);
    if (m >= 1 && m <= 12) return m - 1;
  }

  const parsed = new Date(clean);
  if (!isNaN(parsed.getTime())) return parsed.getMonth();

  return null;
}

/**
 * Days until the next occurrence of a birthday, ignoring the birth year.
 * 0 means today. Returns null when the date cannot be read.
 */
export function getDaysUntilBirthday(dob?: string, from: Date = new Date()): number | null {
  const month = getBirthMonthIndex(dob);
  const day = getBirthdayDayOfMonth(dob);
  if (month === null || day === 99) return null;

  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  let next = new Date(today.getFullYear(), month, day);
  if (next.getTime() < today.getTime()) {
    next = new Date(today.getFullYear() + 1, month, day);
  }
  return Math.round((next.getTime() - today.getTime()) / 86400000);
}

/**
 * Formats a birthday as "August 14th" using the member's real birth month.
 */
export function formatBirthdayWithMonth(dob?: string): string {
  const month = getBirthMonthIndex(dob);
  const day = getBirthdayDayOfMonth(dob);
  if (month === null || day === 99) return dob ? dob.trim() : 'Date unknown';
  const suffix = (d: number) => {
    if (d > 3 && d < 21) return 'th';
    switch (d % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };
  return `${MONTH_NAMES[month]} ${day}${suffix(day)}`;
}

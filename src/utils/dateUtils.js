import NepaliDate from 'nepali-date-converter';

/**
 * Normalizes any AD date value from API/DB to YYYY-MM-DD.
 */
export function normalizeAdDateString(dateInput) {
  if (!dateInput) return '';

  const str = String(dateInput).trim();
  if (!str) return '';

  if (str.includes('T')) {
    return str.slice(0, 10);
  }

  return str.slice(0, 10);
}

/**
 * Parses an AD date string into year, month (1-12), and day.
 */
export function parseAdDateString(adDateString) {
  const normalized = normalizeAdDateString(adDateString);
  if (!normalized) return null;

  const [year, month, day] = normalized.split('-').map(Number);
  if (!year || !month || !day) return null;

  return { year, month, day };
}

/**
 * Converts an AD date string to a BS picker value object.
 */
export function adStringToBsDate(adDateString) {
  const parts = parseAdDateString(adDateString);
  if (!parts) return undefined;

  try {
    const nepaliDate = new NepaliDate(new Date(parts.year, parts.month - 1, parts.day));
    return {
      year: nepaliDate.getYear(),
      month: nepaliDate.getMonth(),
      day: nepaliDate.getDate(),
      calendarType: 'BS',
    };
  } catch {
    return undefined;
  }
}

/**
 * Converts a BS picker value to an AD string (YYYY-MM-DD) for API/DB storage.
 */
export function bsDateToAdString(bsDate) {
  if (!bsDate?.year && bsDate?.year !== 0) return '';
  if (bsDate.month === undefined || !bsDate.day) return '';

  try {
    const jsDate = new NepaliDate(bsDate.year, bsDate.month, bsDate.day).toJsDate();
    const year = jsDate.getFullYear();
    const month = String(jsDate.getMonth() + 1).padStart(2, '0');
    const day = String(jsDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return '';
  }
}

/**
 * Formats an AD date from DB/API for UI display in Bikram Sambat.
 */
export function formatAdDateForDisplay(
  adDateString,
  language = 'ne',
  format = 'DD MMMM YYYY'
) {
  const parts = parseAdDateString(adDateString);
  if (!parts) return '';

  try {
    const nepaliDate = new NepaliDate(new Date(parts.year, parts.month - 1, parts.day));
    const converterLanguage = language === 'ne' ? 'np' : 'en';
    return nepaliDate.format(format, converterLanguage);
  } catch {
    return normalizeAdDateString(adDateString);
  }
}

/**
 * Formats an AD datetime (ISO) for UI display with BS date and local time.
 */
export function formatAdDateTimeForDisplay(isoString, language = 'ne') {
  if (!isoString) return '';

  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '';

  const datePart = formatAdDateForDisplay(
    date.toISOString().slice(0, 10),
    language,
    'DD MMMM YYYY'
  );
  const timePart = date.toLocaleTimeString(language === 'ne' ? 'ne-NP' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return `${datePart} ${timePart}`;
}

/**
 * Adds years to an AD date string and returns YYYY-MM-DD.
 */
export function addYearsToAdDate(adDateString, years) {
  const parts = parseAdDateString(adDateString);
  if (!parts) return '';

  const date = new Date(parts.year, parts.month - 1, parts.day);
  date.setFullYear(date.getFullYear() + years);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

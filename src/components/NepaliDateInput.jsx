import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import NepaliDateModule from 'nepali-date-converter';
import { FaCalendarAlt, FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa';
import { useLang } from '../context/LanguageContext';
import { adStringToBsDate, ensureAdDateString } from '../utils/dateUtils';

const NepaliDate = NepaliDateModule.default || NepaliDateModule;
const dateConfigMap = NepaliDateModule.dateConfigMap || {};

const MONTH_KEYS = [
  'Baisakh',
  'Jestha',
  'Asar',
  'Shrawan',
  'Bhadra',
  'Aswin',
  'Kartik',
  'Mangsir',
  'Poush',
  'Magh',
  'Falgun',
  'Chaitra',
];

const MONTHS_EN = [
  'Baisakh',
  'Jestha',
  'Asar',
  'Shrawan',
  'Bhadra',
  'Aswin',
  'Kartik',
  'Mangsir',
  'Poush',
  'Magh',
  'Falgun',
  'Chaitra',
];

const MONTHS_NP = [
  'बैशाख',
  'जेठ',
  'असार',
  'श्रावण',
  'भाद्र',
  'आश्विन',
  'कार्तिक',
  'मंसिर',
  'पौष',
  'माघ',
  'फाल्गुण',
  'चैत्र',
];

const WEEKDAYS_EN = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const WEEKDAYS_NP = ['आ', 'सो', 'म', 'बु', 'बि', 'शु', 'श'];
const NEPALI_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

const MIN_YEAR = 2000;
const MAX_YEAR = 2090;
const YEAR_PAGE_SIZE = 12;
const POPOVER_WIDTH = 296; // 18.5rem

function toNepaliNumeral(value) {
  return String(value)
    .split('')
    .map((char) => (/[0-9]/.test(char) ? NEPALI_DIGITS[Number(char)] : char))
    .join('');
}

function getDaysInBsMonth(year, month) {
  return dateConfigMap?.[String(year)]?.[MONTH_KEYS[month]] || 30;
}

function getTodayBs() {
  const today = new NepaliDate();
  return {
    year: today.getYear(),
    month: today.getMonth(),
    day: today.getDate(),
  };
}

function clampDay(year, month, day) {
  return Math.min(day, getDaysInBsMonth(year, month));
}

function shiftMonth(year, month, delta) {
  let nextYear = year;
  let nextMonth = month + delta;

  while (nextMonth < 0) {
    nextMonth += 12;
    nextYear -= 1;
  }
  while (nextMonth > 11) {
    nextMonth -= 12;
    nextYear += 1;
  }

  if (nextYear < MIN_YEAR || nextYear > MAX_YEAR) {
    return { year, month };
  }

  return { year: nextYear, month: nextMonth };
}

/**
 * Nepali (BS) date picker for display/selection only.
 * Always converts the selected BS date to English/AD (YYYY-MM-DD) before
 * calling onChange — that AD value is what gets stored in form state and the DB.
 * Calendar popover is portaled to document.body so parent overflow/transform
 * (e.g. form cards) cannot clip it.
 */
export default function NepaliDateInput({
  name,
  value = '',
  onChange,
  className = '',
  disabled = false,
  placeholder,
}) {
  const { language } = useLang();
  const useNepali = language === 'ne';
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);

  // `value` from parent/DB is always AD; convert to BS only for calendar UI.
  const selected = adStringToBsDate(value);
  const today = useMemo(() => getTodayBs(), []);

  const [open, setOpen] = useState(false);
  const [view, setView] = useState('day');
  const [popoverStyle, setPopoverStyle] = useState({ top: 0, left: 0 });
  const [cursor, setCursor] = useState(() => ({
    year: selected?.year || today.year,
    month: selected?.month ?? today.month,
  }));
  const [yearPageStart, setYearPageStart] = useState(() => {
    const base = selected?.year || today.year;
    return base - ((base - MIN_YEAR) % YEAR_PAGE_SIZE);
  });

  const updatePopoverPosition = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const gap = 8;
    const estimatedHeight = 360;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < estimatedHeight && rect.top > spaceBelow;

    let left = rect.left;
    if (left + POPOVER_WIDTH > window.innerWidth - 8) {
      left = Math.max(8, window.innerWidth - POPOVER_WIDTH - 8);
    }
    if (left < 8) left = 8;

    const top = openUpward
      ? Math.max(8, rect.top - estimatedHeight - gap)
      : rect.bottom + gap;

    setPopoverStyle({ top, left });
  };

  useLayoutEffect(() => {
    if (!open) return undefined;
    updatePopoverPosition();

    const onReposition = () => updatePopoverPosition();
    window.addEventListener('resize', onReposition);
    window.addEventListener('scroll', onReposition, true);
    return () => {
      window.removeEventListener('resize', onReposition);
      window.removeEventListener('scroll', onReposition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    const onPointerDown = (event) => {
      const inTrigger = triggerRef.current?.contains(event.target);
      const inPopover = popoverRef.current?.contains(event.target);
      if (!inTrigger && !inPopover) {
        setOpen(false);
        setView('day');
      }
    };

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        setView('day');
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const next = {
      year: selected?.year || today.year,
      month: selected?.month ?? today.month,
    };
    setCursor(next);
    setYearPageStart(next.year - ((next.year - MIN_YEAR) % YEAR_PAGE_SIZE));
    setView('day');
  }, [open, selected?.year, selected?.month, today.year, today.month]);

  const formatNumber = (num) => (useNepali ? toNepaliNumeral(num) : String(num));
  const months = useNepali ? MONTHS_NP : MONTHS_EN;
  const weekdays = useNepali ? WEEKDAYS_NP : WEEKDAYS_EN;

  const displayText = selected
    ? `${formatNumber(selected.day)} ${months[selected.month]} ${formatNumber(selected.year)}`
    : placeholder || (useNepali ? 'मिति छान्नुहोस्' : 'Select date');

  const emitChange = (bsDate) => {
    if (!onChange) return;

    // Critical: convert BS → English/AD before form/DB storage.
    const adValue = bsDate ? ensureAdDateString(bsDate) : '';

    onChange({
      target: {
        name,
        value: adValue,
      },
    });
  };

  const openPicker = () => {
    if (disabled) return;
    setOpen(true);
  };

  const selectDay = (day) => {
    emitChange({ year: cursor.year, month: cursor.month, day });
    setOpen(false);
    setView('day');
  };

  const selectMonth = (month) => {
    setCursor((prev) => ({ ...prev, month }));
    setView('day');
  };

  const selectYear = (year) => {
    setCursor((prev) => ({ ...prev, year }));
    setView('month');
  };

  const navigate = (direction) => {
    if (view === 'day') {
      setCursor((prev) => shiftMonth(prev.year, prev.month, direction));
      return;
    }

    if (view === 'month') {
      setCursor((prev) => {
        const nextYear = prev.year + direction;
        if (nextYear < MIN_YEAR || nextYear > MAX_YEAR) return prev;
        return { ...prev, year: nextYear };
      });
      return;
    }

    setYearPageStart((prev) => {
      const next = prev + direction * YEAR_PAGE_SIZE;
      if (next < MIN_YEAR) return MIN_YEAR;
      if (next > MAX_YEAR) return MAX_YEAR - ((MAX_YEAR - MIN_YEAR) % YEAR_PAGE_SIZE);
      return next;
    });
  };

  const daysInMonth = getDaysInBsMonth(cursor.year, cursor.month);
  const firstWeekday = new NepaliDate(cursor.year, cursor.month, 1).toJsDate().getDay();
  const dayCells = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  const yearOptions = Array.from({ length: YEAR_PAGE_SIZE }, (_, index) => yearPageStart + index).filter(
    (year) => year >= MIN_YEAR && year <= MAX_YEAR
  );

  const yearPageEnd = yearOptions[yearOptions.length - 1] || yearPageStart;

  const calendarPopover =
    open &&
    !disabled &&
    createPortal(
      <div
        ref={popoverRef}
        style={{
          position: 'fixed',
          top: popoverStyle.top,
          left: popoverStyle.left,
          width: POPOVER_WIDTH,
          zIndex: 9999,
        }}
        className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2.5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-md p-1.5 text-gray-600 transition hover:bg-gray-100"
            aria-label="Previous"
          >
            <FaChevronLeft className="h-3.5 w-3.5" />
          </button>

          <div className="flex items-center gap-1">
            {view === 'day' && (
              <>
                <button
                  type="button"
                  onClick={() => setView('month')}
                  className="rounded-md px-2 py-1 text-xs font-bold uppercase tracking-wide text-gray-700 transition hover:bg-gray-100"
                >
                  {months[cursor.month]}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setYearPageStart(
                      cursor.year - ((cursor.year - MIN_YEAR) % YEAR_PAGE_SIZE)
                    );
                    setView('year');
                  }}
                  className="rounded-md px-2 py-1 text-xs font-bold tracking-wide text-gray-700 transition hover:bg-gray-100"
                >
                  {formatNumber(cursor.year)}
                </button>
              </>
            )}

            {view === 'month' && (
              <button
                type="button"
                onClick={() => {
                  setYearPageStart(
                    cursor.year - ((cursor.year - MIN_YEAR) % YEAR_PAGE_SIZE)
                  );
                  setView('year');
                }}
                className="rounded-md px-2 py-1 text-xs font-bold tracking-wide text-gray-700 transition hover:bg-gray-100"
              >
                {formatNumber(cursor.year)}
              </button>
            )}

            {view === 'year' && (
              <span className="px-2 py-1 text-xs font-bold tracking-wide text-gray-700">
                {formatNumber(yearPageStart)} – {formatNumber(yearPageEnd)}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => navigate(1)}
            className="rounded-md p-1.5 text-gray-600 transition hover:bg-gray-100"
            aria-label="Next"
          >
            <FaChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="p-3">
          {view === 'day' && (
            <>
              <div className="mb-2 grid grid-cols-7 gap-1">
                {weekdays.map((label) => (
                  <div
                    key={label}
                    className="text-center text-[10px] font-semibold uppercase text-gray-400"
                  >
                    {label}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {dayCells.map((day, index) => {
                  if (!day) {
                    return <div key={`empty-${index}`} className="h-8" />;
                  }

                  const isSelected =
                    selected?.year === cursor.year &&
                    selected?.month === cursor.month &&
                    selected?.day === day;
                  const isToday =
                    today.year === cursor.year &&
                    today.month === cursor.month &&
                    today.day === day;

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => selectDay(day)}
                      className={`h-8 rounded-md text-sm transition ${
                        isSelected
                          ? 'bg-nepal-blue text-white'
                          : isToday
                            ? 'bg-blue-50 font-semibold text-nepal-blue'
                            : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {formatNumber(day)}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {view === 'month' && (
            <div className="grid grid-cols-3 gap-2">
              {months.map((monthLabel, monthIndex) => {
                const isSelected =
                  selected?.year === cursor.year && selected?.month === monthIndex;
                const isCurrent =
                  today.year === cursor.year && today.month === monthIndex;

                return (
                  <button
                    key={monthLabel}
                    type="button"
                    onClick={() => selectMonth(monthIndex)}
                    className={`rounded-lg px-2 py-3 text-xs font-semibold transition ${
                      isSelected
                        ? 'bg-nepal-blue text-white'
                        : isCurrent
                          ? 'bg-blue-50 text-nepal-blue'
                          : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {monthLabel}
                  </button>
                );
              })}
            </div>
          )}

          {view === 'year' && (
            <div className="grid grid-cols-3 gap-2">
              {yearOptions.map((year) => {
                const isSelected = selected?.year === year;
                const isCurrent = today.year === year;

                return (
                  <button
                    key={year}
                    type="button"
                    onClick={() => selectYear(year)}
                    className={`rounded-lg px-2 py-3 text-sm font-semibold transition ${
                      isSelected
                        ? 'bg-nepal-blue text-white'
                        : isCurrent
                          ? 'bg-blue-50 text-nepal-blue'
                          : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {formatNumber(year)}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 px-3 py-2">
          <button
            type="button"
            className="text-xs font-semibold text-nepal-blue hover:underline"
            onClick={() => {
              const safeDay = clampDay(today.year, today.month, today.day);
              setCursor({ year: today.year, month: today.month });
              emitChange({ year: today.year, month: today.month, day: safeDay });
              setOpen(false);
              setView('day');
            }}
          >
            {useNepali ? 'आज' : 'Today'}
          </button>
          <span className="text-[10px] text-gray-400">
            {view === 'day'
              ? useNepali
                ? 'महिना / वर्ष मा क्लिक गर्नुहोस्'
                : 'Click month / year to jump'
              : view === 'month'
                ? useNepali
                  ? 'वर्ष मा क्लिक गर्नुहोस्'
                  : 'Click year to jump'
                : useNepali
                  ? 'वर्ष छान्नुहोस्'
                  : 'Select a year'}
          </span>
        </div>
      </div>,
      document.body
    );

  return (
    <div className="relative w-full">
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={openPicker}
        className={`flex w-full items-center gap-2 text-left transition-all duration-200 ${
          disabled
            ? 'cursor-not-allowed opacity-60'
            : 'cursor-pointer hover:border-nepal-blue focus:outline-none focus:ring-2 focus:ring-nepal-blue'
        } ${className || 'rounded-lg border border-gray-200 bg-gray-50 px-4 py-2'}`.trim()}
      >
        <FaCalendarAlt className="shrink-0 text-gray-400" />
        <span className={`flex-1 text-sm ${selected ? 'text-gray-900' : 'text-gray-400'}`}>
          {displayText}
        </span>
        {selected && !disabled && (
          <span
            role="button"
            tabIndex={0}
            aria-label="Clear date"
            className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
            onClick={(event) => {
              event.stopPropagation();
              emitChange(null);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                event.stopPropagation();
                emitChange(null);
              }
            }}
          >
            <FaTimes className="h-3 w-3" />
          </span>
        )}
      </button>

      {calendarPopover}
    </div>
  );
}

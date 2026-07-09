import { DatePicker } from '@unholy_centipede/nepali-date-picker';
import { useLang } from '../context/LanguageContext';
import { adStringToBsDate, bsDateToAdString } from '../utils/dateUtils';

/**
 * Nepali (BS) date picker that stores values as AD (YYYY-MM-DD) for API/DB.
 * Fires onChange with a synthetic event: { target: { name, value } }.
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
  const bsValue = adStringToBsDate(value);

  const handleChange = (selectedDate) => {
    if (!onChange) return;

    onChange({
      target: {
        name,
        value: selectedDate ? bsDateToAdString(selectedDate) : '',
      },
    });
  };

  return (
    <DatePicker
      value={bsValue || null}
      onChange={handleChange}
      calendarType="BS"
      useNepaliNumerals={language === 'ne'}
      disabled={disabled}
      placeholder={placeholder}
      className={`w-full ${className}`.trim()}
      size="md"
      closeOnSelect
    />
  );
}

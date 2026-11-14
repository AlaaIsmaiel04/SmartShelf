import { useState } from 'react';
import { useLanguage } from '../preferences/LanguageProvider';

export function ExpiryDateField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const { t, language } = useLanguage();
  const [year, month, day] = value.split('-');
  const [parts, setParts] = useState({
    year: year ?? '',
    month: month ?? '',
    day: day ?? '',
  });
  const currentYear = new Date().getFullYear();
  const firstYear = Math.min(currentYear - 20, Number(year) || currentYear);
  const lastYear = Math.max(currentYear + 20, Number(year) || currentYear);
  const days = new Date(
    Date.UTC(Number(parts.year) || 2024, Number(parts.month) || 1, 0),
  ).getUTCDate();
  function update(field: keyof typeof parts, selected: string) {
    const next = { ...parts, [field]: selected };
    const maxDay = new Date(
      Date.UTC(Number(next.year) || 2024, Number(next.month) || 1, 0),
    ).getUTCDate();
    if (Number(next.day) > maxDay) next.day = String(maxDay).padStart(2, '0');
    setParts(next);
    onChange(
      next.year && next.month && next.day
        ? `${next.year}-${next.month}-${next.day}`
        : '',
    );
  }
  return (
    <fieldset className="expiry-date-control">
      <legend>{t('Expiry date')}</legend>
      <div className="expiry-date-parts">
        <label htmlFor="stock-expiry-day">
          <span>{t('Day')}</span>
          <select
            id="stock-expiry-day"
            value={parts.day}
            required
            onChange={(event) => update('day', event.target.value)}
          >
            <option value="">{t('Day')}</option>
            {Array.from({ length: days }, (_, i) =>
              String(i + 1).padStart(2, '0'),
            ).map((day) => (
              <option key={day} value={day}>
                {Number(day)}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor="stock-expiry-month">
          <span>{t('Month')}</span>
          <select
            id="stock-expiry-month"
            value={parts.month}
            required
            onChange={(event) => update('month', event.target.value)}
          >
            <option value="">{t('Month')}</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={String(i + 1).padStart(2, '0')}>
                {new Intl.DateTimeFormat(
                  language === 'ar' ? 'ar-SY' : 'en-GB',
                  { month: 'long', timeZone: 'UTC' },
                ).format(new Date(Date.UTC(2024, i, 1)))}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor="stock-expiry-year">
          <span>{t('Year')}</span>
          <select
            id="stock-expiry-year"
            value={parts.year}
            required
            onChange={(event) => update('year', event.target.value)}
          >
            <option value="">{t('Year')}</option>
            {Array.from(
              { length: lastYear - firstYear + 1 },
              (_, i) => firstYear + i,
            ).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>
      </div>
      <small>
        {t(
          'Select day, month and year. Past dates are accepted for expired stock.',
        )}
      </small>
    </fieldset>
  );
}

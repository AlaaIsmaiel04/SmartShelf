import { useEffect, useState } from 'react';
import { useLanguage } from '../preferences/LanguageProvider';
import { CareSymbol } from '../../components/InterfaceIcon';
import {
  dutyCalendarDate,
  filterPublishedDuties,
  millisecondsUntilDutyMidnight,
  SERVICE_TIME_ZONE,
  upcomingDutyDates,
} from './duty-schedule';
import '../public-search/public.css';
import './duty-schedule.css';

export function DirectoryPage() {
  const { t, language } = useLanguage();
  const [date, setDate] = useState('');
  const [query, setQuery] = useState('');
  const [shift, setShift] = useState('');
  const [today, setToday] = useState(() => dutyCalendarDate());
  useEffect(() => {
    const refreshDate = () => setToday(dutyCalendarDate());
    const midnight = window.setTimeout(
      refreshDate,
      millisecondsUntilDutyMidnight(),
    );
    // Also recover from sleeping tabs, device clock changes and delayed timers.
    const interval = window.setInterval(refreshDate, 60_000);
    window.addEventListener('focus', refreshDate);
    document.addEventListener('visibilitychange', refreshDate);
    return () => {
      window.clearTimeout(midnight);
      window.clearInterval(interval);
      window.removeEventListener('focus', refreshDate);
      document.removeEventListener('visibilitychange', refreshDate);
    };
  }, [today]);
  useEffect(() => {
    if (date && date < today) setDate('');
  }, [date, today]);
  const selectedDate = date && date >= today ? date : '';
  const entries = filterPublishedDuties(selectedDate, query, shift, today);
  const dates = upcomingDutyDates(today);
  const formatDate = (value: string) =>
    new Intl.DateTimeFormat(language === 'ar' ? 'ar-SY' : 'en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: SERVICE_TIME_ZONE,
    }).format(new Date(`${value}T12:00:00+03:00`));
  return (
    <section className="public-page duty-schedule" aria-labelledby="duty-title">
      <header className="public-intro">
        <div className="public-intro-copy">
          <h2 id="duty-title">{t('On-duty pharmacies')}</h2>
          <p>{t('Syria / Hama / Salamiyah')}</p>
        </div>
        <CareSymbol />
      </header>
      <p>{t('Published duty schedule: 14–27 November 2026.')}</p>
      <div
        className="public-filters"
        role="search"
        aria-label={t('Pharmacy filters')}
      >
        <label>
          {t('Area')}
          <input value={t('Syria / Hama / Salamiyah')} readOnly />
        </label>
        <label>
          {t('Duty date')}
          <select
            value={selectedDate}
            onChange={(event) => setDate(event.target.value)}
          >
            <option value="">{t('Today and upcoming dates')}</option>
            {dates.map((day) => (
              <option key={day} value={day}>
                {formatDate(day)}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t('Shift')}
          <select
            value={shift}
            onChange={(event) => setShift(event.target.value)}
          >
            <option value="">{t('All shifts')}</option>
            <option value="noon">{t('Noon')}</option>
            <option value="evening">{t('Evening')}</option>
          </select>
        </label>
        <label>
          {t('Pharmacy name or address')}
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <button
          type="button"
          className="secondary"
          onClick={() => {
            setDate('');
            setShift('');
            setQuery('');
          }}
        >
          {t('Clear filters')}
        </button>
      </div>
      <p className="public-note">
        {t('Past duties are hidden automatically using Syria time.')}{' '}
        {t(
          'The notice specifies noon and evening shifts, not exact duty hours. A listing does not confirm that a pharmacy is open now or has a medicine in stock.',
        )}
      </p>
      <p role="status">
        {t('Duty entries: {count}', { count: entries.length })}
      </p>
      {!entries.length && (
        <p>
          {t(
            dates.length
              ? 'No pharmacies found'
              : 'No upcoming duty schedule has been published.',
          )}
        </p>
      )}
      {dates
        .filter((day) => entries.some((entry) => entry.date === day))
        .map((day) => (
          <section className="duty-day" key={day} aria-label={formatDate(day)}>
            <h3>
              <time dateTime={day}>{formatDate(day)}</time>
            </h3>
            <div className="duty-day-entries">
              {entries
                .filter((entry) => entry.date === day)
                .map((entry) => (
                  <article
                    key={`${entry.shift}-${entry.name}`}
                    className="duty-entry"
                  >
                    <div>
                      <h4>
                        <bdi>{entry.name}</bdi>
                      </h4>
                      <span className="public-duty">
                        {t(entry.shift === 'noon' ? 'Noon' : 'Evening')}
                      </span>
                    </div>
                    <p>
                      <bdi>{entry.address}</bdi>
                    </p>
                    <small>{t('Syria / Hama / Salamiyah')}</small>
                  </article>
                ))}
            </div>
          </section>
        ))}
    </section>
  );
}

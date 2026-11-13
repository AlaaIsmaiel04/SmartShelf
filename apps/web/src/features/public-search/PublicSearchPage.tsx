import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { ListResponse, PublicPharmacy } from '@smartshelf/contracts';
import { useLanguage } from '../preferences/LanguageProvider';
import { ApiRequestError } from '../../lib/api';
import { createPublicService } from './public-api';
import { PharmacyCard } from './PharmacyCard';
import { CareSymbol, InterfaceIcon } from '../../components/InterfaceIcon';
import './public.css';
import { SERVICE_AREA } from '../directory/duty-schedule';
import { demoMedicines, searchDemoMedicines } from './demo-search';

export function PublicSearchPage({
  directory = false,
}: {
  directory?: boolean;
}) {
  const { t, translateMessage, language } = useLanguage();
  const [searchParams] = useSearchParams();
  const initialDutyOnly = directory && searchParams.get('onDutyNow') === 'true';
  const service = useMemo(() => createPublicService(), []);
  const [demo, setDemo] = useState(!directory);
  const [q, setQ] = useState(directory ? '' : 'Panadol');
  const area = SERVICE_AREA;
  const [onDutyNow, setOnDutyNow] = useState(initialDutyOnly);
  const [submitted, setSubmitted] = useState<{
    q: string;
    area: string;
    onDutyNow: boolean;
  } | null>(
    directory
      ? { q: '', area, onDutyNow: initialDutyOnly }
      : { q: 'Panadol', area, onDutyNow: false },
  );
  const [attempt, setAttempt] = useState(0);
  const [data, setData] = useState<ListResponse<PublicPharmacy> | null>(null);
  const [error, setError] = useState('');
  const [invalid, setInvalid] = useState(false);
  const [loading, setLoading] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!submitted) return;
    const controller = new AbortController();
    setLoading(true);
    setError('');
    setData(null);
    const promise = demo
      ? Promise.resolve(searchDemoMedicines(submitted))
      : directory
        ? service.listPublicPharmacies(submitted, controller.signal)
        : service.searchMedicines(submitted, controller.signal);
    promise
      .then((result) => {
        if (!controller.signal.aborted) setData(result);
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return;
        setError(
          reason instanceof ApiRequestError && reason.status === 503
            ? 'Pharmacy data is temporarily unavailable. Please try again.'
            : reason instanceof ApiRequestError
              ? reason.message
              : 'Unable to load pharmacies. Check your connection and try again.',
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [submitted, directory, service, attempt, demo]);
  function changeMode() {
    setDemo(!demo);
    setQ(demo ? '' : 'Panadol');
    setSubmitted(demo ? null : { q: 'Panadol', area, onDutyNow: false });
    setOnDutyNow(false);
    setData(null);
    setError('');
    setInvalid(false);
    setLoading(false);
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    if (!directory && !q.trim()) {
      setInvalid(true);
      input.current?.focus();
      return;
    }
    setInvalid(false);
    setSubmitted({ q: q.trim(), area: area.trim(), onDutyNow });
  }
  function clear() {
    setQ('');
    setOnDutyNow(false);
    setInvalid(false);
    setData(null);
    setError('');
    setLoading(false);
    setSubmitted(directory ? { q: '', area, onDutyNow: false } : null);
    input.current?.focus();
  }
  return (
    <section className="public-page" aria-labelledby="public-title">
      <header className="public-intro">
        <div className="public-intro-copy">
          <h2 id="public-title">
            {t(directory ? 'Find a pharmacy' : 'Find your medicine')}
          </h2>
          <p>
            {t(
              directory
                ? 'Browse pharmacies and their duty schedules. No sign-in needed.'
                : 'Search by medicine or scientific name to find pharmacies with available stock.',
            )}
          </p>
        </div>
        <CareSymbol />
      </header>
      {!directory && (
        <aside
          className="search-demo-notice"
          aria-label={t('Search data source')}
        >
          <div>
            <strong>{t(demo ? 'Demo search' : 'Live search')}</strong>
            <p>
              {t(
                demo
                  ? 'Preview only: pharmacy names, addresses, stock and duty times below are fictional. They are not the published Salamiyah duty schedule.'
                  : 'Results come from registered pharmacies and their recorded inventory.',
              )}
            </p>
          </div>
          <button type="button" className="secondary" onClick={changeMode}>
            {t(demo ? 'Use live search' : 'Use demo search')}
          </button>
        </aside>
      )}
      {demo && (
        <div
          className="demo-medicine-choices"
          aria-label={t('Try a sample medicine')}
        >
          <span>{t('Try a sample medicine')}</span>
          {demoMedicines.slice(0, 6).map((medicine) => (
            <button
              type="button"
              key={medicine.name}
              onClick={() => {
                const value =
                  language === 'ar' ? medicine.arabic : medicine.name;
                setQ(value);
                setInvalid(false);
                setSubmitted({ q: value, area, onDutyNow });
              }}
            >
              {language === 'ar' ? medicine.arabic : medicine.name}
            </button>
          ))}
        </div>
      )}
      <form
        className="public-filters"
        onSubmit={submit}
        aria-label={t(
          directory ? 'Pharmacy filters' : 'Medicine search filters',
        )}
      >
        {!directory && (
          <label>
            <span id="public-query-label">{t('Medicine name')}</span>
            <input
              ref={input}
              aria-labelledby="public-query-label"
              name="q"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setInvalid(false);
              }}
              aria-invalid={invalid}
              aria-describedby={invalid ? 'public-query-error' : undefined}
            />
            {invalid && (
              <span id="public-query-error" role="alert">
                {t('Enter a medicine name.')}
              </span>
            )}
          </label>
        )}
        <label>
          {t('Area')}
          <input
            ref={directory ? input : undefined}
            name="area"
            value={t('Syria / Hama / Salamiyah')}
            readOnly
          />
        </label>
        <label className="public-checkbox">
          <input
            type="checkbox"
            checked={onDutyNow}
            onChange={(e) => setOnDutyNow(e.target.checked)}
          />
          {t(demo ? 'Simulated on-duty pharmacies only' : 'On duty now only')}
        </label>
        <div className="public-actions">
          <button type="submit">
            <InterfaceIcon name={directory ? 'pharmacy' : 'search'} />
            {t(directory ? 'Apply filters' : 'Search pharmacies')}
          </button>
          <button type="button" className="secondary" onClick={clear}>
            {t('Clear filters')}
          </button>
        </div>
      </form>
      <p className="public-note">
        {t(
          demo
            ? 'All availability, duty periods and update times shown in demo mode are simulated.'
            : 'Duty status is not general opening hours. Times are shown in Syria time. Contact the pharmacy to confirm availability.',
        )}
      </p>
      <div aria-live="polite" aria-atomic="true">
        {loading && <p role="status">{t('Loading pharmacies…')}</p>}
        {!loading && data && (
          <p className="public-result-count">
            {t('Pharmacies found: {count}', { count: data.total })}
            {!directory && submitted && (
              <>
                {' '}
                · <bdi>{submitted.q}</bdi>
              </>
            )}
          </p>
        )}
      </div>
      {error && (
        <div className="public-error" role="alert">
          <p>{translateMessage(error)}</p>
          <button
            type="button"
            onClick={() => setAttempt((value) => value + 1)}
          >
            {t('Retry')}
          </button>
        </div>
      )}
      {!loading && !error && !submitted && (
        <div className="public-empty">
          <InterfaceIcon name="search" />
          <h3>{t('Start with a medicine name')}</h3>
          <p>
            {t(
              'Enter a display or scientific name, then choose Search pharmacies.',
            )}
          </p>
        </div>
      )}
      {!loading &&
        !error &&
        data &&
        (data.total === 0 ? (
          <div className="public-empty">
            <h3>{t('No pharmacies found')}</h3>
            <p>
              {t('Try a different name or area, or remove the on-duty filter.')}
            </p>
          </div>
        ) : (
          <div className="public-results">
            {data.items.map((pharmacy, index) => (
              <PharmacyCard
                key={`${pharmacy.name}|${pharmacy.phone}|${index}`}
                pharmacy={pharmacy}
                demo={demo}
              />
            ))}
          </div>
        ))}
    </section>
  );
}

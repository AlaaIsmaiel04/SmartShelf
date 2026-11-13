import { ArrowRight, Mail, Pill, Hospital, UserRound } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../preferences/LanguageProvider';
import './home.css';

const SUPPORT_EMAIL = 'alaa.ismaiel20@gmail.com';

export function HomePage() {
  const { t } = useLanguage();
  const [pharmacistOpen, setPharmacistOpen] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);
  const [fields, setFields] = useState({
    name: '',
    pharmacy: '',
    area: '',
    email: '',
  });
  const [draftReady, setDraftReady] = useState(false);
  const body = [
    'Hello SmartShelf support,',
    'I would like to verify my pharmacy and request a SmartShelf account.',
    '',
    `Pharmacist name: ${fields.name.trim()}`,
    `Pharmacy name: ${fields.pharmacy.trim()}`,
    `Area / city: ${fields.area.trim()}`,
    `Contact email: ${fields.email.trim()}`,
    '',
    'Please let me know the verification requirements and subscription details.',
  ].join('\n');
  const requestHref = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('SmartShelf pharmacist verification and account request')}&body=${encodeURIComponent(body)}`;
  function prepareRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDraftReady(true);
  }
  return (
    <div className="home-page home-entry">
      <header className="entry-heading">
        <h1>{t('How can SmartShelf help you?')}</h1>
        <p>
          {t(
            'Choose your next step. Medicine search and duty schedules are open to everyone.',
          )}
        </p>
      </header>
      <div className="entry-choices" aria-label={t('Choose your next step')}>
        <button
          className="entry-choice entry-pharmacist"
          type="button"
          aria-expanded={pharmacistOpen}
          aria-controls="pharmacist-entry"
          onClick={() => setPharmacistOpen((open) => !open)}
        >
          <UserRound className="entry-icon" aria-hidden="true" />
          <span className="entry-title">{t('Pharmacist')}</span>
          <span className="entry-description">
            {t('Sign in or request an account for your pharmacy.')}
          </span>
          <ArrowRight className="entry-arrow" aria-hidden="true" />
        </button>
        <Link className="entry-choice entry-medicine" to="/search">
          <Pill className="entry-icon" aria-hidden="true" />
          <span className="entry-title">{t('Medicine Search')}</span>
          <span className="entry-description">
            {t('Find the medicine you need. No account required.')}
          </span>
          <ArrowRight className="entry-arrow" aria-hidden="true" />
        </Link>
        <Link
          className="entry-choice entry-duty"
          to="/pharmacies?onDutyNow=true"
        >
          <Hospital className="entry-icon" aria-hidden="true" />
          <span className="entry-title">{t('On-duty pharmacies')}</span>
          <span className="entry-description">
            {t('See pharmacies on duty now and how to contact them.')}
          </span>
          <ArrowRight className="entry-arrow" aria-hidden="true" />
        </Link>
      </div>
      {pharmacistOpen && (
        <section
          className="entry-access"
          id="pharmacist-entry"
          aria-labelledby="pharmacist-question"
        >
          <div className="entry-access-heading">
            <h2 id="pharmacist-question">
              {t('Is your pharmacy already subscribed?')}
            </h2>
            <p>
              {t(
                'Already have an account? Sign in with the details provided by support.',
              )}
            </p>
          </div>
          <div className="entry-actions">
            <Link className="button" to="/login">
              {t('Yes, sign in')}
            </Link>
            <button
              className="button entry-secondary"
              type="button"
              aria-expanded={requestOpen}
              aria-controls="pharmacist-request"
              onClick={() => setRequestOpen((open) => !open)}
            >
              {t('No, request an account')}
            </button>
          </div>
          {requestOpen && (
            <div className="entry-request" id="pharmacist-request">
              <h3>{t('Verify your pharmacy first')}</h3>
              <p>
                {t(
                  'Send your details to support. After verification and subscription setup, support will create your account and provide sign-in instructions.',
                )}
              </p>
              <form className="entry-request-form" onSubmit={prepareRequest}>
                <div className="entry-request-fields">
                  {(['name', 'pharmacy', 'area', 'email'] as const).map(
                    (field) => (
                      <label key={field} htmlFor={`request-${field}`}>
                        {t(
                          (
                            {
                              name: 'Pharmacist name',
                              pharmacy: 'Pharmacy name',
                              area: 'Area / city',
                              email: 'Contact email',
                            } as const
                          )[field],
                        )}
                        <input
                          id={`request-${field}`}
                          type={field === 'email' ? 'email' : 'text'}
                          dir={field === 'email' ? 'ltr' : 'auto'}
                          required
                          autoComplete={
                            field === 'name'
                              ? 'name'
                              : field === 'email'
                                ? 'email'
                                : field === 'pharmacy'
                                  ? 'organization'
                                  : 'address-level2'
                          }
                          maxLength={field === 'email' ? 254 : 120}
                          pattern={field === 'email' ? undefined : '.*\\S.*'}
                          value={fields[field]}
                          onChange={(event) => {
                            setFields({
                              ...fields,
                              [field]: event.target.value,
                            });
                            setDraftReady(false);
                          }}
                        />
                      </label>
                    ),
                  )}
                </div>
                <button className="button" type="submit">
                  {t('Prepare email request')}
                </button>
                {draftReady && (
                  <div className="entry-email-draft" role="status">
                    <p>
                      {t(
                        'Your draft is ready. Open your email app, then send it to support. This does not create an account automatically.',
                      )}
                    </p>
                    <a className="button" href={requestHref}>
                      <Mail size={18} aria-hidden="true" />
                      {t('Open email request')}
                    </a>
                  </div>
                )}
              </form>
              <p className="entry-support">
                {t('Or email support directly:')}{' '}
                <a href={`mailto:${SUPPORT_EMAIL}`}>
                  <bdi>{SUPPORT_EMAIL}</bdi>
                </a>
              </p>
              <p className="entry-support">
                {t(
                  'If no email app opens, copy the address and your details into your usual email service. Do not include a password.',
                )}
              </p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

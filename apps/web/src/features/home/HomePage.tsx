import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { InterfaceIcon } from '../../components/InterfaceIcon';
import { useLanguage } from '../preferences/LanguageProvider';
import './home.css';

export function HomePage() {
  const { t } = useLanguage();
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const choices = [
    {
      label: t('Medicine Search'),
      title: t('A clearer path to your pharmacy.'),
      description: t(
        'Find a medicine, explore pharmacy duty schedules, or open your staff workspace. Start here with SmartShelf.',
      ),
      action: t('Find a medicine'),
      to: '/search',
      icon: 'search' as const,
    },
    {
      label: t('Pharmacies'),
      title: t('Know where to go.'),
      description: t(
        'Browse pharmacies by area, view duty schedules, and find an address or phone number.',
      ),
      action: t('Browse pharmacies'),
      to: '/pharmacies',
      icon: 'pharmacy' as const,
    },
    {
      label: t('Staff sign in'),
      title: t('Your pharmacy workspace, in one place.'),
      description: t(
        'For pharmacy owners and pharmacists: sign in to access the tools available to your role.',
      ),
      action: t('Staff sign in'),
      to: '/login',
      icon: 'signin' as const,
    },
  ];
  const choice = choices[active];
  return (
    <div className="home-page">
      <h1 className="visually-hidden">SmartShelf</h1>
      <div className="home-choices" role="tablist" aria-label="SmartShelf">
        {choices.map((item, index) => (
          <button
            key={item.to}
            ref={(element) => {
              tabs.current[index] = element;
            }}
            id={`home-tab-${index}`}
            type="button"
            role="tab"
            aria-selected={active === index}
            aria-controls="home-feature"
            tabIndex={active === index ? 0 : -1}
            onClick={() => setActive(index)}
            onFocus={() => setActive(index)}
            onPointerEnter={(event) => {
              if (event.pointerType === 'mouse') setActive(index);
            }}
            onKeyDown={(event) => {
              const rtl = document.documentElement.dir === 'rtl';
              let next = index;
              if (event.key === 'ArrowRight')
                next = (index + (rtl ? 2 : 1)) % 3;
              else if (event.key === 'ArrowLeft')
                next = (index + (rtl ? 1 : 2)) % 3;
              else if (event.key === 'Home') next = 0;
              else if (event.key === 'End') next = 2;
              else return;
              event.preventDefault();
              tabs.current[next]?.focus();
            }}
          >
            <InterfaceIcon name={item.icon} />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
      <section
        className="home-feature"
        id="home-feature"
        role="tabpanel"
        aria-labelledby={`home-tab-${active}`}
        tabIndex={0}
      >
        <div className="home-feature-content" key={choice.to}>
          <div className="home-feature-copy">
            <h2>{choice.title}</h2>
            <p>{choice.description}</p>
            <Link className="button home-primary" to={choice.to}>
              <InterfaceIcon name={choice.icon} />
              {choice.action}
              <svg
                className="home-link-arrow"
                aria-hidden="true"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.65"
              >
                <path d="M4 12h15m-6-6 6 6-6 6" />
              </svg>
            </Link>
          </div>
          <div className="home-feature-symbol" aria-hidden="true">
            {active === 0 ? (
              <svg
                className="interface-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                aria-hidden="true"
              >
                <g transform="rotate(38 12 12)">
                  <rect x="7" y="2" width="10" height="20" rx="5" />
                  <path d="M7 12h10" />
                </g>
              </svg>
            ) : (
              <InterfaceIcon name={choice.icon} />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

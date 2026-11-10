import { useLanguage } from './LanguageProvider';
import { useTheme } from './ThemeProvider';
import { InterfaceIcon } from '../../components/InterfaceIcon';
import './preferences.css';

export function ThemeControl() {
  const { t } = useLanguage();
  const { theme, setPreference } = useTheme();
  const dark = theme === 'dark';
  return (
    <button
      type="button"
      className="display-switch theme-switch"
      role="switch"
      aria-label={t('Dark mode')}
      title={t('Dark mode')}
      aria-checked={dark}
      onClick={() => setPreference(dark ? 'light' : 'dark')}
    >
      <span
        className="theme-switch-track"
        data-dark={dark}
        dir="ltr"
        aria-hidden="true"
      >
        <span className="switch-thumb" />
        <span className="switch-choice">
          <InterfaceIcon name="light" />
        </span>
        <span className="switch-choice">
          <InterfaceIcon name="dark" />
        </span>
      </span>
    </button>
  );
}

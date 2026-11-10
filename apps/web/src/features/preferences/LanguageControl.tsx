import { useLanguage } from './LanguageProvider';
import './preferences.css';

export function LanguageControl() {
  const { language, setLanguage, t } = useLanguage();
  return (
    <button
      type="button"
      className="display-switch language-switch"
      data-arabic={language === 'ar'}
      dir="ltr"
      aria-label={t(
        language === 'ar' ? 'Switch to English' : 'Switch to Arabic',
      )}
      title={t(language === 'ar' ? 'Switch to English' : 'Switch to Arabic')}
      onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
    >
      <span className="switch-thumb" aria-hidden="true" />
      <span className="switch-choice" lang="en">
        English
      </span>
      <span className="switch-choice" lang="ar">
        العربية
      </span>
    </button>
  );
}

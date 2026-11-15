import { useAuth } from './AuthProvider';
import { useLanguage } from '../preferences/LanguageProvider';

export function SessionRestoreState() {
  const { isRestoring, restoreError, retryRestore, signOut } = useAuth();
  const { t, translateMessage } = useLanguage();
  if (isRestoring) return <p role="status">{t('Restoring your session…')}</p>;
  return (
    <section className="surface">
      <p role="alert">{translateMessage(restoreError)}</p>
      <div className="inventory-actions">
        <button type="button" className="button" onClick={retryRestore}>
          {t('Try again')}
        </button>
        <button
          type="button"
          className="button button-secondary"
          onClick={signOut}
        >
          {t('Continue signed out')}
        </button>
      </div>
    </section>
  );
}

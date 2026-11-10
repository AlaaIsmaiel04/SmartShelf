import { useLanguage } from '../features/preferences/LanguageProvider';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthProvider';
import { LanguageControl } from '../features/preferences/LanguageControl';
import { ThemeControl } from '../features/preferences/ThemeControl';
import { InterfaceIcon } from './InterfaceIcon';
import type { InterfaceIconName } from './InterfaceIcon';

export function Brand() {
  const { t } = useLanguage();
  return (
    <Link to="/" className="brand" aria-label={t('SmartShelf home')} dir="ltr">
      <span>SmartShelf</span>
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { t } = useLanguage();
  const { user, signOut } = useAuth();
  const { pathname } = useLocation();
  const preview =
    import.meta.env.DEV && ['/dev/owner', '/dev/inventory'].includes(pathname);
  const pharmacist =
    user?.role === 'PHARMACIST' || pathname === '/dev/inventory';
  const workspace =
    pathname.startsWith('/owner') ||
    pathname.startsWith('/pharmacist') ||
    (user?.role === 'PHARMACIST' && pathname === '/search') ||
    preview;
  const owner = user?.role === 'OWNER' || pathname === '/dev/owner';
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const drawer = useRef<HTMLDialogElement>(null);
  const [mobile, setMobile] = useState(
    () => window.matchMedia('(max-width: 760px)').matches,
  );
  useEffect(() => {
    const query = window.matchMedia('(max-width: 760px)');
    const update = () => {
      setMobile(query.matches);
      setMenuOpen(false);
    };
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    const dialog = drawer.current;
    if (!dialog || !workspace) return;
    if (!mobile) {
      if (dialog.matches(':modal')) dialog.close();
      if (!dialog.open) dialog.show();
      return;
    }
    if (!menuOpen) {
      if (dialog.open) dialog.close();
      return;
    }
    if (dialog.open && !dialog.matches(':modal')) dialog.close();
    if (!dialog.open) dialog.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobile, menuOpen, workspace]);
  const links: {
    to: string;
    label: Parameters<typeof t>[0];
    icon: InterfaceIconName;
    end?: boolean;
  }[] = [];
  if (user?.role === 'OWNER')
    links.push({ to: '/owner', label: 'Owner dashboard', icon: 'dashboard' });
  if (user?.role === 'PHARMACIST')
    links.push(
      { to: '/pharmacist', label: 'Dashboard', icon: 'dashboard', end: true },
      { to: '/pharmacist/inventory', label: 'Inventory', icon: 'inventory' },
      { to: '/pharmacist/profile', label: 'Profile & duty', icon: 'profile' },
    );
  if (preview)
    links.push({
      to: pathname,
      label: owner ? 'Owner workspace' : 'Inventory',
      icon: owner ? 'dashboard' : 'inventory',
    });
  if (!(workspace && pharmacist))
    links.push({ to: '/', label: 'Home', icon: 'home', end: true });
  links.push({ to: '/search', label: 'Medicine Search', icon: 'search' });
  if (!(workspace && pharmacist))
    links.push({ to: '/pharmacies', label: 'Pharmacies', icon: 'pharmacy' });
  if (!user) links.push({ to: '/login', label: 'Sign in', icon: 'signin' });
  const navigation = links
    .filter(({ to }) => workspace || to !== '/login')
    .map(({ to, label, icon, end }) => (
      <li key={to}>
        <NavLink to={to} end={end} aria-label={t(label)} title={t(label)}>
          <InterfaceIcon name={icon} />
          <span className="nav-link-label">{t(label)}</span>
        </NavLink>
      </li>
    ));
  return (
    <div
      className={`app-shell ${workspace ? 'workspace-shell' : 'public-shell'}${collapsed ? ' sidebar-is-collapsed' : ''}`}
    >
      <a className="skip-link" href="#main-content">
        {t('Skip to content')}
      </a>
      {workspace && (
        <aside className="workspace-sidebar">
          <div className="sidebar-brand">
            <Brand />
            <button
              className="sidebar-collapse-toggle"
              type="button"
              aria-label={t(collapsed ? 'Expand sidebar' : 'Collapse sidebar')}
              title={t(collapsed ? 'Expand sidebar' : 'Collapse sidebar')}
              aria-expanded={!collapsed}
              aria-controls="workspace-navigation"
              onClick={() => setCollapsed(!collapsed)}
            >
              <InterfaceIcon name="sidebar" />
            </button>
            <button
              ref={toggle}
              className="menu-toggle"
              type="button"
              aria-label={t('Toggle navigation')}
              aria-expanded={menuOpen}
              aria-controls="workspace-drawer"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>{' '}
              {t('Menu')}
            </button>
          </div>
          <dialog
            ref={drawer}
            id="workspace-drawer"
            className="workspace-drawer"
            role={mobile ? 'dialog' : 'presentation'}
            aria-label={mobile ? t('Main navigation') : undefined}
            aria-modal={mobile && menuOpen ? true : undefined}
            onKeyDown={(event) => {
              if (!mobile || event.key !== 'Tab') return;
              const controls = [
                ...event.currentTarget.querySelectorAll<HTMLElement>(
                  'a[href], button:not(:disabled), [tabindex="0"]',
                ),
              ].filter((element) => element.getClientRects().length);
              const first = controls[0],
                last = controls[controls.length - 1];
              if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last?.focus();
              } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first?.focus();
              }
            }}
            onCancel={(event) => {
              event.preventDefault();
              setMenuOpen(false);
            }}
            onClick={(event) => {
              if (!mobile || event.target !== event.currentTarget) return;
              const bounds = event.currentTarget.getBoundingClientRect();
              if (
                event.clientX < bounds.left ||
                event.clientX > bounds.right ||
                event.clientY < bounds.top ||
                event.clientY > bounds.bottom
              )
                setMenuOpen(false);
            }}
          >
            <div className="drawer-heading">
              <span>SmartShelf</span>
              <button
                type="button"
                className="drawer-close"
                aria-label={t('Close menu')}
                onClick={() => setMenuOpen(false)}
              >
                <svg
                  aria-hidden="true"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="m6 6 12 12M18 6 6 18" />
                </svg>
              </button>
            </div>
            <nav
              id="workspace-navigation"
              aria-label={t('Main navigation')}
              className={menuOpen ? 'workspace-nav is-open' : 'workspace-nav'}
              onClick={(event) => {
                if ((event.target as HTMLElement).closest('a'))
                  setMenuOpen(false);
              }}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  setMenuOpen(false);
                  toggle.current?.focus();
                }
              }}
            >
              <p className="nav-label">{t('Your workspace')}</p>
              <ul>{navigation}</ul>
              {!pharmacist && (
                <div className="sidebar-message">
                  <strong>
                    {t('Safer shelves.')}
                    <br />
                    {t('Every day.')}
                  </strong>
                  <p>
                    {t('Review stock and expiry dates before your next shift.')}
                  </p>
                </div>
              )}
              <div className="sidebar-identity">
                <strong>
                  {preview
                    ? t('Sample workspace')
                    : owner
                      ? t('Platform owner')
                      : t('Pharmacist')}
                </strong>
                {user && (
                  <>
                    <p dir="ltr">{user.email}</p>
                    <button
                      type="button"
                      onClick={signOut}
                      aria-label={t('Sign out')}
                      title={t('Sign out')}
                    >
                      <InterfaceIcon name="signout" />
                      <span className="nav-link-label">{t('Sign out')}</span>
                    </button>
                  </>
                )}
              </div>
            </nav>
            <div className="display-preferences sidebar-preferences">
              <LanguageControl />
              <ThemeControl />
            </div>
          </dialog>
        </aside>
      )}
      <div className="app-body">
        <header className="app-topbar">
          {workspace ? (
            <>
              <span>
                {owner ? t('Platform management') : t('Pharmacy workspace')}
              </span>
            </>
          ) : (
            <>
              <Brand />
              <div className="display-preferences">
                <LanguageControl />
                <ThemeControl />
              </div>
            </>
          )}
        </header>
        <main
          id="main-content"
          tabIndex={-1}
          className={pathname === '/login' ? 'app-main login-main' : 'app-main'}
        >
          {children}
        </main>
        <footer className="app-footer">
          <span>{t('SmartShelf — Team 2')}</span>
          <span>{t('Pharmacy management & medicine search')}</span>
        </footer>
      </div>
    </div>
  );
}

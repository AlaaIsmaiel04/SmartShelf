export type InterfaceIconName =
  | 'home'
  | 'search'
  | 'pharmacy'
  | 'dashboard'
  | 'inventory'
  | 'profile'
  | 'signin'
  | 'signout'
  | 'sidebar'
  | 'language'
  | 'system'
  | 'light'
  | 'dark'
  | 'check'
  | 'chevron';

// One shared stroke family. Icons decorate existing text labels.
export function InterfaceIcon({ name }: { name: InterfaceIconName }) {
  return (
    <svg
      className="interface-icon"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {name === 'home' && <path d="m3 10 9-7 9 7M5 9v12h5v-7h4v7h5V9" />}
      {name === 'search' && (
        <>
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="m16 16 4.5 4.5" />
        </>
      )}
      {name === 'pharmacy' && (
        <>
          <path d="M4 21V7l8-4 8 4v14M2 21h20M9 21v-6h6v6M9 9h6M12 6v6" />
        </>
      )}
      {name === 'dashboard' && (
        <>
          <rect x="3" y="3" width="7" height="7" rx="2" />
          <rect x="14" y="3" width="7" height="7" rx="2" />
          <rect x="3" y="14" width="7" height="7" rx="2" />
          <rect x="14" y="14" width="7" height="7" rx="2" />
        </>
      )}
      {name === 'inventory' && (
        <>
          <path d="m12 2 9 5-9 5-9-5 9-5Zm-9 5v10l9 5 9-5V7M12 12v10M7.5 4.5l9 5" />
        </>
      )}
      {name === 'profile' && (
        <>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21v-2a8 8 0 0 1 16 0v2" />
        </>
      )}
      {name === 'signin' && (
        <>
          <path d="M14 4h6v16h-6M3 12h12m-4-4 4 4-4 4" />
        </>
      )}
      {name === 'language' && (
        <>
          <circle cx="12" cy="12" r="9" />
          <ellipse cx="12" cy="12" rx="4" ry="9" />
          <path d="M3 12h18" />
        </>
      )}
      {name === 'system' && (
        <>
          <rect x="3" y="4" width="18" height="12" rx="2" />
          <path d="M12 16v4m-4 0h8" />
        </>
      )}
      {name === 'light' && (
        <>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
        </>
      )}
      {name === 'dark' && (
        <path d="M20.5 14A9 9 0 0 1 10 3.5 9 9 0 1 0 20.5 14Z" />
      )}
      {name === 'chevron' && <path d="m7 10 5 5 5-5" />}
      {name === 'sidebar' && (
        <>
          <rect x="3" y="4" width="18" height="16" rx="3" />
          <path d="M9 4v16" />
        </>
      )}
      {name === 'signout' && <path d="M10 4H4v16h6m0-8h11m-4-4 4 4-4 4" />}
      {name === 'check' && <path d="m5 12 4 4L19 6" />}
    </svg>
  );
}

export function CareSymbol() {
  return (
    <svg
      className="care-symbol"
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
  );
}

import {
  House,
  Search,
  Hospital,
  LayoutGrid,
  Package,
  UserRound,
  LogIn,
  LogOut,
  PanelLeft,
  Languages,
  Monitor,
  Sun,
  Moon,
  Check,
  ChevronDown,
  Pill,
} from 'lucide-react';

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

const icons = {
  home: House,
  search: Search,
  pharmacy: Hospital,
  dashboard: LayoutGrid,
  inventory: Package,
  profile: UserRound,
  signin: LogIn,
  signout: LogOut,
  sidebar: PanelLeft,
  language: Languages,
  system: Monitor,
  light: Sun,
  dark: Moon,
  check: Check,
  chevron: ChevronDown,
};

// Preserve the shared icon API while using Lucide's consistent stroke family.
export function InterfaceIcon({ name }: { name: InterfaceIconName }) {
  const Icon = icons[name];
  return (
    <Icon
      className="interface-icon"
      size={20}
      strokeWidth={1.65}
      aria-hidden="true"
    />
  );
}

export function CareSymbol() {
  return <Pill className="care-symbol" strokeWidth={1} aria-hidden="true" />;
}

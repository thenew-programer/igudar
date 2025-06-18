import { DivideIcon as LucideIcon } from 'lucide-react';

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
  children?: NavigationItem[];
}

export interface UserMenuAction {
  id: string;
  label: string;
  href?: string;
  icon: LucideIcon;
  action?: () => void;
  separator?: boolean;
}

export interface LayoutProps {
  children: React.ReactNode;
}

export interface HeaderProps {
  onMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

export interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

export interface UserMenuProps {
  align?: 'start' | 'center' | 'end';
}
'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Settings, 
  LogOut, 
  CreditCard,
  Bell,
  HelpCircle,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/components/auth/AuthProvider';
import { UserMenuProps, UserMenuAction } from '@/types/navigation';

export const UserMenu: React.FC<UserMenuProps> = ({ align = 'end' }) => {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const userMenuActions: UserMenuAction[] = [
    {
      id: 'profile',
      label: 'Profile',
      href: '/profile',
      icon: User,
    },
    {
      id: 'billing',
      label: 'Billing',
      href: '/billing',
      icon: CreditCard,
    },
    {
      id: 'notifications',
      label: 'Notifications',
      href: '/notifications',
      icon: Bell,
    },
    {
      id: 'settings',
      label: 'Settings',
      href: '/settings',
      icon: Settings,
    },
    {
      id: 'separator-1',
      label: '',
      icon: HelpCircle,
      separator: true,
    },
    {
      id: 'help',
      label: 'Help & Support',
      href: '/help',
      icon: HelpCircle,
    },
    {
      id: 'separator-2',
      label: '',
      icon: LogOut,
      separator: true,
    },
    {
      id: 'logout',
      label: 'Sign Out',
      icon: LogOut,
      action: handleSignOut,
    },
  ];

  if (loading || !user) {
    return null;
  }

  const userInitials = user.user_metadata?.full_name
    ? user.user_metadata.full_name
        .split(' ')
        .map((name: string) => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user.email?.[0]?.toUpperCase() || 'U';

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage 
              src={user.user_metadata?.avatar_url} 
              alt={displayName}
            />
            <AvatarFallback className="bg-igudar-primary text-white">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-56" align={align} forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-igudar-text-muted">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {userMenuActions.map((action) => {
          if (action.separator) {
            return <DropdownMenuSeparator key={action.id} />;
          }

          const Icon = action.icon;

          if (action.action) {
            return (
              <DropdownMenuItem
                key={action.id}
                onClick={action.action}
                className="cursor-pointer"
              >
                <Icon className="mr-2 h-4 w-4" />
                <span>{action.label}</span>
              </DropdownMenuItem>
            );
          }

          if (action.href) {
            return (
              <DropdownMenuItem key={action.id} asChild>
                <Link href={action.href} className="cursor-pointer">
                  <Icon className="mr-2 h-4 w-4" />
                  <span>{action.label}</span>
                </Link>
              </DropdownMenuItem>
            );
          }

          return null;
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
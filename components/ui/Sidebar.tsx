'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/components/auth/AuthProvider';
import { LanguageSelector } from '@/components/auth/LanguageSelector';
import { NavigationItem } from '@/types/navigation';
import Image from 'next/image';
import {
	LayoutDashboard,
	Building2,
	TrendingUp,
	PieChart,
	User,
	Settings,
	Shield,
	HelpCircle,
	CreditCard,
	LogOut,
	X,
	ChevronLeft,
	ChevronRight,
	FileText
} from 'lucide-react';

interface SidebarProps {
	isOpen?: boolean;
	onClose?: () => void;
	className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
	isOpen = false,
	onClose,
	className = ''
}) => {
	const pathname = usePathname();
	const { user, signOut } = useAuth();
	const [isCollapsed, setIsCollapsed] = useState(false);

	// Load collapsed state from localStorage
	useEffect(() => {
		const savedState = localStorage.getItem('sidebar-collapsed');
		if (savedState) {
			setIsCollapsed(JSON.parse(savedState));
		}
	}, []);

	// Save collapsed state and emit event
	const toggleCollapsed = () => {
		const newState = !isCollapsed;
		setIsCollapsed(newState);
		localStorage.setItem('sidebar-collapsed', JSON.stringify(newState));

		// Emit custom event for other components to listen
		window.dispatchEvent(new CustomEvent('sidebar-toggle', {
			detail: { collapsed: newState }
		}));
	};

	const handleSignOut = async () => {
		try {
			await signOut();
		} catch (error) {
			console.error('Sign out error:', error);
		}
	};

	// App navigation items
	const appNavItems = [
		{
			name: 'Dashboard',
			href: '/dashboard',
			icon: LayoutDashboard,
		},
		{
			name: 'Properties',
			href: '/properties',
			icon: Building2,
		},
		{
			name: 'Investments',
			href: '/investments',
			icon: TrendingUp,
		},
		{
			name: 'Portfolio',
			href: '/portfolio',
			icon: PieChart,
		},
		{
			name: 'Documents',
			href: '/documents',
			icon: FileText,
		},
	];

	// User navigation items
	const userNavItems = [
		{
			name: 'Profile',
			href: '/profile',
			icon: User,
		},
		{
			name: 'Settings',
			href: '/settings',
			icon: Settings,
		},
		{
			name: 'Security',
			href: '/security',
			icon: Shield,
		},
		{
			name: 'Billing',
			href: '/billing',
			icon: CreditCard,
		},
		{
			name: 'Help & Support',
			href: '/help',
			icon: HelpCircle,
		},
	];

	const isActive = (href: string) => {
		if (href === '/dashboard') {
			return pathname === href;
		}
		return pathname.startsWith(href);
	};

	const NavItem = ({ item, showText = true }: { item: any; showText?: boolean }) => {
		const Icon = item.icon;
		const active = isActive(item.href);

		return (
			<Link
				href={item.href}
				onClick={onClose}
				className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${active
					? 'bg-igudar-primary text-white shadow-sm'
					: 'text-igudar-text hover:bg-igudar-primary/10 hover:text-igudar-primary'
					} ${!showText ? 'justify-center' : ''}`}
			>
				<Icon className={`h-5 w-5 ${showText ? 'mr-3' : ''} flex-shrink-0`} />
				{showText && (
					<span className="transition-opacity duration-200">{item.name}</span>
				)}
			</Link>
		);
	};

	// Mobile overlay
	if (isOpen) {
		return (
			<>
				{/* Mobile backdrop */}
				<div
					className="fixed inset-0 bg-black/50 z-40 lg:hidden"
					onClick={onClose}
				/>

				{/* Mobile sidebar */}
				<div className={`fixed left-0 top-0 h-full w-64 bg-white border-r border-border z-50 lg:hidden ${className}`}>
					<div className="flex flex-col h-full">
						{/* Mobile header */}
						<div className="flex items-center justify-between p-4 border-b border-border">
							<Link href="/dashboard" className="flex items-center space-x-2">
								<Image
									src="/igudar.png"
									alt="IGUDAR Logo"
									width={40}
									height={40}
									className="mr-2"
								/>
								<span className="text-xl font-bold text-igudar-primary">IGUDAR</span>
							</Link>
							<Button
								variant="ghost"
								size="sm"
								onClick={onClose}
								className="text-igudar-text hover:text-igudar-primary"
							>
								<X className="h-5 w-5" />
							</Button>
						</div>

						{/* Mobile navigation */}
						<ScrollArea className="flex-1 px-4 py-4">
							<div className="space-y-6">
								{/* App Navigation */}
								<div className="space-y-2">
									{appNavItems.map((item) => (
										<NavItem key={item.name} item={item} />
									))}
								</div>

								<Separator />

								{/* User Navigation */}
								<div className="space-y-2">
									{userNavItems.map((item) => (
										<NavItem key={item.name} item={item} />
									))}
								</div>
							</div>
						</ScrollArea>

						{/* Mobile user info and sign out */}
						<div className="p-4 border-t border-border">
							{user && (
								<div className="mb-3">
									<div className="text-sm font-medium text-igudar-text">
										{user.user_metadata?.full_name || user.email}
									</div>
									<div className="text-xs text-igudar-text-muted">{user.email}</div>
								</div>
							)}
							<Button
								variant="ghost"
								onClick={handleSignOut}
								className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
							>
								<LogOut className="mr-3 h-4 w-4" />
								Sign Out
							</Button>
						</div>
					</div>
				</div>
			</>
		);
	}

	// Desktop sidebar
	return (
		<div className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 ${isCollapsed ? 'lg:w-16' : 'lg:w-64'
			} bg-white border-r border-border transition-all duration-300 ${className}`}>

			{/* Desktop header */}
			<div className={`flex items-center ${isCollapsed ? 'justify-center px-2' : 'justify-between px-4'} py-4 border-b border-border`}>
				<Link href="/dashboard" className="flex items-center space-x-2">
					<Image
						src="/igudar.png"
						alt="IGUDAR Logo"
						width={40}
						height={40}
						className="mr-2"
					/>
					{!isCollapsed && (
						<span className="text-xl font-bold text-igudar-primary transition-opacity duration-200">
							IGUDAR
						</span>
					)}
				</Link>

				{!isCollapsed && (
					<Button
						variant="ghost"
						size="sm"
						onClick={toggleCollapsed}
						className="text-igudar-text hover:text-igudar-primary"
					>
						<ChevronLeft className="h-4 w-4" />
					</Button>
				)}
			</div>

			{/* Collapsed expand button */}
			{isCollapsed && (
				<div className="px-2 py-2">
					<Button
						variant="ghost"
						size="sm"
						onClick={toggleCollapsed}
						className="w-full justify-center text-igudar-text hover:text-igudar-primary"
					>
						<ChevronRight className="h-4 w-4" />
					</Button>
				</div>
			)}

			{/* Desktop navigation */}
			<ScrollArea className="flex-1 px-3 py-4">
				<div className="space-y-6">
					{/* App Navigation */}
					<div className="space-y-1">
						{appNavItems.map((item) => (
							<NavItem key={item.name} item={item} showText={!isCollapsed} />
						))}
					</div>

					<Separator />

					{/* User Navigation */}
					<div className="space-y-1">
						{userNavItems.map((item) => (
							<NavItem key={item.name} item={item} showText={!isCollapsed} />
						))}
					</div>
				</div>
			</ScrollArea>

			{/* Desktop user info and sign out */}
			<div className={`p-3 border-t border-border ${isCollapsed ? 'text-center' : ''}`}>
				{user && !isCollapsed && (
					<div className="mb-3 px-3">
						<div className="text-sm font-medium text-igudar-text truncate">
							{user.user_metadata?.full_name || user.email}
						</div>
						<div className="text-xs text-igudar-text-muted truncate">{user.email}</div>
					</div>
				)}

				<Button
					variant="ghost"
					onClick={handleSignOut}
					className={`${isCollapsed ? 'w-10 h-10 p-0' : 'w-full justify-start'} text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200`}
					title={isCollapsed ? 'Sign Out' : undefined}
				>
					<LogOut className={`h-4 w-4 ${!isCollapsed ? 'mr-3' : ''}`} />
					{!isCollapsed && <span>Sign Out</span>}
				</Button>
			</div>
		</div>
	);
};

'use client';

import React, { useRef, useEffect } from 'react';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { InvestmentChart } from '@/components/dashboard/InvestmentChart';
import { useAuth } from '@/components/auth/AuthProvider';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
	const { user, loading: authLoading } = useAuth();
	const investmentOverviewRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleScroll = () => {
			if (investmentOverviewRef.current) {
				const rect = investmentOverviewRef.current.getBoundingClientRect();
				const isInView = rect.top <= 0 && rect.bottom > 0;

				if (isInView) {
					investmentOverviewRef.current.style.boxShadow = '0 0 0 2px rgba(93, 24, 233, 0.1)';
				} else {
					investmentOverviewRef.current.style.boxShadow = 'none';
				}
			}
		};

		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	if (authLoading) {
		return (
			<div className="flex-1 space-y-6 p-4 md:p-6">
				<Skeleton className="h-10 w-64 mb-4" />
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					{Array.from({ length: 4 }).map((_, i) => (
						<Skeleton key={i} className="h-32 w-full" />
					))}
				</div>
				<Skeleton className="h-24 w-full" />
				<Skeleton className="h-96 w-full" />
			</div>
		);
	}

	return (
		<div className="flex-1 space-y-6 p-4 md:p-6" key={user?.id || 'loading'}>
			<div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
				<div>
					<h1 className="text-2xl md:text-3xl font-bold text-igudar-text">
						Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || 'Investor'}!
					</h1>
				</div>
			</div>
			<StatsCards />
			<QuickActions />
			<div
				ref={investmentOverviewRef}
				className="scroll-mt-6 transition-all duration-300"
				style={{ scrollSnapAlign: 'start' }}
			>
				<div className="mb-4">
					<h2 className="text-xl font-semibold text-igudar-text mb-2">Investment Overview</h2>
					<p className="text-sm text-igudar-text-secondary">
						Detailed analysis of your portfolio performance and distribution
					</p>
				</div>
				<div className="grid gap-6 lg:grid-cols-3">
					<div className="lg:col-span-2">
						<InvestmentChart />
					</div>

					<div className="lg:col-span-1">
						<RecentActivity />
					</div>
				</div>
			</div>
			<div className="space-y-6 pt-6">
				<div className="text-center text-igudar-text-muted">
					<p className="text-sm">
						More portfolio insights and detailed analytics coming soon...
					</p>
				</div>
			</div>
		</div>
	);
}

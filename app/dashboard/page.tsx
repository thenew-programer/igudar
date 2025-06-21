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
					investmentOverviewRef.current.style.boxShadow = '0 0 0 1px rgba(93, 24, 233, 0.08)';
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
			<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50/50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					<div className="space-y-8">
						{/* Header Skeleton */}
						<div className="space-y-4">
							<Skeleton className="h-8 w-80 bg-slate-200" />
							<Skeleton className="h-4 w-96 bg-slate-100" />
						</div>
						
						{/* Stats Cards Skeleton */}
						<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
							{Array.from({ length: 4 }).map((_, i) => (
								<Skeleton key={i} className="h-32 w-full bg-slate-200 rounded-xl" />
							))}
						</div>
						
						{/* Quick Actions Skeleton */}
						<Skeleton className="h-20 w-full bg-slate-200 rounded-xl" />
						
						{/* Chart Skeleton */}
						<div className="grid gap-6 lg:grid-cols-3">
							<Skeleton className="lg:col-span-2 h-96 bg-slate-200 rounded-xl" />
							<Skeleton className="lg:col-span-1 h-96 bg-slate-200 rounded-xl" />
						</div>
					</div>
				</div>
			</div>
		);
	}

	const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'Investor';
	const currentHour = new Date().getHours();
	const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50/50" key={user?.id || 'loading'}>
			{/* Main Container */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="space-y-8">
					{/* Enhanced Header Section */}
					<div className="relative">
						<div className="absolute inset-0 bg-gradient-to-r from-igudar-primary/5 via-transparent to-igudar-primary/5 rounded-2xl -z-10" />
						<div className="px-6 py-8 sm:px-8">
							<div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
								<div className="space-y-2">
									<h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-igudar-text to-igudar-text/80 bg-clip-text text-transparent">
										{greeting}, {firstName}!
									</h1>
									<p className="text-lg text-igudar-text-secondary max-w-2xl">
										Track your investments, monitor performance, and discover new opportunities in your personalized dashboard.
									</p>
								</div>
								
								{/* Time-based Badge */}
								<div className="flex items-center space-x-2 lg:flex-col lg:items-end lg:space-x-0 lg:space-y-2">
									<div className="px-4 py-2 bg-white/80 backdrop-blur-sm border border-igudar-primary/10 rounded-full">
										<span className="text-sm font-medium text-igudar-text">
											{new Date().toLocaleDateString('en-US', { 
												weekday: 'long', 
												month: 'short', 
												day: 'numeric' 
											})}
										</span>
									</div>
									<div className="w-2 h-2 bg-green-500 rounded-full animate-pulse lg:hidden" />
								</div>
							</div>
						</div>
					</div>

					{/* Stats Cards with Enhanced Spacing */}
					<div className="relative">
						<div className="absolute inset-0 bg-gradient-to-r from-transparent via-igudar-primary/5 to-transparent rounded-2xl blur-3xl -z-10" />
						<StatsCards />
					</div>

					{/* Quick Actions Enhanced */}
					<div className="relative">
						<div className="mb-6">
							<h2 className="text-xl font-semibold text-igudar-text mb-2">Quick Actions</h2>
							<p className="text-sm text-igudar-text-secondary">
								Manage your portfolio with these essential tools
							</p>
						</div>
						<QuickActions />
					</div>

					{/* Investment Overview - Enhanced Section */}
					<div
						ref={investmentOverviewRef}
						className="scroll-mt-8 transition-all duration-500 rounded-2xl"
						style={{ scrollSnapAlign: 'start' }}
					>
						{/* Section Header */}
						<div className="mb-8 text-center lg:text-left">
							<div className="inline-flex items-center space-x-2 mb-4">
								<div className="w-1 h-8 bg-gradient-to-b from-igudar-primary to-igudar-primary/60 rounded-full" />
								<h2 className="text-2xl font-bold text-igudar-text">Investment Overview</h2>
							</div>
							<p className="text-igudar-text-secondary max-w-3xl mx-auto lg:mx-0">
								Comprehensive analysis of your portfolio performance, asset allocation, and recent market activity to help you make informed investment decisions.
							</p>
						</div>

						{/* Chart and Activity Grid */}
						<div className="grid gap-8 lg:grid-cols-12">
							{/* Main Chart Area */}
							<div className="lg:col-span-8">
								<div className="relative group">
									<div className="absolute inset-0 bg-gradient-to-br from-igudar-primary/5 via-transparent to-igudar-primary/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
									<InvestmentChart />
								</div>
							</div>

							{/* Recent Activity Sidebar */}
							<div className="lg:col-span-4">
								<div className="sticky top-8">
									<div className="relative">
										<div className="absolute inset-0 bg-gradient-to-b from-white to-slate-50/50 rounded-2xl shadow-sm border border-slate-100/60" />
										<div className="relative">
											<RecentActivity />
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Enhanced Footer Section */}
					<div className="relative py-12">
						<div className="absolute inset-0 bg-gradient-to-r from-igudar-primary/5 via-transparent to-igudar-primary/5 rounded-2xl" />
						<div className="relative text-center space-y-4">
							<div className="inline-flex items-center justify-center w-12 h-12 bg-igudar-primary/10 rounded-full mb-4">
								<div className="w-6 h-6 bg-igudar-primary/20 rounded-full animate-pulse" />
							</div>
							<h3 className="text-lg font-semibold text-igudar-text">
								More Insights Coming Soon
							</h3>
							<p className="text-igudar-text-secondary max-w-md mx-auto">
								We're working on advanced analytics, AI-powered recommendations, and personalized market insights to enhance your investment experience.
							</p>
							<div className="flex items-center justify-center space-x-2 pt-4">
								<div className="w-2 h-2 bg-igudar-primary rounded-full animate-bounce" />
								<div className="w-2 h-2 bg-igudar-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
								<div className="w-2 h-2 bg-igudar-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

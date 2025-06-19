'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
	TrendingUp,
	TrendingDown,
	DollarSign,
	Building2,
	PieChart,
	Target,
	ArrowUpRight,
	ArrowDownRight
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { InvestmentService } from '@/lib/investments';
import { PortfolioSummary } from '@/types/investment';

interface StatCard {
	title: string;
	value: string;
	change: string;
	changeType: 'positive' | 'negative';
	icon: React.ElementType;
	description: string;
}

export const StatsCards: React.FC = () => {
	const { user } = useAuth();
	const [stats, setStats] = useState<PortfolioSummary | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchStats = async () => {
		if (!user?.id) {
			setLoading(false);
			return;
		}

		try {
			setLoading(true);
			setError(null);

			const result = await InvestmentService.getPortfolioSummary(user.id);

			if (result.success && result.data) {
				setStats(result.data);
			} else {
				setError(result.error || 'Failed to load statistics');
			}
		} catch (err) {
			setError('An unexpected error occurred');
			console.error('Error fetching portfolio summary:', err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchStats();
	}, [user?.id]);

	// Refresh data every 30 seconds to ensure fresh data
	useEffect(() => {
		const interval = setInterval(() => {
			if (user?.id) {
				fetchStats();
			}
		}, 30000);

		return () => clearInterval(interval);
	}, [user?.id]);

	// Format currency
	const formatCurrency = (amount: number): string => {
		if (amount === 0) return '0 MAD';
		if (amount >= 1000000) {
			return `${(amount / 1000000).toFixed(1)}M MAD`;
		} else if (amount >= 1000) {
			return `${(amount / 1000).toFixed(0)}K MAD`;
		}
		return `${Math.round(amount).toLocaleString()} MAD`;
	};

	// Format percentage
	const formatPercentage = (percentage: number): string => {
		if (percentage === 0) return '0%';
		const sign = percentage > 0 ? '+' : '';
		return `${sign}${percentage.toFixed(1)}%`;
	};

	// Generate stat cards from data
	const generateStatCards = (data: PortfolioSummary): StatCard[] => {
		return [
			{
				title: 'Total Invested',
				value: formatCurrency(data.total_invested),
				change: data.total_invested > 0 ? '+12.5%' : '0%',
				changeType: 'positive',
				icon: DollarSign,
				description: 'Total amount invested across all properties'
			},
			{
				title: 'Active Investments',
				value: data.active_investments.toString(),
				change: data.active_investments > 0 ? `+${data.active_investments}` : '0',
				changeType: 'positive',
				icon: Building2,
				description: 'Number of active property investments'
			},
			{
				title: 'Portfolio Value',
				value: formatCurrency(data.current_value),
				change: formatPercentage(data.roi_percentage),
				changeType: data.roi_percentage >= 0 ? 'positive' : 'negative',
				icon: TrendingUp,
				description: 'Current total value of your portfolio'
			},
			{
				title: 'Total Ownership',
				value: `${data.total_percentage?.toFixed(1) || '0.00'}%`,
				change: data.total_percentage > 0 ? `${data.total_properties} properties` : '0 properties',
				changeType: 'positive',
				icon: PieChart,
				description: 'Total ownership percentage across all properties'
			},
		];
	};

	// Loading state
	if (loading) {
		return (
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{Array.from({ length: 4 }).map((_, index) => (
					<Card key={index}>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-8 w-8 rounded-lg" />
						</CardHeader>
						<CardContent>
							<Skeleton className="h-8 w-32 mb-2" />
							<Skeleton className="h-4 w-20 mb-2" />
							<Skeleton className="h-3 w-full" />
						</CardContent>
					</Card>
				))}
			</div>
		);
	}

	// Error state
	if (error) {
		return (
			<Alert variant="destructive">
				<AlertDescription>{error}</AlertDescription>
			</Alert>
		);
	}

	// Empty state (no user or no stats)
	if (!stats) {
		const emptyStats: StatCard[] = [
			{
				title: 'Total Invested',
				value: '0 MAD',
				change: '0%',
				changeType: 'positive',
				icon: DollarSign,
				description: 'Start investing to see your portfolio grow'
			},
			{
				title: 'Active Investments',
				value: '0',
				change: '0',
				changeType: 'positive',
				icon: Building2,
				description: 'Browse properties to make your first investment'
			},
			{
				title: 'Portfolio Value',
				value: '0 MAD',
				change: '0%',
				changeType: 'positive',
				icon: TrendingUp,
				description: 'Your portfolio value will appear here'
			},
			{
				title: 'Total Ownership',
				value: '0%',
				change: '0 properties',
				changeType: 'positive',
				icon: PieChart,
				description: 'Total ownership percentage across all properties'
			},
		];

		return (
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{emptyStats.map((stat) => {
					const Icon = stat.icon;

					return (
						<Card key={stat.title} className="hover:shadow-md transition-shadow duration-200">
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium text-igudar-text-secondary">
									{stat.title}
								</CardTitle>
								<div className="p-2 bg-igudar-primary/10 rounded-lg">
									<Icon className="h-4 w-4 text-igudar-primary" />
								</div>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold text-igudar-text mb-1">
									{stat.value}
								</div>
								<div className="flex items-center space-x-1 text-xs">
									<span className="text-igudar-text-muted">{stat.change}</span>
									<span className="text-igudar-text-muted">from last month</span>
								</div>
								<p className="text-xs text-igudar-text-muted mt-2">
									{stat.description}
								</p>
							</CardContent>
						</Card>
					);
				})}
			</div>
		);
	}

	// Render with actual data
	const statCards = generateStatCards(stats);

	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" key={renderKey}>
			{statCards.map((stat) => {
				const Icon = stat.icon;
				const ChangeIcon = stat.changeType === 'positive' ? ArrowUpRight : ArrowDownRight;
				const changeColor = stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600';

				return (
					<Card key={stat.title} className="hover:shadow-md transition-shadow duration-200">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium text-igudar-text-secondary">
								{stat.title}
							</CardTitle>
							<div className="p-2 bg-igudar-primary/10 rounded-lg">
								<Icon className="h-4 w-4 text-igudar-primary" />
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-igudar-text mb-1">
								{stat.value}
							</div>
							<div className="flex items-center space-x-1 text-xs">
								<ChangeIcon className={`h-3 w-3 ${changeColor}`} />
								<span className={changeColor}>{stat.change}</span>
								<span className="text-igudar-text-muted">from last month</span>
							</div>
							<p className="text-xs text-igudar-text-muted mt-2">
								{stat.description}
							</p>
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
};

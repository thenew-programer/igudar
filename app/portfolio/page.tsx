// app/portfolio/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
	TrendingUp,
	TrendingDown,
	DollarSign,
	Building2,
	PieChart,
	Target,
	ArrowUpRight,
	ArrowDownRight,
	BarChart3,
	Brain,
	Lightbulb,
	Zap,
	Star,
	AlertTriangle,
	CheckCircle,
	Calendar,
	Users,
	MapPin,
	Activity
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { InvestmentService } from '@/lib/investments';
import { PortfolioSummary as PortfolioSummaryType, InvestmentPerformance, PortfolioBreakdown } from '@/types/investment';

// Define a new type for insight priority
type InsightPriority = 'high' | 'medium' | 'low';

// Define the interface for an AI insight object
interface AIInsight {
	type: 'positive' | 'warning' | 'suggestion' | 'urgent' | 'neutral';
	icon: React.ElementType;
	title: string;
	description: string;
	action: string;
	priority: InsightPriority;
}

export default function PortfolioPage() {
	const { user } = useAuth();
	const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummaryType | null>(null);
	const [performanceData, setPerformanceData] = useState<InvestmentPerformance[]>([]);
	const [portfolioBreakdown, setPortfolioBreakdown] = useState<PortfolioBreakdown[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'insights'>('overview');

	useEffect(() => {
		const fetchPortfolioData = async () => {
			if (!user?.id) {
				setLoading(false);
				return;
			}

			try {
				setLoading(true);
				setError(null);

				const [summaryResult, performanceResult, breakdownResult] = await Promise.all([
					InvestmentService.getPortfolioSummary(user.id),
					InvestmentService.getInvestmentPerformance(user.id),
					InvestmentService.getPortfolioBreakdown(user.id)
				]);

				if (summaryResult.success && summaryResult.data) {
					setPortfolioSummary(summaryResult.data);
				}

				if (performanceResult.success && performanceResult.data) {
					setPerformanceData(performanceResult.data);
				}

				if (breakdownResult.success && breakdownResult.data) {
					setPortfolioBreakdown(breakdownResult.data);
				}

				if (!summaryResult.success || !performanceResult.success || !breakdownResult.success) {
					setError('Failed to load portfolio data');
				}
			} catch (err) {
				setError('An unexpected error occurred');
				console.error('Error fetching portfolio data:', err);
			} finally {
				setLoading(false);
			}
		};

		fetchPortfolioData();
	}, [user?.id]);

	const formatCurrency = (amount: number): string => {
		return amount.toLocaleString() + ' MAD';
	};

	const formatPercentage = (percentage: number): string => {
		const sign = percentage >= 0 ? '+' : '';
		return `${sign}${percentage.toFixed(1)}%`;
	};

	const getROIColor = (roi: number): string => {
		if (roi > 0) return 'text-green-600';
		if (roi < 0) return 'text-red-600';
		return 'text-gray-600';
	};

	const getROIBadgeColor = (roi: number): string => {
		if (roi > 0) return 'bg-green-100 text-green-800 border-green-200';
		if (roi < 0) return 'bg-red-100 text-red-800 border-red-200';
		return 'bg-gray-100 text-gray-800 border-gray-200';
	};

	// AI Insights Generator
	const generateAIInsights = (): AIInsight[] => { // Explicitly type the return value
		if (!portfolioSummary || !performanceData.length || !portfolioBreakdown.length) {
			return [];
		}

		const insights: AIInsight[] = []; // Explicitly type the insights array

		// Performance insights
		if (portfolioSummary.roi_percentage > 10) {
			insights.push({
				type: 'positive',
				icon: TrendingUp,
				title: 'Excellent Performance',
				description: `Your portfolio is outperforming with ${portfolioSummary.roi_percentage.toFixed(1)}% ROI. Consider increasing your investment allocation.`,
				action: 'Invest More',
				priority: 'high'
			});
		} else if (portfolioSummary.roi_percentage < 5) {
			insights.push({
				type: 'warning',
				icon: AlertTriangle,
				title: 'Performance Review',
				description: `Your ROI of ${portfolioSummary.roi_percentage.toFixed(1)}% could be improved. Consider diversifying into higher-yield properties.`,
				action: 'Diversify',
				priority: 'medium'
			});
		}

		// Diversification insights
		if (portfolioBreakdown.length < 3) {
			insights.push({
				type: 'suggestion',
				icon: PieChart,
				title: 'Diversification Opportunity',
				description: `You're invested in ${portfolioBreakdown.length} property type${portfolioBreakdown.length === 1 ? '' : 's'}. Consider diversifying across more property types to reduce risk.`,
				action: 'Explore Properties',
				priority: 'medium'
			});
		}

		// Investment size insights
		const avgInvestment = portfolioSummary.active_investments > 0
			? portfolioSummary.total_invested / portfolioSummary.active_investments
			: 0;

		if (avgInvestment < 10000) {
			insights.push({
				type: 'suggestion',
				icon: Target,
				title: 'Scale Your Investments',
				description: `Your average investment of ${formatCurrency(avgInvestment)} could be increased to maximize returns and reduce fees.`,
				action: 'Increase Investment',
				priority: 'low'
			});
		}

		// Best performing property insight
		const bestPerformer = performanceData.reduce((best, current) =>
			current.roi_percentage > best.roi_percentage ? current : best
		);

		if (bestPerformer.roi_percentage > 15) {
			insights.push({
				type: 'positive',
				icon: Star,
				title: 'Top Performer Identified',
				description: `${bestPerformer.property_title} is your best performer with ${bestPerformer.roi_percentage.toFixed(1)}% ROI. Consider similar properties.`,
				action: 'Find Similar',
				priority: 'high'
			});
		}

		// Monthly return insights
		if (portfolioSummary.monthly_return > 1000) {
			insights.push({
				type: 'positive',
				icon: DollarSign,
				title: 'Strong Monthly Returns',
				description: `You're earning ${formatCurrency(portfolioSummary.monthly_return)} monthly. Consider reinvesting to compound your growth.`,
				action: 'Reinvest',
				priority: 'medium'
			});
		}

		return insights.slice(0, 5); // Return top 5 insights
	};

	const aiInsights: AIInsight[] = generateAIInsights(); // Explicitly type the aiInsights array

	if (loading) {
		return <PortfolioPageSkeleton />;
	}

	if (error) {
		return (
			<div className="p-6">
				<div className="max-w-7xl mx-auto">
					<Alert variant="destructive">
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				</div>
			</div>
		);
	}

	// Empty state
	if (!portfolioSummary || portfolioSummary.total_invested === 0) {
		return (
			<div className="p-6">
				<div className="max-w-4xl mx-auto">
					<div className="text-center py-16">
						<div className="mx-auto w-24 h-24 bg-igudar-primary/10 rounded-full flex items-center justify-center mb-6">
							<PieChart className="h-12 w-12 text-igudar-primary" />
						</div>
						<h1 className="text-3xl font-bold text-igudar-text mb-4">
							Build Your Portfolio
						</h1>
						<p className="text-lg text-igudar-text-secondary mb-8 max-w-2xl mx-auto">
							Start your investment journey to unlock detailed portfolio analytics, AI-powered insights,
							and comprehensive performance tracking.
						</p>
						<Button
							onClick={() => window.location.href = '/properties'}
							className="bg-igudar-primary hover:bg-igudar-primary/90 text-white px-8 py-3"
							size="lg"
						>
							<Target className="mr-2 h-5 w-5" />
							Start Investing
						</Button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="p-6" key={Date.now()}>
			<div className="max-w-7xl mx-auto space-y-8">
				{/* Header */}
				<div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
					<div>
						<h1 className="text-3xl md:text-4xl font-bold text-igudar-text">
							Portfolio Analytics
						</h1>
						<p className="text-lg text-igudar-text-secondary">
							Deep insights into your real estate investment performance with AI-powered recommendations
						</p>
					</div>
					<div className="flex items-center space-x-4">
						<div className="text-right">
							<div className="text-sm text-igudar-text-muted">Portfolio Value</div>
							<div className="text-2xl font-bold text-igudar-primary">
								{formatCurrency(portfolioSummary.current_value)}
							</div>
						</div>
						<div className="text-right">
							<div className="text-sm text-igudar-text-muted">Total Return</div>
							<div className={`text-xl font-bold ${getROIColor(portfolioSummary.roi_percentage)}`}>
								{formatPercentage(portfolioSummary.roi_percentage)}
							</div>
						</div>
					</div>
				</div>

				{/* Key Metrics Cards */}
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
					<Card className="hover:shadow-md transition-shadow duration-200">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium text-igudar-text-secondary">
								Total Invested
							</CardTitle>
							<DollarSign className="h-4 w-4 text-igudar-primary" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-igudar-text">
								{formatCurrency(portfolioSummary.total_invested)}
							</div>
							<p className="text-xs text-igudar-text-muted">
								Across {portfolioSummary.total_properties} properties
							</p>
						</CardContent>
					</Card>

					<Card className="hover:shadow-md transition-shadow duration-200">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium text-igudar-text-secondary">
								Current Value
							</CardTitle>
							<TrendingUp className="h-4 w-4 text-green-600" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-igudar-text">
								{formatCurrency(portfolioSummary.current_value)}
							</div>
							<div className="flex items-center space-x-2">
								<div className={`flex items-center ${getROIColor(portfolioSummary.total_return)}`}>
									{portfolioSummary.total_return >= 0 ? (
										<ArrowUpRight className="h-3 w-3 mr-1" />
									) : (
										<ArrowDownRight className="h-3 w-3 mr-1" />
									)}
									<span className="text-sm font-medium">
										{formatCurrency(Math.abs(portfolioSummary.total_return))}
									</span>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="hover:shadow-md transition-shadow duration-200">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium text-igudar-text-secondary">
								Monthly Return
							</CardTitle>
							<Calendar className="h-4 w-4 text-blue-600" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-igudar-text">
								{formatCurrency(portfolioSummary.monthly_return)}
							</div>
							<p className="text-xs text-igudar-text-muted">
								Expected monthly income
							</p>
						</CardContent>
					</Card>

					<Card className="hover:shadow-md transition-shadow duration-200">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium text-igudar-text-secondary">
								ROI Performance
							</CardTitle>
							<Target className="h-4 w-4 text-purple-600" />
						</CardHeader>
						<CardContent>
							<div className={`text-2xl font-bold ${getROIColor(portfolioSummary.roi_percentage)}`}>
								{formatPercentage(portfolioSummary.roi_percentage)}
							</div>
							<Badge className={`text-xs ${getROIBadgeColor(portfolioSummary.roi_percentage)}`}>
								{portfolioSummary.roi_percentage > 10 ? 'Excellent' :
									portfolioSummary.roi_percentage > 5 ? 'Good' : 'Needs Improvement'}
							</Badge>
						</CardContent>
					</Card>
				</div>

				{/* Main Content Tabs */}
				<Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="space-y-6">
					<TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
						<TabsTrigger value="overview" className="flex items-center space-x-2">
							<BarChart3 className="h-4 w-4" />
							<span>Overview</span>
						</TabsTrigger>
						<TabsTrigger value="performance" className="flex items-center space-x-2">
							<Activity className="h-4 w-4" />
							<span>Performance</span>
						</TabsTrigger>
						<TabsTrigger value="insights" className="flex items-center space-x-2">
							<Brain className="h-4 w-4" />
							<span>AI Insights</span>
						</TabsTrigger>
					</TabsList>

					<TabsContent value="overview" className="space-y-6">
						<div className="grid gap-6 lg:grid-cols-2">
							{/* Portfolio Breakdown */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center text-igudar-text">
										<PieChart className="mr-2 h-5 w-5" />
										Portfolio Distribution
									</CardTitle>
									<CardDescription>
										Your investments across different property types
									</CardDescription>
								</CardHeader>
								<CardContent>
									{portfolioBreakdown.length === 0 ? (
										<div className="text-center py-8">
											<PieChart className="h-12 w-12 text-igudar-primary/30 mx-auto mb-4" />
											<p className="text-igudar-text-muted">No portfolio breakdown available</p>
										</div>
									) : (
										<div className="space-y-4">
											{portfolioBreakdown.map((item, index) => {
												const colors = [
													'bg-igudar-primary',
													'bg-green-500',
													'bg-blue-500',
													'bg-purple-500',
													'bg-orange-500',
													'bg-pink-500'
												];

												return (
													<div key={item.property_type} className="space-y-2">
														<div className="flex items-center justify-between">
															<div className="flex items-center space-x-3">
																<div className={`w-4 h-4 rounded ${colors[index % colors.length]}`} />
																<span className="font-medium text-igudar-text">{item.property_type}</span>
															</div>
															<div className="text-right">
																<div className="font-semibold text-igudar-text">
																	{formatCurrency(item.total_invested)}
																</div>
																<div className="text-xs text-igudar-text-muted">
																	{item.percentage_of_portfolio}% of portfolio
																</div>
															</div>
														</div>

														<div className="h-2 rounded-full bg-gray-100 overflow-hidden">
															<div
																className={`h-full rounded-full ${colors[index % colors.length]} transition-all duration-500`}
																style={{ width: `${item.percentage_of_portfolio}%` }}
															/>
														</div>

														<div className="grid grid-cols-3 gap-4 text-xs text-igudar-text-muted">
															<div>Properties: {item.number_of_properties}</div>
															<div>Value: {formatCurrency(item.current_value)}</div>
															<div>Avg ROI: {item.average_roi.toFixed(1)}%</div>
														</div>
													</div>
												);
											})}
										</div>
									)}
								</CardContent>
							</Card>

							{/* Performance Summary */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center text-igudar-text">
										<TrendingUp className="mr-2 h-5 w-5" />
										Performance Summary
									</CardTitle>
									<CardDescription>
										Key performance metrics and trends
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="space-y-6">
										{/* ROI Gauge */}
										<div className="text-center p-6 bg-gradient-to-br from-igudar-primary/5 to-igudar-primary/10 rounded-lg">
											<div className="flex items-center justify-center mb-2">
												{portfolioSummary.roi_percentage >= 0 ? (
													<TrendingUp className="h-8 w-8 text-green-600" />
												) : (
													<TrendingDown className="h-8 w-8 text-red-600" />
												)}
											</div>
											<div className={`text-3xl font-bold ${getROIColor(portfolioSummary.roi_percentage)}`}>
												{formatPercentage(portfolioSummary.roi_percentage)}
											</div>
											<div className="text-sm text-igudar-text-muted">Overall ROI</div>
										</div>

										{/* Key Metrics */}
										<div className="grid grid-cols-2 gap-4">
											<div className="text-center p-4 bg-gray-50 rounded-lg">
												<div className="text-lg font-bold text-igudar-text">
													{portfolioSummary.active_investments}
												</div>
												<div className="text-xs text-igudar-text-muted">Active Investments</div>
											</div>
											<div className="text-center p-4 bg-gray-50 rounded-lg">
												<div className="text-lg font-bold text-igudar-text">
													{portfolioSummary.total_percentage.toFixed(1)}%
												</div>
												<div className="text-xs text-igudar-text-muted">Total Ownership</div>
											</div>
											<div className="text-center p-4 bg-gray-50 rounded-lg">
												<div className="text-lg font-bold text-green-600">
													{formatCurrency(portfolioSummary.annual_return)}
												</div>
												<div className="text-xs text-igudar-text-muted">Annual Return</div>
											</div>
											<div className="text-center p-4 bg-gray-50 rounded-lg">
												<div className="text-lg font-bold text-igudar-text">
													{portfolioSummary.active_investments > 0
														? formatCurrency(portfolioSummary.total_invested / portfolioSummary.active_investments)
														: '0 MAD'
													}
												</div>
												<div className="text-xs text-igudar-text-muted">Avg Investment</div>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					</TabsContent>

					<TabsContent value="performance" className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center text-igudar-text">
									<BarChart3 className="mr-2 h-5 w-5" />
									Investment Performance by Property
								</CardTitle>
								<CardDescription>
									Individual property performance and returns
								</CardDescription>
							</CardHeader>
							<CardContent>
								{performanceData.length === 0 ? (
									<div className="text-center py-8">
										<BarChart3 className="h-12 w-12 text-igudar-primary/30 mx-auto mb-4" />
										<p className="text-igudar-text-muted">No performance data available</p>
									</div>
								) : (
									<div className="space-y-4">
										{performanceData.map((item, index) => {
											const maxValue = Math.max(...performanceData.map(d => d.current_value));
											const barWidth = maxValue > 0 ? (item.current_value / maxValue) * 100 : 0;

											return (
												<div key={item.investment_id} className="space-y-3 p-4 border border-border rounded-lg hover:bg-gray-50 transition-colors">
													<div className="flex items-center justify-between">
														<div className="flex items-center space-x-3">
															<div className="w-10 h-10 bg-igudar-primary/10 rounded-lg flex items-center justify-center">
																<Building2 className="h-5 w-5 text-igudar-primary" />
															</div>
															<div>
																<h4 className="font-medium text-igudar-text">{item.property_title}</h4>
																<p className="text-xs text-igudar-text-muted">
																	Held for {item.months_held} {item.months_held === 1 ? 'month' : 'months'}
																</p>
															</div>
														</div>
														<div className="text-right">
															<div className={`text-lg font-bold ${getROIColor(item.roi_percentage)}`}>
																{formatPercentage(item.roi_percentage)}
															</div>
															<div className="text-xs text-igudar-text-muted">
																{item.performance_trend === 'up' ? '📈' :
																	item.performance_trend === 'down' ? '📉' : '➡️'}
																{item.performance_trend}
															</div>
														</div>
													</div>

													<div className="grid grid-cols-3 gap-4 text-sm">
														<div>
															<div className="text-igudar-text-muted">Initial</div>
															<div className="font-semibold">{formatCurrency(item.initial_value)}</div>
														</div>
														<div>
															<div className="text-igudar-text-muted">Current</div>
															<div className="font-semibold">{formatCurrency(item.current_value)}</div>
														</div>
														<div>
															<div className="text-igudar-text-muted">Return</div>
															<div className={`font-semibold ${getROIColor(item.return_amount)}`}>
																{item.return_amount >= 0 ? '+' : ''}{formatCurrency(Math.abs(item.return_amount))}
															</div>
														</div>
													</div>

													<div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
														<div
															className={`h-full rounded-full transition-all duration-500 ${item.roi_percentage > 0 ? 'bg-green-500' :
																item.roi_percentage < 0 ? 'bg-red-500' : 'bg-gray-400'
																}`}
															style={{ width: `${barWidth}%` }}
														/>
													</div>
												</div>
											);
										})}
									</div>
								)}
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="insights" className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center text-igudar-text">
									<Brain className="mr-2 h-5 w-5" />
									AI-Powered Investment Insights
								</CardTitle>
								<CardDescription>
									Personalized recommendations to optimize your portfolio performance
								</CardDescription>
							</CardHeader>
							<CardContent>
								{aiInsights.length === 0 ? (
									<div className="text-center py-8">
										<Brain className="h-12 w-12 text-igudar-primary/30 mx-auto mb-4" />
										<h3 className="text-lg font-semibold text-igudar-text mb-2">
											Building Your AI Profile
										</h3>
										<p className="text-igudar-text-muted">
											Make more investments to unlock personalized AI insights and recommendations.
										</p>
									</div>
								) : (
									<div className="space-y-4">
										{aiInsights.map((insight, index) => {
											const Icon = insight.icon;
											const priorityColors = {
												high: 'border-red-200 bg-red-50',
												medium: 'border-yellow-200 bg-yellow-50',
												low: 'border-blue-200 bg-blue-50'
											};

											const typeColors = {
												positive: 'text-green-600',
												warning: 'text-orange-600',
												suggestion: 'text-blue-600',
												urgent: 'text-red-600', // Added for completeness, though not used in this file
												neutral: 'text-gray-600' // Added for completeness, though not used in this file
											};

											return (
												<div
													key={index}
													className={`p-4 rounded-lg border ${priorityColors[insight.priority]} hover:shadow-md transition-shadow`}
												>
													<div className="flex items-start space-x-4">
														<div className={`p-2 rounded-lg bg-white ${typeColors[insight.type]}`}>
															<Icon className="h-5 w-5" />
														</div>
														<div className="flex-1">
															<div className="flex items-center justify-between mb-2">
																<h4 className="font-semibold text-igudar-text">{insight.title}</h4>
																<Badge
																	variant="outline"
																	className={`text-xs ${insight.priority === 'high' ? 'border-red-300 text-red-700' :
																		insight.priority === 'medium' ? 'border-yellow-300 text-yellow-700' :
																			'border-blue-300 text-blue-700'
																		}`}
																>
																	{insight.priority} priority
																</Badge>
															</div>
															<p className="text-igudar-text-secondary mb-3">{insight.description}</p>
															<Button
																size="sm"
																className="bg-igudar-primary hover:bg-igudar-primary/90 text-white"
															>
																<Lightbulb className="mr-2 h-3 w-3" />
																{insight.action}
															</Button>
														</div>
													</div>
												</div>
											);
										})}

										{/* AI Summary */}
										<div className="mt-6 p-4 bg-gradient-to-r from-igudar-primary/10 to-igudar-primary/5 rounded-lg border border-igudar-primary/20">
											<div className="flex items-center space-x-3 mb-3">
												<Zap className="h-5 w-5 text-igudar-primary" />
												<h4 className="font-semibold text-igudar-text">AI Portfolio Summary</h4>
											</div>
											<p className="text-igudar-text-secondary">
												Based on your current portfolio performance and market trends, our AI recommends
												focusing on {portfolioSummary.roi_percentage > 10 ? 'scaling your successful strategy' : 'diversification and optimization'}.
												Your portfolio shows {portfolioSummary.roi_percentage > 5 ? 'strong' : 'moderate'} performance
												with opportunities for improvement in risk management and return optimization.
											</p>
										</div>
									</div>
								)}
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}

// Loading skeleton component
const PortfolioPageSkeleton: React.FC = () => {
	return (
		<div className="p-6">
			<div className="max-w-7xl mx-auto space-y-8">
				{/* Header skeleton */}
				<div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
					<div>
						<Skeleton className="h-8 w-64 mb-2" />
						<Skeleton className="h-4 w-96" />
					</div>
					<div className="flex items-center space-x-4">
						<div className="text-right">
							<Skeleton className="h-4 w-24 mb-1" />
							<Skeleton className="h-6 w-32" />
						</div>
						<div className="text-right">
							<Skeleton className="h-4 w-20 mb-1" />
							<Skeleton className="h-6 w-16" />
						</div>
					</div>
				</div>

				{/* Metrics cards skeleton */}
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
					{Array.from({ length: 4 }).map((_, index) => (
						<div key={index} className="bg-white border border-border rounded-lg p-6">
							<div className="flex items-center justify-between mb-4">
								<Skeleton className="h-4 w-24" />
								<Skeleton className="h-4 w-4" />
							</div>
							<Skeleton className="h-8 w-32 mb-2" />
							<Skeleton className="h-3 w-20" />
						</div>
					))}
				</div>

				{/* Tabs skeleton */}
				<div className="space-y-6">
					<Skeleton className="h-10 w-96" />
					<div className="grid gap-6 lg:grid-cols-2">
						<Skeleton className="h-96 w-full" />
						<Skeleton className="h-96 w-full" />
					</div>
				</div>
			</div>
		</div>
	);
};
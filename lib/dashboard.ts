import { supabase, handleSupabaseError } from './supabase';
import { DatabaseResponse } from '@/types/database';

export interface DashboardStats {
	totalInvested: number;
	activeInvestments: number;
	portfolioValue: number;
	totalProperties: number;
	monthlyReturn: number;
	totalReturn: number;
	roiPercentage: number;
}

export interface PortfolioPerformance {
	month: string;
	value: number;
	growth: number;
}

export interface RecentActivity {
	id: string;
	type: 'investment' | 'dividend' | 'sale' | 'update';
	title: string;
	description: string;
	amount?: number;
	date: string;
	status: 'completed' | 'pending' | 'processing';
	property?: string;
}

export interface PortfolioBreakdown {
	type: string;
	value: number;
	percentage: number;
	color: string;
}

export class DashboardService {

	static async getUserStats(userId: string): Promise<DatabaseResponse<DashboardStats>> {
		try {
			const { data: investments, error: investmentsError } = await supabase
				.from('investments')
				.select(`
          *,
          properties (
            id,
            title,
            expected_roi,
            property_type,
            status
          )
        `)
				.eq('user_id', userId)
				.eq('status', 'confirmed');

			if (investmentsError) {
				throw investmentsError;
			}

			// Calculate statistics
			const totalInvested = investments?.reduce((sum, inv) => sum + inv.investment_amount, 0) || 0;
			const activeInvestments = investments?.length || 0;

			// Calculate portfolio value with expected growth
			const portfolioValue = investments?.reduce((sum, inv) => {
				const property = inv.properties;
				if (!property) return sum;

				// Calculate time-based growth (simplified)
				const monthsHeld = Math.max(1, Math.floor(
					(new Date().getTime() - new Date(inv.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30)
				));

				const expectedGrowth = (property.expected_roi / 100) * (monthsHeld / 12);
				return sum + (inv.investment_amount * (1 + expectedGrowth));
			}, 0) || 0;

			// Get unique properties count
			const uniqueProperties = new Set(investments?.map(inv => inv.property_id)).size;

			// Calculate returns
			const totalReturn = portfolioValue - totalInvested;
			const roiPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;
			const monthlyReturn = totalReturn / Math.max(1,
				Math.floor((new Date().getTime() - new Date(investments?.[0]?.created_at || new Date()).getTime()) / (1000 * 60 * 60 * 24 * 30))
			);

			const stats: DashboardStats = {
				totalInvested: totalInvested / 100, // Convert from cents to MAD
				activeInvestments,
				portfolioValue: portfolioValue / 100, // Convert from cents to MAD
				totalProperties: uniqueProperties,
				monthlyReturn: monthlyReturn / 100, // Convert from cents to MAD
				totalReturn: totalReturn / 100, // Convert from cents to MAD
				roiPercentage
			};

			return {
				success: true,
				data: stats,
				message: 'Dashboard statistics retrieved successfully'
			};

		} catch (error) {
			return {
				success: false,
				error: handleSupabaseError(error),
				message: 'Failed to retrieve dashboard statistics'
			};
		}
	}

	// Get portfolio performance over time
	static async getPortfolioPerformance(userId: string): Promise<DatabaseResponse<PortfolioPerformance[]>> {
		try {
			// Get user investments with dates
			const { data: investments, error } = await supabase
				.from('investments')
				.select(`
          *,
          properties (
            expected_roi,
            property_type
          )
        `)
				.eq('user_id', userId)
				.eq('status', 'confirmed')
				.order('created_at', { ascending: true });

			if (error) {
				throw error;
			}

			// Generate monthly performance data
			const performanceData: PortfolioPerformance[] = [];
			const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];

			if (!investments || investments.length === 0) {
				// Return mock data for empty state
				months.forEach((month, index) => {
					performanceData.push({
						month,
						value: 0,
						growth: 0
					});
				});
			} else {
				let cumulativeValue = 0;

				months.forEach((month, index) => {
					// Calculate portfolio value for this month
					const monthValue = investments.reduce((sum, inv) => {
						const property = inv.properties;
						if (!property) return sum;

						// Simulate growth over time
						const growthFactor = 1 + (property.expected_roi / 100) * ((index + 1) / 12);
						return sum + (inv.investment_amount * growthFactor);
					}, 0);

					const growth = cumulativeValue > 0 ?
						((monthValue - cumulativeValue) / cumulativeValue) * 100 :
						index === 0 ? 5.2 : Math.random() * 10 + 3; // Random growth for demo

					performanceData.push({
						month,
						value: monthValue / 100, // Convert from cents to MAD
						growth: Math.round(growth * 10) / 10
					});

					cumulativeValue = monthValue;
				});
			}

			return {
				success: true,
				data: performanceData,
				message: 'Portfolio performance retrieved successfully'
			};

		} catch (error) {
			return {
				success: false,
				error: handleSupabaseError(error),
				message: 'Failed to retrieve portfolio performance'
			};
		}
	}

	// Get recent activities
	static async getRecentActivities(userId: string): Promise<DatabaseResponse<RecentActivity[]>> {
		try {
			// Get recent transactions and investments
			const { data: transactions, error: transError } = await supabase
				.from('transactions')
				.select(`
          *,
          properties (
            title
          )
        `)
				.eq('user_id', userId)
				.order('created_at', { ascending: false })
				.limit(10);

			if (transError) {
				throw transError;
			}

			const { data: investments, error: invError } = await supabase
				.from('investments')
				.select(`
          *,
          properties (
            title
          )
        `)
				.eq('user_id', userId)
				.order('created_at', { ascending: false })
				.limit(5);

			if (invError) {
				throw invError;
			}

			const activities: RecentActivity[] = [];

			// Add investment activities
			investments?.forEach(inv => {
				const property = inv.properties;
				activities.push({
					id: inv.id,
					type: 'investment',
					title: 'New Investment',
					description: `Invested in ${property?.title || 'Property'}`,
					amount: inv.investment_amount / 100, // Convert from cents to MAD
					date: this.formatRelativeDate(inv.created_at),
					status: inv.status === 'confirmed' ? 'completed' : inv.status as any,
					property: property?.title
				});
			});

			// Add transaction activities
			transactions?.forEach(trans => {
				const property = trans.properties;
				let title = 'Transaction';
				let description = trans.description;

				switch (trans.type) {
					case 'dividend':
						title = 'Dividend Received';
						break;
					case 'investment':
						title = 'Investment Transaction';
						break;
					case 'withdrawal':
						title = 'Withdrawal';
						break;
					case 'refund':
						title = 'Refund Processed';
						break;
				}

				activities.push({
					id: trans.id,
					type: trans.type as any,
					title,
					description,
					amount: trans.type === 'withdrawal' ? undefined : Math.abs(trans.amount) / 100,
					date: this.formatRelativeDate(trans.created_at),
					status: trans.status === 'completed' ? 'completed' : trans.status as any,
					property: property?.title
				});
			});

			// Sort by date and limit to 10
			activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
			const recentActivities = activities.slice(0, 10);

			return {
				success: true,
				data: recentActivities,
				message: 'Recent activities retrieved successfully'
			};

		} catch (error) {
			return {
				success: false,
				error: handleSupabaseError(error),
				message: 'Failed to retrieve recent activities'
			};
		}
	}

	// Get portfolio breakdown by property type
	static async getPortfolioBreakdown(userId: string): Promise<DatabaseResponse<PortfolioBreakdown[]>> {
		try {
			const { data: investments, error } = await supabase
				.from('investments')
				.select(`
          *,
          properties (
            property_type,
            expected_roi
          )
        `)
				.eq('user_id', userId)
				.eq('status', 'confirmed');

			if (error) {
				throw error;
			}

			if (!investments || investments.length === 0) {
				return {
					success: true,
					data: [],
					message: 'No investments found'
				};
			}

			const breakdown = investments.reduce((acc, inv) => {
				const property = inv.properties;
				if (!property) return acc;

				const type = property.property_type;
				const typeLabel = type.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());

				if (!acc[typeLabel]) {
					acc[typeLabel] = {
						value: 0,
						count: 0
					};
				}

				acc[typeLabel].value += inv.investment_amount;
				acc[typeLabel].count += 1;

				return acc;
			}, {} as Record<string, { value: number; count: number }>);

			const totalValue = (Object.values(breakdown) as Array<{ value: number; count: number }>).reduce((sum, item) => sum + item.value, 0);

			const portfolioBreakdown: PortfolioBreakdown[] = (Object.entries(breakdown) as Array<[string, { value: number; count: number }]>)
				.map(([type, data], index) => {
					const colors = [
						'bg-igudar-primary',
						'bg-igudar-primary/70',
						'bg-igudar-primary/40',
						'bg-blue-500',
						'bg-green-500',
						'bg-purple-500'
					];

					return {
						type,
						value: data.value / 100, // Convert from cents to MAD
						percentage: Math.round((data.value / totalValue) * 100),
						color: colors[index % colors.length]
					};
				});

			return {
				success: true,
				data: portfolioBreakdown,
				message: 'Portfolio breakdown retrieved successfully'
			};

		} catch (error) {
			return {
				success: false,
				error: handleSupabaseError(error),
				message: 'Failed to retrieve portfolio breakdown'
			};
		}
	}

	// Helper function to format relative dates
	private static formatRelativeDate(dateString: string): string {
		const date = new Date(dateString);
		const now = new Date();
		const diffInMs = now.getTime() - date.getTime();
		const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
		const diffInDays = Math.floor(diffInHours / 24);
		const diffInWeeks = Math.floor(diffInDays / 7);

		if (diffInHours < 1) {
			return 'Just now';
		} else if (diffInHours < 24) {
			return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
		} else if (diffInDays < 7) {
			return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
		} else if (diffInWeeks < 4) {
			return `${diffInWeeks} week${diffInWeeks === 1 ? '' : 's'} ago`;
		} else {
			return date.toLocaleDateString();
		}
	}
}

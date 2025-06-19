import { supabase, handleSupabaseError } from './supabase';
import { revalidateAppPaths } from './supabase';
import {
	Investment,
	InvestmentInsert,
	InvestmentUpdate,
	InvestmentFilters,
	InvestmentQueryOptions,
	PortfolioSummary,
	InvestmentPerformance,
	PortfolioBreakdown,
	InvestmentStats,
	InvestmentStatus,
	InvestmentValidationResult,
	InvestmentValidationError
} from '@/types/investment';
import { DatabaseResponse } from '@/types/database';

export class InvestmentService {

	// Get user investments with optional filters and pagination
	static async getUserInvestments(
		userId: string,
		filters?: InvestmentFilters,
		options?: InvestmentQueryOptions
	): Promise<DatabaseResponse<Investment[]>> {
		try {
			let query = supabase
				.from('investments')
				.select(`
          *,
          properties (
            id,
            title,
            city,
            region,
            property_type,
            expected_roi,
            rental_yield,
            image_url,
            target_amount,
            status
          )
        `)
				.eq('user_id', userId);

			// Apply filters
			if (filters) {
				if (filters.status && filters.status.length > 0) {
					query = query.in('status', filters.status);
				}
				if (filters.date_from) {
					query = query.gte('created_at', filters.date_from);
				}
				if (filters.date_to) {
					query = query.lte('created_at', filters.date_to);
				}
				if (filters.min_amount) {
					query = query.gte('investment_amount', filters.min_amount * 100); // Convert to cents
				}
				if (filters.max_amount) {
					query = query.lte('investment_amount', filters.max_amount * 100); // Convert to cents
				}
			}

			// Apply sorting and pagination
			if (options) {
				if (options.sort) {
					query = query.order(options.sort.field, {
						ascending: options.sort.direction === 'asc'
					});
				} else {
					// Default sort by created_at desc
					query = query.order('created_at', { ascending: false });
				}

				if (options.limit) {
					query = query.limit(options.limit);
				}
				if (options.offset) {
					query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
				}
			}

			const { data, error } = await query;

			if (error) {
				throw error;
			}

			// Revalidate relevant paths after successful update
			try {
				revalidateAppPaths()
			} catch (revalidateError) {
				console.error('Error revalidating paths:', revalidateError);
			}
			return {
				success: true,
				data: data || [],
				message: 'Investments retrieved successfully'
			};

		} catch (error) {
			return {
				success: false,
				error: handleSupabaseError(error),
				message: 'Failed to retrieve investments'
			};
		}
	}

	// Get investment by ID
	static async getInvestmentById(id: string): Promise<DatabaseResponse<Investment>> {
		try {
			const { data, error } = await supabase
				.from('investments')
				.select(`
          *,
          properties (
            id,
            title,
            city,
            region,
            property_type,
            expected_roi,
            rental_yield,
            image_url,
            status
          )
        `)
				.eq('id', id)
				.single();

			if (error) {
				throw error;
			}

			if (!data) {
				return {
					success: false,
					error: 'Investment not found',
					message: 'Investment with the specified ID does not exist'
				};
			}

			return {
				success: true,
				data,
				message: 'Investment retrieved successfully'
			};

		} catch (error) {
			return {
				success: false,
				error: handleSupabaseError(error),
				message: 'Failed to retrieve investment'
			};
		}
	}

	// Get user portfolio summary
	static async getPortfolioSummary(userId: string): Promise<DatabaseResponse<PortfolioSummary>> {
		try {
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
				.eq('status', 'confirmed');

			if (error) {
				throw error;
			}

			if (!investments || investments.length === 0) {
				const emptySummary: PortfolioSummary = {
					total_invested: 0,
					current_value: 0,
					total_return: 0,
					roi_percentage: 0,
					total_properties: 0,
					total_shares: 0,
					active_investments: 0,
					monthly_return: 0,
					annual_return: 0
				};

				return {
					success: true,
					data: emptySummary,
					message: 'Portfolio summary retrieved (empty portfolio)'
				};
			}

			// Calculate portfolio metrics
			const totalInvested = investments.reduce((sum, inv) => sum + inv.investment_amount, 0);
			const totalPercentage = investments.reduce((sum, inv) => {
				const property = inv.properties;
				if (!property) return sum;
				const percentage = property.target_amount > 0 
					? (inv.investment_amount / property.target_amount) * 100 
					: 0;
				return sum + percentage;
			}, 0);
			const uniqueProperties = new Set(investments.map(inv => inv.property_id)).size;

			// Calculate current value with time-based growth
			const currentValue = investments.reduce((sum, inv) => {
				const property = inv.properties;
				if (!property) return sum + inv.investment_amount;

				// Calculate time-based growth
				const monthsHeld = Math.max(1, Math.floor(
					(new Date().getTime() - new Date(inv.confirmed_at || inv.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30)
				));

				const expectedGrowth = (property.expected_roi / 100) * (monthsHeld / 12);
				return sum + (inv.investment_amount * (1 + expectedGrowth));
			}, 0);

			const totalReturn = currentValue - totalInvested;
			const roiPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

			// Calculate expected returns
			const annualReturn = investments.reduce((sum, inv) => {
				const property = inv.properties;
				if (!property) return sum;
				return sum + (inv.investment_amount * (property.expected_roi / 100));
			}, 0);

			const monthlyReturn = annualReturn / 12;

			const summary: PortfolioSummary = {
				total_invested: totalInvested / 100, // Convert from cents to MAD
				current_value: currentValue / 100, // Convert from cents to MAD
				total_return: totalReturn / 100, // Convert from cents to MAD
				roi_percentage: roiPercentage,
				total_properties: uniqueProperties,
				total_percentage: totalPercentage,
				active_investments: investments.length,
				monthly_return: monthlyReturn / 100, // Convert from cents to MAD
				annual_return: annualReturn / 100 // Convert from cents to MAD
			};

			return {
				success: true,
				data: summary,
				message: 'Portfolio summary retrieved successfully'
			};

		} catch (error) {
			return {
				success: false,
				error: handleSupabaseError(error),
				message: 'Failed to retrieve portfolio summary'
			};
		}
	}

	// Get investment performance data
	static async getInvestmentPerformance(userId: string): Promise<DatabaseResponse<InvestmentPerformance[]>> {
		try {
			const { data: investments, error } = await supabase
				.from('investments')
				.select(`
          *,
          properties (
            title,
            expected_roi,
            target_amount
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
					message: 'No investment performance data found'
				};
			}

			const performanceData: InvestmentPerformance[] = investments.map(inv => {
				const property = inv.properties;
				const initialValue = inv.investment_amount;

				// Calculate months held
				const monthsHeld = Math.max(1, Math.floor(
					(new Date().getTime() - new Date(inv.confirmed_at || inv.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30)
				));

				// Calculate current value with expected growth
				const expectedGrowth = property ? (property.expected_roi / 100) * (monthsHeld / 12) : 0;
				const currentValue = initialValue * (1 + expectedGrowth);
				const returnAmount = currentValue - initialValue;
				const roiPercentage = (returnAmount / initialValue) * 100;
				
				// Calculate investment percentage
				const investmentPercentage = property && property.target_amount > 0 
					? (inv.investment_amount / property.target_amount) * 100 
					: 0;

				// Determine performance trend
				let performanceTrend: 'up' | 'down' | 'stable' = 'stable';
				if (roiPercentage > 2) performanceTrend = 'up';
				else if (roiPercentage < -2) performanceTrend = 'down';

				return {
					investment_id: inv.id,
					property_title: property?.title || 'Unknown Property',
					initial_value: initialValue / 100, // Convert from cents to MAD
					current_value: currentValue / 100, // Convert from cents to MAD
					return_amount: returnAmount / 100, // Convert from cents to MAD
					roi_percentage: roiPercentage,
					months_held: monthsHeld,
					investment_percentage: investmentPercentage,
					performance_trend: performanceTrend
				};
			});

			return {
				success: true,
				data: performanceData,
				message: 'Investment performance retrieved successfully'
			};

		} catch (error) {
			return {
				success: false,
				error: handleSupabaseError(error),
				message: 'Failed to retrieve investment performance'
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
					message: 'No portfolio breakdown data found'
				};
			}

			const breakdown = investments.reduce((acc, inv) => {
				const property = inv.properties;
				if (!property) return acc;

				const type = property.property_type;
				const typeLabel = type.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());

				if (!acc[typeLabel]) {
					acc[typeLabel] = {
						total_invested: 0,
						current_value: 0,
						properties: new Set(),
						roi_sum: 0,
						roi_count: 0
					};
				}

				const monthsHeld = Math.max(1, Math.floor(
					(new Date().getTime() - new Date(inv.confirmed_at || inv.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30)
				));
				const expectedGrowth = (property.expected_roi / 100) * (monthsHeld / 12);
				const currentValue = inv.investment_amount * (1 + expectedGrowth);

				acc[typeLabel].total_invested += inv.investment_amount;
				acc[typeLabel].current_value += currentValue;
				acc[typeLabel].properties.add(inv.property_id);
				acc[typeLabel].roi_sum += property.expected_roi;
				acc[typeLabel].roi_count += 1;

				return acc;
			}, {} as Record<string, any>);

			const totalInvested = Object.values(breakdown).reduce((sum: number, item: any) => sum + item.total_invested, 0);

			const portfolioBreakdown: PortfolioBreakdown[] = Object.entries(breakdown).map(([type, data]: [string, any]) => ({
				property_type: type,
				total_invested: data.total_invested / 100, // Convert from cents to MAD
				current_value: data.current_value / 100, // Convert from cents to MAD
				percentage_of_portfolio: Math.round((data.total_invested / totalInvested) * 100),
				number_of_properties: data.properties.size,
				average_roi: data.roi_count > 0 ? data.roi_sum / data.roi_count : 0
			}));

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

	static async createInvestment(investment: InvestmentInsert): Promise<DatabaseResponse<Investment>> {
		try {
			// Validate investment data
			const validation = this.validateInvestment(investment);
			if (!validation.isValid) {
				return {
					success: false,
					error: validation.errors.map(e => e.message).join(', '),
					message: 'Investment validation failed'
				};
			}

			const { data, error } = await supabase
				.from('investments')
				.insert([{
					...investment,
					created_at: new Date().toISOString()
				}])
				.select(`
          *,
          properties (
            id,
            title,
            city,
            region,
            property_type,
            expected_roi,
            rental_yield,
            image_url,
            status
          )
        `)
				.single();

			if (error) {
				throw error;
			}

			// Revalidate relevant paths after successful update
			try {
				revalidateAppPaths()
			} catch (revalidateError) {
				console.error('Error revalidating paths:', revalidateError);
			}
			return {
				success: true,
				data,
				message: 'Investment created successfully'
			};

		} catch (error) {
			return {
				success: false,
				error: handleSupabaseError(error),
				message: 'Failed to create investment'
			};
		}
	}

	// Update investment
	static async updateInvestment(
		id: string,
		updates: InvestmentUpdate
	): Promise<DatabaseResponse<Investment>> {
		try {
			const { data, error } = await supabase
				.from('investments')
				.update(updates)
				.eq('id', id)
				.select(`
          *,
          properties (
            id,
            title,
            city,
            region,
            property_type,
            expected_roi,
            rental_yield,
            image_url,
            status
          )
        `)
				.single();

			if (error) {
				throw error;
			}

			if (!data) {
				return {
					success: false,
					error: 'Investment not found',
					message: 'Investment with the specified ID does not exist'
				};
			}

			// Revalidate relevant paths after successful update
			try {
				revalidateAppPaths()
			} catch (revalidateError) {
				console.error('Error revalidating paths:', revalidateError);
			}
			return {
				success: true,
				data,
				message: 'Investment updated successfully'
			};

		} catch (error) {
			return {
				success: false,
				error: handleSupabaseError(error),
				message: 'Failed to update investment'
			};
		}
	}

	// Get user's ownership percentage for a specific property
	static async getUserOwnershipPercentageForProperty(
		userId: string,
		propertyId: string
	): Promise<DatabaseResponse<number>> {
		try {
			const { data, error } = await supabase.rpc('get_user_investment_percentage', {
				user_uuid: userId,
				property_uuid: propertyId
			});

			if (error) {
				throw error;
			}

			return {
				success: true,
				data: data || 0,
				message: 'User ownership percentage retrieved successfully'
			};

		} catch (error) {
			return {
				success: false,
				error: handleSupabaseError(error),
				message: 'Failed to retrieve user ownership percentage'
			};
		}
	}

	// Validate investment data
	static validateInvestment(investment: InvestmentInsert | InvestmentUpdate): InvestmentValidationResult {
		const errors: InvestmentValidationError[] = [];

		if ('investment_amount' in investment && investment.investment_amount !== undefined) {
			if (investment.investment_amount <= 0) {
				errors.push({
					field: 'investment_amount',
					message: 'Investment amount must be greater than 0',
					code: 'INVALID_AMOUNT'
				});
			}
		}

		return {
			isValid: errors.length === 0,
			errors
		};
	}
}

// Utility functions for formatting
export const formatInvestmentAmount = (amount: number): string => {
	const formatted = new Intl.NumberFormat('en-US', {
		minimumFractionDigits: 0,
		maximumFractionDigits: 2
	}).format(amount);
	return formatted.replace(/,/g, ' ') + ' MAD';
};

export const formatInvestmentAmountShort = (amount: number): string => {
	if (amount >= 1000000) {
		const value = (amount / 1000000).toFixed(2);
		return `${value.replace(/\.?0+$/, '')}M MAD`;
	} else if (amount >= 1000) {
		const value = (amount / 1000).toFixed(2);
		return `${value.replace(/\.?0+$/, '')}K MAD`;
	}
	const formatted = new Intl.NumberFormat('en-US', {
		minimumFractionDigits: 0,
		maximumFractionDigits: 2
	}).format(amount);
	return formatted.replace(/,/g, ' ') + ' MAD';
};

export const formatROI = (roi: number): string => {
	const sign = roi >= 0 ? '+' : '';
	return `${sign}${roi.toFixed(1)}%`;
};

export const getROIColor = (roi: number): string => {
	if (roi > 0) return 'text-green-600';
	if (roi < 0) return 'text-red-600';
	return 'text-gray-600';
};

export const getInvestmentStatusColor = (status: InvestmentStatus): string => {
	switch (status) {
		case InvestmentStatus.CONFIRMED:
			return 'bg-green-100 text-green-800 border-green-200';
		case InvestmentStatus.PENDING:
			return 'bg-yellow-100 text-yellow-800 border-yellow-200';
		case InvestmentStatus.CANCELLED:
			return 'bg-red-100 text-red-800 border-red-200';
		case InvestmentStatus.REFUNDED:
			return 'bg-blue-100 text-blue-800 border-blue-200';
		default:
			return 'bg-gray-100 text-gray-800 border-gray-200';
	}
};

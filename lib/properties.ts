import { supabase, handleSupabaseError } from './supabase';
import { revalidatePath } from 'next/cache';
import {
	Property,
	PropertyInsert,
	PropertyUpdate,
	PropertyFilters,
	PropertyQueryOptions,
	PropertyStats,
	PropertyStatus,
	PropertyType,
	InvestmentCalculation,
	PropertyValidationResult,
	PropertyValidationError
} from '@/types/property';
import { DatabaseResponse } from '@/types/database';

export class PropertyService {

	static async getProperties(
		filters?: PropertyFilters,
		options?: PropertyQueryOptions
	): Promise<DatabaseResponse<Property[]>> {
		try {
			let query = supabase
				.from('properties')
				.select('*');

			if (filters) {
				if (filters.status && filters.status.length > 0) {
					query = query.in('status', filters.status);
				}
				if (filters.property_type && filters.property_type.length > 0) {
					query = query.in('property_type', filters.property_type);
				}
				if (filters.city && filters.city.length > 0) {
					query = query.in('city', filters.city);
				}
				if (filters.region && filters.region.length > 0) {
					query = query.in('region', filters.region);
				}
				if (filters.min_price) {
					query = query.gte('price', filters.min_price);
				}
				if (filters.max_price) {
					query = query.lte('price', filters.max_price);
				}
				if (filters.min_investment) {
					query = query.gte('min_investment', filters.min_investment);
				}
				if (filters.max_investment) {
					query = query.lte('min_investment', filters.max_investment);
				}
				if (filters.min_roi) {
					query = query.gte('expected_roi', filters.min_roi);
				}
				if (filters.max_roi) {
					query = query.lte('expected_roi', filters.max_roi);
				}
				if (filters.min_size) {
					query = query.gte('size_sqm', filters.min_size);
				}
				if (filters.max_size) {
					query = query.lte('size_sqm', filters.max_size);
				}
				if (filters.bedrooms && filters.bedrooms.length > 0) {
					query = query.in('bedrooms', filters.bedrooms);
				}
				if (filters.bathrooms && filters.bathrooms.length > 0) {
					query = query.in('bathrooms', filters.bathrooms);
				}
				if (filters.search) {
					query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,location.ilike.%${filters.search}%,city.ilike.%${filters.search}%`);
				}
			}

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

			const propertiesWithProgress = (data || []).map(property => ({
				...property,
				funding_progress: property.target_amount > 0
					? Math.round((property.total_raised / property.target_amount) * 100)
					: 0
			}));

			return {
				success: true,
				data: propertiesWithProgress,
				message: 'Properties retrieved successfully'
			};

		} catch (error) {
			return {
				success: false,
				error: handleSupabaseError(error),
				message: 'Failed to retrieve properties'
			};
		}
	}

	static async getPropertyById(id: string): Promise<DatabaseResponse<Property>> {
		try {
			const { data, error } = await supabase
				.from('properties')
				.select('*')
				.eq('id', id)
				.single();

			if (error) {
				throw error;
			}

			if (!data) {
				return {
					success: false,
					error: 'Property not found',
					message: 'Property with the specified ID does not exist'
				};
			}

			const propertyWithProgress = {
				...data,
				funding_progress: data.target_amount > 0
					? Math.round((data.total_raised / data.target_amount) * 100)
					: 0
			};

			return {
				success: true,
				data: propertyWithProgress,
				message: 'Property retrieved successfully'
			};

		} catch (error) {
			return {
				success: false,
				error: handleSupabaseError(error),
				message: 'Failed to retrieve property'
			};
		}
	}

	static async createProperty(property: PropertyInsert): Promise<DatabaseResponse<Property>> {
		try {
			const validation = this.validateProperty(property);
			if (!validation.isValid) {
				return {
					success: false,
					error: validation.errors.map(e => e.message).join(', '),
					message: 'Property validation failed'
				};
			}

			const funding_progress = property.target_amount > 0
				? Math.round(((property.total_raised || 0) / property.target_amount) * 100)
				: 0;

			const price_per_share = property.total_shares > 0
				? Math.round(property.target_amount / property.total_shares)
				: 0;

			const propertyData = {
				...property,
				funding_progress,
				price_per_share,
				total_raised: property.total_raised || 0,
				status: property.status || PropertyStatus.DRAFT,
				total_investors: property.total_investors || 0,
				created_at: new Date().toISOString()
			};

			const { data, error } = await supabase
				.from('properties')
				.insert([propertyData])
				.select()
				.single();

			if (error) {
				throw error;
			}

			return {
				success: true,
				data,
				message: 'Property created successfully'
			};

		} catch (error) {
			return {
				success: false,
				error: handleSupabaseError(error),
				message: 'Failed to create property'
			};
		}
	}

	static async updateProperty(
		id: string,
		updates: PropertyUpdate
	): Promise<DatabaseResponse<Property>> {
		try {
			if (Object.keys(updates).length === 0) {
				return {
					success: false,
					error: 'No updates provided',
					message: 'At least one field must be updated'
				};
			}

			let calculatedUpdates = { ...updates };

			if (updates.total_raised !== undefined || updates.target_amount !== undefined) {
				const currentProperty = await this.getPropertyById(id);
				if (currentProperty.success && currentProperty.data) {
					const current = currentProperty.data;
					const newTotalRaised = updates.total_raised ?? current.total_raised;
					const newTargetAmount = updates.target_amount ?? current.target_amount;

					calculatedUpdates.funding_progress = newTargetAmount > 0
						? Math.round((newTotalRaised / newTargetAmount) * 100)
						: 0;
				}
			}

			if (updates.target_amount !== undefined || updates.total_shares !== undefined) {
				const currentProperty = await this.getPropertyById(id);
				if (currentProperty.success && currentProperty.data) {
					const current = currentProperty.data;
					const newTargetAmount = updates.target_amount ?? current.target_amount;
					const newTotalShares = updates.total_shares ?? current.total_shares;

					calculatedUpdates.price_per_share = newTotalShares > 0
						? Math.round(newTargetAmount / newTotalShares)
						: 0;
				}
			}

			const { data, error } = await supabase
				.from('properties')
				.update({
					...calculatedUpdates,
					updated_at: new Date().toISOString()
				})
				.eq('id', id)
				.select()
				.single();

			if (error) {
				throw error;
			}

			if (!data) {
				return {
					success: false,
					error: 'Property not found',
					message: 'Property with the specified ID does not exist'
				};
			}

			// Revalidate relevant paths after successful update
			try {
				revalidatePath('/properties');
				revalidatePath('/dashboard');
				revalidatePath('/investments');
				revalidatePath('/portfolio');
			} catch (revalidateError) {
				console.error('Error revalidating paths:', revalidateError);
			}
			return {
				success: true,
				data,
				message: 'Property updated successfully'
			};

		} catch (error) {
			return {
				success: false,
				error: handleSupabaseError(error),
				message: 'Failed to update property'
			};
		}
	}

	static async deleteProperty(id: string): Promise<DatabaseResponse<void>> {
		try {
			const { error } = await supabase
				.from('properties')
				.delete()
				.eq('id', id);

			if (error) {
				throw error;
			}

			return {
				success: true,
				message: 'Property deleted successfully'
			};

		} catch (error) {
			return {
				success: false,
				error: handleSupabaseError(error),
				message: 'Failed to delete property'
			};
		}
	}

	static async getPropertiesByStatus(status: PropertyStatus): Promise<DatabaseResponse<Property[]>> {
		return this.getProperties({ status: [status] });
	}

	static async getActiveProperties(): Promise<DatabaseResponse<Property[]>> {
		return this.getProperties({ status: [PropertyStatus.ACTIVE, PropertyStatus.FUNDING] });
	}

	static async searchProperties(searchTerm: string): Promise<DatabaseResponse<Property[]>> {
		return this.getProperties({ search: searchTerm });
	}

	static async getPropertyStats(): Promise<DatabaseResponse<PropertyStats>> {
		try {
			const { data, error } = await supabase
				.from('properties')
				.select('*');

			if (error) {
				throw error;
			}

			const properties = data || [];

			const stats: PropertyStats = {
				total_properties: properties.length,
				active_properties: properties.filter(p =>
					p.status === PropertyStatus.ACTIVE || p.status === PropertyStatus.FUNDING
				).length,
				total_value: properties.reduce((sum, p) => sum + p.price, 0),
				total_raised: properties.reduce((sum, p) => sum + p.total_raised, 0),
				average_roi: properties.length > 0
					? properties.reduce((sum, p) => sum + p.expected_roi, 0) / properties.length
					: 0,
				properties_by_type: properties.reduce((acc, p) => {
					acc[p.property_type] = (acc[p.property_type] || 0) + 1;
					return acc;
				}, {} as Record<PropertyType, number>),
				properties_by_city: properties.reduce((acc, p) => {
					acc[p.city] = (acc[p.city] || 0) + 1;
					return acc;
				}, {} as Record<string, number>),
				properties_by_status: properties.reduce((acc, p) => {
					acc[p.status] = (acc[p.status] || 0) + 1;
					return acc;
				}, {} as Record<PropertyStatus, number>)
			};

			return {
				success: true,
				data: stats,
				message: 'Property statistics retrieved successfully'
			};

		} catch (error) {
			return {
				success: false,
				error: handleSupabaseError(error),
				message: 'Failed to retrieve property statistics'
			};
		}
	}

	static calculateInvestment(
		property: Property,
		investmentAmount: number
	): InvestmentCalculation {
		const sharesPurchased = Math.floor(investmentAmount / property.price_per_share);
		const actualInvestmentAmount = sharesPurchased * property.price_per_share;

		const expectedAnnualReturn = (actualInvestmentAmount * property.expected_roi) / 100;
		const expectedMonthlyReturn = expectedAnnualReturn / 12;
		const totalExpectedReturn = expectedAnnualReturn * (property.investment_period / 12);
		const roiPercentage = property.expected_roi;
		const paybackPeriodMonths = Math.ceil((actualInvestmentAmount / expectedMonthlyReturn));

		return {
			investment_amount: actualInvestmentAmount,
			shares_purchased: sharesPurchased,
			expected_annual_return: expectedAnnualReturn,
			expected_monthly_return: expectedMonthlyReturn,
			total_expected_return: totalExpectedReturn,
			roi_percentage: roiPercentage,
			payback_period_months: paybackPeriodMonths
		};
	}

	static validateProperty(property: PropertyInsert | PropertyUpdate): PropertyValidationResult {
		const errors: PropertyValidationError[] = [];

		// Required fields validation (for insert)
		if ('title' in property) {
			if (!property.title || property.title.trim().length < 3) {
				errors.push({
					field: 'title',
					message: 'Title must be at least 3 characters long',
					code: 'TITLE_TOO_SHORT'
				});
			}
		}

		if ('price' in property && property.price !== undefined) {
			if (property.price <= 0) {
				errors.push({
					field: 'price',
					message: 'Price must be greater than 0',
					code: 'INVALID_PRICE'
				});
			}
		}

		if ('min_investment' in property && property.min_investment !== undefined) {
			if (property.min_investment <= 0) {
				errors.push({
					field: 'min_investment',
					message: 'Minimum investment must be greater than 0',
					code: 'INVALID_MIN_INVESTMENT'
				});
			}
		}

		if ('target_amount' in property && property.target_amount !== undefined) {
			if (property.target_amount <= 0) {
				errors.push({
					field: 'target_amount',
					message: 'Target amount must be greater than 0',
					code: 'INVALID_TARGET_AMOUNT'
				});
			}
		}

		if ('expected_roi' in property && property.expected_roi !== undefined) {
			if (property.expected_roi < 0 || property.expected_roi > 100) {
				errors.push({
					field: 'expected_roi',
					message: 'Expected ROI must be between 0 and 100',
					code: 'INVALID_ROI'
				});
			}
		}

		if ('size_sqm' in property && property.size_sqm !== undefined) {
			if (property.size_sqm <= 0) {
				errors.push({
					field: 'size_sqm',
					message: 'Size must be greater than 0',
					code: 'INVALID_SIZE'
				});
			}
		}

		if ('total_shares' in property && property.total_shares !== undefined) {
			if (property.total_shares <= 0) {
				errors.push({
					field: 'total_shares',
					message: 'Total shares must be greater than 0',
					code: 'INVALID_TOTAL_SHARES'
				});
			}
		}

		return {
			isValid: errors.length === 0,
			errors
		};
	}
}

export const formatPrice = (price: number): string => {
	return new Intl.NumberFormat('fr-MA', {
		style: 'currency',
		currency: 'MAD',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0
	}).format(price);
};

export const formatPriceShort = (price: number): string => {
	if (price >= 1000000) {
		return `${(price / 1000000).toFixed(1)}M MAD`;
	} else if (price >= 1000) {
		return `${(price / 1000).toFixed(0)}K MAD`;
	}
	return `${price} MAD`;
};

export const calculateROI = (
	initialInvestment: number,
	currentValue: number,
	timeInYears: number
): number => {
	if (initialInvestment <= 0 || timeInYears <= 0) return 0;
	return ((currentValue - initialInvestment) / initialInvestment) * 100 / timeInYears;
};

export const calculateYield = (
	annualIncome: number,
	propertyValue: number
): number => {
	if (propertyValue <= 0) return 0;
	return (annualIncome / propertyValue) * 100;
};

export const getPropertyStatusColor = (status: PropertyStatus): string => {
	switch (status) {
		case PropertyStatus.ACTIVE:
			return 'bg-green-100 text-green-800 border-green-200';
		case PropertyStatus.FUNDING:
			return 'bg-blue-100 text-blue-800 border-blue-200';
		case PropertyStatus.FUNDED:
			return 'bg-purple-100 text-purple-800 border-purple-200';
		case PropertyStatus.COMPLETED:
			return 'bg-gray-100 text-gray-800 border-gray-200';
		case PropertyStatus.CANCELLED:
			return 'bg-red-100 text-red-800 border-red-200';
		case PropertyStatus.DRAFT:
			return 'bg-yellow-100 text-yellow-800 border-yellow-200';
		default:
			return 'bg-gray-100 text-gray-800 border-gray-200';
	}
};

export const getPropertyTypeIcon = (type: PropertyType): string => {
	switch (type) {
		case PropertyType.RESIDENTIAL:
			return '🏠';
		case PropertyType.COMMERCIAL:
			return '🏢';
		case PropertyType.MIXED_USE:
			return '🏬';
		case PropertyType.LAND:
			return '🌍';
		case PropertyType.INDUSTRIAL:
			return '🏭';
		case PropertyType.HOSPITALITY:
			return '🏨';
		default:
			return '🏠';
	}
};

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PropertyGrid } from '@/components/properties/PropertyGrid';
import { PropertyFilters } from '@/components/properties/PropertyFilters';
import { PropertyModal } from '@/components/properties/PropertyModal';
import { Property, PropertyFilters as PropertyFiltersType } from '@/types/property';
import { PropertyService } from '@/lib/properties';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function PropertiesPage() {
	const [allProperties, setAllProperties] = useState<Property[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [filters, setFilters] = useState<PropertyFiltersType>({});
	const [searchTerm, setSearchTerm] = useState('');
	const [showFilters, setShowFilters] = useState(false);
	const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	useEffect(() => {
		const fetchAllProperties = async () => {
			try {
				setLoading(true);
				setError(null);

				const result = await PropertyService.getProperties({}, {
					limit: 100,
					sort: { field: 'created_at', direction: 'desc' }
				});

				if (result.success && result.data) {
					setAllProperties(result.data);
				} else {
					setError(result.error || 'Failed to load properties');
				}
			} catch (err) {
				setError('An unexpected error occurred');
				console.error('Error fetching properties:', err);
			} finally {
				setLoading(false);
			}
		};

		fetchAllProperties();
	}, []);

	// Filter and search properties in real-time
	const filteredProperties = useMemo(() => {
		let filtered = [...allProperties];

		// Apply search filter
		if (searchTerm.trim()) {
			const searchLower = searchTerm.toLowerCase().trim();
			filtered = filtered.filter(property =>
				property.title.toLowerCase().includes(searchLower) ||
				property.description.toLowerCase().includes(searchLower) ||
				property.location.toLowerCase().includes(searchLower) ||
				property.city.toLowerCase().includes(searchLower) ||
				property.region.toLowerCase().includes(searchLower)
			);
		}

		// Apply filters
		if (filters.property_type && filters.property_type.length > 0) {
			filtered = filtered.filter(property =>
				filters.property_type!.includes(property.property_type)
			);
		}

		if (filters.city && filters.city.length > 0) {
			filtered = filtered.filter(property =>
				filters.city!.includes(property.city)
			);
		}

		if (filters.status && filters.status.length > 0) {
			filtered = filtered.filter(property =>
				filters.status!.includes(property.status)
			);
		}

		if (filters.min_price) {
			filtered = filtered.filter(property =>
				(property.price / 100) >= filters.min_price!
			);
		}

		if (filters.max_price) {
			filtered = filtered.filter(property =>
				(property.price / 100) <= filters.max_price!
			);
		}

		if (filters.min_investment) {
			filtered = filtered.filter(property =>
				Math.max(property.min_investment / 100, 1000) >= filters.min_investment!
			);
		}

		if (filters.max_investment) {
			filtered = filtered.filter(property =>
				Math.max(property.min_investment / 100, 1000) <= filters.max_investment!
			);
		}

		if (filters.min_roi) {
			filtered = filtered.filter(property =>
				property.expected_roi >= filters.min_roi!
			);
		}

		if (filters.max_roi) {
			filtered = filtered.filter(property =>
				property.expected_roi <= filters.max_roi!
			);
		}

		if (filters.bedrooms && filters.bedrooms.length > 0) {
			filtered = filtered.filter(property =>
				property.bedrooms && filters.bedrooms!.includes(property.bedrooms)
			);
		}

		if (filters.bathrooms && filters.bathrooms.length > 0) {
			filtered = filtered.filter(property =>
				property.bathrooms && filters.bathrooms!.includes(property.bathrooms)
			);
		}

		return filtered;
	}, [allProperties, searchTerm, filters]);

	// Handle filter changes
	const handleFiltersChange = (newFilters: PropertyFiltersType) => {
		setFilters(newFilters);
	};

	// Handle property selection
	const handlePropertySelect = (propertyId: string) => {
		setSelectedPropertyId(propertyId);
		setIsModalOpen(true);
	};

	// Handle modal close
	const handleModalClose = () => {
		setIsModalOpen(false);
		setSelectedPropertyId(null);
	};

	// Clear all filters and search
	const clearAllFilters = () => {
		setFilters({});
		setSearchTerm('');
	};

	return (
		<div className="p-6" key={user?.id || 'loading'}>
			{/* Header */}
			<div className="mb-8">
				<h1 className="text-3xl md:text-4xl font-bold text-igudar-text mb-2">
					Property Marketplace
				</h1>
				<p className="text-lg text-igudar-text-secondary">
					Discover premium real estate investment opportunities across Morocco
				</p>
			</div>

			{/* Search and Filter Controls */}
			<div className="mb-6 space-y-4">
				{/* Search Bar */}
				<div className="flex flex-col sm:flex-row gap-4">
					<div className="flex-1 relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-igudar-text-muted" />
						<Input
							placeholder="Search properties by title, location, or city..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-10"
						/>
					</div>
					<div className="flex gap-2">
						<Button
							variant="outline"
							onClick={() => setShowFilters(!showFilters)}
							className="border-igudar-primary text-igudar-primary hover:bg-igudar-primary/10"
						>
							<SlidersHorizontal className="mr-2 h-4 w-4" />
							Filters
						</Button>
					</div>
				</div>

				{/* Filters Panel */}
				{showFilters && (
					<div className="bg-white border border-border rounded-lg p-4">
						<PropertyFilters
							filters={filters}
							onFiltersChange={handleFiltersChange}
						/>
					</div>
				)}
			</div>

			{/* Results Summary */}
			{!loading && (
				<div className="mb-6 flex items-center justify-between">
					<p className="text-igudar-text-secondary">
						{filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'} found
						{searchTerm && ` for "${searchTerm}"`}
					</p>
					{(Object.keys(filters).length > 0 || searchTerm) && (
						<Button
							variant="ghost"
							onClick={clearAllFilters}
							className="text-igudar-primary hover:text-igudar-primary-dark hover:bg-igudar-primary/10"
						>
							Clear all filters
						</Button>
					)}
				</div>
			)}

			{/* Error State */}
			{error && (
				<Alert variant="destructive" className="mb-6">
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			{/* Loading State */}
			{loading && (
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{Array.from({ length: 6 }).map((_, index) => (
						<div key={index} className="space-y-4">
							<Skeleton className="h-48 w-full rounded-lg" />
							<div className="space-y-2">
								<Skeleton className="h-4 w-3/4" />
								<Skeleton className="h-4 w-1/2" />
								<Skeleton className="h-4 w-full" />
								<div className="flex justify-between">
									<Skeleton className="h-4 w-1/4" />
									<Skeleton className="h-4 w-1/4" />
								</div>
							</div>
						</div>
					))}
				</div>
			)}

			{/* Properties Grid */}
			{!loading && !error && (
				<PropertyGrid
					properties={filteredProperties}
					onPropertySelect={handlePropertySelect}
				/>
			)}

			{/* Empty State */}
			{!loading && !error && filteredProperties.length === 0 && (
				<div className="text-center py-12">
					<div className="mx-auto w-24 h-24 bg-igudar-primary/10 rounded-full flex items-center justify-center mb-4">
						<Search className="h-12 w-12 text-igudar-primary" />
					</div>
					<h3 className="text-xl font-semibold text-igudar-text mb-2">
						No properties found
					</h3>
					<p className="text-igudar-text-secondary mb-4">
						{searchTerm || Object.keys(filters).length > 0
							? 'Try adjusting your search criteria or filters to find more properties.'
							: 'No properties are currently available.'
						}
					</p>
					{(searchTerm || Object.keys(filters).length > 0) && (
						<Button
							onClick={clearAllFilters}
							className="bg-igudar-primary hover:bg-igudar-primary-dark text-white"
						>
							View All Properties
						</Button>
					)}
				</div>
			)}

			{/* Property Details Modal */}
			<PropertyModal
				propertyId={selectedPropertyId}
				isOpen={isModalOpen}
				onClose={handleModalClose}
			/>
		</div>
	);
}
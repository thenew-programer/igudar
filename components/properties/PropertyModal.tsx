'use client';

import React, { useState, useEffect } from 'react';
import { Property } from '@/types/property';
import { PropertyService } from '@/lib/properties';
import { InvestmentService } from '@/lib/investments';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PropertyHeader } from './PropertyHeader';
import { PropertyGallery } from './PropertyGallery';
import { PropertyDetails } from './PropertyDetails';
import { InvestmentSummary } from './InvestmentSummary';
import { PropertySpecs } from './PropertySpecs';
import { PropertyMapView } from './PropertyMapView';
import { X, ArrowLeft } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/components/auth/AuthProvider';

interface PropertyModalProps {
	propertyId: string | null;
	isOpen: boolean;
	onClose: () => void;
}

export const PropertyModal: React.FC<PropertyModalProps> = ({
	propertyId,
	isOpen,
	onClose
}) => {
	const [property, setProperty] = useState<Property | null>(null);
	const [loading, setLoading] = useState(false);
	const [userOwnershipPercentage, setUserOwnershipPercentage] = useState<number>(0);
	const [error, setError] = useState<string | null>(null);
	const { user } = useAuth();

	useEffect(() => {
		const fetchProperty = async () => {
			if (!propertyId || !isOpen) {
				setProperty(null);
				setError(null);
				return;
			}

			try {
				setLoading(true);
				setError(null);
				setUserOwnershipPercentage(0);

				const result = await PropertyService.getPropertyById(propertyId);

				if (result.success && result.data) {
					setProperty(result.data);
				} else {
					setError(result.error || 'Property not found');
				}

				// If user is logged in, fetch their ownership percentage for this property
				if (user?.id) {
					const ownershipResult = await InvestmentService.getUserOwnershipPercentageForProperty(
						user.id,
						propertyId
					);
					if (ownershipResult.success && ownershipResult.data !== undefined) {
						setUserOwnershipPercentage(ownershipResult.data);
					}
				}
			} catch (err) {
				setError('Failed to load property details');
				console.error('Error fetching property:', err);
			} finally {
				setLoading(false);
			}
		};

		if (isOpen) fetchProperty();
	}, [propertyId, isOpen]);

	const handleClose = () => {
		setProperty(null);
		setError(null);
		onClose();
	};

	// Always provide a title for accessibility
	const getDialogTitle = () => {
		if (loading) return 'Loading Property Details';
		if (error) return 'Property Error';
		if (property) return property.title;
		return 'Property Details';
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="max-w-7xl w-[95vw] h-[95vh] p-0 overflow-hidden">
				<DialogHeader className="flex flex-row items-center justify-between p-6 border-b border-border">
					<div className="flex items-center space-x-4">
						<Button
							variant="ghost"
							size="sm"
							onClick={handleClose}
							className="text-igudar-text hover:text-igudar-primary"
						>
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back to Properties
						</Button>
						<DialogTitle className="text-xl font-semibold text-igudar-text">
							{getDialogTitle()}
						</DialogTitle>
					</div>
				</DialogHeader>

				<ScrollArea className="flex-1 h-full">
					<div className="p-6">
						{loading && <PropertyModalSkeleton />}

						{error && (
							<div className="flex items-center justify-center h-96">
								<Alert variant="destructive" className="max-w-md">
									<AlertDescription className="text-center">
										<div>
											<h3 className="font-semibold mb-2">Error Loading Property</h3>
											<p className="mb-4">{error}</p>
											<Button
												// onClick={() => window.location.reload()}
												variant="outline"
												className="mr-2"
											>
												Try Again
											</Button>
											<Button
												onClick={handleClose}
												className="bg-igudar-primary hover:bg-igudar-primary-dark text-white"
											>
												Close
											</Button>
										</div>
									</AlertDescription>
								</Alert>
							</div>
						)}

						{property && !loading && !error && (
							<div className="space-y-8">
								{/* Property Header */}
								<PropertyHeader property={property} />

								{/* Main Content Grid */}
								<div className="grid gap-8 lg:grid-cols-3">
									{/* Left Column - Gallery and Details */}
									<div className="lg:col-span-2 space-y-8">
										{/* Property Gallery */}
										<PropertyGallery property={property} />

										{/* Property Map View */}
										<PropertyMapView property={property} />

										{/* Property Details */}
										<PropertyDetails property={property} />

										{/* Property Specifications */}
										<PropertySpecs property={property} />
									</div>

									{/* Right Column - Investment Summary */}
									<div className="lg:col-span-1">
										<div className="sticky top-6">
											<InvestmentSummary
												property={property}
												userOwnershipPercentage={userOwnershipPercentage}
											/>
										</div>
									</div>
								</div>
							</div>
						)}
					</div>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
};

// Skeleton component for loading state
const PropertyModalSkeleton: React.FC = () => {
	return (
		<div className="space-y-8">
			{/* Header skeleton */}
			<div className="space-y-4">
				<Skeleton className="h-8 w-96" />
				<Skeleton className="h-4 w-48" />
				<div className="flex gap-4">
					<Skeleton className="h-6 w-20" />
					<Skeleton className="h-6 w-24" />
					<Skeleton className="h-6 w-16" />
				</div>
				<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
					<div className="text-center">
						<Skeleton className="h-4 w-16 mx-auto mb-1" />
						<Skeleton className="h-6 w-20 mx-auto" />
					</div>
					<div className="text-center">
						<Skeleton className="h-4 w-20 mx-auto mb-1" />
						<Skeleton className="h-6 w-24 mx-auto" />
					</div>
					<div className="text-center">
						<Skeleton className="h-4 w-24 mx-auto mb-1" />
						<Skeleton className="h-6 w-16 mx-auto" />
					</div>
					<div className="text-center">
						<Skeleton className="h-4 w-18 mx-auto mb-1" />
						<Skeleton className="h-6 w-16 mx-auto" />
					</div>
				</div>
				<div className="flex gap-3">
					<Skeleton className="h-10 w-32" />
					<Skeleton className="h-10 w-40" />
					<Skeleton className="h-10 w-24" />
				</div>
			</div>

			{/* Content grid skeleton */}
			<div className="grid gap-8 lg:grid-cols-3">
				<div className="lg:col-span-2 space-y-8">
					<Skeleton className="h-96 w-full rounded-lg" />
					<Skeleton className="h-64 w-full rounded-lg" />
					<div className="space-y-4">
						<Skeleton className="h-6 w-48" />
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-3/4" />
					</div>
					<div className="space-y-4">
						<Skeleton className="h-6 w-56" />
						<div className="grid grid-cols-2 gap-4">
							<Skeleton className="h-20 w-full" />
							<Skeleton className="h-20 w-full" />
							<Skeleton className="h-20 w-full" />
							<Skeleton className="h-20 w-full" />
						</div>
					</div>
				</div>
				<div className="space-y-6">
					<Skeleton className="h-64 w-full rounded-lg" />
					<Skeleton className="h-48 w-full rounded-lg" />
				</div>
			</div>
		</div>
	);
};

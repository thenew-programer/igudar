'use client';

import React from 'react';
import { Property, PropertyStatus, PropertyType } from '@/types/property';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  MapPin, 
  TrendingUp, 
  Calendar,
  Building2,
  Home,
  Factory,
  Hotel,
  AlertTriangle,
  ShieldCheck,
  Landmark,
  Building
} from 'lucide-react';
import { formatPrice } from '@/lib/properties';

interface PropertyCardProps {
  property: Property;
  className?: string;
  onViewDetails?: (propertyId: string) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ 
  property, 
  className = '',
  onViewDetails 
}) => {
  // Get property type icon
  const getPropertyTypeIcon = (type: PropertyType) => {
    switch (type) {
      case PropertyType.RESIDENTIAL:
        return Home;
      case PropertyType.COMMERCIAL:
        return Building2;
      case PropertyType.MIXED_USE:
        return Building;
      case PropertyType.HOSPITALITY:
        return Hotel;
      case PropertyType.INDUSTRIAL:
        return Factory;
      case PropertyType.LAND:
        return Landmark;
      default:
        return Building2;
    }
  };

  // Get status color
  const getStatusColor = (status: PropertyStatus): string => {
    switch (status) {
      case PropertyStatus.ACTIVE:
        return 'bg-green-100 text-green-800 border-green-200';
      case PropertyStatus.FUNDING:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case PropertyStatus.FUNDED:
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case PropertyStatus.COMPLETED:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Calculate days remaining
  const getDaysRemaining = (): number => {
    const deadline = new Date(property.funding_deadline);
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const PropertyTypeIcon = getPropertyTypeIcon(property.property_type);
  const daysRemaining = getDaysRemaining();

  // Convert prices from cents to MAD for display
  const priceMAD = property.price / 100;
  const minInvestmentMAD = Math.max(property.min_investment / 100, 1000); // Ensure minimum 1000 MAD
  const totalRaisedMAD = property.total_raised / 100;
  const targetAmountMAD = property.target_amount / 100;
  const remainingFundingMAD = targetAmountMAD - totalRaisedMAD;

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(property.id);
    }
  };

  const handleImageClick = () => {
    handleViewDetails();
  };

  return (
    <Card className={`group hover:shadow-lg transition-all duration-300 border-border hover:border-igudar-primary/30 ${className}`}>
      {/* Property Image */}
      <div className="relative overflow-hidden rounded-t-lg">
        <div 
          className="aspect-[4/3] bg-gradient-to-br from-igudar-primary/10 to-igudar-primary/5 cursor-pointer"
          onClick={handleImageClick}
        >
          <img
            src={property.image_url}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg';
            }}
          />
        </div>
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <Badge className={`${getStatusColor(property.status)} font-medium`}>
            {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
          </Badge>
        </div>

        {/* Property Type Badge */}
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="bg-white/90 text-igudar-text">
            <PropertyTypeIcon className="mr-1 h-3 w-3" />
            {property.property_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </Badge>
        </div>
        
      </div>

      <CardContent className="p-4 space-y-4">
        {/* Title and Location */}
        <div>
          <h3 className="font-semibold text-lg text-igudar-text line-clamp-2 group-hover:text-igudar-primary transition-colors">
            {property.title}
          </h3>
          <div className="flex items-center text-igudar-text-muted mt-1">
            <MapPin className="mr-1 h-3 w-3" />
            <span className="text-sm">{property.city}, {property.region}</span>
          </div>
        </div>

        {/* Price and Investment Info */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-igudar-text-secondary">Total Value</span>
            <span className="font-semibold text-igudar-text">{formatPrice(priceMAD)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-igudar-text-secondary">Min. Investment</span>
            <span className="font-medium text-igudar-text">{formatPrice(minInvestmentMAD)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-igudar-text-secondary">Remaining</span>
            <span className="font-medium text-igudar-text">{formatPrice(remainingFundingMAD)}</span>
          </div>
        </div>

        {/* Funding Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-igudar-text-secondary">Funding Progress</span>
            <span className="font-medium text-igudar-text">{property.funding_progress}%</span>
          </div>
          <Progress 
            value={property.funding_progress} 
            className="h-2"
            style={{
              '--progress-background': '#5d18e9'
            } as React.CSSProperties}
          />
          <div className="flex items-center justify-between text-xs text-igudar-text-muted">
            <span>{formatPrice(totalRaisedMAD)} raised</span>
            <span>{formatPrice(targetAmountMAD)} target</span>
          </div>
        </div>

        {/* ROI and Timeline */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
          <div className="text-center">
            <div className="flex items-center justify-center text-green-600 mb-1">
              <TrendingUp className="mr-1 h-3 w-3" />
              <span className="text-xs font-medium">Expected ROI</span>
            </div>
            <span className="text-sm font-semibold text-igudar-text">{property.expected_roi}%</span>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center text-igudar-primary mb-1">
              <Calendar className="mr-1 h-3 w-3" />
              <span className="text-xs font-medium">Time Left</span>
            </div>
            <span className="text-sm font-semibold text-igudar-text">
              {daysRemaining > 0 ? `${daysRemaining} days` : 'Ended'}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button 
          onClick={handleViewDetails}
          className="w-full bg-igudar-primary hover:bg-igudar-primary/90 text-white transition-colors"
          disabled={property.status === PropertyStatus.COMPLETED || property.status === PropertyStatus.CANCELLED}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

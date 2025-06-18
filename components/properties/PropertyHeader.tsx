'use client';

import React from 'react';
import { Property, PropertyStatus, PropertyType } from '@/types/property';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  TrendingUp, 
  Calendar,
  Share2,
  Heart,
  Building2,
  Home,
  Factory,
  Hotel,
  Landmark,
  Building
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';

interface PropertyHeaderProps {
  property: Property;
}

export const PropertyHeader: React.FC<PropertyHeaderProps> = ({ property }) => {
  const { t } = useAuth();

  // Format price in MAD
  const formatPrice = (price: number): string => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M MAD`;
    } else if (price >= 1000) {
      return `${(price / 1000).toFixed(0)}K MAD`;
    }
    return `${price.toLocaleString()} MAD`;
  };

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

  return (
    <div className="mb-8">
      {/* Title and Location */}
      <div className="mb-4">
        <h1 className="text-3xl md:text-4xl font-bold text-igudar-text mb-2">
          {property.title}
        </h1>
        <div className="flex items-center text-igudar-text-secondary mb-4">
          <MapPin className="mr-2 h-4 w-4" />
          <span className="text-lg">{property.location}, {property.city}, {property.region}</span>
        </div>
      </div>

      {/* Badges and Key Metrics */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        {/* Status Badge */}
        <Badge className={`${getStatusColor(property.status)} font-medium px-3 py-1`}>
          {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
        </Badge>

        {/* Property Type Badge */}
        <Badge variant="secondary" className="bg-igudar-primary/10 text-igudar-primary border-igudar-primary/20 px-3 py-1">
          <PropertyTypeIcon className="mr-1 h-3 w-3" />
          {property.property_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </Badge>

        {/* ROI Badge */}
        <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50 px-3 py-1">
          <TrendingUp className="mr-1 h-3 w-3" />
          {property.expected_roi}% ROI
        </Badge>

        {/* Time Remaining Badge */}
        <Badge variant="outline" className="border-igudar-primary/20 text-igudar-primary bg-igudar-primary/5 px-3 py-1">
          <Calendar className="mr-1 h-3 w-3" />
          {daysRemaining > 0 ? `${daysRemaining} days left` : 'Funding ended'}
        </Badge>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
        <div className="text-center md:text-left">
          <div className="text-sm text-igudar-text-muted mb-1">Total Value</div>
          <div className="text-xl md:text-2xl font-bold text-igudar-text">
            {formatPrice(property.price)}
          </div>
        </div>
        
        <div className="text-center md:text-left">
          <div className="text-sm text-igudar-text-muted mb-1">Min Investment</div>
          <div className="text-xl md:text-2xl font-bold text-igudar-text">
            {formatPrice(property.min_investment)}
          </div>
        </div>
        
        <div className="text-center md:text-left">
          <div className="text-sm text-igudar-text-muted mb-1">Funding Progress</div>
          <div className="text-xl md:text-2xl font-bold text-igudar-primary">
            {property.funding_progress}%
          </div>
        </div>
        
        <div className="text-center md:text-left">
          <div className="text-sm text-igudar-text-muted mb-1">Rental Yield</div>
          <div className="text-xl md:text-2xl font-bold text-green-600">
            {property.rental_yield}%
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button
          size="lg"
          className="bg-igudar-primary hover:bg-igudar-primary-dark text-white px-8"
          disabled={property.status === PropertyStatus.COMPLETED || property.status === PropertyStatus.CANCELLED}
        >
          Invest Now
        </Button>
        
        <Button
          variant="outline"
          size="lg"
          className="border-igudar-primary text-igudar-primary hover:bg-igudar-primary hover:text-white"
        >
          <Heart className="mr-2 h-4 w-4" />
          Save Property
        </Button>
        
        <Button
          variant="outline"
          size="lg"
          className="border-igudar-primary text-igudar-primary hover:bg-igudar-primary hover:text-white"
        >
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
      </div>
    </div>
  );
};
'use client';

import React from 'react';
import { Property, PropertyType } from '@/types/property';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Home,
  Maximize,
  Bed,
  Bath,
  Car,
  Building,
  Calendar,
  Wrench,
  MapPin
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';

interface PropertySpecsProps {
  property: Property;
}

export const PropertySpecs: React.FC<PropertySpecsProps> = ({ property }) => {
  const { t } = useAuth();

  // Format area
  const formatArea = (sqm: number): string => {
    return `${sqm.toLocaleString()} m²`;
  };

  // Get property type specific specs
  const getPropertyTypeSpecs = () => {
    const specs = [];

    // Common specs for all property types
    specs.push({
      icon: Maximize,
      label: 'Total Area',
      value: formatArea(property.size_sqm),
      color: 'text-igudar-primary'
    });

    // Residential specific specs
    if (property.property_type === PropertyType.RESIDENTIAL || 
        property.property_type === PropertyType.MIXED_USE ||
        property.property_type === PropertyType.HOSPITALITY) {
      
      if (property.bedrooms !== undefined && property.bedrooms > 0) {
        specs.push({
          icon: Bed,
          label: property.property_type === PropertyType.HOSPITALITY ? 'Rooms' : 'Bedrooms',
          value: property.bedrooms.toString(),
          color: 'text-blue-600'
        });
      }

      if (property.bathrooms !== undefined && property.bathrooms > 0) {
        specs.push({
          icon: Bath,
          label: 'Bathrooms',
          value: property.bathrooms.toString(),
          color: 'text-green-600'
        });
      }
    }

    // Building specs
    if (property.floors !== undefined && property.floors > 0) {
      specs.push({
        icon: Building,
        label: 'Floors',
        value: property.floors.toString(),
        color: 'text-purple-600'
      });
    }

    // Parking
    if (property.parking_spaces !== undefined && property.parking_spaces > 0) {
      specs.push({
        icon: Car,
        label: 'Parking Spaces',
        value: property.parking_spaces.toString(),
        color: 'text-orange-600'
      });
    }

    return specs;
  };

  const specs = getPropertyTypeSpecs();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-igudar-text">Property Specifications</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Main Specifications Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {specs.map((spec, index) => {
            const Icon = spec.icon;
            return (
              <div key={index} className="text-center p-4 bg-gray-50 rounded-lg border">
                <div className={`flex items-center justify-center mb-2 ${spec.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-lg font-semibold text-igudar-text mb-1">
                  {spec.value}
                </div>
                <div className="text-xs text-igudar-text-muted">
                  {spec.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Construction & Renovation Details */}
        {(property.construction_year || property.renovation_year) && (
          <div className="space-y-3">
            <h4 className="font-semibold text-igudar-text">Construction Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {property.construction_year && (
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center text-blue-700">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span className="text-sm font-medium">Year Built</span>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                    {property.construction_year}
                  </Badge>
                </div>
              )}
              
              {property.renovation_year && (
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center text-green-700">
                    <Wrench className="mr-2 h-4 w-4" />
                    <span className="text-sm font-medium">Last Renovated</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    {property.renovation_year}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Property Type Specific Information */}
        <div className="space-y-3">
          <h4 className="font-semibold text-igudar-text">Property Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-igudar-text-secondary">Property Type</span>
              <Badge className="bg-igudar-primary/10 text-igudar-primary border-igudar-primary/20">
                {property.property_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-igudar-text-secondary">Total Shares</span>
              <span className="font-semibold text-igudar-text">
                {property.total_shares.toLocaleString()}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-igudar-text-secondary">Shares Available</span>
              <span className="font-semibold text-igudar-text">
                {property.shares_available.toLocaleString()}
              </span>
            </div>
            
            {property.management_fee && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-igudar-text-secondary">Management Fee</span>
                <span className="font-semibold text-igudar-text">
                  {property.management_fee}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Location Details */}
        <div className="space-y-3">
          <h4 className="font-semibold text-igudar-text">Location Details</h4>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start">
              <MapPin className="mr-2 h-4 w-4 text-igudar-primary mt-0.5" />
              <div>
                <div className="font-medium text-igudar-text">{property.location}</div>
                <div className="text-sm text-igudar-text-secondary">
                  {property.city}, {property.region}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Notes */}
        <div className="text-xs text-igudar-text-muted bg-igudar-primary/5 p-3 rounded-lg">
          <p>
            All specifications are approximate and subject to verification. 
            Please refer to official property documents for exact measurements and details.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
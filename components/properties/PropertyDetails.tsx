'use client';

import React from 'react';
import { Property } from '@/types/property';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  Calendar,
  TrendingUp,
  DollarSign,
  Clock,
  Building2,
  Users,
  Target
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';

interface PropertyDetailsProps {
  property: Property;
}

export const PropertyDetails: React.FC<PropertyDetailsProps> = ({ property }) => {
  const { t } = useAuth();

  // Format price in MAD
  const formatPrice = (price: number): string => {
    return `${price.toLocaleString()} MAD`;
  };

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calculate investment period in years
  const getInvestmentPeriodYears = (): string => {
    const years = Math.floor(property.investment_period / 12);
    const months = property.investment_period % 12;
    
    if (years === 0) {
      return `${months} months`;
    } else if (months === 0) {
      return `${years} ${years === 1 ? 'year' : 'years'}`;
    } else {
      return `${years} ${years === 1 ? 'year' : 'years'} ${months} months`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Property Description */}
      <Card>
        <CardHeader>
          <CardTitle className="text-igudar-text">Property Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-igudar-text-secondary leading-relaxed">
            {property.description}
          </p>
        </CardContent>
      </Card>

      {/* Investment Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-igudar-text">Investment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Financial Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-igudar-text-secondary">
                  <DollarSign className="mr-2 h-4 w-4" />
                  <span>Total Property Value</span>
                </div>
                <span className="font-semibold text-igudar-text">
                  {formatPrice(property.price)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center text-igudar-text-secondary">
                  <Target className="mr-2 h-4 w-4" />
                  <span>Funding Target</span>
                </div>
                <span className="font-semibold text-igudar-text">
                  {formatPrice(property.target_amount)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center text-igudar-text-secondary">
                  <Building2 className="mr-2 h-4 w-4" />
                  <span>Amount Raised</span>
                </div>
                <span className="font-semibold text-green-600">
                  {formatPrice(property.total_raised)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center text-igudar-text-secondary">
                  <Users className="mr-2 h-4 w-4" />
                  <span>Total Investors</span>
                </div>
                <span className="font-semibold text-igudar-text">
                  {property.total_investors || 0}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-igudar-text-secondary">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  <span>Expected ROI</span>
                </div>
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  {property.expected_roi}% annually
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center text-igudar-text-secondary">
                  <DollarSign className="mr-2 h-4 w-4" />
                  <span>Rental Yield</span>
                </div>
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                  {property.rental_yield}% annually
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center text-igudar-text-secondary">
                  <Clock className="mr-2 h-4 w-4" />
                  <span>Investment Period</span>
                </div>
                <span className="font-semibold text-igudar-text">
                  {getInvestmentPeriodYears()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center text-igudar-text-secondary">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>Funding Deadline</span>
                </div>
                <span className="font-semibold text-igudar-text">
                  {formatDate(property.funding_deadline)}
                </span>
              </div>
            </div>
          </div>

          {/* Additional Financial Details */}
          {(property.monthly_rent || property.maintenance_cost || property.property_tax) && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold text-igudar-text mb-4">Financial Breakdown</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {property.monthly_rent && (
                    <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-sm text-green-700 mb-1">Monthly Rent</div>
                      <div className="text-lg font-semibold text-green-800">
                        {formatPrice(property.monthly_rent / 100)}
                      </div>
                    </div>
                  )}
                  
                  {property.maintenance_cost && (
                    <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="text-sm text-orange-700 mb-1">Annual Maintenance</div>
                      <div className="text-lg font-semibold text-orange-800">
                        {formatPrice(property.maintenance_cost / 100)}
                      </div>
                    </div>
                  )}
                  
                  {property.property_tax && (
                    <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-sm text-blue-700 mb-1">Annual Property Tax</div>
                      <div className="text-lg font-semibold text-blue-800">
                        {formatPrice(property.property_tax / 100)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Location & Amenities */}
      <Card>
        <CardHeader>
          <CardTitle className="text-igudar-text">Location & Amenities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Location */}
          <div>
            <div className="flex items-center text-igudar-text-secondary mb-2">
              <MapPin className="mr-2 h-4 w-4" />
              <span className="font-medium">Location</span>
            </div>
            <p className="text-igudar-text ml-6">
              {property.location}, {property.city}, {property.region}
            </p>
          </div>

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <div>
              <h4 className="font-medium text-igudar-text mb-3">Property Amenities</h4>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map((amenity, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="bg-igudar-primary/5 text-igudar-primary border-igudar-primary/20"
                  >
                    {amenity}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Nearby Facilities */}
          {property.nearby_facilities && property.nearby_facilities.length > 0 && (
            <div>
              <h4 className="font-medium text-igudar-text mb-3">Nearby Facilities</h4>
              <div className="flex flex-wrap gap-2">
                {property.nearby_facilities.map((facility, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200"
                  >
                    {facility}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
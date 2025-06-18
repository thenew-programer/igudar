'use client';

import React from 'react';
import { Investment, InvestmentStatus } from '@/types/investment';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  MapPin, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
  DollarSign,
  PieChart
} from 'lucide-react';
import { formatInvestmentAmountShort, formatROI, getROIColor, getInvestmentStatusColor } from '@/lib/investments';

interface InvestmentCardProps {
  investment: Investment;
  showPerformance?: boolean;
  onViewDetails?: (investmentId: string) => void;
  className?: string;
}

export const InvestmentCard: React.FC<InvestmentCardProps> = ({
  investment,
  showPerformance = true,
  onViewDetails,
  className = ''
}) => {
  const property = investment.properties;
  
  // Calculate investment performance
  const calculatePerformance = () => {
    if (!property) return { currentValue: 0, returnAmount: 0, roiPercentage: 0 };
    
    const monthsHeld = Math.max(1, Math.floor(
      (new Date().getTime() - new Date(investment.confirmed_at || investment.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30)
    ));
    
    const expectedGrowth = (property.expected_roi / 100) * (monthsHeld / 12);
    const currentValue = (investment.investment_amount / 100) * (1 + expectedGrowth);
    const returnAmount = currentValue - (investment.investment_amount / 100);
    const roiPercentage = (returnAmount / (investment.investment_amount / 100)) * 100;
    
    return { currentValue, returnAmount, roiPercentage };
  };

  const performance = calculatePerformance();
  const investmentAmountMAD = investment.investment_amount / 100; // Convert from cents
  const pricePerShareMAD = investment.purchase_price_per_share / 100; // Convert from cents

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPerformanceIcon = (roi: number) => {
    if (roi > 0) return TrendingUp;
    if (roi < 0) return TrendingDown;
    return Minus;
  };

  const PerformanceIcon = getPerformanceIcon(performance.roiPercentage);

  return (
    <Card className={`hover:shadow-lg transition-all duration-300 border-border hover:border-igudar-primary/30 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-igudar-text line-clamp-2 mb-1">
              {property?.title || 'Unknown Property'}
            </h3>
            <div className="flex items-center text-igudar-text-muted text-sm mb-2">
              <MapPin className="mr-1 h-3 w-3" />
              <span>{property?.city || 'Unknown'}, {property?.region || 'Unknown'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getInvestmentStatusColor(investment.status)}>
                {investment.status.charAt(0).toUpperCase() + investment.status.slice(1)}
              </Badge>
              {property && (
                <Badge variant="outline" className="bg-igudar-primary/10 text-igudar-primary border-igudar-primary/20">
                  <Building2 className="mr-1 h-3 w-3" />
                  {property.property_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
              )}
            </div>
          </div>
          {property?.image_url && (
            <div className="ml-4 flex-shrink-0">
              <img
                src={property.image_url}
                alt={property.title}
                className="w-16 h-16 rounded-lg object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg';
                }}
              />
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Investment Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-igudar-text-secondary">Shares Owned</span>
              <span className="font-semibold text-igudar-text">{investment.shares_purchased.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-igudar-text-secondary">Price per Share</span>
              <span className="font-semibold text-igudar-text">{formatInvestmentAmountShort(pricePerShareMAD)}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-igudar-text-secondary">Total Invested</span>
              <span className="font-semibold text-igudar-text">{formatInvestmentAmountShort(investmentAmountMAD)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-igudar-text-secondary">Investment Date</span>
              <span className="font-semibold text-igudar-text text-xs">
                {formatDate(investment.confirmed_at || investment.created_at)}
              </span>
            </div>
          </div>
        </div>

        {/* Performance Section */}
        {showPerformance && investment.status === InvestmentStatus.CONFIRMED && (
          <div className="pt-3 border-t border-border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-igudar-text">Performance</span>
              <div className="flex items-center space-x-1">
                <PerformanceIcon className={`h-4 w-4 ${getROIColor(performance.roiPercentage)}`} />
                <span className={`text-sm font-semibold ${getROIColor(performance.roiPercentage)}`}>
                  {formatROI(performance.roiPercentage)}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-igudar-text-muted mb-1">Current Value</div>
                <div className="font-semibold text-igudar-text">
                  {formatInvestmentAmountShort(performance.currentValue)}
                </div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-igudar-text-muted mb-1">Return</div>
                <div className={`font-semibold ${getROIColor(performance.returnAmount)}`}>
                  {performance.returnAmount >= 0 ? '+' : ''}{formatInvestmentAmountShort(Math.abs(performance.returnAmount))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Property Metrics */}
        {property && (
          <div className="pt-3 border-t border-border">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-2 bg-igudar-primary/5 rounded-lg">
                <div className="flex items-center justify-center text-igudar-primary mb-1">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  <span className="text-xs font-medium">Expected ROI</span>
                </div>
                <div className="text-sm font-semibold text-igudar-text">{property.expected_roi}%</div>
              </div>
              <div className="text-center p-2 bg-green-50 rounded-lg">
                <div className="flex items-center justify-center text-green-600 mb-1">
                  <DollarSign className="mr-1 h-3 w-3" />
                  <span className="text-xs font-medium">Rental Yield</span>
                </div>
                <div className="text-sm font-semibold text-green-700">{property.rental_yield}%</div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-2 pt-2">
          {onViewDetails && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(investment.id)}
              className="flex-1 border-igudar-primary text-igudar-primary hover:bg-igudar-primary/10"
            >
              <ExternalLink className="mr-2 h-3 w-3" />
              View Details
            </Button>
          )}
          {property && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`/properties/${property.id}`, '_blank')}
              className="flex-1 border-gray-300 text-igudar-text hover:bg-gray-50"
            >
              <Building2 className="mr-2 h-3 w-3" />
              Property
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
'use client';

import React, { useState } from 'react';
import { Property, PropertyStatus } from '@/types/property';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { InvestmentModal } from './InvestmentModal';
import { 
  Calculator,
  TrendingUp,
  Calendar,
  Users,
  Target,
  DollarSign,
  AlertCircle,
  Brain,
  Zap,
  BarChart3,
  PieChart
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';

interface InvestmentSummaryProps {
  property: Property;
}

export const InvestmentSummary: React.FC<InvestmentSummaryProps> = ({ property }) => {
  const { user } = useAuth();
  const [investmentAmount, setInvestmentAmount] = useState<string>('');
  const [calculatedShares, setCalculatedShares] = useState<number>(0);
  const [calculatedReturns, setCalculatedReturns] = useState<{
    monthly: number;
    annual: number;
    total: number;
  }>({ monthly: 0, annual: 0, total: 0 });
  const [isInvestmentModalOpen, setIsInvestmentModalOpen] = useState(false);
  const [prefilledAmount, setPrefilledAmount] = useState<string>('');

  // Format price in MAD
  const formatPrice = (price: number): string => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M MAD`;
    } else if (price >= 1000) {
      return `${(price / 1000).toFixed(0)}K MAD`;
    }
    return `${Math.round(price).toLocaleString()} MAD`;
  };

  // Calculate investment details
  const calculateInvestment = (amount: string) => {
    const numAmount = parseFloat(amount) || 0;
    
    if (numAmount > 0 && property.price_per_share > 0) {
      const shares = Math.floor((numAmount * 100) / property.price_per_share); // Convert to cents
      const actualAmount = (shares * property.price_per_share) / 100; // Convert back to MAD
      
      const annualReturn = (actualAmount * property.expected_roi) / 100;
      const monthlyReturn = annualReturn / 12;
      const totalReturn = (annualReturn * property.investment_period) / 12;
      
      setCalculatedShares(shares);
      setCalculatedReturns({
        monthly: monthlyReturn,
        annual: annualReturn,
        total: totalReturn
      });
    } else {
      setCalculatedShares(0);
      setCalculatedReturns({ monthly: 0, annual: 0, total: 0 });
    }
  };

  // Handle investment amount change
  const handleAmountChange = (value: string) => {
    // Only allow numbers and decimal point
    const sanitizedValue = value.replace(/[^0-9.]/g, '');
    setInvestmentAmount(sanitizedValue);
    calculateInvestment(sanitizedValue);
  };

  // Calculate days remaining
  const getDaysRemaining = (): number => {
    const deadline = new Date(property.funding_deadline);
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const daysRemaining = getDaysRemaining();
  const isInvestmentDisabled = property.status === PropertyStatus.COMPLETED || 
                               property.status === PropertyStatus.CANCELLED ||
                               daysRemaining === 0;

  const minInvestmentMAD = Math.max(property.min_investment / 100, 1000); // Ensure minimum 1000 MAD
  const pricePerShareMAD = property.price_per_share / 100; // Convert from cents
  const targetAmountMAD = property.target_amount / 100; // Convert from cents
  const totalRaisedMAD = property.total_raised / 100; // Convert from cents

  // AI-generated insights
  const getAIInsights = () => {
    const insights = [];
    
    if (property.expected_roi > 12) {
      insights.push({
        icon: TrendingUp,
        text: `High-yield opportunity with ${property.expected_roi}% expected ROI`,
        type: 'positive'
      });
    }
    
    if (property.funding_progress > 70) {
      insights.push({
        icon: Zap,
        text: `Popular investment - ${property.funding_progress}% funded`,
        type: 'warning'
      });
    }
    
    if (daysRemaining < 30 && daysRemaining > 0) {
      insights.push({
        icon: Calendar,
        text: `Limited time - only ${daysRemaining} days remaining`,
        type: 'urgent'
      });
    }
    
    if (property.rental_yield > 8) {
      insights.push({
        icon: BarChart3,
        text: `Strong rental yield of ${property.rental_yield}% annually`,
        type: 'positive'
      });
    }
    
    if (property.total_investors && property.total_investors > 20) {
      insights.push({
        icon: Users,
        text: `Trusted by ${property.total_investors}+ investors`,
        type: 'neutral'
      });
    }

    return insights.slice(0, 3); // Show max 3 insights
  };

  const aiInsights = getAIInsights();

  const handleInvestNow = () => {
    if (!user) {
      // Redirect to login if not authenticated
      window.location.href = '/auth/login';
      return;
    }
    // Set the prefilled amount from the calculator
    setPrefilledAmount(investmentAmount);
    setIsInvestmentModalOpen(true);
  };

  const handleInvestmentSuccess = () => {
    // Refresh the page or update the property data
    window.location.reload();
  };

  return (
    <>
      <Card className="sticky top-6">
        <CardHeader>
          <CardTitle className="flex items-center text-igudar-text">
            <Calculator className="mr-2 h-5 w-5" />
            Investment Summary
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* AI Insights Section */}
          {aiInsights.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center text-igudar-primary mb-2">
                <Brain className="mr-2 h-4 w-4" />
                <span className="text-sm font-medium">AI Investment Insights</span>
              </div>
              <div className="space-y-2">
                {aiInsights.map((insight, index) => {
                  const Icon = insight.icon;
                  const colorClass = insight.type === 'positive' ? 'text-green-600 bg-green-50 border-green-200' :
                                   insight.type === 'warning' ? 'text-orange-600 bg-orange-50 border-orange-200' :
                                   insight.type === 'urgent' ? 'text-red-600 bg-red-50 border-red-200' :
                                   'text-blue-600 bg-blue-50 border-blue-200';
                  
                  return (
                    <div key={index} className={`flex items-center p-2 rounded-lg border ${colorClass}`}>
                      <Icon className="mr-2 h-3 w-3 flex-shrink-0" />
                      <span className="text-xs font-medium">{insight.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <Separator />

          {/* Funding Progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-igudar-text-secondary">Funding Progress</span>
              <span className="font-semibold text-igudar-text">{property.funding_progress}%</span>
            </div>
            
            <Progress 
              value={property.funding_progress} 
              className="h-3"
              style={{
                '--progress-background': '#5d18e9'
              } as React.CSSProperties}
            />
            
            <div className="flex items-center justify-between text-xs text-igudar-text-muted">
              <span>{formatPrice(totalRaisedMAD)} raised</span>
              <span>{formatPrice(targetAmountMAD)} target</span>
            </div>
          </div>

          {/* Enhanced Key Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-igudar-primary/5 rounded-lg border border-igudar-primary/20">
              <div className="flex items-center justify-center text-igudar-primary mb-1">
                <TrendingUp className="mr-1 h-3 w-3" />
                <span className="text-xs font-medium">Expected ROI</span>
              </div>
              <div className="text-lg font-bold text-igudar-text">{property.expected_roi}%</div>
              <div className="text-xs text-igudar-text-muted">annually</div>
            </div>
            
            <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-center text-green-600 mb-1">
                <DollarSign className="mr-1 h-3 w-3" />
                <span className="text-xs font-medium">Rental Yield</span>
              </div>
              <div className="text-lg font-bold text-green-700">{property.rental_yield}%</div>
              <div className="text-xs text-green-600">annually</div>
            </div>

            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-center text-blue-600 mb-1">
                <PieChart className="mr-1 h-3 w-3" />
                <span className="text-xs font-medium">Min Investment</span>
              </div>
              <div className="text-sm font-bold text-blue-700">{formatPrice(minInvestmentMAD)}</div>
            </div>

            <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center justify-center text-purple-600 mb-1">
                <Users className="mr-1 h-3 w-3" />
                <span className="text-xs font-medium">Investors</span>
              </div>
              <div className="text-sm font-bold text-purple-700">{property.total_investors || 0}</div>
            </div>
          </div>

          {/* Investment Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-igudar-text-secondary">Price per Share</span>
              <span className="font-semibold text-igudar-text">{formatPrice(pricePerShareMAD)}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-igudar-text-secondary">Shares Available</span>
              <span className="font-semibold text-igudar-text">{property.shares_available.toLocaleString()}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-igudar-text-secondary">Investment Period</span>
              <span className="font-semibold text-igudar-text">{Math.floor(property.investment_period / 12)} years</span>
            </div>
          </div>

          <Separator />

          {/* Investment Calculator */}
          <div className="space-y-4">
            <h4 className="font-semibold text-igudar-text">Investment Calculator</h4>
            
            <div className="space-y-2">
              <Label htmlFor="investment-amount" className="text-sm font-medium">
                Investment Amount (MAD)
              </Label>
              <Input
                id="investment-amount"
                type="text"
                placeholder={`Min: ${formatPrice(minInvestmentMAD)}`}
                value={investmentAmount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="text-right"
                disabled={isInvestmentDisabled}
              />
            </div>

            {/* Calculation Results */}
            {calculatedShares > 0 && (
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-igudar-text-secondary">Shares to Purchase</span>
                  <span className="font-semibold text-igudar-text">{calculatedShares.toLocaleString()}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-igudar-text-secondary">Actual Investment</span>
                  <span className="font-semibold text-igudar-text">
                    {formatPrice((calculatedShares * pricePerShareMAD))}
                  </span>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-igudar-text-secondary">Expected Monthly Return</span>
                  <span className="font-semibold text-green-600">
                    {formatPrice(calculatedReturns.monthly)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-igudar-text-secondary">Expected Annual Return</span>
                  <span className="font-semibold text-green-600">
                    {formatPrice(calculatedReturns.annual)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-igudar-text-secondary">Total Expected Return</span>
                  <span className="font-semibold text-green-600">
                    {formatPrice(calculatedReturns.total)}
                  </span>
                </div>
              </div>
            )}

            {/* Validation Messages */}
            {investmentAmount && parseFloat(investmentAmount) < minInvestmentMAD && (
              <div className="flex items-center text-red-600 text-sm">
                <AlertCircle className="mr-1 h-3 w-3" />
                <span>Minimum investment is {formatPrice(minInvestmentMAD)}</span>
              </div>
            )}
          </div>

          {/* Time Remaining */}
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center text-blue-700">
              <Calendar className="mr-2 h-4 w-4" />
              <span className="text-sm font-medium">Time Remaining</span>
            </div>
            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
              {daysRemaining > 0 ? `${daysRemaining} days` : 'Ended'}
            </Badge>
          </div>

          {/* Investment Button */}
          <Button
            size="lg"
            onClick={handleInvestNow}
            className="w-full bg-igudar-primary hover:bg-igudar-primary/90 text-white"
            disabled={isInvestmentDisabled}
          >
            {isInvestmentDisabled 
              ? 'Investment Closed' 
              : user
                ? 'Invest Now'
                : 'Sign In to Invest'
            }
          </Button>

          {/* Disclaimer */}
          <div className="text-xs text-igudar-text-muted text-center">
            <p>
              * Returns are estimates based on AI analysis and property projections. 
              Actual returns may vary. Please read all investment documents carefully.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Investment Modal */}
      <InvestmentModal
        property={property}
        isOpen={isInvestmentModalOpen}
        onClose={() => setIsInvestmentModalOpen(false)}
        onSuccess={handleInvestmentSuccess}
        prefilledAmount={prefilledAmount}
      />
    </>
  );
};
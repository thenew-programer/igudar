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
  DollarSign,
  AlertCircle,
  Brain,
  Zap,
  BarChart3,
  PieChart
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { formatPrice } from '@/lib/properties';

interface InvestmentSummaryProps {
  property: Property;
  userOwnershipPercentage?: number;
}

export const InvestmentSummary: React.FC<InvestmentSummaryProps> = ({ 
  property,
  userOwnershipPercentage = 0
}) => {
  const { user } = useAuth();
  const [investmentAmount, setInvestmentAmount] = useState<string>('');
  const [calculatedPercentage, setCalculatedPercentage] = useState<number>(0);
  const [calculatedReturns, setCalculatedReturns] = useState<{
    monthly: number;
    annual: number;
  }>({ monthly: 0, annual: 0});
  const [isInvestmentModalOpen, setIsInvestmentModalOpen] = useState(false);
  const [prefilledAmount, setPrefilledAmount] = useState<string>('');


  // Calculate investment details
  const calculateInvestment = (amount: string) => {
    const numAmount = parseFloat(amount) || 0;
    
    if (numAmount > 0 && property.target_amount > 0) {
      const actualAmount = numAmount;
      const percentage = (actualAmount / (property.target_amount / 100)) * 100; // Calculate percentage of target amount
      
      const annualReturn = (actualAmount * property.expected_roi) / 100;
      const monthlyReturn = annualReturn / 12;
      
      setCalculatedPercentage(percentage);
      setCalculatedReturns({
        monthly: monthlyReturn,
        annual: annualReturn,
      });
    } else {
      setCalculatedPercentage(0);
      setCalculatedReturns({ monthly: 0, annual: 0 });
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
  const targetAmountMAD = property.target_amount / 100; // Convert from cents
  const totalRaisedMAD = property.total_raised / 100; // Convert from cents
  const remainingFundingMAD = targetAmountMAD - totalRaisedMAD;

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

    return insights.slice(0, 4); // Show max 4 insights
  };

  const aiInsights = getAIInsights();

  const handleInvestNow = () => {
    if (!user) {
      window.location.href = '/auth/login';
      return;
    }
    // Set the prefilled amount from the calculator
    setPrefilledAmount(investmentAmount);
    setIsInvestmentModalOpen(true);
  };

  const handleInvestmentSuccess = () => {
    window.location.reload();
  };

  return (
    <>
      <Card className="sticky top-6 shadow-lg rounded-2xl border-0">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-igudar-text text-xl font-bold">
            <Calculator className="h-6 w-6 text-igudar-primary" />
            Investment Summary
          </CardTitle>
        </CardHeader>
        {/* Make CardContent scrollable with a max height */}
        <CardContent className="space-y-8 px-6 pb-6 pt-2 max-h-[80vh] overflow-y-auto">
          {/* Current Ownership Display */}
          {userOwnershipPercentage > 0 && (
            <div className="p-4 bg-igudar-primary/10 rounded-xl border border-igudar-primary/20 text-center mb-2">
              <h3 className="font-semibold text-igudar-primary mb-1 text-base">Your Current Ownership</h3>
              <div className="text-3xl font-extrabold text-igudar-text">{userOwnershipPercentage.toFixed(2)}%</div>
              <p className="text-xs text-igudar-text-muted mt-1">You already own a stake in this property</p>
            </div>
          )}

          {/* AI Insights Section */}
          {aiInsights.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-igudar-primary font-semibold text-sm mb-1">
                <Brain className="h-4 w-4" />
                AI Investment Insights
              </div>
              <div className="grid grid-cols-1 gap-2">
                {aiInsights.map((insight, index) => {
                  const Icon = insight.icon;
                  const colorClass = insight.type === 'positive' ? 'text-green-600 bg-green-50 border-green-200' :
                                   insight.type === 'warning' ? 'text-orange-600 bg-orange-50 border-orange-200' :
                                   insight.type === 'urgent' ? 'text-red-600 bg-red-50 border-red-200' :
                                   'text-blue-600 bg-blue-50 border-blue-200';
                  return (
                    <div key={index} className={`flex items-center gap-2 p-2 rounded-lg border ${colorClass} shadow-sm`}>
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <span className="text-xs font-medium">{insight.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <Separator className="my-2" />

          {/* Funding Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-igudar-text-secondary">Funding Progress</span>
              <span className="font-bold text-igudar-text">{property.funding_progress}%</span>
            </div>
            <Progress 
              value={property.funding_progress} 
              className="h-3 rounded-full"
              style={{
                '--progress-background': '#5d18e9'
              } as React.CSSProperties}
            />
            <div className="flex items-center justify-between text-xs text-igudar-text-muted mt-1">
              <span>{formatPrice(totalRaisedMAD)} raised</span>
              <span>{formatPrice(targetAmountMAD)} target</span>
            </div>
          </div>

          {/* Enhanced Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center p-4 bg-igudar-primary/5 rounded-xl border border-igudar-primary/20 shadow-sm">
              <div className="flex items-center gap-1 text-igudar-primary mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs font-medium">Expected ROI</span>
              </div>
              <div className="text-2xl font-extrabold text-igudar-text">{property.expected_roi}%</div>
              <div className="text-xs text-igudar-text-muted">annually</div>
            </div>
            <div className="flex flex-col items-center p-4 bg-green-50 rounded-xl border border-green-200 shadow-sm">
              <div className="flex items-center gap-1 text-green-600 mb-1">
                <DollarSign className="h-4 w-4" />
                <span className="text-xs font-medium">Min Investment</span>
              </div>
              <div className="text-xl font-bold text-green-700">{formatPrice(minInvestmentMAD)}</div>
            </div>
            {/* Replace redundant Min Investment with Rental Yield */}
            <div className="flex flex-col items-center p-4 bg-blue-50 rounded-xl border border-blue-200 shadow-sm">
              <div className="flex items-center gap-1 text-blue-600 mb-1">
                <BarChart3 className="h-4 w-4" />
                <span className="text-xs font-medium">Rental Yield</span>
              </div>
              <div className="text-base font-bold text-blue-700">{property.rental_yield}%</div>
            </div>
            <div className="flex flex-col items-center p-4 bg-purple-50 rounded-xl border border-purple-200 shadow-sm">
              <div className="flex items-center gap-1 text-purple-600 mb-1">
                <Users className="h-4 w-4" />
                <span className="text-xs font-medium">Investors</span>
              </div>
              <div className="text-base font-bold text-purple-700">{property.total_investors || 0}</div>
            </div>
          </div>

          {/* Investment Details */}
          <div className="space-y-2 bg-gray-50 rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs text-igudar-text-secondary">Investment Period</span>
              <span className="font-semibold text-igudar-text">{Math.floor(property.investment_period / 12)} years</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-igudar-text-secondary">Funding Target</span>
              <span className="font-semibold text-igudar-text">{formatPrice(targetAmountMAD)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-igudar-text-secondary">Amount Raised</span>
              <span className="font-semibold text-igudar-text">{formatPrice(totalRaisedMAD)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-igudar-text-secondary">Remaining</span>
              <span className="font-semibold text-igudar-text">{formatPrice(remainingFundingMAD)}</span>
            </div>
          </div>

          <Separator className="my-2" />

          {/* Time Remaining */}
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-200 shadow-sm">
            <div className="flex flex-col">
              <div className="flex items-center text-blue-700 mb-1">
                <Calendar className="mr-2 h-4 w-4" />
                <span className="text-sm font-medium">Time Remaining</span>
              </div>
            </div>
            <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs px-3 py-1 rounded-full">
              {daysRemaining > 0 ? `${daysRemaining} days` : 'Ended'}
            </Badge>
          </div>
          
          {/* Investment Button */}
          <Button
            size="lg"
            onClick={handleInvestNow}
            className="w-full bg-igudar-primary hover:bg-igudar-primary/90 text-white rounded-xl text-base font-semibold shadow-md transition-all duration-150"
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
          <div className="text-xs text-igudar-text-muted text-center mt-2">
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

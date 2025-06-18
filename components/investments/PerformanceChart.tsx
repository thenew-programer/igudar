'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3,
  PieChart,
  Calendar,
  DollarSign
} from 'lucide-react';
import { InvestmentService } from '@/lib/investments';
import { InvestmentPerformance, PortfolioBreakdown } from '@/types/investment';

interface PerformanceChartProps {
  userId: string;
  className?: string;
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({ 
  userId, 
  className = '' 
}) => {
  const [performanceData, setPerformanceData] = useState<InvestmentPerformance[]>([]);
  const [portfolioBreakdown, setPortfolioBreakdown] = useState<PortfolioBreakdown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'performance' | 'breakdown'>('performance');

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const [performanceResult, breakdownResult] = await Promise.all([
          InvestmentService.getInvestmentPerformance(userId),
          InvestmentService.getPortfolioBreakdown(userId)
        ]);

        if (performanceResult.success && performanceResult.data) {
          setPerformanceData(performanceResult.data);
        }

        if (breakdownResult.success && breakdownResult.data) {
          setPortfolioBreakdown(breakdownResult.data);
        }

        if (!performanceResult.success || !breakdownResult.success) {
          setError('Failed to load performance data');
        }
      } catch (err) {
        setError('An unexpected error occurred');
        console.error('Error fetching performance data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString() + ' MAD';
  };

  const formatROI = (roi: number): string => {
    const sign = roi >= 0 ? '+' : '';
    return `${sign}${roi.toFixed(1)}%`;
  };

  const getROIColor = (roi: number): string => {
    if (roi > 0) return 'text-green-600';
    if (roi < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const renderPerformanceView = () => {
    if (performanceData.length === 0) {
      return (
        <div className="text-center py-8">
          <TrendingUp className="h-12 w-12 text-igudar-primary/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-igudar-text mb-2">No Performance Data</h3>
          <p className="text-igudar-text-muted">Start investing to see your performance over time.</p>
        </div>
      );
    }

    // Calculate overall metrics
    const totalInitialValue = performanceData.reduce((sum, item) => sum + item.initial_value, 0);
    const totalCurrentValue = performanceData.reduce((sum, item) => sum + item.current_value, 0);
    const totalReturn = totalCurrentValue - totalInitialValue;
    const overallROI = totalInitialValue > 0 ? (totalReturn / totalInitialValue) * 100 : 0;

    return (
      <div className="space-y-6">
        {/* Overall Performance Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-igudar-primary/5 rounded-lg border border-igudar-primary/20">
            <div className="text-sm text-igudar-text-muted mb-1">Total Invested</div>
            <div className="text-lg font-bold text-igudar-text">{formatCurrency(totalInitialValue)}</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-sm text-green-700 mb-1">Current Value</div>
            <div className="text-lg font-bold text-green-800">{formatCurrency(totalCurrentValue)}</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm text-blue-700 mb-1">Total Return</div>
            <div className={`text-lg font-bold ${getROIColor(totalReturn)}`}>
              {totalReturn >= 0 ? '+' : ''}{formatCurrency(Math.abs(totalReturn))}
            </div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-sm text-purple-700 mb-1">Overall ROI</div>
            <div className={`text-lg font-bold ${getROIColor(overallROI)}`}>
              {formatROI(overallROI)}
            </div>
          </div>
        </div>

        {/* Performance Chart Visualization */}
        <div className="space-y-4">
          <h4 className="font-semibold text-igudar-text">Investment Performance by Property</h4>
          <div className="space-y-3">
            {performanceData.map((item, index) => {
              const maxValue = Math.max(...performanceData.map(d => d.current_value));
              const barWidth = maxValue > 0 ? (item.current_value / maxValue) * 100 : 0;
              
              return (
                <div key={item.investment_id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-igudar-text truncate flex-1 mr-4">
                      {item.property_title}
                    </span>
                    <div className="flex items-center space-x-4 flex-shrink-0">
                      <span className="text-igudar-text-muted">
                        {formatCurrency(item.initial_value)} → {formatCurrency(item.current_value)}
                      </span>
                      <div className={`flex items-center ${getROIColor(item.roi_percentage)}`}>
                        {item.performance_trend === 'up' ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : item.performance_trend === 'down' ? (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        ) : (
                          <div className="h-3 w-3 mr-1" />
                        )}
                        <span className="font-semibold">{formatROI(item.roi_percentage)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.roi_percentage > 0 ? 'bg-green-500' : 
                        item.roi_percentage < 0 ? 'bg-red-500' : 'bg-gray-400'
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  
                  <div className="text-xs text-igudar-text-muted">
                    Held for {item.months_held} {item.months_held === 1 ? 'month' : 'months'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderBreakdownView = () => {
    if (portfolioBreakdown.length === 0) {
      return (
        <div className="text-center py-8">
          <PieChart className="h-12 w-12 text-igudar-primary/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-igudar-text mb-2">No Portfolio Data</h3>
          <p className="text-igudar-text-muted">Invest in different property types to see your portfolio distribution.</p>
        </div>
      );
    }

    const colors = [
      'bg-igudar-primary',
      'bg-green-500',
      'bg-blue-500',
      'bg-purple-500',
      'bg-orange-500',
      'bg-pink-500'
    ];

    return (
      <div className="space-y-6">
        <h4 className="font-semibold text-igudar-text">Portfolio Distribution by Property Type</h4>
        
        <div className="space-y-4">
          {portfolioBreakdown.map((item, index) => (
            <div key={item.property_type} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded ${colors[index % colors.length]}`} />
                  <span className="font-medium text-igudar-text">{item.property_type}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-igudar-text">
                    {formatCurrency(item.total_invested)}
                  </div>
                  <div className="text-xs text-igudar-text-muted">
                    {item.percentage_of_portfolio}% of portfolio
                  </div>
                </div>
              </div>
              
              <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${colors[index % colors.length]} transition-all duration-500`}
                  style={{ width: `${item.percentage_of_portfolio}%` }}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-xs text-igudar-text-muted">
                <div>
                  <span className="font-medium">Properties:</span> {item.number_of_properties}
                </div>
                <div>
                  <span className="font-medium">Current Value:</span> {formatCurrency(item.current_value)}
                </div>
                <div>
                  <span className="font-medium">Avg ROI:</span> {item.average_roi.toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="pt-4 border-t border-border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-igudar-text">
                {portfolioBreakdown.length}
              </div>
              <div className="text-xs text-igudar-text-muted">Property Types</div>
            </div>
            <div>
              <div className="text-lg font-bold text-igudar-text">
                {portfolioBreakdown.reduce((sum, item) => sum + item.number_of_properties, 0)}
              </div>
              <div className="text-xs text-igudar-text-muted">Total Properties</div>
            </div>
            <div>
              <div className="text-lg font-bold text-igudar-text">
                {formatCurrency(portfolioBreakdown.reduce((sum, item) => sum + item.total_invested, 0))}
              </div>
              <div className="text-xs text-igudar-text-muted">Total Invested</div>
            </div>
            <div>
              <div className="text-lg font-bold text-igudar-text">
                {(portfolioBreakdown.reduce((sum, item) => sum + item.average_roi, 0) / portfolioBreakdown.length).toFixed(1)}%
              </div>
              <div className="text-xs text-igudar-text-muted">Avg ROI</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Card className={`h-[600px] ${className}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-64" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-20 w-full" />
              ))}
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <CardTitle className="text-igudar-text">Portfolio Analytics</CardTitle>
            <CardDescription>
              Track your investment performance and portfolio distribution
            </CardDescription>
          </div>
          
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <Button
              variant={activeView === 'performance' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('performance')}
              className={`transition-all duration-200 ${
                activeView === 'performance' 
                  ? 'bg-white shadow-sm text-igudar-text' 
                  : 'hover:bg-white/50 text-igudar-text-muted hover:text-igudar-text'
              }`}
            >
              <BarChart3 className="mr-1 h-3 w-3" />
              <span>Performance</span>
            </Button>
            <Button
              variant={activeView === 'breakdown' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('breakdown')}
              className={`transition-all duration-200 ${
                activeView === 'breakdown' 
                  ? 'bg-white shadow-sm text-igudar-text' 
                  : 'hover:bg-white/50 text-igudar-text-muted hover:text-igudar-text'
              }`}
            >
              <PieChart className="mr-1 h-3 w-3" />
              <span>Breakdown</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {activeView === 'performance' && renderPerformanceView()}
        {activeView === 'breakdown' && renderBreakdownView()}
      </CardContent>
    </Card>
  );
};